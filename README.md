# 📡 Autonomous Academic Paper Radar

<div align="center">

![License](https://img.shields.io/badge/License-MIT-blue.svg)
![Go](https://img.shields.io/badge/Backend-Go_1.21-00ADD8?logo=go)
![Python](https://img.shields.io/badge/ML-Python_3.10-3776AB?logo=python)
![Gemini AI](https://img.shields.io/badge/AI-Google_Gemini_3.6-8E7CC3?logo=google)
![React](https://img.shields.io/badge/Frontend-React_18-61DAFB?logo=react)
![ESP32](https://img.shields.io/badge/Hardware-ESP32_MQTT-000000?logo=espressif)
![Docker](https://img.shields.io/badge/Deployment-Docker_Compose-2496ED?logo=docker)

**Autonomous literature radar scanning arXiv, scoring relevance 1–100 with Gemini AI, and syncing with physical ESP32 desk hardware.**

[**Paper Referensi Springer**](https://rdcu.be/fyDRz) &bull; [**Arsitektur Sistem**](#-arsitektur-sistem) &bull; [**Panduan Instalasi**](#-panduan-instalasi-quick-start) &bull; [**Hardware ESP32**](#-esp32-desk-assistant)

</div>

---

## 📌 Penulis & Konteks Penelitian

* **Penulis**: Izmaherdian
* **Program**: Tesis Magister Teknik Instrumentasi & Kontrol, Institut Teknologi Bandung (ITB) 2026
* **Paper Referensi**: *Decentralized formation control system design for swarm quadcopters using an improved artificial potential field and event-based reconfiguration control*
* **DOI / Springer Link**: [10.1007/s44444-026-00111-4](https://rdcu.be/fyDRz)

---

## 🎯 Gambaran Umum

**Autonomous Academic Paper Radar** adalah platform pemantau literatur ilmiah berbasis agentic AI dan IoT. Sistem ini dirancang untuk mendeteksi, mengevaluasi, dan merangkum paper publikasi ilmiah terbaru dari arXiv secara otomatis yang relevan dengan topik riset **Swarm UAV Formation Control**, **Artificial Potential Field (APF)**, **Decentralized Multi-Agent Systems**, dan **Event-Based Control**.

Sistem ini mengintegrasikan mikroservis Go berkecepatan tinggi, kecerdasan buatan Google Gemini 3.6 Flash, dasbor web berestetika *calm academic editorial*, serta perangkat keras **ESP32 Desk Assistant** berbasis MQTT.

---

## ✨ Fitur-Fitur Utama

* 🔍 **arXiv Targeted Scraper (Dynamic Pagination)**:
  * Menggunakan pencarian terarah pada **Judul (`ti`)** dan **Abstrak (`abs`)** dengan operator logika `AND` untuk mencegah masuknya paper yang tidak relevan.
  * Offset pencarian otomatis disesuaikan dengan jumlah total paper di database (`start=TotalPapers`), menjamin setiap penarikan manual atau otomatis selalu mendapatkan paper baru yang lebih lama.
* 🤖 **Gemini AI Relevance Scoring (1–100)**:
  * Evaluasi relevansi granular skala 1–100 berdasarkan rubrik terbobot topik Swarm UAV, APF, terdesentralisasi, dan stabilitas Lyapunov.
  * Menghasilkan ringkasan analitis dalam Bahasa Indonesia (3–4 paragraf) dengan sintaks **bold** pada istilah-istilah teknis penting.
* 📟 **Physical ESP32 & Virtual Hardware Assistant**:
  * Koneksi real-time via Mosquitto MQTT Broker (port 1883).
  * Layar OLED SSD1306 menampilkan ID paper, judul, dan skor relevansi terbaru (score ≥ 70).
  * Tombol fisik/virtual **[F]** (*Fetch*) untuk memicu pencarian paper baru dan tombol **[S]** (*Star*) untuk memberi bintang pada paper yang sedang aktif.
* 🎨 **Serene Editorial UI & Showcase Landing Page**:
  * Antarmuka terang (*light mode*) berestetika tenang dan lega (*Plus Jakarta Sans* & *Playfair Display* font).
  * Fitur pencarian instan, filter skor minimum, pagination, dan toggle tampilan antara **Radar Dashboard** dan **Showcase Landing Page**.
* ⏰ **Penyimpanan Timestamp WIB (UTC+7)**:
  * Database mencatat secara eksplisit hari (`fetch_day`) dan jam (`fetch_time`) dalam Waktu Indonesia Barat saat paper berhasil disimpan.

---

## 🏗️ Arsitektur Sistem

Sistem ini berjalan dalam arsitektur mikroservis terisolasi menggunakan Docker Compose:

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

## 🚀 Panduan Instalasi (Quick Start)

### Prasyarat
- [Docker Engine](https://docs.docker.com/get-docker/) & [Docker Compose V2](https://docs.docker.com/compose/)
- Key API [Google Gemini AI](https://aistudio.google.com/)

### 1. Clone Repositori
```bash
git clone https://github.com/izmaherdian/AutonomousAcademicPaperRadar.git
cd AutonomousAcademicPaperRadar
```

### 2. Konfigurasi Environment Variable
Salin file `.env.example` menjadi `.env` dan masukkan `GEMINI_API_KEY` Anda:
```bash
cp .env.example .env
```

Isi file `.env`:
```env
GEMINI_API_KEY=YOUR_GEMINI_API_KEY_HERE
DB_PATH=/data/radar.db
MQTT_BROKER=broker:1883
ARXIV_FETCH_INTERVAL=@every 6h
PORT=8080
```

### 3. Build & Jalankan dengan Docker Compose
```bash
docker compose up --build -d
```

Buka browser Anda dan akses dasbor di: `http://localhost`

---

## 📟 ESP32 Desk Assistant

Perangkat ESP32 berfungsi sebagai asisten fisik di meja kerja Anda untuk memberikan notifikasi instan saat paper berelevansi tinggi ditemukan.

### Menjalankan Hardware Simulator (Python CLI)
Jika Anda tidak memiliki perangkat keras fisik ESP32, Anda dapat menggunakan simulator terminal bawaan:

```bash
# Jalankan simulator di Windows / Linux (menghubungkan ke server MQTT & HTTP)
set BACKEND_URL=http://localhost/api/v1
python esp32/simulator.py localhost
```

**Kontrol Simulator**:
- Tekan `f` + `Enter`: Memicu pencarian paper baru (Button F).
- Tekan `s` + `Enter`: Memberi bintang pada paper yang aktif di OLED (Button S).
- Tekan `q` + `Enter`: Keluar dari simulator.

### Firmware Hardware Fisik
Kode firmware C++ (PlatformIO) tersedia di folder `esp32/src/main.cpp`.
* **Pinout**:
  * OLED SSD1306 (I2C): `SDA = GPIO 21`, `SCL = GPIO 22`
  * Tombol F (Fetch): `GPIO 12` (Internal Pullup)
  * Tombol S (Star): `GPIO 14` (Internal Pullup)
  * LED Notifikasi: `GPIO 2`

---

## 📡 Topic MQTT & REST API Endpoints

### MQTT Topics
| Topic | Arah | Payload / Keterangan |
|---|---|---|
| `radar/control/button_fetch` | ESP32 &rarr; Backend | `{"action":"FETCH_NOW"}` — Memicu scraping arXiv |
| `radar/control/button_star` | ESP32 &rarr; Backend | `{"action":"STAR_CURRENT","paper_id":"2408.xxxxx"}` — Memberi bintang |
| `radar/paper/high_relevance` | Backend &rarr; ESP32 | `{"id":"...","title":"...","score":87}` — Alert paper skor ≥ 70 |

### REST API Endpoints (`/api/v1`)
| Method | Endpoint | Deskripsi |
|---|---|---|
| `GET` | `/api/v1/papers` | Mendapatkan daftar paper (filter: `search`, `starred_only`, `min_score`, `page`) |
| `GET` | `/api/v1/papers/{id}` | Detail paper berdasarkan arXiv ID |
| `PATCH` | `/api/v1/papers/{id}/star` | Mengubah status bintang (`is_starred: true/false`) |
| `PATCH` | `/api/v1/papers/{id}/read` | Mengubah status dibaca (`is_read: true/false`) |
| `POST` | `/api/v1/trigger-fetch` | Memicu pencarian manual arXiv di background |
| `GET` | `/api/v1/stats` | Mendapatkan statistik total paper, avg score, unread, & starred |

---

## 🗄️ Skema Database (SQLite)

Tabel `papers` disimpan secara persisten pada volume Docker `/data/radar.db`:

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

## 📁 Struktur Repositori

```
AutonomousAcademicPaperRadar/
├── .env.example               # Template environment configuration
├── docker-compose.yml         # Docker multi-container specification
├── README.md                  # Dokumentasi utama repositori
├── backend/                   # Microservice Go (REST API, Cron, WS, MQTT)
│   ├── main.go
│   └── internal/
│       ├── arxiv/             # arXiv XML Atom scraper & ML client
│       ├── database/          # SQLite WAL driver & migration
│       ├── handlers/          # HTTP REST handlers
│       ├── mqtt/              # Paho MQTT broker client
│       └── websocket/         # WebSocket broadcast hub
├── ml-service/                # Microservice Python FastAPI
│   ├── main.py
│   └── gemini_client.py       # Google Gemini 3.6 prompt & fallback engine
├── frontend/                  # Single Page Application React 18
│   ├── index.html
│   └── src/
│       ├── App.jsx            # State management & WebSocket listener
│       ├── components/        # Header, PaperCard, FilterBar, Showcase, ESP32 Widget
│       └── services/          # REST API & WebSocket client
├── esp32/                     # IoT Desk Assistant
│   ├── src/main.cpp           # Firmware PlatformIO (ESP32 C++)
│   └── simulator.py           # Terminal simulator (Python)
├── mosquitto/                 # Konfigurasi MQTT Broker
└── nginx/                     # Konfigurasi NGINX Reverse Proxy
```

---

## 📄 Lisensi & Hak Cipta

Dipublikasikan di bawah Lisensi MIT. Hak Cipta &copy; 2026 **Izmaherdian** — Penelitian Tesis S2 Magister Teknik Instrumentasi & Kontrol, Institut Teknologi Bandung (ITB).
