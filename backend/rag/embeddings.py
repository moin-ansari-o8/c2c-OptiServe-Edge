"""
Embedding Model for RAG pipeline.

Converts text into dense vector representations using sentence-transformers.

Default model: ``all-MiniLM-L6-v2``
  - 22 M params, 384 dimensions
  - Fast and lightweight — perfect for edge deployment

Pipeline:
    Text string  →  embeddings.py  →  numpy vector  [0.12, -0.34, 0.87, …]
"""

from __future__ import annotations

import logging
from typing import List, Union

import numpy as np

logger = logging.getLogger(__name__)

DEFAULT_MODEL = "all-MiniLM-L6-v2"


class EmbeddingModel:
    """Thin wrapper around ``SentenceTransformer`` for text embedding.

    The model is lazily loaded on first use so import is fast.
    """

    def __init__(self, model_name: str = DEFAULT_MODEL, device: str = "cpu") -> None:
        self.model_name = model_name
        self.device = device
        self._model = None  # lazy

    # ── lazy loading ────────────────────────────────────────────────────

    @property
    def model(self):
        """Return the underlying SentenceTransformer, loading on first call."""
        if self._model is None:
            try:
                from sentence_transformers import SentenceTransformer
            except ImportError:
                raise ImportError(
                    "Install 'sentence-transformers':  pip install sentence-transformers"
                )
            logger.info("Loading embedding model: %s (device=%s)", self.model_name, self.device)
            self._model = SentenceTransformer(self.model_name, device=self.device)
            logger.info(
                "Embedding model ready — dimension=%d", self.dimension,
            )
        return self._model

    # ── properties ──────────────────────────────────────────────────────

    @property
    def dimension(self) -> int:
        """Embedding dimensionality (e.g. 384 for MiniLM)."""
        # get_embedding_dimension is the new name (sentence-transformers >= 6.0)
        if hasattr(self.model, "get_embedding_dimension"):
            return self.model.get_embedding_dimension()
        return self.model.get_sentence_embedding_dimension()  # fallback

    # ── public API ──────────────────────────────────────────────────────

    def embed(self, texts: Union[str, List[str]]) -> np.ndarray:
        """Embed one or more texts into dense vectors.

        Args:
            texts: A single string or a list of strings.

        Returns:
            ``np.ndarray`` of shape ``(n, dimension)`` with L2-normalised
            vectors (so dot-product == cosine similarity).
        """
        if isinstance(texts, str):
            texts = [texts]

        embeddings = self.model.encode(
            texts,
            show_progress_bar=False,
            convert_to_numpy=True,
            normalize_embeddings=True,  # L2 norm → cosine sim via dot product
        )
        return embeddings

    def embed_query(self, query: str) -> np.ndarray:
        """Embed a single query string.  Returns a **1-D** vector."""
        return self.embed(query)[0]
