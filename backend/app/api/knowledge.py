import os
import glob
import logging
from typing import List, Dict, Any
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.config import settings
from app.services.rag.vector_store import RAGVectorStore

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/knowledge", tags=["Knowledge Base"])

class SearchRequest(BaseModel):
    query: str
    top_k: int = 3

@router.get("", response_model=List[Dict[str, Any]])
async def list_knowledge_articles():
    """Lists all approved knowledge base articles."""
    kb_dir = settings.KNOWLEDGE_BASE_DIR
    articles = []

    if os.path.exists(kb_dir):
        md_files = glob.glob(os.path.join(kb_dir, "*.md"))
        for file_path in md_files:
            filename = os.path.basename(file_path)
            art_id = filename.replace(".md", "")
            title = art_id.replace("_", " ").title()
            
            with open(file_path, "r", encoding="utf-8") as f:
                content = f.read()

            lines = [l.strip() for l in content.split("\n") if l.strip()]
            short_desc = lines[1] if len(lines) > 1 and not lines[1].startswith("#") else (lines[0] if lines else "")
            
            # Extract category mapping
            category = "General IT"
            if "vpn" in art_id or "wifi" in art_id:
                category = "Network"
            elif "password" in art_id or "account" in art_id or "access" in art_id:
                category = "Identity & Security"
            elif "outlook" in art_id:
                category = "Collaboration"
            elif "software" in art_id or "laptop" in art_id:
                category = "Hardware & Software"

            articles.append({
                "id": art_id,
                "title": title,
                "category": category,
                "filename": filename,
                "short_description": short_desc[:140] + "...",
                "content": content
            })

    return articles

@router.get("/{article_id}")
async def get_article(article_id: str):
    kb_dir = settings.KNOWLEDGE_BASE_DIR
    file_path = os.path.join(kb_dir, f"{article_id}.md")
    if not os.path.exists(file_path):
        # Check if requested by title
        md_files = glob.glob(os.path.join(kb_dir, "*.md"))
        for f in md_files:
            if article_id.lower() in os.path.basename(f).lower():
                file_path = f
                break

    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail=f"Knowledge article '{article_id}' not found.")

    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()

    filename = os.path.basename(file_path)
    art_id = filename.replace(".md", "")

    return {
        "id": art_id,
        "title": art_id.replace("_", " ").title(),
        "filename": filename,
        "content": content
    }

@router.post("/search")
async def search_knowledge(payload: SearchRequest):
    """Executes semantic vector search across FAISS index."""
    query = payload.query.strip()
    if not query:
        raise HTTPException(status_code=400, detail="Query string cannot be empty.")

    store = RAGVectorStore.get_instance()
    results, sufficient, score = store.search(query, top_k=payload.top_k)

    return {
        "query": query,
        "results": results,
        "has_sufficient_context": sufficient,
        "max_similarity_score": score,
        "threshold": settings.RAG_SIMILARITY_THRESHOLD
    }
