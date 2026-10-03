from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

class RAGSource(BaseModel):
    title: str
    source: str
    chunk: str
    score: float

class TicketCreate(BaseModel):
    subject: str
    user_request: str
    intent: Optional[str] = "Incident"
    category: Optional[str] = "General IT"
    subcategory: Optional[str] = "General"
    priority: Optional[str] = "P3"
    impact: Optional[str] = "Individual"
    urgency: Optional[str] = "Medium"
    assignment_group: Optional[str] = "Service Desk"
    summary: Optional[str] = ""
    suggested_resolution: Optional[str] = ""
    confidence: Optional[float] = 0.95
    rag_sources: List[RAGSource] = []

class TicketResponse(BaseModel):
    ticket_id: str
    subject: str
    user_request: str
    intent: str
    category: str
    subcategory: str
    priority: str
    impact: str
    urgency: str
    assignment_group: str
    summary: str
    suggested_resolution: str
    status: str = "Open"
    ai_status: str = "AI Analyzed"
    confidence: float
    servicenow_id: Optional[str] = None
    servicenow_mode: str = "MOCK"
    rag_sources: List[RAGSource] = []
    created_at: str
    updated_at: str
