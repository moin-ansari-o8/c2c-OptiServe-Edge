"""
RAG Pipeline — the **single unified interface** for the rest of the project.

Team contract:
    Member 4 → Member 3:  ``context = rag.retrieve(query)``
    Member 4 → Core:      ``context = rag.retrieve(query)``
    Member 4 → Member 5:  ``metrics = rag.get_all_metrics()``

Quickstart::

    from rag import RAGPipeline

    rag = RAGPipeline()
    rag.ingest("./data")

    context = rag.retrieve("When was the college established?")
    print(context)
    # "Sacred Heart College was established in 1967…"
"""

from __future__ import annotations

import logging
from typing import Dict, List, Optional

from .chunker import TextChunker
from .embeddings import DEFAULT_MODEL, EmbeddingModel
from .loader import DocumentLoader
from .retriever import Retriever, RetrievalMetrics, RetrievalResult
from .vector_store import VectorStore

logger = logging.getLogger(__name__)


class RAGPipeline:
    """End-to-end RAG pipeline: **ingest → retrieve**.

    Combines:
        Loader → Chunker → Embeddings → Vector Store → Retriever

    Other team members only need to call :meth:`retrieve` or
    :meth:`retrieve_with_scores`.
    """

    def __init__(
        self,
        model_name: str = DEFAULT_MODEL,
        device: str = "cpu",
        chunk_size: int = 512,
        chunk_overlap: int = 64,
        top_k: int = 5,
        similarity_threshold: float = 0.2,
    ) -> None:
        # Sub-components
        self.loader = DocumentLoader()
        self.chunker = TextChunker(
            chunk_size=chunk_size,
            chunk_overlap=chunk_overlap,
        )
        self.embedding_model = EmbeddingModel(
            model_name=model_name,
            device=device,
        )

        # Deferred init (created on first ingest/load)
        self._vector_store: Optional[VectorStore] = None
        self._retriever: Optional[Retriever] = None
        self._top_k = top_k
        self._similarity_threshold = similarity_threshold
        self._ingested = False

    # ── lazy sub-components ─────────────────────────────────────────────

    @property
    def vector_store(self) -> VectorStore:
        if self._vector_store is None:
            self._vector_store = VectorStore(dimension=self.embedding_model.dimension)
        return self._vector_store

    @property
    def retriever(self) -> Retriever:
        if self._retriever is None:
            self._retriever = Retriever(
                embedding_model=self.embedding_model,
                vector_store=self.vector_store,
                top_k=self._top_k,
                similarity_threshold=self._similarity_threshold,
            )
        return self._retriever

    # ── ingest ──────────────────────────────────────────────────────────

    def ingest(self, path: str, batch_size: int = 32) -> Dict:
        """Ingest documents from *path* (file or directory).

        Pipeline: Load → Chunk → Embed → Store

        Returns:
            Dict with ingestion statistics (documents, chunks, vectors, status).
        """
        logger.info("Ingesting documents from: %s", path)

        # 1. Load
        documents = self.loader.load(path)
        logger.info("Loaded %d document(s)", len(documents))

        if not documents:
            return {"documents": 0, "chunks": 0, "vectors": 0, "status": "no_documents"}

        # 2. Chunk
        chunks = self.chunker.chunk_documents(documents)
        logger.info("Created %d chunk(s)", len(chunks))

        # 3. Embed + Store (in batches to limit peak memory)
        for i in range(0, len(chunks), batch_size):
            batch = chunks[i : i + batch_size]
            texts = [c.content for c in batch]
            embeddings = self.embedding_model.embed(texts)
            self.vector_store.add(batch, embeddings)

        self._ingested = True

        stats = {
            "documents": len(documents),
            "chunks": len(chunks),
            "vectors": self.vector_store.size,
            "status": "ok",
        }
        logger.info("Ingestion complete: %s", stats)
        return stats

    # ── retrieve ────────────────────────────────────────────────────────

    def retrieve(self, query: str, top_k: Optional[int] = None) -> str:
        """Retrieve relevant context for *query* as a formatted string.

        This is **the** primary interface for Member 3 and the Core.
        """
        if not self._ingested and self.vector_store.size == 0:
            logger.warning("No documents ingested — call ingest() first.")
            return ""

        return self.retriever.get_context_string(query, top_k=top_k)

    def retrieve_with_scores(
        self,
        query: str,
        top_k: Optional[int] = None,
    ) -> List[RetrievalResult]:
        """Retrieve with full :class:`RetrievalResult` objects (scores + metadata).

        Useful for Member 3 (safety module) to evaluate retrieval confidence.
        """
        if not self._ingested and self.vector_store.size == 0:
            return []
        return self.retriever.retrieve(query, top_k=top_k)

    # ── persistence ─────────────────────────────────────────────────────

    def save(self, directory: str) -> None:
        """Save the vector store to disk for later reuse."""
        self.vector_store.save(directory)

    def load(self, directory: str) -> None:
        """Load a previously saved vector store."""
        self.vector_store.load(directory)
        self._ingested = True

    # ── metrics (for Member 5 — Evaluation) ─────────────────────────────

    def get_metrics(self) -> Optional[RetrievalMetrics]:
        """Latest retrieval metrics."""
        return self.retriever.get_latest_metrics()

    def get_all_metrics(self) -> List[RetrievalMetrics]:
        """Full retrieval metrics history for evaluation."""
        return self.retriever.metrics
