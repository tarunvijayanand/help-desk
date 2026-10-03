import logging
import time
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database.mongodb import MongoDBManager
from app.database.indexes import init_db_indexes
from app.services.rag.vector_store import RAGVectorStore
from app.services.ai.huggingface_llm import HuggingFaceLLMService

from app.api.chat import router as chat_router
from app.api.tickets import router as tickets_router
from app.api.knowledge import router as knowledge_router
from app.api.automation import router as automation_router
from app.api.software import router as software_router
from app.api.dashboard import router as dashboard_router
from app.api.servicenow import router as servicenow_router

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger("main")

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing AI ITSM Helpdesk Backend Platform...")
    
    # 1. Connect MongoDB Atlas Cloud
    await MongoDBManager.connect()
    await init_db_indexes()

    # 2. Automatically build FAISS vector index from 8 Knowledge Base docs
    try:
        vector_store = RAGVectorStore.get_instance()
        vector_store.initialize()
    except Exception as e:
        logger.error(f"Error initializing RAG Vector Store: {str(e)}")

    # 3. Load Hugging Face LLM service
    try:
        llm = HuggingFaceLLMService.get_instance()
        llm.load_model()
    except Exception as e:
        logger.warning(f"Note on HF LLM startup: {str(e)}")

    logger.info("Backend startup sequence complete. Ready for REST requests.")
    yield
    
    await MongoDBManager.close()
    logger.info("Backend shutdown complete.")

app = FastAPI(
    title="AI-Powered ITSM & Intelligent Helpdesk Automation Platform",
    description="Enterprise ITSM Helpdesk Backend featuring FastAPI, RAG with FAISS, Hugging Face LLM, ServiceNow Adapter, and MongoDB Atlas.",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers
app.include_router(chat_router)
app.include_router(tickets_router)
app.include_router(knowledge_router)
app.include_router(automation_router)
app.include_router(software_router)
app.include_router(dashboard_router)
app.include_router(servicenow_router)

@app.get("/health", tags=["Health"])
async def health_check():
    """Health check endpoint displaying system status and database/service states."""
    store = RAGVectorStore.get_instance()
    chunk_count = len(store.chunks) if store else 0
    return {
        "status": "healthy",
        "app_name": settings.APP_NAME,
        "environment": settings.ENV,
        "database": "MongoDB Atlas Cloud" if MongoDBManager.is_atlas else "In-Memory Resilient Fallback",
        "servicenow_mode": settings.SERVICENOW_MODE.upper(),
        "rag_vectors_indexed": chunk_count,
        "hf_model": settings.HF_MODEL_NAME,
        "timestamp": time.time()
    }
