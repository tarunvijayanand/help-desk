import logging
from typing import List, Dict, Any, Optional
from datetime import datetime
from fastapi import APIRouter, HTTPException, Query
from app.models.ticket import TicketCreate, TicketResponse
from app.database.mongodb import MongoDBManager, clean_mongo_doc
from app.services.servicenow.client import get_servicenow_client
from app.config import settings

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/tickets", tags=["Tickets"])

@router.post("", response_model=Dict[str, Any])
async def create_ticket(payload: TicketCreate):
    """Creates an ITSM ticket in MongoDB and syncs with ServiceNow."""
    sn_client = get_servicenow_client()
    
    # Create ServiceNow incident
    sn_record = await sn_client.create_incident(payload.model_dump())
    servicenow_id = sn_record.get("number", "INC001001")

    now_str = datetime.now().isoformat()
    ticket_id = f"TCK-{int(datetime.now().timestamp() * 1000) % 1000000}"

    ticket_doc = {
        "ticket_id": ticket_id,
        "subject": payload.subject,
        "user_request": payload.user_request,
        "intent": payload.intent or "Incident",
        "category": payload.category or "General IT",
        "subcategory": payload.subcategory or "General",
        "priority": payload.priority or "P3",
        "impact": payload.impact or "Individual",
        "urgency": payload.urgency or "Medium",
        "assignment_group": payload.assignment_group or "Service Desk",
        "summary": payload.summary or payload.subject,
        "suggested_resolution": payload.suggested_resolution or "",
        "status": "Open",
        "ai_status": "AI Analyzed",
        "confidence": payload.confidence or 0.95,
        "servicenow_id": servicenow_id,
        "servicenow_mode": settings.SERVICENOW_MODE.upper(),
        "rag_sources": [s.model_dump() for s in payload.rag_sources],
        "created_at": now_str,
        "updated_at": now_str
    }

    # Store in MongoDB
    col = MongoDBManager.get_collection("tickets")
    await col.insert_one(ticket_doc)

    # Store audit entry
    audit_col = MongoDBManager.get_collection("audit_logs")
    await audit_col.insert_one({
        "timestamp": now_str,
        "action": "Ticket Created",
        "ticket_id": servicenow_id,
        "status": "Open",
        "result": f"Incident created with ServiceNow ID {servicenow_id}",
        "actor": "Intelligent Ticket Intake",
        "mode": settings.SERVICENOW_MODE.upper(),
        "details": {"subject": payload.subject, "category": payload.category}
    })

    return clean_mongo_doc(ticket_doc)

@router.get("", response_model=List[Dict[str, Any]])
async def list_tickets(
    status: Optional[str] = None,
    priority: Optional[str] = None,
    category: Optional[str] = None,
    assignment_group: Optional[str] = None
):
    """Retrieves tickets from database with filtering options."""
    col = MongoDBManager.get_collection("tickets")
    query = {}
    if status and status != "All":
        query["status"] = status
    if priority and priority != "All":
        query["priority"] = priority
    if category and category != "All":
        query["category"] = category
    if assignment_group and assignment_group != "All":
        query["assignment_group"] = assignment_group

    cursor = col.find(query).sort("created_at", -1)
    tickets = await cursor.to_list(length=200)

    # If database is fresh/empty, provide pre-seeded enterprise tickets for rich demonstration
    if not tickets:
        tickets = get_seed_tickets()
        for t in tickets:
            await col.insert_one(dict(t))

    return clean_mongo_doc(tickets)

@router.get("/{ticket_id}")
async def get_ticket(ticket_id: str):
    col = MongoDBManager.get_collection("tickets")
    doc = await col.find_one({"$or": [{"ticket_id": ticket_id}, {"servicenow_id": ticket_id}]})
    if not doc:
        # Check seed list
        for t in get_seed_tickets():
            if t["ticket_id"] == ticket_id or t["servicenow_id"] == ticket_id:
                return t
        raise HTTPException(status_code=404, detail=f"Ticket {ticket_id} not found.")
    return clean_mongo_doc(doc)

@router.put("/{ticket_id}")
async def update_ticket(ticket_id: str, payload: Dict[str, Any]):
    col = MongoDBManager.get_collection("tickets")
    payload["updated_at"] = datetime.now().isoformat()
    await col.update_one({"$or": [{"ticket_id": ticket_id}, {"servicenow_id": ticket_id}]}, {"$set": payload})
    return {"message": "Ticket updated successfully", "ticket_id": ticket_id}

def get_seed_tickets():
    now = datetime.now().isoformat()
    return [
        {
            "ticket_id": "TCK-1001",
            "subject": "VPN connection failing - Authentication error",
            "user_request": "I cannot connect to VPN since this morning. Authentication keeps failing.",
            "intent": "Incident",
            "category": "Network",
            "subcategory": "VPN",
            "priority": "P2",
            "impact": "Individual",
            "urgency": "High",
            "assignment_group": "Network Support",
            "summary": "VPN authentication failure and tunnel setup issue",
            "suggested_resolution": "Verify MFA push, restart GlobalProtect client, flush DNS.",
            "status": "In Progress",
            "ai_status": "AI Analyzed",
            "confidence": 0.94,
            "servicenow_id": "INC001001",
            "servicenow_mode": "MOCK",
            "rag_sources": [
                {
                    "title": "VPN Troubleshooting Guide",
                    "source": "vpn_troubleshooting.md",
                    "chunk": "Verify internet connectivity and check domain credentials before restarting GlobalProtect agent.",
                    "score": 0.89
                }
            ],
            "created_at": now,
            "updated_at": now
        },
        {
            "ticket_id": "TCK-1002",
            "subject": "Password reset for expired Active Directory account",
            "user_request": "My domain password has expired and I am locked out.",
            "intent": "Password Reset",
            "category": "Identity & Access",
            "subcategory": "Password Expiry",
            "priority": "P3",
            "impact": "Individual",
            "urgency": "Medium",
            "assignment_group": "Identity & Security",
            "summary": "Self-service password reset",
            "suggested_resolution": "Executed automated password reset.",
            "status": "Resolved",
            "ai_status": "AI Resolved",
            "confidence": 0.98,
            "servicenow_id": "INC001002",
            "servicenow_mode": "MOCK",
            "rag_sources": [],
            "created_at": now,
            "updated_at": now
        }
    ]
