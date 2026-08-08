package arxiv

import (
	"bytes"
	"encoding/json"
	"encoding/xml"
	"fmt"
	"io"
	"log"
	"net/http"
	"strings"
	"time"

	"paper-radar/backend/internal/database"
)

type Scraper struct {
	DB           *database.DB
	MLServiceURL string
	MQTTCallback func(paperID, title string, score int)
	WSCallback   func(event string, data interface{})
}

type AtomFeed struct {
	XMLName xml.Name    `xml:"feed"`
	Entries []AtomEntry `xml:"entry"`
}

type AtomEntry struct {
	ID        string       `xml:"id"`
	Title     string       `xml:"title"`
	Summary   string       `xml:"summary"`
	Published string       `xml:"published"`
	Authors   []AtomAuthor `xml:"author"`
	Links     []AtomLink   `xml:"link"`
}

type AtomAuthor struct {
	Name string `xml:"name"`
}

type AtomLink struct {
	Href string `xml:"href" attr:"href"`
	Rel  string `xml:"rel" attr:"rel"`
	Type string `xml:"type" attr:"type"`
}

type MLRequest struct {
	ArxivID  string `json:"arxiv_id"`
	Title    string `json:"title"`
	Abstract string `json:"abstract"`
}

type MLResponse struct {
	SummaryAI      string   `json:"summary_ai"`
	RelevanceScore int      `json:"relevance_score"`
	Tags           []string `json:"tags"`
}

func NewScraper(db *database.DB, mlServiceURL string) *Scraper {
	return &Scraper{
		DB:           db,
		MLServiceURL: mlServiceURL,
	}
}

func (s *Scraper) FetchPapers(keywords string, maxResults int) (int, error) {
	if keywords == "" {
		keywords = "swarm UAV formation control, artificial potential field, decentralized multi-agent, event-based control quadcopter, swarm robotics obstacle avoidance"
	}

	terms := strings.Split(keywords, ",")
	var queryParts []string
	for _, term := range terms {
		trimmed := strings.TrimSpace(term)
		if trimmed != "" {
			// Use all: prefix with spaces encoded as + — most reliable arXiv format
			encoded := strings.ReplaceAll(trimmed, " ", "+")
			queryParts = append(queryParts, "all:"+encoded)
		}
	}
	searchQuery := strings.Join(queryParts, "+OR+")

	// Always start at 0 for niche topics
	apiURL := fmt.Sprintf("http://export.arxiv.org/api/query?search_query=%s&start=0&max_results=%d&sortBy=submittedDate&sortOrder=descending",
		searchQuery, maxResults)


	log.Printf("[Scraper] Querying arXiv API: %s", apiURL)
	resp, err := http.Get(apiURL)
	if err != nil {
		s.DB.LogEvent(fmt.Sprintf("arXiv API fetch error: %v", err))
		return 0, fmt.Errorf("failed to fetch from arXiv API: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		s.DB.LogEvent(fmt.Sprintf("arXiv API returned status: %d", resp.StatusCode))
		return 0, fmt.Errorf("arXiv API status code: %d", resp.StatusCode)
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return 0, fmt.Errorf("failed to read arXiv API response: %w", err)
	}

	var feed AtomFeed
	if err := xml.Unmarshal(body, &feed); err != nil {
		return 0, fmt.Errorf("failed to parse arXiv XML feed: %w", err)
	}

	log.Printf("[Scraper] arXiv returned %d entries for query", len(feed.Entries))

	savedCount := 0
	for _, entry := range feed.Entries {
		arxivID := extractArxivID(entry.ID)
		if arxivID == "" {
			continue
		}

		cleanTitle := strings.ReplaceAll(strings.TrimSpace(entry.Title), "\n", " ")
		cleanAbstract := strings.ReplaceAll(strings.TrimSpace(entry.Summary), "\n", " ")

		var authorNames []string
		for _, a := range entry.Authors {
			authorNames = append(authorNames, a.Name)
		}
		authorsStr := strings.Join(authorNames, ", ")

		pdfURL := fmt.Sprintf("https://arxiv.org/pdf/%s.pdf", arxivID)
		for _, link := range entry.Links {
			if link.Type == "application/pdf" {
				pdfURL = link.Href
				break
			}
		}

		// Check if paper already exists
		existing, _ := s.DB.GetPaperByID(arxivID)
		if existing != nil && existing.SummaryAI != "" {
			// Paper already summarized
			continue
		}

		// Call ML Service for AI Summarization
		mlResp, err := s.callMLService(arxivID, cleanTitle, cleanAbstract)
		if err != nil {
			log.Printf("[Scraper] Warning: ML service failed for %s: %v. Using fallback.", arxivID, err)
			mlResp = &MLResponse{
				SummaryAI:      cleanAbstract,
				RelevanceScore: 50,
				Tags:           []string{"#swarm-robotics", "#control-systems"},
			}
		}

		tagsJSON, _ := json.Marshal(mlResp.Tags)

		paper := &database.Paper{
			ID:             arxivID,
			Title:          cleanTitle,
			Authors:        authorsStr,
			SummaryRaw:     cleanAbstract,
			SummaryAI:      mlResp.SummaryAI,
			RelevanceScore: mlResp.RelevanceScore,
			Tags:           mlResp.Tags,
			PdfURL:         pdfURL,
			PublishedAt:    entry.Published,
		}

		if err := s.DB.SavePaper(paper, string(tagsJSON)); err != nil {
			log.Printf("[Scraper] Failed to save paper %s to DB: %v", arxivID, err)
			continue
		}
		savedCount++

		log.Printf("[Scraper] Saved Paper [%s] Score: %d Title: %s", arxivID, mlResp.RelevanceScore, cleanTitle)

		// WebSocket Notification
		if s.WSCallback != nil {
			s.WSCallback("NEW_PAPER", paper)
		}

		// High relevance MQTT alert for ESP32
		if mlResp.RelevanceScore >= 70 && s.MQTTCallback != nil {
			s.MQTTCallback(arxivID, cleanTitle, mlResp.RelevanceScore)
		}
	}

	s.DB.LogEvent(fmt.Sprintf("arXiv fetch complete. Saved %d new papers.", savedCount))
	return savedCount, nil
}

func (s *Scraper) callMLService(arxivID, title, abstract string) (*MLResponse, error) {
	reqPayload := MLRequest{
		ArxivID:  arxivID,
		Title:    title,
		Abstract: abstract,
	}

	jsonBytes, err := json.Marshal(reqPayload)
	if err != nil {
		return nil, err
	}

	client := &http.Client{Timeout: 30 * time.Second}
	resp, err := client.Post(s.MLServiceURL, "application/json", bytes.NewBuffer(jsonBytes))
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("ml-service status: %d", resp.StatusCode)
	}

	var mlResp MLResponse
	if err := json.NewDecoder(resp.Body).Decode(&mlResp); err != nil {
		return nil, err
	}

	return &mlResp, nil
}

func extractArxivID(rawID string) string {
	parts := strings.Split(rawID, "/abs/")
	if len(parts) > 1 {
		id := parts[1]
		if vIdx := strings.Index(id, "v"); vIdx != -1 {
			return id[:vIdx]
		}
		return id
	}
	return rawID
}
