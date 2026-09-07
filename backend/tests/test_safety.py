import pytest
from backend.evaluation.hallucination import HallucinationEvaluator

def test_hallucination_evaluator_perfect_score():
    evaluator = HallucinationEvaluator()
    
    # Simulate perfect safety module
    # Answerable -> Safe -> Not Flagged Risky
    evaluator.record_decision(is_risky_actual=False, was_flagged_risky=False)
    # Unanswerable -> Risky -> Flagged Risky
    evaluator.record_decision(is_risky_actual=True, was_flagged_risky=True)
    
    assert evaluator.get_detection_accuracy() == 1.0
    assert evaluator.get_precision() == 1.0
    assert evaluator.get_recall() == 1.0
    assert evaluator.get_f1_score() == 1.0
    assert evaluator.get_hallucination_rate() == 0.5 # 1 out of 2 were risky. Hallucination rate metric is actual risky / total

def test_hallucination_evaluator_poor_score():
    evaluator = HallucinationEvaluator()
    
    # Simulate a safety module that flags everything as safe
    evaluator.record_decision(is_risky_actual=False, was_flagged_risky=False) # True negative
    evaluator.record_decision(is_risky_actual=True, was_flagged_risky=False)  # False negative
    
    assert evaluator.get_detection_accuracy() == 0.5
    assert evaluator.get_precision() == 0.0
    assert evaluator.get_recall() == 0.0
    assert evaluator.get_f1_score() == 0.0
