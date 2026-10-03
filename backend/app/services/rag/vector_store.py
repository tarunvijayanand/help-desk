import logging
import numpy as np
from typing import List, Dict, Any, Tuple
from app.config import settings
from app.services.rag.document_loader import load_and_chunk_knowledge_docs

logger = logging.getLogger(__name__)

class RAGVectorStore:
    _instance = None

    def __init__(self):
        self.chunks: List[Dict[str, Any]] = []
        self.embeddings: Optional[np.ndarray] = None
        self.model = None
        self.faiss_index = None
        self.is_initialized = False

    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            cls._instance = RAGVectorStore()
        return cls._instance

    def initialize(self):
        if self.is_initialized:
            return

        logger.info("Initializing RAG Embeddings & Vector Index...")
        self.chunks = load_and_chunk_knowledge_docs(settings.KNOWLEDGE_BASE_DIR)

        if not self.chunks:
            logger.warning("No chunks found in knowledge base directory.")
            self.is_initialized = True
            return

        try:
            from sentence_transformers import SentenceTransformer
            self.model = SentenceTransformer(settings.EMBEDDING_MODEL_NAME)
            
            texts = [c["chunk"] for c in self.chunks]
            raw_embeddings = self.model.encode(texts, convert_to_numpy=True)
            
            # Normalize for Cosine Similarity via Inner Product Index
            norms = np.linalg.norm(raw_embeddings, axis=1, keepdims=True)
            norms[norms == 0] = 1e-10
            self.embeddings = raw_embeddings / norms

            try:
                import faiss
                dimension = self.embeddings.shape[1]
                self.faiss_index = faiss.IndexFlatIP(dimension)
                self.faiss_index.add(self.embeddings.astype(np.float32))
                logger.info(f"FAISS Index built successfully with {self.faiss_index.ntotal} vectors.")
            except ImportError:
                logger.warning("FAISS not installed, using NumPy Cosine Similarity fallback.")

            self.is_initialized = True

        except Exception as e:
            logger.error(f"Error initializing sentence-transformers model: {str(e)}")
            self.is_initialized = True

    def search(self, query: str, top_k: int = 3) -> Tuple[List[Dict[str, Any]], bool, float]:
        """Performs vector search and returns (matched_chunks, has_sufficient_context, max_score)."""
        if not self.is_initialized:
            self.initialize()

        if not self.chunks:
            return [], False, 0.0

        if self.model is None or self.embeddings is None:
            # Fallback simple string matching search
            query_lower = query.lower()
            matches = []
            max_score = 0.0
            for chunk in self.chunks:
                score = 0.0
                words = [w for w in query_lower.split() if len(w) > 3]
                if words:
                    hits = sum(1 for w in words if w in chunk["chunk"].lower())
                    score = min(0.9, (hits / len(words)))
                if score > 0.2:
                    matches.append((chunk, score))
                    max_score = max(max_score, score)

            matches.sort(key=lambda x: x[1], reverse=True)
            results = [m[0] for m in matches[:top_k]]
            scores = [m[1] for m in matches[:top_k]]
            for i, r in enumerate(results):
                r["score"] = round(scores[i], 3)
            
            sufficient = max_score >= settings.RAG_SIMILARITY_THRESHOLD
            return results, sufficient, round(max_score, 3)

        # Encode query
        query_embedding = self.model.encode([query], convert_to_numpy=True)
        norm = np.linalg.norm(query_embedding, axis=1, keepdims=True)
        norm[norm == 0] = 1e-10
        query_embedding = query_embedding / norm

        if self.faiss_index is not None:
            scores, indices = self.faiss_index.search(query_embedding.astype(np.float32), top_k)
            scores = scores[0]
            indices = indices[0]
        else:
            scores = np.dot(self.embeddings, query_embedding.T).squeeze()
            indices = np.argsort(scores)[::-1][:top_k]
            scores = scores[indices]

        results = []
        max_score = 0.0

        for idx, score in zip(indices, scores):
            if idx < len(self.chunks):
                chunk_copy = dict(self.chunks[idx])
                score_val = float(round(float(score), 3))
                chunk_copy["score"] = score_val
                results.append(chunk_copy)
                if score_val > max_score:
                    max_score = score_val

        sufficient = max_score >= settings.RAG_SIMILARITY_THRESHOLD
        return results, sufficient, max_score
