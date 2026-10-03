import httpx
import logging
from typing import Dict, Any, Optional
from app.config import settings
from app.services.servicenow.client import ServiceNowClient

logger = logging.getLogger(__name__)

class RealServiceNowClient(ServiceNowClient):
    """Real REST API Integration for ServiceNow Table API."""
    
    def __init__(self):
        self.base_url = settings.SERVICENOW_URL.rstrip('/')
        self.auth = (settings.SERVICENOW_USERNAME, settings.SERVICENOW_PASSWORD)
        self.headers = {
            "Content-Type": "application/json",
            "Accept": "application/json"
        }

    async def create_incident(self, ticket_data: Dict[str, Any]) -> Dict[str, Any]:
        url = f"{self.base_url}/api/now/table/incident"
        payload = {
            "short_description": ticket_data.get("subject", ""),
            "description": ticket_data.get("user_request", ""),
            "category": ticket_data.get("category", "inquiry"),
            "priority": "2" if ticket_data.get("priority") == "P2" else "3",
            "assignment_group": ticket_data.get("assignment_group", "")
        }
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                resp = await client.post(url, json=payload, auth=self.auth, headers=self.headers)
                resp.raise_for_status()
                result = resp.json().get("result", {})
                return {
                    "number": result.get("number"),
                    "sys_id": result.get("sys_id"),
                    "state": result.get("state"),
                    "mode": "REAL"
                }
        except Exception as e:
            logger.error(f"[REAL ServiceNow] Error creating incident: {str(e)}")
            raise e

    async def get_incident(self, incident_id: str) -> Optional[Dict[str, Any]]:
        url = f"{self.base_url}/api/now/table/incident?sysparm_query=number={incident_id}"
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                resp = await client.get(url, auth=self.auth, headers=self.headers)
                resp.raise_for_status()
                records = resp.json().get("result", [])
                return records[0] if records else None
        except Exception as e:
            logger.error(f"[REAL ServiceNow] Error fetching incident: {str(e)}")
            return None

    async def update_incident(self, incident_id: str, update_data: Dict[str, Any]) -> Dict[str, Any]:
        # First get sys_id
        inc = await self.get_incident(incident_id)
        sys_id = inc.get("sys_id") if inc else incident_id
        url = f"{self.base_url}/api/now/table/incident/{sys_id}"
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                resp = await client.patch(url, json=update_data, auth=self.auth, headers=self.headers)
                resp.raise_for_status()
                return resp.json().get("result", {})
        except Exception as e:
            logger.error(f"[REAL ServiceNow] Error updating incident: {str(e)}")
            raise e

    async def create_service_request(self, request_data: Dict[str, Any]) -> Dict[str, Any]:
        url = f"{self.base_url}/api/now/table/sc_request"
        payload = {
            "short_description": f"Service Request: {request_data.get('software_name')}",
            "description": f"Automated software request for {request_data.get('software_name')}"
        }
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                resp = await client.post(url, json=payload, auth=self.auth, headers=self.headers)
                resp.raise_for_status()
                result = resp.json().get("result", {})
                return {
                    "number": result.get("number"),
                    "sys_id": result.get("sys_id"),
                    "mode": "REAL"
                }
        except Exception as e:
            logger.error(f"[REAL ServiceNow] Error creating service request: {str(e)}")
            raise e
