from pydantic import BaseModel
from typing import List, Optional

class KnowledgeArticle(BaseModel):
    id: str
    title: str
    category: str
    filename: str
    short_description: str
    content: str

class SearchResultChunk(BaseModel):
    title: str
    filename: str
    chunk: str
    score: float

class KnowledgeSearchResponse(BaseModel):
    query: str
    results: List[SearchResultChunk]
    has_sufficient_context: bool
    confidence: float
