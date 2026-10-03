import logging
from typing import Dict, Any

logger = logging.getLogger(__name__)

class RequestClassifier:
    """Intelligent classification engine for ITSM intake, intent detection, and metadata extraction."""
    
    @classmethod
    def classify(cls, user_request: str) -> Dict[str, Any]:
        text = user_request.lower()
        
        # Scenario 2: Password reset / expired password / unlock
        if any(w in text for w in ["password", "expired password", "reset password", "passcode"]):
            return {
                "workflow_type": "Automatable Issue",
                "intent": "Password Reset",
                "category": "Identity & Access",
                "subcategory": "Password Expiry",
                "priority": "P3",
                "impact": "Individual",
                "urgency": "Medium",
                "assignment_group": "Identity & Security",
                "summary": "Self-service domain password reset request",
                "suggested_resolution": "Trigger automated Active Directory password reset workflow.",
                "confidence": 0.98,
                "automation_allowed": True,
                "automation_action": "password_reset"
            }

        # Scenario 4: Software request / Visual Studio Code / Git
        elif any(w in text for w in ["need visual studio", "install vs code", "vscode", "install git", "need software"]):
            software_name = "Visual Studio Code" if "visual studio" in text or "vscode" in text else "Git"
            return {
                "workflow_type": "Service Request",
                "intent": "Software Provisioning",
                "category": "Software Catalog",
                "subcategory": "Developer Tools",
                "priority": "P4",
                "impact": "Individual",
                "urgency": "Low",
                "assignment_group": "IT Asset Management",
                "summary": f"Request for automated installation of {software_name}",
                "suggested_resolution": f"Provision pre-approved software {software_name} via mock provisioning API.",
                "confidence": 0.96,
                "automation_allowed": True,
                "automation_action": "software_provisioning",
                "requested_software": software_name
            }

        # Scenario 1: VPN / Network outage / connection failure
        elif any(w in text for w in ["vpn", "tunnel", "cannot connect", "authentication keeps failing", "wifi failure"]):
            return {
                "workflow_type": "Incident",
                "intent": "Incident",
                "category": "Network",
                "subcategory": "VPN",
                "priority": "P2",
                "impact": "Individual",
                "urgency": "High",
                "assignment_group": "Network Support",
                "summary": "VPN authentication failure and tunnel connectivity issue",
                "suggested_resolution": "Verify domain password, check authenticator push notification, restart GlobalProtect agent, and flush DNS cache.",
                "confidence": 0.94,
                "automation_allowed": False,
                "automation_action": None
            }

        # Scenario 3: How do I / Troubleshooting questions (Knowledge Questions)
        elif any(w in text for w in ["how do i", "troubleshoot", "outlook", "sync", "why is", "steps to"]):
            return {
                "workflow_type": "Knowledge Question",
                "intent": "Knowledge Query",
                "category": "Collaboration",
                "subcategory": "Outlook / Mail",
                "priority": "P4",
                "impact": "Individual",
                "urgency": "Low",
                "assignment_group": "Messaging Support",
                "summary": "Information request regarding Outlook synchronization and mailbox repair",
                "suggested_resolution": "Provide grounded RAG knowledge base steps for OST repair and offline mode toggle.",
                "confidence": 0.91,
                "automation_allowed": False,
                "automation_action": None
            }

        # Generic / Unsupported default classification
        else:
            return {
                "workflow_type": "Knowledge Question",
                "intent": "General Inquiry",
                "category": "General IT",
                "subcategory": "General Inquiry",
                "priority": "P3",
                "impact": "Individual",
                "urgency": "Medium",
                "assignment_group": "Service Desk",
                "summary": "General IT support inquiry",
                "suggested_resolution": "Search knowledge base or submit a helpdesk ticket.",
                "confidence": 0.50,
                "automation_allowed": False,
                "automation_action": None
            }
