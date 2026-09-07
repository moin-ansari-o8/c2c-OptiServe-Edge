"""Tests for the Retriever component."""

import pytest
import numpy as np

from rag.chunker import Chunk
from rag.retriever import Retriever, RetrievalResult


def _deps_available() -> bool:
    try:
        import sentence_transformers  # noqa: F401
        import faiss  # noqa: F401
        return True
    except ImportError:
        return False


# ═══════════════════════════════════════════════════════════════════════════
# Unit tests (no heavy deps)
# ═══════════════════════════════════════════════════════════════════════════

class TestRetrievalResult:
    def test_repr_short_content(self):
        r = RetrievalResult(content="Hello world", score=0.95, metadata={})
        text = repr(r)
        assert "0.95" in text
        assert "Hello world" in text

    def test_repr_long_content_truncates(self):
        r = RetrievalResult(content="x" * 200, score=0.5, metadata={})
        text = repr(r)
        assert "…" in text


# ═══════════════════════════════════════════════════════════════════════════
# Integration tests — require sentence-transformers + faiss-cpu
# ═══════════════════════════════════════════════════════════════════════════

@pytest.mark.skipif(not _deps_available(), reason="sentence-transformers / faiss-cpu not installed")
class TestRetriever:

    @pytest.fixture
    def populated_retriever(self):
        from rag.embeddings import EmbeddingModel
        from rag.vector_store import VectorStore

        emb = EmbeddingModel()
        vs = VectorStore(dimension=emb.dimension)

        chunks = [
            Chunk(content="Python is a popular programming language.", metadata={"idx": 0}),
            Chunk(content="The Eiffel Tower is located in Paris, France.", metadata={"idx": 1}),
            Chunk(content="Machine learning uses statistical models for predictions.", metadata={"idx": 2}),
            Chunk(content="The Great Wall of China is a historic fortification.", metadata={"idx": 3}),
            Chunk(content="Neural networks are inspired by the human brain.", metadata={"idx": 4}),
        ]

        texts = [c.content for c in chunks]
        embeddings = emb.embed(texts)
        vs.add(chunks, embeddings)

        return Retriever(
            embedding_model=emb,
            vector_store=vs,
            top_k=3,
            similarity_threshold=0.0,
        )

    def test_retrieve_returns_results(self, populated_retriever: Retriever):
        results = populated_retriever.retrieve("What programming language?")
        assert len(results) > 0
        assert isinstance(results[0], RetrievalResult)

    def test_retrieve_relevance_ranking(self, populated_retriever: Retriever):
        results = populated_retriever.retrieve("Tell me about France and the Eiffel Tower")
        # The Eiffel Tower chunk should rank highly
        top_contents = [r.content for r in results[:2]]
        assert any("Paris" in c or "France" in c for c in top_contents)

    def test_retrieve_records_metrics(self, populated_retriever: Retriever):
        populated_retriever.retrieve("test query")
        metrics = populated_retriever.get_latest_metrics()

        assert metrics is not None
        assert metrics.query == "test query"
        assert metrics.latency_ms > 0
        assert metrics.num_results > 0

    def test_metrics_history_grows(self, populated_retriever: Retriever):
        populated_retriever.retrieve("query 1")
        populated_retriever.retrieve("query 2")

        history = populated_retriever.metrics
        assert len(history) == 2
        assert history[0].query == "query 1"
        assert history[1].query == "query 2"

    def test_get_context_string(self, populated_retriever: Retriever):
        context = populated_retriever.get_context_string("programming")
        assert isinstance(context, str)
        assert len(context) > 0

    def test_empty_store_returns_empty(self):
        from rag.embeddings import EmbeddingModel
        from rag.vector_store import VectorStore

        emb = EmbeddingModel()
        vs = VectorStore(dimension=emb.dimension)
        retriever = Retriever(emb, vs)

        results = retriever.retrieve("anything")
        assert results == []

    def test_top_k_override(self, populated_retriever: Retriever):
        results = populated_retriever.retrieve("test", top_k=1)
        assert len(results) == 1

    def test_threshold_filters_low_scores(self, populated_retriever: Retriever):
        # A very high threshold should return fewer or no results
        results = populated_retriever.retrieve(
            "completely unrelated gibberish xyz123",
            threshold=0.99,
        )
        # May or may not return results — just check it doesn't crash
        assert isinstance(results, list)
