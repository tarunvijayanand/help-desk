import logging
from typing import Dict, Any, Optional
from fastapi import APIRouter, HTTPException
from app.services.servicenow.client import get_servicenow_client

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/servicenow", tags=["ServiceNow REST Integration"])

@router.post("/incidents")
async def create_servicenow_incident(payload: Dict[str, Any]):
    client = get_servicenow_client()
    return await client.create_incident(payload)

@router.get("/incidents/{incident_id}")
async def get_servicenow_incident(incident_id: str):
    client = get_servicenow_client()
    res = await client.get_incident(incident_id)
    if not res:
        raise HTTPException(status_code=404, detail=f"ServiceNow incident {incident_id} not found.")
    return res

@router.put("/incidents/{incident_id}")
async def update_servicenow_incident(incident_id: str, payload: Dict[str, Any]):
    client = get_servicenow_client()
    return await client.update_incident(incident_id, payload)

@router.post("/requests")
async def create_servicenow_request(payload: Dict[str, Any]):
    client = get_servicenow_client()
    return await client.create_service_request(payload)
