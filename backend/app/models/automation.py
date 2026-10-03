from pydantic import BaseModel
from typing import Optional, Dict, Any

class AutomationRequest(BaseModel):
    action: str
    ticket_id: Optional[str] = "INC001001"
    user_id: Optional[str] = "user@company.com"
    details: Optional[Dict[str, Any]] = {}

class AuditLogEntry(BaseModel):
    id: Optional[str] = None
    timestamp: str
    action: str
    ticket_id: str
    status: str
    result: str
    actor: str
    mode: str = "MOCK"
    details: Dict[str, Any] = {}

class AutomationResponse(BaseModel):
    action: str
    ticket_id: str
    status: str
    result: str
    mode: str = "MOCK"
    execution_time: str
    validation: str
    servicenow_updated: bool
    audit_entry: AuditLogEntry
