"""
Retriever for RAG pipeline.

Combines the embedding model and vector store to retrieve the most
relevant context chunks for a user query.

Pipeline:
    Query  →  embed  →  vector similarity search  →  Top-K chunks

Metrics are recorded for every retrieval so Member 5 (Evaluation) can
analyse retrieval quality.
"""

from __future__ import annotations

import logging
import time
from dataclasses import dataclass, field
from typing import List, Optional

from .chunker import Chunk
from .embeddings import EmbeddingModel
from .vector_store import VectorStore

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Result & metrics data models
# ---------------------------------------------------------------------------

@dataclass
class RetrievalResult:
    """A single retrieved chunk with its similarity score."""

    content: str
    score: float
    metadata: dict = field(default_factory=dict)

    def __repr__(self) -> str:
        preview = self.content[:80] + "…" if len(self.content) > 80 else self.content
        return f"RetrievalResult(score={self.score:.4f}, content={preview!r})"


@dataclass
class RetrievalMetrics:
    """Metrics captured during a single retrieval operation."""

    query: str
    num_results: int
    top_score: float
    avg_score: float
    latency_ms: float


# ---------------------------------------------------------------------------
# Retriever
# ---------------------------------------------------------------------------

class Retriever:
    """Retrieve relevant context from the vector store.

    Parameters:
        embedding_model:      The model used to embed the query.
        vector_store:         The FAISS-backed store to search.
        top_k:                Default number of results to return.
        similarity_threshold: Minimum cosine similarity to include a result.
    """

    def __init__(
        self,
        embedding_model: EmbeddingModel,
        vector_store: VectorStore,
        top_k: int = 5,
        similarity_threshold: float = 0.2,
    ) -> None:
        self.embedding_model = embedding_model
        self.vector_store = vector_store
        self.top_k = top_k
        self.similarity_threshold = similarity_threshold

        self._metrics_history: List[RetrievalMetrics] = []

    # ── core retrieval ──────────────────────────────────────────────────

    def retrieve(
        self,
        query: str,
        top_k: Optional[int] = None,
        threshold: Optional[float] = None,
    ) -> List[RetrievalResult]:
        """Retrieve the most relevant chunks for *query*.

        Args:
            query:     The user's question or search string.
            top_k:     Override default top_k.
            threshold: Override default similarity threshold.

        Returns:
            Sorted list of :class:`RetrievalResult` (highest score first).
        """
        k = top_k if top_k is not None else self.top_k
        thresh = threshold if threshold is not None else self.similarity_threshold

        start = time.perf_counter()

        # 1. Embed the query
        query_vector = self.embedding_model.embed_query(query)

        # 2. Search
        hits = self.vector_store.search(query_vector, top_k=k, threshold=thresh)

        elapsed_ms = (time.perf_counter() - start) * 1000

        # 3. Wrap results
        results = [
            RetrievalResult(content=chunk.content, score=score, metadata=chunk.metadata)
            for chunk, score in hits
        ]

        # 4. Record metrics
        metrics = RetrievalMetrics(
            query=query,
            num_results=len(results),
            top_score=results[0].score if results else 0.0,
            avg_score=(sum(r.score for r in results) / len(results)) if results else 0.0,
            latency_ms=elapsed_ms,
        )
        self._metrics_history.append(metrics)

        logger.info(
            "Retrieved %d chunks in %.1f ms (top=%.4f, avg=%.4f)",
            len(results), elapsed_ms, metrics.top_score, metrics.avg_score,
        )

        return results

    # ── convenience helpers ─────────────────────────────────────────────

    def get_context_string(
        self,
        query: str,
        top_k: Optional[int] = None,
        separator: str = "\n\n---\n\n",
    ) -> str:
        """Retrieve and format chunks as a single context string for the LLM.

        This is the primary convenience method for other team members::

            context = retriever.get_context_string("When was it founded?")
        """
        results = self.retrieve(query, top_k=top_k)
        if not results:
            return ""
        return separator.join(r.content for r in results)

    # ── metrics access (for Member 5) ───────────────────────────────────

    @property
    def metrics(self) -> List[RetrievalMetrics]:
        """Full history of retrieval metrics."""
        return list(self._metrics_history)

    def get_latest_metrics(self) -> Optional[RetrievalMetrics]:
        """Metrics from the most recent retrieval, or ``None``."""
        return self._metrics_history[-1] if self._metrics_history else None
