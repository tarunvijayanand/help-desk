import os
import glob
import logging
from typing import List, Dict, Any

logger = logging.getLogger(__name__)

def load_and_chunk_knowledge_docs(kb_dir: str) -> List[Dict[str, Any]]:
    """Loads all markdown files from knowledge_base directory and splits into chunks."""
    chunks: List[Dict[str, Any]] = []
    
    if not os.path.exists(kb_dir):
        logger.warning(f"Knowledge base directory does not exist: {kb_dir}")
        return chunks

    md_files = glob.glob(os.path.join(kb_dir, "*.md"))
    logger.info(f"Found {len(md_files)} knowledge base documents in {kb_dir}")

    for file_path in md_files:
        filename = os.path.basename(file_path)
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                text = f.read()

            # Extract title from H1 or filename
            title = filename.replace(".md", "").replace("_", " ").title()
            lines = text.split("\n")
            for line in lines:
                if line.startswith("# "):
                    title = line.replace("# ", "").strip()
                    break

            # Split document by sections/paragraphs
            paragraphs = [p.strip() for p in text.split("\n\n") if p.strip()]
            
            chunk_index = 0
            for para in paragraphs:
                # If paragraph is too long, split further by line length
                if len(para) > 400:
                    sub_paras = [para[i:i+350] for i in range(0, len(para), 300)]
                    for sub in sub_paras:
                        chunks.append({
                            "title": title,
                            "filename": filename,
                            "chunk": sub,
                            "chunk_id": f"{filename}_{chunk_index}"
                        })
                        chunk_index += 1
                else:
                    chunks.append({
                        "title": title,
                        "filename": filename,
                        "chunk": para,
                        "chunk_id": f"{filename}_{chunk_index}"
                    })
                    chunk_index += 1

        except Exception as e:
            logger.error(f"Error reading knowledge document {filename}: {str(e)}")

    logger.info(f"Total chunks created: {len(chunks)}")
    return chunks
