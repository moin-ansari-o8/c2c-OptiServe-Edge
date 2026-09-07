from typing import List, Dict

# Example static dataset for evaluation.
# `is_answerable` determines if the system should find the answer in the RAG context or detect it as hallucination risk.
EVALUATION_DATASET: List[Dict] = [
    {
        "question": "What is the admission process?",
        "expected_evidence": "Students must submit their high school transcripts and complete the online application form.",
        "is_answerable": True
    },
    {
        "question": "What is the fee for XYZ?",
        "expected_evidence": "The fee structure varies by course, generally ranging from $500 to $1500 per semester.",
        "is_answerable": True
    },
    {
        "question": "What happened in 1850 on Mars?",
        "expected_evidence": None,
        "is_answerable": False
    },
    {
        "question": "How do I configure speculative decoding in vLLM?",
        "expected_evidence": "Speculative decoding in vLLM can be enabled using the --speculative-model flag.",
        "is_answerable": True
    },
    {
        "question": "What is the exact population of exoplanet Kepler-186f?",
        "expected_evidence": None,
        "is_answerable": False
    }
]

def get_evaluation_dataset() -> List[Dict]:
    return EVALUATION_DATASET
