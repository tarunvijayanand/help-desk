import logging
from datetime import datetime
from typing import List, Dict, Any, Optional
from app.database.mongodb import MongoDBManager
from app.services.servicenow.client import get_servicenow_client

logger = logging.getLogger(__name__)

SOFTWARE_CATALOG: List[Dict[str, Any]] = [
    {
        "id": "vscode",
        "name": "Visual Studio Code",
        "description": "Standard IDE for modern web, cloud, and AI software development.",
        "category": "Developer Tools",
        "icon": "code",
        "pre_approved": True
    },
    {
        "id": "git",
        "name": "Git & Git Bash",
        "description": "Distributed version control system and Unix command line utilities.",
        "category": "Developer Tools",
        "icon": "git-branch",
        "pre_approved": True
    },
    {
        "id": "postman",
        "name": "Postman API Platform",
        "description": "API design, testing, and documentation development platform.",
        "category": "Developer Tools",
        "icon": "terminal",
        "pre_approved": True
    },
    {
        "id": "docker",
        "name": "Docker Desktop",
        "description": "Enterprise containerization engine and local Kubernetes developer tool.",
        "category": "Infrastructure",
        "icon": "box",
        "pre_approved": False
    }
]

class SoftwareProvisioningService:
    
    @classmethod
    def get_catalog(cls) -> List[Dict[str, Any]]:
        return SOFTWARE_CATALOG

    @classmethod
    async def request_software(
        cls, 
        software_id_or_name: str, 
        user_id: str = "user@company.com"
    ) -> Dict[str, Any]:
        # Find matching item
        item = None
        s_lower = software_id_or_name.lower()
        for sw in SOFTWARE_CATALOG:
            if sw["id"] == s_lower or sw["name"].lower() in s_lower or s_lower in sw["name"].lower():
                item = sw
                break

        software_name = item["name"] if item else software_id_or_name

        # 1. Create ServiceNow Service Request
        sn_client = get_servicenow_client()
        sn_res = await sn_client.create_service_request({
            "software_name": software_name,
            "user_id": user_id
        })
        servicenow_ref = sn_res.get("number", "REQ001245")

        timestamp = datetime.now().isoformat()
        request_id = f"REQ_ACT_{int(datetime.now().timestamp())}"

        # 2. Mock Provisioning API
        provisioning_status = "Provisioned (MOCK)"

        response_data = {
            "request_id": request_id,
            "software_name": software_name,
            "servicenow_ref": servicenow_ref,
            "provisioning_status": provisioning_status,
            "mode": "MOCK",
            "timestamp": timestamp,
            "details": f"Mock provisioning agent deployed {software_name} to endpoint. License activated."
        }

        # 3. Store in MongoDB
        sw_col = MongoDBManager.get_collection("software_requests")
        await sw_col.insert_one(dict(response_data))

        # 4. Create Audit Log Entry
        audit_col = MongoDBManager.get_collection("audit_logs")
        await audit_col.insert_one({
            "timestamp": timestamp,
            "action": f"Software Provisioning: {software_name}",
            "ticket_id": servicenow_ref,
            "status": "Success",
            "result": f"Software {software_name} provisioned via Mock Agent.",
            "actor": "Provisioning Engine",
            "mode": "MOCK",
            "details": response_data
        })

        logger.info(f"Software provisioning complete for {software_name}: {servicenow_ref}")
        return response_data
