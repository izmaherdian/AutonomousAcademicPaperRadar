# 📡 Autonomous Academic Paper Radar

<div align="center">

![Go](https://img.shields.io/badge/Backend-Go_1.21-00ADD8?logo=go)
![Python](https://img.shields.io/badge/ML-Python_3.10-3776AB?logo=python)
![Gemini AI](https://img.shields.io/badge/AI-Google_Gemini_3.6-8E7CC3?logo=google)
![React](https://img.shields.io/badge/Frontend-React_18-61DAFB?logo=react)
![ESP32](https://img.shields.io/badge/Hardware-ESP32_MQTT-000000?logo=espressif)
![Docker](https://img.shields.io/badge/Deployment-Docker_Compose-2496ED?logo=docker)

**An autonomous literature radar scanning arXiv, evaluating relevance (1–100) via Gemini AI, and syncing with physical ESP32 desk hardware.**

[**Springer Reference Paper**](https://rdcu.be/fyDRz) &bull; [**System Architecture**](#-system-architecture) &bull; [**Quick Start Guide**](#-quick-start-guide) &bull; [**ESP32 Desk Assistant**](#-esp32-desk-assistant)

</div>

---

## 📌 Author & Research Context

* **Author**: Izmaherdian
* **Program**: Master's Degree in Instrumentation & Control Engineering, Institut Teknologi Bandung (ITB) 2026
* **Reference Paper**: *Decentralized formation control system design for swarm quadcopters using an improved artificial potential field and event-based reconfiguration control*
* **DOI / Springer Link**: [10.1007/s44444-026-00111-4](https://rdcu.be/fyDRz)

---

## 🎯 Overview

**Autonomous Academic Paper Radar** is an agentic AI and IoT-driven literature monitoring platform. The system is engineered to automatically discover, evaluate, and summarize the latest arXiv academic publications relevant to **Swarm UAV Formation Control**, **Artificial Potential Field (APF)**, **Decentralized Multi-Agent Systems**, and **Event-Based Reconfiguration Control**.

It harmonizes high-performance Go microservices, Google Gemini 3.6 Flash AI intelligence, a calm academic editorial web interface, and a physical/virtual **ESP32 Desk Assistant** connected via MQTT.

---

## ✨ Key Features

* 🔍 **arXiv Targeted Scraper (Dynamic Pagination)**:
  * Performs strict title (`ti`) and abstract (`abs`) phrase queries with boolean `AND` grouping to eliminate irrelevant literature.
  * Search offset automatically matches the total number of papers stored in the database (`start=TotalPapers`), ensuring every fetch operation retrieves a new batch of older publications.
* 🤖 **Gemini AI Relevance Scoring (1–100)**:
  * Evaluates papers on a granular 1–100 relevance scale based on a weighted rubric (Swarm UAVs, APF, decentralized control, Lyapunov stability).
  * Generates structured summaries in Indonesian with highlighted **bold** technical keywords.
* 📟 **Physical ESP32 & Virtual Hardware Assistant**:
  * Real-time MQTT synchronization via Mosquitto Broker (port 1883).
  * SSD1306 OLED screen displaying the paper ID, title, and relevance score (score ≥ 70).
  * Physical/virtual buttons **[F]** (*Fetch*) to trigger arXiv scraping and **[S]** (*Star*) to favorite the active paper.
* 🎨 **Serene Editorial UI & Showcase View**:
  * Light-mode user interface built with *Plus Jakarta Sans* & *Playfair Display* serif typography.
  * Instant search, min-score range filter, pagination, and a view switcher between the **Radar Dashboard** and **Showcase Landing Page**.
* ⏰ **WIB Timestamp Logging (UTC+7)**:
  * Database records the exact day (`fetch_day`) and time (`fetch_time`) in Western Indonesia Time (WIB) upon successful persistence.

---

## 🏗️ System Architecture

The application runs as isolated microservices managed by Docker Compose:

```
                              ┌────────────────────────┐
                              │     arXiv Atom API     │
                              └───────────▲────────────┘
                                          │ HTTP GET
┌──────────────────────┐      ┌───────────┴────────────┐      ┌──────────────────────┐
│  Browser / Frontend  │◄────►│      Backend (Go)      │◄────►│  ML Service (Python) │
│  React SPA + Tailw.  │  WS  │  REST API + WebSocket  │ HTTP │  FastAPI + Gemini AI │
└──────────────────────┘      └───────────┬────────────┘      └──────────────────────┘
           ▲                              │
           │ HTTP Proxy                   │ SQLite (/data/radar.db)
┌──────────┴───────────┐                  ▼
│  NGINX Reverse Proxy │      ┌────────────────────────┐
│  Port: 80 / 443      │      │ Mosquitto MQTT Broker  │
└──────────────────────┘      │ Port: 1883             │
                              └───────────▲────────────┘
                                          │ MQTT Publish/Subscribe
                              ┌───────────┴────────────┐
                              │ ESP32 Assistant / Sim  │
                              │ OLED Display & Buttons │
                              └────────────────────────┘
```

---

## 🚀 Quick Start Guide

### Prerequisites
- [Docker Engine](https://docs.docker.com/get-docker/) & [Docker Compose V2](https://docs.docker.com/compose/)
- [Google Gemini AI](https://aistudio.google.com/) API Key

### 1. Clone the Repository
```bash
git clone https://github.com/izmaherdian/AutonomousAcademicPaperRadar.git
cd AutonomousAcademicPaperRadar
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` and insert your `GEMINI_API_KEY`:
```bash
cp .env.example .env
```

Contents of `.env`:
```env
GEMINI_API_KEY=YOUR_GEMINI_API_KEY_HERE
DB_PATH=/data/radar.db
MQTT_BROKER=broker:1883
ARXIV_FETCH_INTERVAL=@every 6h
PORT=8080
```

### 3. Build & Run with Docker Compose
```bash
docker compose up --build -d
```

Open your browser and navigate to: `http://localhost`

---

## 📟 ESP32 Desk Assistant

The ESP32 hardware acts as a physical desk notification assistant when high-relevance papers are discovered.

### Terminal Hardware Simulator (Python CLI)
If physical ESP32 hardware is unavailable, run the included terminal simulator:

```bash
# Run simulator (connects to MQTT broker & REST API)
set BACKEND_URL=http://localhost/api/v1
python esp32/simulator.py localhost
```

**Simulator Controls**:
- Press `f` + `Enter`: Trigger arXiv paper fetch (Button F).
- Press `s` + `Enter`: Star active OLED paper (Button S).
- Press `q` + `Enter`: Exit simulator.

### Physical Hardware Firmware
C++ firmware source (PlatformIO) is available at `esp32/src/main.cpp`.
* **Hardware Pinout**:
  * SSD1306 OLED (I2C): `SDA = GPIO 21`, `SCL = GPIO 22`
  * Button F (Fetch): `GPIO 12` (Internal Pullup)
  * Button S (Star): `GPIO 14` (Internal Pullup)
  * Alert LED: `GPIO 2`

---

## 📡 MQTT Topics & REST API Endpoints

### MQTT Topics
| Topic | Direction | Payload / Description |
|---|---|---|
| `radar/control/button_fetch` | ESP32 &rarr; Backend | `{"action":"FETCH_NOW"}` — Triggers arXiv scraping |
| `radar/control/button_star` | ESP32 &rarr; Backend | `{"action":"STAR_CURRENT","paper_id":"2408.xxxxx"}` — Stars active paper |
| `radar/paper/high_relevance` | Backend &rarr; ESP32 | `{"id":"...","title":"...","score":87}` — High-relevance alert (score ≥ 70) |

### REST API Endpoints (`/api/v1`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/papers` | Retrieves paper list (filters: `search`, `starred_only`, `min_score`, `page`) |
| `GET` | `/api/v1/papers/{id}` | Paper details by arXiv ID |
| `PATCH` | `/api/v1/papers/{id}/star` | Toggles star status (`is_starred: true/false`) |
| `PATCH` | `/api/v1/papers/{id}/read` | Toggles read status (`is_read: true/false`) |
| `POST` | `/api/v1/trigger-fetch` | Triggers background arXiv fetch |
| `GET` | `/api/v1/stats` | Retrieves total papers, average score, unread, and starred stats |

---

## 🗄️ Database Schema (SQLite)

The `papers` table is persisted inside Docker volume at `/data/radar.db`:

```sql
CREATE TABLE IF NOT EXISTS papers (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    authors TEXT,
    summary_raw TEXT,
    summary_ai TEXT,
    relevance_score INTEGER DEFAULT 0,
    tags TEXT,
    pdf_url TEXT,
    published_at DATETIME,
    is_starred INTEGER DEFAULT 0,
    is_read INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    fetch_day TEXT DEFAULT '',
    fetch_time TEXT DEFAULT ''
);
```

---

## 📁 Repository Structure

```
AutonomousAcademicPaperRadar/
├── .env.example               # Environment configuration template
├── docker-compose.yml         # Multi-container Docker specification
├── README.md                  # Main repository documentation
├── backend/                   # Go Microservice (REST API, Cron, WS, MQTT)
│   ├── main.go
│   └── internal/
│       ├── arxiv/             # arXiv XML Atom scraper & ML client
│       ├── database/          # SQLite WAL driver & migrations
│       ├── handlers/          # HTTP REST handlers
│       ├── mqtt/              # Paho MQTT broker client
│       └── websocket/         # WebSocket broadcast hub
├── ml-service/                # Python FastAPI Microservice
│   ├── main.py
│   └── gemini_client.py       # Google Gemini 3.6 prompt & fallback engine
├── frontend/                  # React 18 Single Page Application
│   ├── index.html
│   └── src/
│       ├── App.jsx            # State management & WebSocket listener
│       ├── components/        # Header, PaperCard, FilterBar, Showcase, ESP32 Widget
│       └── services/          # REST API & WebSocket client
├── esp32/                     # IoT Desk Assistant
│   ├── src/main.cpp           # PlatformIO Firmware (ESP32 C++)
│   └── simulator.py           # Terminal Simulator (Python)
├── mosquitto/                 # MQTT Broker configuration
└── nginx/                     # NGINX Reverse Proxy configuration
```

---

<div align="center">

**Izmaherdian** &bull; Master's Thesis Research &bull; Institut Teknologi Bandung (ITB) 2026

</div>
