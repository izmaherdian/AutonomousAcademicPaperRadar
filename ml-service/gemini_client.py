import json
import logging
import os
import re
from typing import Dict, Any, List

logger = logging.getLogger("gemini_client")
logging.basicConfig(level=logging.INFO)

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
                logger.warning(f"Could not initialize genai SDK: {e}. Fallback to HTTP API will be used if needed.")

    def summarize_paper(self, arxiv_id: str, title: str, abstract: str) -> Dict[str, Any]:
        """
        Summarizes an academic paper abstract using Google Gemini API (gemini-flash-latest).
        Returns a dict with summary_ai (3 sentences), relevance_score (0-100), and tags.
        """
        if not self.api_key:
            logger.warning("GEMINI_API_KEY not set. Using rule-based fallback summary.")
            return self._generate_fallback(title, abstract)

        prompt = f"""You are an expert academic paper reviewer specializing in autonomous systems, control engineering, robotics, and UAVs.

Please analyze the following paper:
arXiv ID: {arxiv_id}
Title: {title}
Abstract: {abstract}

Required Output Format (MUST BE VALID JSON):
{{
  "summary_ai": "Sentence 1: The core problem being addressed. Sentence 2: The proposed method/approach. Sentence 3: The key result or performance gain achieved.",
  "relevance_score": <Integer from 0 to 100 representing relevance to autonomous systems, UAVs, swarm robotics, decentralized control, or control engineering>,
  "tags": ["#tag1", "#tag2", "#tag3"]
}}

Strict Rules:
- Return ONLY a raw JSON object. Do not include markdown code block syntax (like ```json).
- 'summary_ai' MUST contain exactly 3 concise sentences.
- 'relevance_score' must be an integer between 0 and 100.
- 'tags' must be a list of 2 to 4 hashtag topics relevant to the paper.
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

            logger.warning(f"Failed to parse Gemini response as JSON. Raw text: {raw_text}")
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
        with urllib.request.urlopen(req, timeout=30) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            return data["candidates"][0]["content"]["parts"][0]["text"]

    def _clean_and_parse_json(self, raw_text: str) -> Dict[str, Any]:
        try:
            # Clean markdown code blocks if present
            cleaned = re.sub(r'```(?:json)?\s*', '', raw_text)
            cleaned = cleaned.strip('`').strip()
            data = json.loads(cleaned)

            summary = str(data.get("summary_ai", "")).strip()
            score = int(data.get("relevance_score", 50))
            tags = data.get("tags", [])

            # Clamp score between 0 and 100
            score = max(0, min(100, score))

            if not isinstance(tags, list):
                tags = ["#research", "#paper"]
            tags = [t if t.startswith("#") else f"#{t}" for t in tags[:4]]

            if summary:
                return {
                    "summary_ai": summary,
                    "relevance_score": score,
                    "tags": tags
                }
        except Exception as e:
            logger.debug(f"JSON parse error: {e}")
        return None

    def _generate_fallback(self, title: str, abstract: str) -> Dict[str, Any]:

        sentences = [s.strip() for s in re.split(r'(?<=[.!?]) +', abstract) if s.strip()]
        if len(sentences) >= 3:
            summary_ai = f"{sentences[0]} {sentences[1]} {sentences[-1]}"
        elif len(sentences) > 0:
            summary_ai = " ".join(sentences[:3])
        else:
            summary_ai = abstract[:250] + "..."

        score = 50
        title_lower = title.lower() + " " + abstract.lower()
        keywords_weights = {
            "swarm": 25, "drone": 20, "vtol": 20, "uav": 20, "robotics": 15,
            "decentralized": 15, "consensus": 15, "control": 10, "autonomous": 15
        }
        for kw, weight in keywords_weights.items():
            if kw in title_lower:
                score += weight

        score = min(98, score)

        tags = ["#academic-paper"]
        if "swarm" in title_lower:
            tags.append("#swarm-robotics")
        if "control" in title_lower:
            tags.append("#control-systems")
        if "drone" in title_lower or "uav" in title_lower:
            tags.append("#uav-drones")

        return {
            "summary_ai": summary_ai,
            "relevance_score": score,
            "tags": tags
        }
