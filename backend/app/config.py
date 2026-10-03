import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    APP_NAME: str = "AI ITSM Helpdesk"
    ENV: str = "development"
    
    # MongoDB Atlas Cloud
    MONGODB_URI: str = os.getenv("MONGODB_URI", "")
    MONGODB_DATABASE: str = os.getenv("MONGODB_DATABASE", "itsm_helpdesk")
    
    # ServiceNow Configuration
    SERVICENOW_MODE: str = os.getenv("SERVICENOW_MODE", "mock").lower()
    SERVICENOW_URL: str = os.getenv("SERVICENOW_URL", "https://dev00000.service-now.com")
    SERVICENOW_USERNAME: str = os.getenv("SERVICENOW_USERNAME", "admin")
    SERVICENOW_PASSWORD: str = os.getenv("SERVICENOW_PASSWORD", "")
    
    # AI & Embeddings Models
    HF_MODEL_NAME: str = os.getenv("HF_MODEL_NAME", "google/flan-t5-base")
    EMBEDDING_MODEL_NAME: str = os.getenv("EMBEDDING_MODEL_NAME", "sentence-transformers/all-MiniLM-L6-v2")
    
    # Thresholds
    RAG_SIMILARITY_THRESHOLD: float = float(os.getenv("RAG_SIMILARITY_THRESHOLD", "0.35"))
    AI_CONFIDENCE_THRESHOLD: float = float(os.getenv("AI_CONFIDENCE_THRESHOLD", "0.65"))
    
    # Path settings
    KNOWLEDGE_BASE_DIR: str = os.getenv(
        "KNOWLEDGE_BASE_DIR", 
        os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "knowledge_base"))
    )

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
