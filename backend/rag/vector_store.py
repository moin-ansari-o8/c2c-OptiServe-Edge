"""
FAISS-based Vector Store for RAG pipeline.

Stores chunk embeddings and supports fast approximate nearest-neighbour
similarity search.  The store can be persisted to / loaded from disk.

Architecture:
    Chunks + Embeddings  →  FAISS Index  →  Top-K similarity search
"""

from __future__ import annotations

import json
import logging
from pathlib import Path
from typing import List, Optional, Tuple

import numpy as np

from .chunker import Chunk

logger = logging.getLogger(__name__)


class VectorStore:
    """FAISS vector store for chunk retrieval.

    Uses ``IndexFlatIP`` (inner-product) which behaves as cosine similarity
    when vectors are L2-normalised (which our ``EmbeddingModel`` guarantees).
    """

    def __init__(self, dimension: int) -> None:
        try:
            import faiss
        except ImportError:
            raise ImportError(
                "Install 'faiss-cpu':  pip install faiss-cpu"
            )

        self._faiss = faiss
        self.dimension = dimension
        self.index = faiss.IndexFlatIP(dimension)
        self.chunks: List[Chunk] = []

    # ── properties ──────────────────────────────────────────────────────

    @property
    def size(self) -> int:
        """Number of vectors currently stored."""
        return self.index.ntotal

    # ── mutating operations ─────────────────────────────────────────────

    def add(self, chunks: List[Chunk], embeddings: np.ndarray) -> None:
        """Add *chunks* with their corresponding *embeddings*.

        Raises ``ValueError`` if the counts don't match.
        """
        if len(chunks) != embeddings.shape[0]:
            raise ValueError(
                f"Mismatch: {len(chunks)} chunks vs {embeddings.shape[0]} embeddings"
            )

        self.index.add(embeddings.astype(np.float32))
        self.chunks.extend(chunks)
        logger.info("Added %d vectors (total: %d)", len(chunks), self.size)

    def clear(self) -> None:
        """Remove all vectors and chunks."""
        self.index.reset()
        self.chunks.clear()

    # ── search ──────────────────────────────────────────────────────────

    def search(
        self,
        query_vector: np.ndarray,
        top_k: int = 5,
        threshold: float = 0.0,
    ) -> List[Tuple[Chunk, float]]:
        """Return the *top_k* most similar chunks.

        Args:
            query_vector: 1-D embedding of the query.
            top_k: How many results to return.
            threshold: Minimum cosine-similarity score to include.

        Returns:
            List of ``(Chunk, score)`` tuples sorted by similarity descending.
        """
        if self.size == 0:
            return []

        top_k = min(top_k, self.size)
        qv = query_vector.astype(np.float32).reshape(1, -1)

        scores, indices = self.index.search(qv, top_k)

        results: List[Tuple[Chunk, float]] = []
        for score, idx in zip(scores[0], indices[0]):
            if idx < 0:          # FAISS sentinel for empty slots
                continue
            if score < threshold:
                continue
            results.append((self.chunks[idx], float(score)))

        return results

    # ── persistence ─────────────────────────────────────────────────────

    def save(self, directory: str) -> None:
        """Persist the FAISS index and chunk metadata to *directory*."""
        path = Path(directory)
        path.mkdir(parents=True, exist_ok=True)

        self._faiss.write_index(self.index, str(path / "index.faiss"))

        chunk_data = [
            {"content": c.content, "metadata": c.metadata}
            for c in self.chunks
        ]
        with open(path / "chunks.json", "w", encoding="utf-8") as fh:
            json.dump(chunk_data, fh, ensure_ascii=False, indent=2)

        logger.info("Vector store saved to %s (%d vectors)", directory, self.size)

    def load(self, directory: str) -> None:
        """Restore a previously saved vector store from *directory*."""
        path = Path(directory)

        index_path = path / "index.faiss"
        if not index_path.exists():
            raise FileNotFoundError(f"No FAISS index found at {index_path}")

        self.index = self._faiss.read_index(str(index_path))

        with open(path / "chunks.json", "r", encoding="utf-8") as fh:
            chunk_data = json.load(fh)

        self.chunks = [
            Chunk(content=c["content"], metadata=c["metadata"])
            for c in chunk_data
        ]

        logger.info(
            "Vector store loaded from %s (%d vectors)", directory, self.size,
        )
