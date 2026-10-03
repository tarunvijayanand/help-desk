import logging
from typing import Dict, Any, Optional, List
from datetime import datetime
from app.services.servicenow.client import ServiceNowClient

logger = logging.getLogger(__name__)

class MockServiceNowClient(ServiceNowClient):
    _instance = None

    def __init__(self):
        self._incidents: Dict[str, Dict[str, Any]] = {}
        self._requests: Dict[str, Dict[str, Any]] = {}
        self._inc_counter = 1001
        self._req_counter = 1245

    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            cls._instance = MockServiceNowClient()
        return cls._instance

    async def create_incident(self, ticket_data: Dict[str, Any]) -> Dict[str, Any]:
        inc_id = f"INC00{self._inc_counter}"
        self._inc_counter += 1
        
        record = {
            "sys_id": f"mock_sys_{inc_id.lower()}",
            "number": inc_id,
            "short_description": ticket_data.get("subject", ticket_data.get("summary", "IT Support Incident")),
            "description": ticket_data.get("user_request", ""),
            "category": ticket_data.get("category", "Inquiry / Help"),
            "subcategory": ticket_data.get("subcategory", "General"),
            "priority": ticket_data.get("priority", "P3"),
            "state": "1",  # 1 = New, 2 = In Progress, 6 = Resolved
            "state_label": "New",
            "assignment_group": ticket_data.get("assignment_group", "Service Desk"),
            "comments": [f"Created via AI ITSM Helpdesk Intake pipeline"],
            "opened_at": datetime.now().isoformat(),
            "mode": "MOCK"
        }
        self._incidents[inc_id] = record
        logger.info(f"[MOCK ServiceNow] Created Incident: {inc_id}")
        return record

    async def get_incident(self, incident_id: str) -> Optional[Dict[str, Any]]:
        return self._incidents.get(incident_id)

    async def update_incident(self, incident_id: str, update_data: Dict[str, Any]) -> Dict[str, Any]:
        if incident_id not in self._incidents:
            # Create if missing for test resilience
            await self.create_incident({"subject": f"Auto-created {incident_id}"})
            
        record = self._incidents.get(incident_id, {})
        for k, v in update_data.items():
            record[k] = v
        
        if "state" in update_data and update_data["state"] == "6":
            record["state_label"] = "Resolved"

        logger.info(f"[MOCK ServiceNow] Updated Incident: {incident_id}")
        return record

    async def create_service_request(self, request_data: Dict[str, Any]) -> Dict[str, Any]:
        req_id = f"REQ00{self._req_counter}"
        self._req_counter += 1

        record = {
            "sys_id": f"mock_sys_{req_id.lower()}",
            "number": req_id,
            "short_description": f"Service Request: {request_data.get('software_name', 'IT Service')}",
            "requested_for": request_data.get("user_id", "user@company.com"),
            "stage": "Fulfilled",
            "state": "Closed Complete",
            "approval": "Approved",
            "created_at": datetime.now().isoformat(),
            "mode": "MOCK"
        }
        self._requests[req_id] = record
        logger.info(f"[MOCK ServiceNow] Created Service Request: {req_id}")
        return record
