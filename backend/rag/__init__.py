"""
RAG Module — Retrieval-Augmented Generation for OptiServe-Edge.

Member 4's complete knowledge retrieval layer.

Usage:
    from rag import RAGPipeline

    rag = RAGPipeline()
    rag.ingest("./data")
    context = rag.retrieve("When was the college established?")
"""

from .loader import DocumentLoader, Document
from .chunker import TextChunker, Chunk
from .embeddings import EmbeddingModel
from .vector_store import VectorStore
from .retriever import Retriever, RetrievalResult, RetrievalMetrics
from .pipeline import RAGPipeline

__all__ = [
    "RAGPipeline",
    "DocumentLoader",
    "Document",
    "TextChunker",
    "Chunk",
    "EmbeddingModel",
    "VectorStore",
    "Retriever",
    "RetrievalResult",
    "RetrievalMetrics",
]
