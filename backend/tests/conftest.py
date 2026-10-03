import sys
import os
import pytest
from fastapi.testclient import TestClient

# Ensure app package is importable
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.main import app
from app.services.rag.vector_store import RAGVectorStore

@pytest.fixture(scope="session", autouse=True)
def initialize_rag():
    store = RAGVectorStore.get_instance()
    store.initialize()

@pytest.fixture
def client():
    with TestClient(app) as test_client:
        yield test_client
