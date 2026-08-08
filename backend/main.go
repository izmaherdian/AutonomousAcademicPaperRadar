package main

import (
	"log"
	"net/http"
	"os"
	"strings"
	"time"

	"paper-radar/backend/internal/arxiv"
	"paper-radar/backend/internal/database"
	"paper-radar/backend/internal/handlers"
	mqttClient "paper-radar/backend/internal/mqtt"
	wsHub "paper-radar/backend/internal/websocket"

	"github.com/robfig/cron/v3"
)

func main() {
	log.Println("Starting Autonomous Academic Paper Radar Backend...")

	// 1. Load Configurations from Environment
	dbPath := getEnv("DB_PATH", "/data/radar.db")
	mqttBroker := getEnv("MQTT_BROKER", "broker:1883")
	mlServiceURL := getEnv("ML_SERVICE_URL", "http://ml-service:5000/summarize")
	defaultKeywords := getEnv("DEFAULT_KEYWORDS", "swarm UAV formation control, artificial potential field, decentralized multi-agent, event-based control quadcopter, swarm robotics obstacle avoidance")
	cronInterval := getEnv("ARXIV_FETCH_INTERVAL", "@every 6h")
	port := getEnv("PORT", "8080")

	// 2. Initialize Database
	db, err := database.InitDB(dbPath)
	if err != nil {
		log.Fatalf("Fatal: Database initialization failed: %v", err)
	}
	defer db.SqlDB.Close()

	// Keywords yang benar sesuai topik paper penelitian
	correctKeywords := "swarm UAV formation control, artificial potential field, decentralized multi-agent, event-based control quadcopter, swarm robotics obstacle avoidance"

	// Reset keywords jika masih pakai nilai lama atau kosong
	storedKw := db.GetSetting("keywords", "")
	oldDefaults := []string{
		"",
		"swarm robotics, decentralized control, drone vtol",
		"swarm UAV formation control, artificial potential field, decentralized multi-agent, event-based control quadcopter, swarm robotics obstacle avoidance",
	}
	isOldOrWrong := false
	for _, old := range oldDefaults {
		if storedKw == old {
			isOldOrWrong = true
			break
		}
	}
	if isOldOrWrong || storedKw == "" {
		_ = db.SetSetting("keywords", correctKeywords)
		log.Printf("[Startup] Keywords set to: %s", correctKeywords)
	} else {
		log.Printf("[Startup] Using stored keywords: %s", storedKw)
	}

	// 3. Initialize WebSocket Hub
	hub := wsHub.NewHub()
	go hub.Run()

	// 4. Initialize Scraper
	scraper := arxiv.NewScraper(db, mlServiceURL)
	scraper.WSCallback = func(event string, data interface{}) {
		hub.Broadcast(event, data)
	}

	// 5. Initialize MQTT Client
	mqttC := mqttClient.NewMQTTClient(mqttBroker)
	if err := mqttC.Connect(); err != nil {
		log.Printf("[MQTT] Warning: Could not connect to MQTT Broker: %v. Continuing without MQTT.", err)
	} else {
		log.Println("[MQTT] Client successfully initialized.")
	}

	scraper.MQTTCallback = func(paperID, title string, score int) {
		mqttC.PublishHighRelevanceAlert(paperID, title, score)
	}

	// Auto-fetch initial papers on backend startup if DB is empty
	go func() {
		time.Sleep(2 * time.Second)
		stats, err := db.GetStats()
		if err == nil && stats.TotalPapers == 0 {
			log.Println("[Startup] Database is empty. Performing initial arXiv paper fetch...")
			kw := db.GetSetting("keywords", defaultKeywords)
			scraper.FetchPapers(kw, 2)
		}
	}()

	mqttC.OnFetchTriggered = func() {
		log.Println("[MQTT Trigger] Fetching arXiv papers manually from ESP32 button press...")
		kw := db.GetSetting("keywords", defaultKeywords)
		hub.Broadcast("FETCH_STARTED", map[string]string{"keywords": kw, "source": "esp32"})
		count, err := scraper.FetchPapers(kw, 2)
		status := "completed"
		if err != nil {
			status = "failed"
			log.Printf("[MQTT Trigger] Fetch error: %v", err)
		}
		hub.Broadcast("FETCH_COMPLETED", map[string]interface{}{
			"count":  count,
			"status": status,
			"source": "esp32",
		})
	}

	mqttC.OnStarTriggered = func(paperID string) {
		log.Printf("[MQTT Trigger] Starring paper [%s] from ESP32 button press...", paperID)
		db.ToggleStar(paperID, true)
		hub.Broadcast("PAPER_STARRED", map[string]interface{}{
			"id":         paperID,
			"is_starred": true,
		})
	}

	// 6. Setup Cron Scheduler
	c := cron.New()
	_, err = c.AddFunc(cronInterval, func() {
		log.Println("[Cron Scheduler] Running periodic arXiv paper scraping job...")
		kw := db.GetSetting("keywords", defaultKeywords)
		scraper.FetchPapers(kw, 2)
	})
	if err != nil {
		log.Printf("[Cron Scheduler] Error scheduling cron job (%s): %v", cronInterval, err)
	} else {
		c.Start()
		log.Printf("[Cron Scheduler] Active with interval: %s", cronInterval)
	}

	// 7. Setup HTTP Handler & Routes
	h := handlers.NewHandler(db, scraper, hub)

	mux := http.NewServeMux()
	mux.HandleFunc("/api/v1/papers", h.GetPapers)
	mux.HandleFunc("/api/v1/papers/", func(w http.ResponseWriter, r *http.Request) {
		if strings.HasSuffix(r.URL.Path, "/star") {
			h.ToggleStar(w, r)
			return
		}
		if strings.HasSuffix(r.URL.Path, "/read") {
			h.ToggleRead(w, r)
			return
		}
		h.GetPaperByID(w, r)
	})
	mux.HandleFunc("/api/v1/trigger-fetch", h.TriggerFetch)
	mux.HandleFunc("/api/v1/stats", h.GetStats)
	mux.HandleFunc("/api/v1/keywords", h.KeywordsHandler)
	mux.HandleFunc("/ws", hub.ServeWS)

	// Healthcheck endpoint
	mux.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		handlers.JSONResponse(w, http.StatusOK, map[string]string{"status": "ok"})
	})

	log.Printf("Server listening on port :%s", port)
	if err := http.ListenAndServe(":"+port, mux); err != nil {
		log.Fatalf("Server failed to start: %v", err)
	}
}

func getEnv(key, defaultValue string) string {
	if value, exists := os.LookupEnv(key); exists && value != "" {
		return value
	}
	return defaultValue
}
