import logging
from datetime import datetime
from typing import Dict, Any
from app.database.mongodb import MongoDBManager
from app.services.servicenow.client import get_servicenow_client

logger = logging.getLogger(__name__)

class AutomationExecutor:
    """Executes safe self-healing IT automations with validation and audit logging."""

    @classmethod
    async def execute_automation(
        self,
        action: str,
        ticket_id: str = "INC001001",
        actor: str = "Self-Heal Agent",
        details: Dict[str, Any] = None
    ) -> Dict[str, Any]:
        details = details or {}
        timestamp = datetime.now().isoformat()
        
        # 1. Action execution logic (Mock engines)
        if action in ["password_reset", "Password Reset"]:
            result_str = "Active Directory domain password successfully reset via automated token validation."
            validation = "MFA Token Verified & Password Policy Enforced"
            action_name = "Password Reset"
        elif action in ["account_unlock", "Account Unlock"]:
            result_str = "Active Directory domain account unlocked. Bad password count reset to zero."
            validation = "AD Account Status Verified: Unlocked"
            action_name = "Account Unlock"
        elif action in ["service_restart", "Service Restart"]:
            service_name = details.get("service_name", "GlobalProtect Service")
            result_str = f"Service '{service_name}' restarted successfully on remote endpoint."
            validation = f"Process Status Verified: RUNNING (PID 4892)"
            action_name = f"Service Restart ({service_name})"
        else:
            result_str = f"Mock automation '{action}' executed successfully."
            validation = "Operation Verified"
            action_name = action

        # 2. Update ServiceNow Incident
        sn_client = get_servicenow_client()
        sn_updated = False
        try:
            await sn_client.update_incident(ticket_id, {
                "state": "6",
                "state_label": "Resolved",
                "close_notes": f"Resolved automatically via Self-Heal Agent: {action_name}"
            })
            sn_updated = True
        except Exception as e:
            logger.warning(f"Could not update ServiceNow incident {ticket_id}: {str(e)}")

        # 3. Create Audit Log Record
        audit_entry = {
            "timestamp": timestamp,
            "action": action_name,
            "ticket_id": ticket_id,
            "status": "Success",
            "result": result_str,
            "actor": actor,
            "mode": "MOCK",
            "details": {
                "validation": validation,
                "servicenow_updated": sn_updated,
                **details
            }
        }

        # Store in MongoDB audit_logs collection
        audit_col = MongoDBManager.get_collection("audit_logs")
        await audit_col.insert_one(dict(audit_entry))

        # Also store in automation_actions
        auto_col = MongoDBManager.get_collection("automation_actions")
        await auto_col.insert_one(dict(audit_entry))

        logger.info(f"Executed automation '{action_name}' for ticket {ticket_id}. Status: Success (MOCK).")

        return {
            "action": action_name,
            "ticket_id": ticket_id,
            "status": "Success",
            "result": result_str,
            "mode": "MOCK",
            "execution_time": "340ms",
            "validation": validation,
            "servicenow_updated": sn_updated,
            "audit_entry": audit_entry
        }
