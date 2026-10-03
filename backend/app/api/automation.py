import logging
from typing import Dict, Any, List, Optional
from fastapi import APIRouter, HTTPException
from app.models.automation import AutomationRequest
from app.services.automation.executor import AutomationExecutor
from app.database.mongodb import MongoDBManager, clean_mongo_doc

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/automation", tags=["Automation"])

@router.post("/execute")
async def execute_automation(payload: AutomationRequest) -> Dict[str, Any]:
    """Triggers self-healing automation (Password Reset, Account Unlock, Service Restart)."""
    if not payload.action:
        raise HTTPException(status_code=400, detail="Automation action is required.")

    res = await AutomationExecutor.execute_automation(
        action=payload.action,
        ticket_id=payload.ticket_id or "INC001001",
        actor="Self-Heal Agent",
        details=payload.details or {}
    )
    return clean_mongo_doc(res)

@router.get("/audit", response_model=List[Dict[str, Any]])
async def get_audit_logs(limit: int = 100):
    """Retrieves system-wide audit timeline records."""
    audit_col = MongoDBManager.get_collection("audit_logs")
    cursor = audit_col.find().sort("timestamp", -1).limit(limit)
    logs = await cursor.to_list(length=limit)

    # Seed initial audit logs if collection is empty
    if not logs:
        from datetime import datetime
        now = datetime.now().isoformat()
        logs = [
            {
                "id": "aud_1",
                "timestamp": now,
                "action": "Password Reset",
                "ticket_id": "INC001002",
                "status": "Success",
                "result": "Active Directory domain password reset completed successfully.",
                "actor": "Self-Heal Agent",
                "mode": "MOCK",
                "details": {"validation": "MFA Verified & Policy Applied"}
            },
            {
                "id": "aud_2",
                "timestamp": now,
                "action": "Software Provisioning: Visual Studio Code",
                "ticket_id": "REQ001245",
                "status": "Success",
                "result": "Software Visual Studio Code provisioned via Mock Provisioning API.",
                "actor": "Provisioning Engine",
                "mode": "MOCK",
                "details": {"software": "Visual Studio Code"}
            }
        ]
        for l in logs:
            await audit_col.insert_one(dict(l))

    return clean_mongo_doc(logs)
