import logging
from typing import Dict, Any, List, Optional
from motor.motor_asyncio import AsyncIOMotorClient
from app.config import settings

from bson import ObjectId

logger = logging.getLogger(__name__)

def clean_mongo_doc(doc: Any) -> Any:
    """Converts MongoDB BSON ObjectId to string to prevent FastAPI JSON serialization errors."""
    if doc is None:
        return None
    if isinstance(doc, list):
        return [clean_mongo_doc(item) for item in doc]
    if isinstance(doc, dict):
        cleaned = {}
        for k, v in doc.items():
            if isinstance(v, ObjectId):
                cleaned[k] = str(v)
            elif isinstance(v, (dict, list)):
                cleaned[k] = clean_mongo_doc(v)
            else:
                cleaned[k] = str(v) if k == "_id" and v is not None else v
        return cleaned
    if isinstance(doc, ObjectId):
        return str(doc)
    return doc



class InMemoryCollection:
    """Thread-safe in-memory document collection fallback when MongoDB Atlas is disconnected."""
    def __init__(self, name: str):
        self.name = name
        self._data: List[Dict[str, Any]] = []

    async def insert_one(self, document: Dict[str, Any]):
        doc = dict(document)
        if "_id" not in doc:
            doc["_id"] = str(len(self._data) + 1)
        self._data.append(doc)
        class Result:
            inserted_id = doc["_id"]
        return Result()

    async def find_one(self, filter_dict: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        for doc in self._data:
            match = True
            for k, v in filter_dict.items():
                if doc.get(k) != v:
                    match = False
                    break
            if match:
                return doc
        return None

    def find(self, filter_dict: Optional[Dict[str, Any]] = None):
        filter_dict = filter_dict or {}
        results = []
        for doc in self._data:
            match = True
            for k, v in filter_dict.items():
                if doc.get(k) != v:
                    match = False
                    break
            if match:
                results.append(doc)
        
        class AsyncCursor:
            def __init__(self, items):
                self.items = items
            def sort(self, key, direction=-1):
                reverse = True if direction == -1 else False
                self.items.sort(key=lambda x: x.get(key, ""), reverse=reverse)
                return self
            def limit(self, n):
                self.items = self.items[:n]
                return self
            async def to_list(self, length=100):
                return self.items[:length]
        return AsyncCursor(results)

    async def update_one(self, filter_dict: Dict[str, Any], update_dict: Dict[str, Any]):
        doc = await self.find_one(filter_dict)
        if doc and "$set" in update_dict:
            doc.update(update_dict["$set"])
            return True
        return False

    async def count_documents(self, filter_dict: Optional[Dict[str, Any]] = None) -> int:
        filter_dict = filter_dict or {}
        count = 0
        for doc in self._data:
            match = True
            for k, v in filter_dict.items():
                if doc.get(k) != v:
                    match = False
                    break
            if match:
                count += 1
        return count

class MongoDBManager:
    client: Optional[AsyncIOMotorClient] = None
    db = None
    is_atlas: bool = False
    _fallback_collections: Dict[str, InMemoryCollection] = {}

    @classmethod
    async def connect(cls):
        if settings.MONGODB_URI and "mongodb" in settings.MONGODB_URI:
            try:
                cls.client = AsyncIOMotorClient(settings.MONGODB_URI, serverSelectionTimeoutMS=3000)
                cls.db = cls.client[settings.MONGODB_DATABASE]
                # Ping database to verify connection
                await cls.client.admin.command('ping')
                cls.is_atlas = True
                logger.info("Successfully connected to MongoDB Atlas Cloud database: %s", settings.MONGODB_DATABASE)
                return
            except Exception as e:
                logger.warning("MongoDB Atlas connection failed (%s). Falling back to resilient in-memory datastore.", str(e))
        
        cls.is_atlas = False
        logger.info("Using resilient in-memory database store for tickets, knowledge, chat, automation, software, and audit logs.")

    @classmethod
    def get_collection(cls, collection_name: str):
        if cls.is_atlas and cls.db is not None:
            return cls.db[collection_name]
        
        if collection_name not in cls._fallback_collections:
            cls._fallback_collections[collection_name] = InMemoryCollection(collection_name)
        return cls._fallback_collections[collection_name]

    @classmethod
    async def close(cls):
        if cls.client:
            cls.client.close()
            logger.info("MongoDB client closed.")
