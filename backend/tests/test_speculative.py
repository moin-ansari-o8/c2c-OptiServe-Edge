import pytest
from backend.evaluation.acceptance import AcceptanceEvaluator
from backend.evaluation.metrics import calculate_throughput, calculate_speedup

def test_acceptance_evaluator():
    evaluator = AcceptanceEvaluator()
    
    # Iteration 1: proposed 10, accepted 8
    evaluator.record_iteration(10, 8)
    
    # Iteration 2: proposed 10, accepted 4
    evaluator.record_iteration(10, 4)
    
    assert evaluator.total_proposed == 20
    assert evaluator.total_accepted == 12
    assert evaluator.get_acceptance_rate() == 0.6 # 12/20
    assert evaluator.get_avg_accepted_per_iteration() == 6.0 # 12/2

def test_metrics_math():
    tps = calculate_throughput(tokens=100, time_seconds=2.0)
    assert tps == 50.0
    
    speedup = calculate_speedup(baseline_tps=50.0, speculative_tps=100.0)
    assert speedup == 2.0
