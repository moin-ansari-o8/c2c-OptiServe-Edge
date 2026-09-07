import time
import random
from typing import Dict, Any

from backend.evaluation.performance import PerformanceMonitor

class BaselineSystem:
    """
    Mock/Stub for the Baseline Reference System:
    RAG -> Qwen2.5-1.5B -> Normal generation.
    """
    def __init__(self, rag_pipeline=None):
        self.rag_pipeline = rag_pipeline
        # Frozen measured baseline parameters from requirements
        self.reference_tokens = 2726
        self.reference_time = 28.660
        self.reference_tps = 95.11

    def generate(self, query: str) -> Dict[str, Any]:
        """Simulate a baseline generation."""
        monitor = PerformanceMonitor()
        monitor.start()
        
        # In a real system, we would query the target LLM here
        # For simulation, we sleep slightly to mock latency based on answerability
        time.sleep(0.5) 
        
        monitor.stop()
        
        # Simulate ~50-100 tokens generated per request in this mock
        simulated_tokens = random.randint(50, 100)
        # Force the TPS to be close to the reference for this simulation
        simulated_time = simulated_tokens / self.reference_tps
        
        return {
            "response": f"Baseline response to: {query}",
            "tokens": simulated_tokens,
            "latency": simulated_time,
            "tps": simulated_tokens / simulated_time,
            "memory_mb": monitor.get_peak_memory_mb()
        }
