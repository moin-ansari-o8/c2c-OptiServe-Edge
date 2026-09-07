import re
from typing import List, Dict


# Common words that carry little meaning for context matching.
STOPWORDS = {
    "a",
    "an",
    "and",
    "are",
    "as",
    "at",
    "be",
    "by",
    "for",
    "from",
    "has",
    "have",
    "he",
    "her",
    "his",
    "in",
    "is",
    "it",
    "its",
    "of",
    "on",
    "or",
    "that",
    "the",
    "their",
    "this",
    "to",
    "was",
    "were",
    "will",
    "with",
    "you",
    "your",
}


def normalize_text(text: str) -> str:
    """
    Convert text to lowercase and remove punctuation.
    """
    text = text.lower()
    text = re.sub(r"[^a-z0-9\s]", " ", text)
    text = re.sub(r"\s+", " ", text).strip()

    return text


def extract_content_words(text: str) -> List[str]:
    """
    Extract meaningful words while removing common stopwords.
    """
    normalized = normalize_text(text)

    words = normalized.split()

    return [
        word
        for word in words
        if word not in STOPWORDS and len(word) > 2
    ]


def calculate_sentence_support(
    sentence: str,
    context_words: set,
) -> float:
    """
    Calculate lexical support for one answer sentence.

    The score represents the fraction of meaningful words
    in the sentence that also occur in the retrieved context.
    """
    sentence_words = set(extract_content_words(sentence))

    if not sentence_words:
        return 0.0

    overlapping_words = sentence_words.intersection(context_words)

    return len(overlapping_words) / len(sentence_words)


def split_sentences(text: str) -> List[str]:
    """
    Split text into simple sentences.
    """
    sentences = re.split(r"(?<=[.!?])\s+", text.strip())

    return [
        sentence.strip()
        for sentence in sentences
        if sentence.strip()
    ]


def calculate_context_support(
    context: str,
    answer: str,
) -> Dict:
    """
    Calculate an explainable context-support score.

    Returns:
        {
            "support_score": float,
            "sentence_scores": list,
            "supported_sentences": int,
            "total_sentences": int
        }

    The score is a lexical grounding signal, not a
    definitive hallucination probability.
    """
    if not context.strip() or not answer.strip():
        return {
            "support_score": 0.0,
            "sentence_scores": [],
            "supported_sentences": 0,
            "total_sentences": 0,
        }

    context_words = set(
        extract_content_words(context)
    )

    sentences = split_sentences(answer)

    sentence_scores = []

    for sentence in sentences:
        score = calculate_sentence_support(
            sentence,
            context_words,
        )

        sentence_scores.append(
            {
                "sentence": sentence,
                "support_score": round(score, 4),
            }
        )

    if not sentence_scores:
        return {
            "support_score": 0.0,
            "sentence_scores": [],
            "supported_sentences": 0,
            "total_sentences": 0,
        }

    overall_score = sum(
        item["support_score"]
        for item in sentence_scores
    ) / len(sentence_scores)

    supported_sentences = sum(
        1
        for item in sentence_scores
        if item["support_score"] >= 0.5
    )

    return {
        "support_score": round(overall_score, 4),
        "sentence_scores": sentence_scores,
        "supported_sentences": supported_sentences,
        "total_sentences": len(sentence_scores),
    }


if __name__ == "__main__":

    retrieved_context = """
    Artificial intelligence is a field of computer science.
    It focuses on creating systems that can perform tasks
    that normally require human intelligence.
    Machine learning is a major approach used in artificial intelligence.
    """

    generated_answer = (
        "Artificial intelligence is a field of computer science. "
        "It involves creating systems that can perform tasks "
        "requiring human intelligence."
    )

    result = calculate_context_support(
        retrieved_context,
        generated_answer,
    )

    print("Context Support Analysis")
    print("------------------------")

    print(
        f"Overall support score: "
        f"{result['support_score']:.4f}"
    )

    print(
        f"Supported sentences: "
        f"{result['supported_sentences']}/"
        f"{result['total_sentences']}"
    )

    print("\nSentence-level scores:")

    for item in result["sentence_scores"]:
        print(
            f"- Score: {item['support_score']:.4f} | "
            f"{item['sentence']}"
        )
