package database

import (
	"database/sql"
	"fmt"
	"log"
	"os"
	"path/filepath"
	"time"

	_ "github.com/mattn/go-sqlite3"
)

type DB struct {
	SqlDB *sql.DB
}

type Paper struct {
	ID             string   `json:"id"`
	Title          string   `json:"title"`
	Authors        string   `json:"authors"`
	SummaryRaw     string   `json:"summary_raw"`
	SummaryAI      string   `json:"summary_ai"`
	RelevanceScore int      `json:"relevance_score"`
	Tags           []string `json:"tags"`
	TagsRaw        string   `json:"-"`
	PdfURL         string   `json:"pdf_url"`
	PublishedAt    string   `json:"published_at"`
	IsStarred      bool     `json:"is_starred"`
	IsRead         bool     `json:"is_read"`
	CreatedAt      string   `json:"created_at"`
	FetchDay       string   `json:"fetch_day"`
	FetchTime      string   `json:"fetch_time"`
}

type SystemLog struct {
	ID        int64  `json:"id"`
	Event     string `json:"event"`
	CreatedAt string `json:"created_at"`
}

type Stats struct {
	TotalPapers int     `json:"total_papers"`
	AvgScore    float64 `json:"avg_score"`
	UnreadCount int     `json:"unread_count"`
	StarredCount int    `json:"starred_count"`
}

func InitDB(dbPath string) (*DB, error) {
	dir := filepath.Dir(dbPath)
	if err := os.MkdirAll(dir, 0755); err != nil {
		return nil, fmt.Errorf("failed to create db directory: %w", err)
	}

	sqlDB, err := sql.Open("sqlite3", dbPath+"?_journal_mode=WAL&_busy_timeout=5000")
	if err != nil {
		return nil, fmt.Errorf("failed to open sqlite database: %w", err)
	}

	db := &DB{SqlDB: sqlDB}
	if err := db.Migrate(); err != nil {
		return nil, fmt.Errorf("failed to run database migrations: %w", err)
	}

	log.Printf("SQLite database initialized at: %s", dbPath)
	return db, nil
}

func (db *DB) Migrate() error {
	query := `
	CREATE TABLE IF NOT EXISTS papers (
		id TEXT PRIMARY KEY,
		title TEXT NOT NULL,
		authors TEXT NOT NULL,
		summary_raw TEXT NOT NULL,
		summary_ai TEXT,
		relevance_score INTEGER DEFAULT 0,
		tags TEXT,
		pdf_url TEXT NOT NULL,
		published_at DATETIME NOT NULL,
		is_starred BOOLEAN DEFAULT 0,
		is_read BOOLEAN DEFAULT 0,
		created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
		fetch_day TEXT DEFAULT '',
		fetch_time TEXT DEFAULT ''
	);

	CREATE TABLE IF NOT EXISTS system_logs (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		event TEXT NOT NULL,
		created_at DATETIME DEFAULT CURRENT_TIMESTAMP
	);

	CREATE TABLE IF NOT EXISTS settings (
		key TEXT PRIMARY KEY,
		value TEXT NOT NULL
	);
	`
	_, err := db.SqlDB.Exec(query)
	if err != nil {
		return err
	}
	// Migration: add fetch_day/fetch_time columns if they don't exist yet (for existing DBs)
	_ = db.addColumnIfNotExists("papers", "fetch_day", "TEXT DEFAULT ''")
	_ = db.addColumnIfNotExists("papers", "fetch_time", "TEXT DEFAULT ''")
	return nil
}

func (db *DB) addColumnIfNotExists(table, column, definition string) error {
	_, err := db.SqlDB.Exec(fmt.Sprintf("ALTER TABLE %s ADD COLUMN %s %s", table, column, definition))
	return err
}

func (db *DB) LogEvent(event string) {
	query := `INSERT INTO system_logs (event) VALUES (?)`
	_, err := db.SqlDB.Exec(query, event)
	if err != nil {
		log.Printf("Failed to insert system log: %v", err)
	}
}

func (db *DB) SavePaper(p *Paper, tagsJSON string) error {
	// Capture WIB (UTC+7) day and time at moment of fetch
	wib := time.FixedZone("WIB", 7*3600)
	now := time.Now().In(wib)
	fetchDay := now.Weekday().String()   // e.g. "Monday"
	fetchTime := now.Format("15:04:05") // HH:MM:SS

	query := `
	INSERT INTO papers (id, title, authors, summary_raw, summary_ai, relevance_score, tags, pdf_url, published_at, fetch_day, fetch_time)
	VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
	ON CONFLICT(id) DO UPDATE SET
		title=excluded.title,
		authors=excluded.authors,
		summary_raw=excluded.summary_raw,
		summary_ai=excluded.summary_ai,
		relevance_score=excluded.relevance_score,
		tags=excluded.tags,
		pdf_url=excluded.pdf_url,
		published_at=excluded.published_at,
		fetch_day=excluded.fetch_day,
		fetch_time=excluded.fetch_time;
	`
	_, err := db.SqlDB.Exec(query, p.ID, p.Title, p.Authors, p.SummaryRaw, p.SummaryAI, p.RelevanceScore, tagsJSON, p.PdfURL, p.PublishedAt, fetchDay, fetchTime)
	return err
}

func (db *DB) GetPapers(page, limit int, search string, starredOnly bool, minScore int) ([]Paper, int, error) {
	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 20
	}
	offset := (page - 1) * limit

	whereClause := "WHERE relevance_score >= ?"
	args := []interface{}{minScore}

	if starredOnly {
		whereClause += " AND is_starred = 1"
	}
	if search != "" {
		whereClause += " AND (title LIKE ? OR summary_raw LIKE ? OR authors LIKE ?)"
		searchPattern := "%" + search + "%"
		args = append(args, searchPattern, searchPattern, searchPattern)
	}

	countQuery := fmt.Sprintf("SELECT COUNT(*) FROM papers %s", whereClause)
	var total int
	err := db.SqlDB.QueryRow(countQuery, args...).Scan(&total)
	if err != nil {
		return nil, 0, err
	}

	query := fmt.Sprintf(`
		SELECT id, title, authors, summary_raw, COALESCE(summary_ai, ''), relevance_score, COALESCE(tags, '[]'), pdf_url, published_at, is_starred, is_read, created_at, COALESCE(fetch_day,''), COALESCE(fetch_time,'')
		FROM papers
		%s
		ORDER BY published_at DESC, created_at DESC
		LIMIT ? OFFSET ?
	`, whereClause)

	args = append(args, limit, offset)
	rows, err := db.SqlDB.Query(query, args...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var papers []Paper
	for rows.Next() {
		var p Paper
		var tagsStr string
		err := rows.Scan(&p.ID, &p.Title, &p.Authors, &p.SummaryRaw, &p.SummaryAI, &p.RelevanceScore, &tagsStr, &p.PdfURL, &p.PublishedAt, &p.IsStarred, &p.IsRead, &p.CreatedAt, &p.FetchDay, &p.FetchTime)
		if err != nil {
			return nil, 0, err
		}
		p.TagsRaw = tagsStr
		papers = append(papers, p)
	}

	return papers, total, nil
}

func (db *DB) GetPaperByID(id string) (*Paper, error) {
	query := `
		SELECT id, title, authors, summary_raw, COALESCE(summary_ai, ''), relevance_score, COALESCE(tags, '[]'), pdf_url, published_at, is_starred, is_read, created_at, COALESCE(fetch_day,''), COALESCE(fetch_time,'')
		FROM papers WHERE id = ?
	`
	var p Paper
	var tagsStr string
	err := db.SqlDB.QueryRow(query, id).Scan(&p.ID, &p.Title, &p.Authors, &p.SummaryRaw, &p.SummaryAI, &p.RelevanceScore, &tagsStr, &p.PdfURL, &p.PublishedAt, &p.IsStarred, &p.IsRead, &p.CreatedAt, &p.FetchDay, &p.FetchTime)
	if err != nil {
		return nil, err
	}
	p.TagsRaw = tagsStr
	return &p, nil
}

func (db *DB) ToggleStar(id string, isStarred bool) error {
	query := `UPDATE papers SET is_starred = ? WHERE id = ?`
	_, err := db.SqlDB.Exec(query, isStarred, id)
	return err
}

func (db *DB) ToggleRead(id string, isRead bool) error {
	query := `UPDATE papers SET is_read = ? WHERE id = ?`
	_, err := db.SqlDB.Exec(query, isRead, id)
	return err
}

func (db *DB) GetStats() (Stats, error) {
	var s Stats
	query := `
		SELECT 
			COUNT(*),
			COALESCE(AVG(relevance_score), 0),
			SUM(CASE WHEN is_read = 0 THEN 1 ELSE 0 END),
			SUM(CASE WHEN is_starred = 1 THEN 1 ELSE 0 END)
		FROM papers
	`
	var unread, starred sql.NullInt64
	err := db.SqlDB.QueryRow(query).Scan(&s.TotalPapers, &s.AvgScore, &unread, &starred)
	if err != nil {
		return s, err
	}
	s.UnreadCount = int(unread.Int64)
	s.StarredCount = int(starred.Int64)
	return s, nil
}

func (db *DB) GetSetting(key, defaultValue string) string {
	var val string
	err := db.SqlDB.QueryRow("SELECT value FROM settings WHERE key = ?", key).Scan(&val)
	if err != nil {
		return defaultValue
	}
	return val
}

func (db *DB) SetSetting(key, value string) error {
	_, err := db.SqlDB.Exec("INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value", key, value)
	return err
}
