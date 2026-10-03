from abc import ABC, abstractmethod
from typing import Dict, Any, Optional, List

class ServiceNowClient(ABC):
    @abstractmethod
    async def create_incident(self, ticket_data: Dict[str, Any]) -> Dict[str, Any]:
        pass

    @abstractmethod
    async def get_incident(self, incident_id: str) -> Optional[Dict[str, Any]]:
        pass

    @abstractmethod
    async def update_incident(self, incident_id: str, update_data: Dict[str, Any]) -> Dict[str, Any]:
        pass

    @abstractmethod
    async def create_service_request(self, request_data: Dict[str, Any]) -> Dict[str, Any]:
        pass

def get_servicenow_client(mode: str = "mock") -> ServiceNowClient:
    from app.services.servicenow.mock_client import MockServiceNowClient
    from app.services.servicenow.real_client import RealServiceNowClient
    from app.config import settings

    mode = mode.lower() if mode else settings.SERVICENOW_MODE
    if mode == "real":
        return RealServiceNowClient()
    return MockServiceNowClient.get_instance()
