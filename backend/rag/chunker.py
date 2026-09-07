"""
Text Chunker for RAG pipeline.

Splits documents into smaller overlapping chunks while preserving
semantic context for better retrieval quality.

Pipeline:
    Document  →  chunker.py  →  List[Chunk]

Tuneable parameters:
    chunk_size    – maximum character length of each chunk
    chunk_overlap – how many characters to repeat across chunk boundaries
    min_chunk_size – discard chunks shorter than this
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import List

from .loader import Document


# ---------------------------------------------------------------------------
# Data model
# ---------------------------------------------------------------------------

@dataclass
class Chunk:
    """A chunk of text extracted from a parent Document."""

    content: str
    metadata: dict = field(default_factory=dict)

    @property
    def source(self) -> str:
        return self.metadata.get("source", "unknown")

    @property
    def chunk_index(self) -> int:
        return self.metadata.get("chunk_index", -1)

    def __repr__(self) -> str:
        preview = self.content[:60] + "…" if len(self.content) > 60 else self.content
        return f"Chunk(idx={self.chunk_index}, len={len(self.content)}, preview={preview!r})"


# ---------------------------------------------------------------------------
# Chunker
# ---------------------------------------------------------------------------

class TextChunker:
    """Recursively split documents into overlapping chunks.

    Strategy (in priority order):
        1. Split by double-newlines (paragraphs)
        2. Split by single newlines
        3. Split by sentence-ending punctuation
        4. Split by commas / semicolons
        5. Split by whitespace
        6. Hard character split (last resort)
    """

    # Separators tried in order of decreasing granularity.
    _SEPARATORS = [
        "\n\n",  # paragraphs
        "\n",    # lines
        ". ",    # sentences
        "? ",
        "! ",
        "; ",
        ", ",
        " ",     # words
    ]

    def __init__(
        self,
        chunk_size: int = 512,
        chunk_overlap: int = 64,
        min_chunk_size: int = 50,
    ) -> None:
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap
        self.min_chunk_size = min_chunk_size

    # ── public API ──────────────────────────────────────────────────────

    def chunk_documents(self, documents: List[Document]) -> List[Chunk]:
        """Chunk every document, returning a flat list of Chunk objects."""
        all_chunks: List[Chunk] = []
        for doc in documents:
            all_chunks.extend(self._chunk_text(doc.content, doc.metadata))
        return all_chunks

    # ── internals ───────────────────────────────────────────────────────

    def _chunk_text(self, text: str, base_metadata: dict) -> List[Chunk]:
        """Split *text* into overlapping chunks."""
        text = text.strip()
        if not text:
            return []

        if len(text) <= self.chunk_size:
            return [Chunk(content=text, metadata={**base_metadata, "chunk_index": 0})]

        splits = self._recursive_split(text, list(self._SEPARATORS))
        return self._merge_with_overlap(splits, base_metadata)

    def _recursive_split(self, text: str, separators: List[str]) -> List[str]:
        """Recursively split *text* using the first working separator."""
        if not separators:
            # Hard character split as last resort
            return [text[i : i + self.chunk_size] for i in range(0, len(text), self.chunk_size)]

        sep = separators[0]
        remaining_seps = separators[1:]

        parts = text.split(sep)
        good: List[str] = []
        current = ""

        for part in parts:
            candidate = (current + sep + part) if current else part
            if len(candidate) <= self.chunk_size:
                current = candidate
            else:
                if current:
                    good.append(current)
                # If the part alone is still too big, recurse with finer seps
                if len(part) > self.chunk_size:
                    good.extend(self._recursive_split(part, remaining_seps))
                    current = ""
                else:
                    current = part

        if current:
            good.append(current)

        return good

    def _merge_with_overlap(self, splits: List[str], base_metadata: dict) -> List[Chunk]:
        """Merge small splits into chunk-sized pieces with overlap."""
        chunks: List[Chunk] = []
        current_parts: List[str] = []
        current_len = 0

        for split in splits:
            split_len = len(split)

            if current_len + split_len > self.chunk_size and current_parts:
                # Flush current parts as a chunk
                chunk_text = " ".join(current_parts).strip()
                if len(chunk_text) >= self.min_chunk_size:
                    chunks.append(Chunk(
                        content=chunk_text,
                        metadata={**base_metadata, "chunk_index": len(chunks)},
                    ))

                # Keep trailing parts for overlap
                overlap_parts: List[str] = []
                overlap_len = 0
                for part in reversed(current_parts):
                    if overlap_len + len(part) <= self.chunk_overlap:
                        overlap_parts.insert(0, part)
                        overlap_len += len(part)
                    else:
                        break

                current_parts = overlap_parts
                current_len = overlap_len

            current_parts.append(split)
            current_len += split_len

        # Flush remainder
        if current_parts:
            chunk_text = " ".join(current_parts).strip()
            if len(chunk_text) >= self.min_chunk_size:
                chunks.append(Chunk(
                    content=chunk_text,
                    metadata={**base_metadata, "chunk_index": len(chunks)},
                ))

        return chunks
