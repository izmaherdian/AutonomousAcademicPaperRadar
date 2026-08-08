package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"
	"strings"

	"paper-radar/backend/internal/arxiv"
	"paper-radar/backend/internal/database"
	"paper-radar/backend/internal/websocket"
)

type Handler struct {
	DB      *database.DB
	Scraper *arxiv.Scraper
	WSHub   *websocket.Hub
}

func NewHandler(db *database.DB, scraper *arxiv.Scraper, wsHub *websocket.Hub) *Handler {
	return &Handler{
		DB:      db,
		Scraper: scraper,
		WSHub:   wsHub,
	}
}

func JSONResponse(w http.ResponseWriter, statusCode int, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(statusCode)
	json.NewEncoder(w).Encode(data)
}

func JSONError(w http.ResponseWriter, statusCode int, message string) {
	JSONResponse(w, statusCode, map[string]string{"error": message})
}

// GET /api/v1/papers
func (h *Handler) GetPapers(w http.ResponseWriter, r *http.Request) {
	query := r.URL.Query()

	page, _ := strconv.Atoi(query.Get("page"))
	limit, _ := strconv.Atoi(query.Get("limit"))
	minScore, _ := strconv.Atoi(query.Get("min_score"))
	search := query.Get("search")
	starredOnly := query.Get("starred_only") == "true"

	papers, total, err := h.DB.GetPapers(page, limit, search, starredOnly, minScore)
	if err != nil {
		JSONError(w, http.StatusInternalServerError, err.Error())
		return
	}

	// Parse JSON tags for each paper
	for i := range papers {
		if papers[i].TagsRaw != "" {
			var tags []string
			if err := json.Unmarshal([]byte(papers[i].TagsRaw), &tags); err == nil {
				papers[i].Tags = tags
			}
		}
		if papers[i].Tags == nil {
			papers[i].Tags = []string{}
		}
	}

	JSONResponse(w, http.StatusOK, map[string]interface{}{
		"data":  papers,
		"total": total,
		"page":  page,
		"limit": limit,
	})
}

// GET /api/v1/papers/{id}
func (h *Handler) GetPaperByID(w http.ResponseWriter, r *http.Request) {
	id := strings.TrimPrefix(r.URL.Path, "/api/v1/papers/")
	if id == "" {
		JSONError(w, http.StatusBadRequest, "Paper ID is required")
		return
	}

	paper, err := h.DB.GetPaperByID(id)
	if err != nil {
		JSONError(w, http.StatusNotFound, "Paper not found")
		return
	}

	if paper.TagsRaw != "" {
		var tags []string
		if err := json.Unmarshal([]byte(paper.TagsRaw), &tags); err == nil {
			paper.Tags = tags
		}
	}

	JSONResponse(w, http.StatusOK, paper)
}

// PATCH /api/v1/papers/{id}/star
func (h *Handler) ToggleStar(w http.ResponseWriter, r *http.Request) {
	path := strings.TrimPrefix(r.URL.Path, "/api/v1/papers/")
	parts := strings.Split(path, "/")
	if len(parts) < 2 || parts[1] != "star" {
		JSONError(w, http.StatusBadRequest, "Invalid endpoint format")
		return
	}
	id := parts[0]

	var body struct {
		IsStarred bool `json:"is_starred"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		JSONError(w, http.StatusBadRequest, "Invalid JSON body")
		return
	}

	if err := h.DB.ToggleStar(id, body.IsStarred); err != nil {
		JSONError(w, http.StatusInternalServerError, err.Error())
		return
	}

	h.WSHub.Broadcast("PAPER_STARRED", map[string]interface{}{
		"id":         id,
		"is_starred": body.IsStarred,
	})

	JSONResponse(w, http.StatusOK, map[string]interface{}{
		"id":         id,
		"is_starred": body.IsStarred,
	})
}

// PATCH /api/v1/papers/{id}/read
func (h *Handler) ToggleRead(w http.ResponseWriter, r *http.Request) {
	path := strings.TrimPrefix(r.URL.Path, "/api/v1/papers/")
	parts := strings.Split(path, "/")
	if len(parts) < 2 || parts[1] != "read" {
		JSONError(w, http.StatusBadRequest, "Invalid endpoint format")
		return
	}
	id := parts[0]

	var body struct {
		IsRead bool `json:"is_read"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		JSONError(w, http.StatusBadRequest, "Invalid JSON body")
		return
	}

	if err := h.DB.ToggleRead(id, body.IsRead); err != nil {
		JSONError(w, http.StatusInternalServerError, err.Error())
		return
	}

	h.WSHub.Broadcast("PAPER_READ", map[string]interface{}{
		"id":      id,
		"is_read": body.IsRead,
	})

	JSONResponse(w, http.StatusOK, map[string]interface{}{
		"id":      id,
		"is_read": body.IsRead,
	})
}

// POST /api/v1/trigger-fetch
func (h *Handler) TriggerFetch(w http.ResponseWriter, r *http.Request) {
	var body struct {
		Keywords string `json:"keywords"`
	}
	_ = json.NewDecoder(r.Body).Decode(&body)

	if body.Keywords == "" {
		body.Keywords = h.DB.GetSetting("keywords", "swarm UAV formation control, artificial potential field, decentralized multi-agent, event-based control quadcopter, swarm robotics obstacle avoidance")
	}

	h.WSHub.Broadcast("FETCH_STARTED", map[string]string{"keywords": body.Keywords})

	go func(kw string) {
		count, err := h.Scraper.FetchPapers(kw, 2)
		status := "completed"
		if err != nil {
			status = "failed"
		}
		h.WSHub.Broadcast("FETCH_COMPLETED", map[string]interface{}{
			"count":  count,
			"status": status,
			"error":  err,
		})
	}(body.Keywords)

	JSONResponse(w, http.StatusAccepted, map[string]string{
		"message": "arXiv paper fetch triggered in background",
		"status":  "processing",
	})
}

// GET /api/v1/stats
func (h *Handler) GetStats(w http.ResponseWriter, r *http.Request) {
	stats, err := h.DB.GetStats()
	if err != nil {
		JSONError(w, http.StatusInternalServerError, err.Error())
		return
	}
	JSONResponse(w, http.StatusOK, stats)
}

// GET & POST /api/v1/keywords
func (h *Handler) KeywordsHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method == http.MethodGet {
		kw := h.DB.GetSetting("keywords", "swarm robotics, decentralized control, drone vtol")
		JSONResponse(w, http.StatusOK, map[string]string{"keywords": kw})
		return
	}

	if r.Method == http.MethodPost {
		var body struct {
			Keywords string `json:"keywords"`
		}
		if err := json.NewDecoder(r.Body).Decode(&body); err != nil || body.Keywords == "" {
			JSONError(w, http.StatusBadRequest, "Invalid keywords string")
			return
		}

		if err := h.DB.SetSetting("keywords", body.Keywords); err != nil {
			JSONError(w, http.StatusInternalServerError, err.Error())
			return
		}

		JSONResponse(w, http.StatusOK, map[string]string{
			"message":  "Keywords updated successfully",
			"keywords": body.Keywords,
		})
		return
	}

	JSONError(w, http.StatusMethodNotAllowed, "Method not allowed")
}

// WS /ws
func (h *Handler) ServeWS(w http.ResponseWriter, r *http.Request) {
	h.WSHub.ServeWS(w, r)
}
