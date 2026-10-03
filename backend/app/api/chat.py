import logging
from typing import Dict, Any, Optional, List
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.services.ai.classifier import RequestClassifier
from app.services.rag.vector_store import RAGVectorStore
from app.services.ai.huggingface_llm import HuggingFaceLLMService
from app.database.mongodb import MongoDBManager

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api", tags=["Chat & AI"])

class ChatRequest(BaseModel):
    user_request: str
    user_id: Optional[str] = "user@company.com"

class AnalyzeRequest(BaseModel):
    user_request: str

@router.post("/chat")
async def chat_endpoint(payload: ChatRequest) -> Dict[str, Any]:
    """Employee Self-Service AI Chatbot endpoint."""
    user_request = payload.user_request.strip()
    if not user_request:
        raise HTTPException(status_code=400, detail="User request cannot be empty.")

    # 1. Intent & Metadata Classification
    classification = RequestClassifier.classify(user_request)

    # 2. RAG Vector Search in FAISS
    vector_store = RAGVectorStore.get_instance()
    rag_chunks, sufficient_context, rag_score = vector_store.search(user_request, top_k=3)

    # 3. Grounded Answer Generation or No-Hallucination Guardrail
    llm_service = HuggingFaceLLMService.get_instance()
    
    if sufficient_context:
        answer = llm_service.generate_grounded_answer(user_request, rag_chunks, True)
        confidence = max(rag_score, classification["confidence"])
        human_escalation_required = False
        unsupported = False
    else:
        # Strict No-Hallucination Requirement
        answer = "Information unavailable in the approved knowledge base."
        confidence = round(rag_score if rag_score > 0 else 0.30, 2)
        human_escalation_required = True
        unsupported = True

    response_payload = {
        "user_request": user_request,
        "ai_response": answer,
        "workflow_type": classification["workflow_type"],
        "intent": classification["intent"],
        "category": classification["category"],
        "subcategory": classification["subcategory"],
        "priority": classification["priority"],
        "impact": classification["impact"],
        "urgency": classification["urgency"],
        "assignment_group": classification["assignment_group"],
        "summary": classification["summary"],
        "suggested_resolution": classification["suggested_resolution"],
        "confidence": confidence,
        "has_sufficient_context": sufficient_context,
        "unsupported": unsupported,
        "human_escalation_required": human_escalation_required,
        "automation_allowed": classification["automation_allowed"],
        "automation_action": classification["automation_action"],
        "requested_software": classification.get("requested_software"),
        "rag_sources": [
            {
                "title": c["title"],
                "source": c["filename"],
                "chunk": c["chunk"],
                "score": c.get("score", 0.0)
            }
            for c in rag_chunks
        ]
    }

    # Store in MongoDB chat_history
    try:
        chat_col = MongoDBManager.get_collection("chat_history")
        await chat_col.insert_one({
            "user_id": payload.user_id,
            "request": user_request,
            "response": response_payload
        })
    except Exception as e:
        logger.warning(f"Could not log chat history to MongoDB: {str(e)}")

    return response_payload

@router.post("/analyze")
async def analyze_endpoint(payload: AnalyzeRequest) -> Dict[str, Any]:
    """Dedicated AI Decision Pipeline analysis breakdown endpoint."""
    user_request = payload.user_request.strip()
    if not user_request:
        raise HTTPException(status_code=400, detail="User request cannot be empty.")

    classification = RequestClassifier.classify(user_request)
    vector_store = RAGVectorStore.get_instance()
    rag_chunks, sufficient_context, rag_score = vector_store.search(user_request, top_k=3)

    return {
        "request": user_request,
        "classification": classification,
        "rag_retrieval": {
            "has_sufficient_context": sufficient_context,
            "max_similarity_score": rag_score,
            "chunks_count": len(rag_chunks),
            "sources": rag_chunks
        },
        "decision": {
            "workflow": classification["workflow_type"],
            "confidence": max(rag_score, classification["confidence"]),
            "action_recommended": "Automate" if classification["automation_allowed"] else ("Answer via RAG" if sufficient_context else "Human Escalation")
        },
        "automation": {
            "eligible": classification["automation_allowed"],
            "action": classification["automation_action"],
            "mode": "MOCK"
        }
    }
