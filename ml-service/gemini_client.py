import json
import logging
import os
import re
from typing import Dict, Any

logger = logging.getLogger("gemini_client")
logging.basicConfig(level=logging.INFO)

# ─── Reference paper context for relevance scoring ───────────────────────────
# User's paper: "Decentralized formation control for swarm quadcopters using
# improved artificial potential field & event-based reconfiguration control"
# DOI: 10.1007/s44444-026-00111-4
PAPER_CONTEXT = """
This is an S2 thesis paper on:
- Swarm UAVs / Quadcopters (multi-robot aerial systems)
- Decentralized Formation Control (no central coordinator)
- Artificial Potential Field (APF) — improved version for collision avoidance & formation keeping
- Event-Based Reconfiguration Control (trigger-driven, not time-driven)
- Multi-Agent Systems (distributed consensus, local neighbor interaction)
- Obstacle Avoidance in formation flight
- Lyapunov stability analysis for swarm systems
- Real-time reconfiguration when formation is disturbed or blocked
- PID / nonlinear controllers for quadcopter dynamics
- ROS / simulation environments (Gazebo, MATLAB) for validation
"""

# Weighted scoring parameters (1–100 scale)
# Sum of all max weights = 100
SCORING_RUBRIC = """
SCORING RUBRIC (total 1–100, be precise — use any integer, e.g. 53, 78, 31):

Primary Topic Match (max 45 pts — highest weight):
  +15 pts: Title directly mentions swarm UAV / quadcopter / multi-UAV / drone swarm
  +10 pts: Title mentions formation control / formation flying / flocking
  +10 pts: Title mentions artificial potential field (APF) / potential field method
  +10 pts: Title mentions decentralized control / distributed control

Secondary Topic Match (max 30 pts):
  +8  pts: Abstract mentions event-based / event-triggered control
  +8  pts: Abstract mentions multi-agent systems / consensus algorithm
  +7  pts: Abstract mentions obstacle avoidance / collision avoidance in aerial/UAV context
  +7  pts: Abstract mentions reconfiguration / adaptive formation / dynamic formation

Methodological Overlap (max 15 pts):
  +5  pts: Paper uses Lyapunov analysis / stability proof
  +5  pts: Paper involves real-time / embedded / onboard controller
  +5  pts: Paper involves ROS / Gazebo / MATLAB simulation of aerial robots

Broad Relevance (max 10 pts — for papers that are related but not direct matches):
  +4  pts: Abstract mentions autonomous systems / autonomous aerial vehicles
  +3  pts: Abstract mentions swarm intelligence / bio-inspired algorithms
  +3  pts: Abstract mentions control systems / nonlinear control / robust control for robots

Deductions:
  -5  pts: Paper is purely theoretical/mathematical with no robotics application
  -5  pts: Paper focuses on ground robots only (no UAV/aerial element)
  -10 pts: Paper topic is completely unrelated (e.g. medical, finance, NLP-only)

IMPORTANT: Give an exact integer score from 1 to 100. Do NOT round to 10/25/50/75.
A paper about swarm UAV formation with APF should score 85–100.
A paper about multi-agent systems without UAV focus should score 40–65.
A paper about control theory with no robotics should score 10–25.
"""


class GeminiSummarizer:
    def __init__(self):
        self.api_key = os.environ.get("GEMINI_API_KEY", "")
        self.model_name = "gemini-flash-latest"
        self.client = None

        if self.api_key:
            try:
                from google import genai
                self.client = genai.Client(api_key=self.api_key)
                logger.info(f"Initialized Google Gemini Client using model: {self.model_name}")
            except Exception as e:
                logger.warning(f"Could not initialize genai SDK: {e}.")

    def summarize_paper(self, arxiv_id: str, title: str, abstract: str) -> Dict[str, Any]:
        """
        Summarizes an academic paper using Google Gemini API.
        Returns Indonesian summary (3-5 paragraphs), granular relevance_score (1-100), and topic tags.
        """
        if not self.api_key:
            logger.warning("GEMINI_API_KEY not set. Using rule-based fallback summary.")
            return self._generate_fallback(title, abstract)

        prompt = f"""Kamu adalah seorang reviewer paper akademik senior yang ahli dalam sistem kontrol, robotika swarm, UAV, dan sistem multi-agen. Tugas kamu adalah menganalisis paper berikut dan memberikan ringkasan MENARIK dalam BAHASA INDONESIA yang membuat pembaca ingin membaca paper tersebut secara lengkap.

KONTEKS PAPER REFERENSI:
{PAPER_CONTEXT}

PAPER YANG DIANALISIS:
arXiv ID: {arxiv_id}
Judul: {title}
Abstrak: {abstract}

{SCORING_RUBRIC}

FORMAT OUTPUT (HARUS JSON VALID):
{{
  "summary_ai": "PARAGRAF 1: Awali dengan kalimat pembuka yang menarik — jelaskan masalah utama yang dihadapi penelitian ini, mengapa masalah ini penting dan menantang secara teknis. Buat pembaca merasa 'oh ini relevan!'. PARAGRAF 2: Jelaskan pendekatan/metode yang diusulkan oleh peneliti dengan bahasa yang antusias — apa yang unik dan berbeda dari solusi yang ada sebelumnya? PARAGRAF 3: Sampaikan hasil-hasil kunci dan pencapaian yang dicapai — berikan angka/metrik jika ada di abstrak. PARAGRAF 4 (opsional): Jelaskan mengapa paper ini penting untuk dibaca dan apa kontribusinya ke bidang penelitian swarm UAV/formation control. Pisahkan setiap paragraf dengan karakter \\n\\n.",
  "relevance_score": <integer 1-100, ikuti rubrik penilaian di atas dengan tepat>,
  "tags": ["#tag1", "#tag2", "#tag3", "#tag4"]
}}

ATURAN KETAT:
- Kembalikan HANYA JSON mentah (tanpa markdown code block seperti ```json).
- summary_ai HARUS dalam BAHASA INDONESIA, menarik, dan mengundang rasa ingin tahu.
- summary_ai harus 3–4 paragraf, dipisahkan dengan \\n\\n, total minimal 200 kata.
- relevance_score HARUS integer tepat 1-100 sesuai rubrik, bukan pembulatan ke 10/25/50/75.
- tags harus 3–5 hashtag yang SPESIFIK mencerminkan topik paper (contoh: #swarm-uav, #formation-control, #artificial-potential-field, #decentralized-control, #event-based-control). JANGAN gunakan tag generik seperti #arxiv atau #research.
"""

        try:
            raw_text = ""
            if self.client:
                response = self.client.models.generate_content(
                    model=self.model_name,
                    contents=prompt
                )
                raw_text = response.text
            else:
                raw_text = self._call_rest_api(prompt)

            parsed = self._clean_and_parse_json(raw_text)
            if parsed:
                return parsed

            logger.warning(f"Failed to parse Gemini response as JSON for {arxiv_id}. Raw: {raw_text[:300]}")
            return self._generate_fallback(title, abstract)

        except Exception as e:
            logger.error(f"Error calling Gemini API for paper {arxiv_id}: {e}")
            return self._generate_fallback(title, abstract)

    def _call_rest_api(self, prompt: str) -> str:
        import urllib.request
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{self.model_name}:generateContent?key={self.api_key}"
        payload = json.dumps({
            "contents": [{"parts": [{"text": prompt}]}]
        }).encode("utf-8")
        headers = {"Content-Type": "application/json"}
        req = urllib.request.Request(url, data=payload, headers=headers, method="POST")
        with urllib.request.urlopen(req, timeout=45) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            return data["candidates"][0]["content"]["parts"][0]["text"]

    def _clean_and_parse_json(self, raw_text: str) -> Dict[str, Any]:
        try:
            cleaned = re.sub(r'```(?:json)?\s*', '', raw_text)
            cleaned = cleaned.strip('`').strip()
            data = json.loads(cleaned)

            summary = str(data.get("summary_ai", "")).strip()
            score = int(data.get("relevance_score", 50))
            tags = data.get("tags", [])

            # Clamp score between 1 and 100
            score = max(1, min(100, score))

            if not isinstance(tags, list):
                tags = ["#swarm-robotics", "#control-systems"]
            # Ensure hashtag prefix and filter generic tags
            processed_tags = []
            for t in tags[:5]:
                t = t.strip()
                if not t.startswith("#"):
                    t = f"#{t}"
                # Reject purely generic tags
                if t.lower() not in ["#arxiv", "#research", "#paper", "#academic"]:
                    processed_tags.append(t)
            if not processed_tags:
                processed_tags = ["#swarm-robotics", "#control-systems"]

            if summary:
                return {
                    "summary_ai": summary,
                    "relevance_score": score,
                    "tags": processed_tags
                }
        except Exception as e:
            logger.debug(f"JSON parse error: {e}")
        return None

    def _generate_fallback(self, title: str, abstract: str) -> Dict[str, Any]:
        """Rule-based fallback with granular 1-100 scoring matching paper topics."""
        sentences = [s.strip() for s in re.split(r'(?<=[.!?]) +', abstract) if s.strip()]
        if len(sentences) >= 3:
            summary_ai = (
                f"Paper ini membahas tentang: {sentences[0]} "
                f"{sentences[1]} "
                f"Secara umum, {sentences[-1]}"
            )
        elif sentences:
            summary_ai = " ".join(sentences)
        else:
            summary_ai = abstract[:300] + "..."

        title_abs = (title + " " + abstract).lower()

        # Granular scoring based on paper reference topics
        score = 5  # base

        # Primary topics (high weight)
        primary = {
            "swarm uav": 15, "swarm quadcopter": 15, "multi-uav": 15, "drone swarm": 15,
            "uav swarm": 15, "formation control": 10, "formation flying": 10,
            "flocking": 8, "artificial potential field": 10, "apf": 8,
            "decentralized control": 10, "distributed control": 9,
        }
        for kw, w in primary.items():
            if kw in title_abs:
                score += w

        # Secondary topics
        secondary = {
            "event-based": 8, "event-triggered": 8, "multi-agent": 7,
            "consensus": 7, "obstacle avoidance": 7, "collision avoidance": 6,
            "reconfiguration": 7, "adaptive formation": 6,
        }
        for kw, w in secondary.items():
            if kw in title_abs:
                score += w

        # Methodological
        methods = {
            "lyapunov": 5, "real-time": 4, "embedded": 3,
            "ros": 4, "gazebo": 4, "matlab": 3,
            "quadcopter": 6, "uav": 8, "drone": 6,
        }
        for kw, w in methods.items():
            if kw in title_abs:
                score += w

        # Broad relevance
        broad = {
            "autonomous": 3, "swarm intelligence": 3, "bio-inspired": 2,
            "nonlinear control": 2, "robust control": 2,
        }
        for kw, w in broad.items():
            if kw in title_abs:
                score += w

        score = max(1, min(98, score))

        # Generate meaningful tags
        tags = []
        if any(k in title_abs for k in ["uav", "quadcopter", "drone", "aerial"]):
            tags.append("#swarm-uav")
        if "formation" in title_abs:
            tags.append("#formation-control")
        if "potential field" in title_abs or "apf" in title_abs:
            tags.append("#artificial-potential-field")
        if "decentralized" in title_abs or "distributed" in title_abs:
            tags.append("#decentralized-control")
        if "event" in title_abs:
            tags.append("#event-based-control")
        if "multi-agent" in title_abs or "consensus" in title_abs:
            tags.append("#multi-agent-systems")
        if "obstacle" in title_abs or "collision" in title_abs:
            tags.append("#obstacle-avoidance")
        if not tags:
            tags = ["#swarm-robotics", "#control-systems"]

        return {
            "summary_ai": summary_ai,
            "relevance_score": score,
            "tags": tags[:5]
        }
