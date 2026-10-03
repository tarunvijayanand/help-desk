import logging
from typing import Dict, Any, List
from fastapi import APIRouter, HTTPException
from app.models.software import SoftwareProvisionRequest
from app.services.provisioning.software_catalog import SoftwareProvisioningService

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/software", tags=["Software Provisioning"])

@router.get("", response_model=List[Dict[str, Any]])
async def get_software_catalog():
    """Retrieves enterprise software catalogue."""
    return SoftwareProvisioningService.get_catalog()

@router.post("/request")
async def request_software(payload: SoftwareProvisionRequest) -> Dict[str, Any]:
    """Submits a software request, creates ServiceNow REQ, and triggers Mock Provisioning."""
    if not payload.software_id:
        raise HTTPException(status_code=400, detail="software_id is required.")

    res = await SoftwareProvisioningService.request_software(
        software_id_or_name=payload.software_id,
        user_id=payload.user_id or "user@company.com"
    )
    return res
