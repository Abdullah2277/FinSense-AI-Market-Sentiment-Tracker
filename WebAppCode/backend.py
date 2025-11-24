import os
import httpx
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from transformers import pipeline

# --- Configuration ---
# 🔑 Get your free token from https://www.marketaux.com/
MARKETAUX_API_TOKEN = os.getenv("MARKETAUX_API_TOKEN", "DnVyLT1DxiY0jIqaZ1FyzOmhUllajAuGbGODwsfT")
MARKETAUX_URL = "https://api.marketaux.com/v1/news/all"

# Initialize FastAPI
app = FastAPI(title="FinBERT Sentiment API")

# --- CORS Configuration ---
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "*" 
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Model Loading ---
print("🧠 Loading FinBERT model...")
try:
    classifier = pipeline("text-classification", model="HussainR/finbert-finetuned")
    print("✅ Model loaded successfully!")
except Exception as e:
    print(f"❌ Failed to load model: {e}")
    classifier = None

# --- Data Models ---
class InputText(BaseModel):
    text: str

class SentimentObj(BaseModel):
    label: str
    score: float

class ArticleObj(BaseModel):
    title: str
    description: Optional[str] = None
    url: str
    source: str
    published_at: str
    sentiment: SentimentObj

class NewsResponse(BaseModel):
    ticker: Optional[str]
    count: int
    articles: List[ArticleObj]

# --- Helper Functions ---
async def fetch_news_from_api(ticker: Optional[str], limit: int):
    """
    Fetches news from MarketAux.
    Uses 'symbols' param if a ticker is provided, otherwise fetches latest general news.
    """
    if MARKETAUX_API_TOKEN == "DnVyLT1DxiY0jIqaZ1FyzOmhUllajAuGbGODwsfT":
        print("⚠️ WARNING: MarketAux Token is missing!")
    
    async with httpx.AsyncClient() as client:
        try:
            # MarketAux params
            params = {
                "api_token": MARKETAUX_API_TOKEN,
                "language": "en",
                "limit": limit
            }
            
            # If a ticker is provided, filter by that symbol (e.g., 'AAPL')
            if ticker:
                params["symbols"] = ticker

            response = await client.get(MARKETAUX_URL, params=params)
            response.raise_for_status()
            
            # MarketAux returns data in a "data" list, not "articles"
            return response.json().get("data", [])
            
        except httpx.HTTPStatusError as exc:
            print(f"MarketAux API Error {exc.response.status_code}: {exc.response.text}")
            return []
        except Exception as e:
            print(f"Error fetching news: {e}")
            return []

# --- Endpoints ---

@app.get("/")
def home():
    return {"message": "FinBERT Sentiment API (MarketAux Edition) is Running", "status": "active"}

@app.post("/predict")
def predict(item: InputText):
    if not classifier:
        raise HTTPException(status_code=500, detail="Model not loaded")
    return classifier(item.text)

@app.get("/news-with-sentiment", response_model=NewsResponse)
async def news_with_sentiment(ticker: str = Query(None), limit: int = 10):
    """
    Fetches news from MarketAux, runs FinBERT, and returns combined results.
    """
    if not classifier:
        raise HTTPException(status_code=500, detail="Model is initializing or failed.")

    # 1. Fetch News
    raw_articles = await fetch_news_from_api(ticker, limit)
    
    processed_articles = []

    # 2. Iterate and Classify
    for article in raw_articles:
        title = article.get("title")
        description = article.get("description")
        
        # Skip invalid data
        if not title:
            continue
            
        # Combine for context
        text_to_analyze = f"{title}. {description or ''}"
        
        try:
            # Run FinBERT
            result = classifier(text_to_analyze, truncation=True, max_length=512)[0]
            
            # MarketAux 'source' is usually a string (e.g. "bloomberg.com"), unlike NewsAPI's dict
            source_raw = article.get("source")
            source_name = source_raw if isinstance(source_raw, str) else "Unknown"

            processed_articles.append({
                "title": title,
                "description": description,
                "url": article.get("url"),
                "source": source_name,
                "published_at": article.get("published_at"), # MarketAux uses 'published_at'
                "sentiment": {
                    "label": result['label'],
                    "score": result['score']
                }
            })
        except Exception as e:
            print(f"Error analyzing article '{title}': {e}")
            continue

    return {
        "ticker": ticker,
        "count": len(processed_articles),
        "articles": processed_articles
    }