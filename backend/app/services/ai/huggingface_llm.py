import logging
from typing import List, Dict, Any, Optional
from app.config import settings

logger = logging.getLogger(__name__)

class HuggingFaceLLMService:
    _instance = None

    def __init__(self):
        self.pipeline = None
        self.is_loaded = False

    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            cls._instance = HuggingFaceLLMService()
        return cls._instance

    def load_model(self):
        if self.is_loaded:
            return

        try:
            logger.info(f"Loading Hugging Face model: {settings.HF_MODEL_NAME}...")
            from transformers import pipeline
            # Load text2text-generation or text-generation model
            self.pipeline = pipeline(
                "text2text-generation",
                model=settings.HF_MODEL_NAME,
                max_length=512,
                device_map="auto" if False else -1  # CPU mode for portable Docker compatibility
            )
            self.is_loaded = True
            logger.info("Hugging Face model loaded successfully.")
        except Exception as e:
            logger.warning(f"Could not load Hugging Face pipeline ({str(e)}). Using prompt engine fallback generator.")
            self.is_loaded = True

    def generate_grounded_answer(
        self, 
        query: str, 
        rag_chunks: List[Dict[str, Any]], 
        has_sufficient_context: bool
    ) -> str:
        """Generates grounded answer strictly relying on supplied RAG context."""
        if not has_sufficient_context or not rag_chunks:
            return "Information unavailable in the approved knowledge base."

        context_text = "\n\n".join([f"Source [{c['title']}]: {c['chunk']}" for c in rag_chunks])

        prompt = (
            f"You are an AI ITSM Support Assistant. Answer the employee's request using ONLY the approved knowledge context below.\n"
            f"If the context does not contain sufficient information, state 'Information unavailable in the approved knowledge base.'\n\n"
            f"CONTEXT:\n{context_text}\n\n"
            f"EMPLOYEE REQUEST: {query}\n\n"
            f"ANSWER:"
        )

        if not self.is_loaded:
            self.load_model()

        if self.pipeline is not None:
            try:
                res = self.pipeline(prompt, max_new_tokens=200)
                answer = res[0]["generated_text"].strip()
                if len(answer) > 10:
                    return answer
            except Exception as e:
                logger.error(f"Error executing HF pipeline: {str(e)}")

        # Clean fallback synthesis grounded in retrieved context
        top_chunk = rag_chunks[0]
        title = top_chunk.get('title', 'Knowledge Document')
        chunk_text = top_chunk.get('chunk', '')

        # Synthesize clear, bulleted instruction from the matching KB doc
        lines = [line.strip() for line in chunk_text.split('\n') if line.strip() and not line.startswith('#')]
        summary = " ".join(lines[:3])

        return f"Based on approved documentation '{title}':\n\n{summary}\n\nPlease follow the documented procedure above or submit a ticket if additional support is required."
