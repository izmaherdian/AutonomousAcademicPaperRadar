import logging
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from typing import List
from gemini_client import GeminiSummarizer

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("ml-service")

app = FastAPI(
    title="Autonomous Paper Radar ML Service",
    description="FastAPI service connecting to Google Gemini API (gemini-flash-latest) for paper summarization & scoring",
    version="1.0.0"
)

summarizer = GeminiSummarizer()

class SummarizeRequest(BaseModel):
    arxiv_id: str = Field(..., example="2408.01234")
    title: str = Field(..., example="Decentralized Swarm Robot Control under Wind Disturbances")
    abstract: str = Field(..., example="Full abstract text here...")

class SummarizeResponse(BaseModel):
    summary_ai: str
    relevance_score: int
    tags: List[str]

@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "service": "ml-service",
        "gemini_api_key_set": bool(summarizer.api_key),
        "model": summarizer.model_name
    }

@app.post("/summarize", response_model=SummarizeResponse)
def summarize_paper(payload: SummarizeRequest):
    logger.info(f"Received summarize request for paper [{payload.arxiv_id}]: {payload.title[:50]}...")
    if not payload.abstract:
        raise HTTPException(status_code=400, detail="Abstract cannot be empty")
    
    result = summarizer.summarize_paper(
        arxiv_id=payload.arxiv_id,
        title=payload.title,
        abstract=payload.abstract
    )
    
    return SummarizeResponse(
        summary_ai=result["summary_ai"],
        relevance_score=result["relevance_score"],
        tags=result["tags"]
    )
