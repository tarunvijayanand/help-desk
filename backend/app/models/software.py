from pydantic import BaseModel
from typing import Optional

class SoftwareItem(BaseModel):
    id: str
    name: str
    description: str
    category: str
    icon: str
    pre_approved: bool = True

class SoftwareProvisionRequest(BaseModel):
    software_id: str
    user_id: Optional[str] = "user@company.com"

class SoftwareProvisionResponse(BaseModel):
    request_id: str
    software_name: str
    servicenow_ref: str
    provisioning_status: str
    mode: str = "MOCK"
    timestamp: str
