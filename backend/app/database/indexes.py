import logging
from app.database.mongodb import MongoDBManager

logger = logging.getLogger(__name__)

async def init_db_indexes():
    """Initializes MongoDB collection indexes for optimal performance."""
    if not MongoDBManager.is_atlas:
        return

    try:
        tickets_col = MongoDBManager.get_collection("tickets")
        await tickets_col.create_index("ticket_id", unique=True)
        await tickets_col.create_index("status")
        await tickets_col.create_index("servicenow_id")

        audit_col = MongoDBManager.get_collection("audit_logs")
        await audit_col.create_index("timestamp")

        kb_col = MongoDBManager.get_collection("knowledge")
        await kb_col.create_index("title")

        logger.info("MongoDB Atlas indexes initialized successfully.")
    except Exception as e:
        logger.warning("Could not create MongoDB Atlas indexes: %s", str(e))
