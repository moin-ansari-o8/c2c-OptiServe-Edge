import time
import random
from typing import Dict, Any

from backend.rag.pipeline import RAGPipeline

# ==========================================
# MOCK CLASSES FOR MISSING MODULES (M1, M2, M3)
# ==========================================

class MockSpeculativeEngine:
    """Mock for Member 1 & 2's Speculative Decoder + CUDA."""
    def generate_with_draft(self, context: str, query: str) -> Dict[str, Any]:
        """Simulates speculative decoding generation."""
        # Simulated performance boost compared to baseline (e.g. ~1.8x - 2.2x speedup)
        # Baseline TPS = ~95. This mock will output ~190 TPS.
        proposed = random.randint(50, 100)
        # Simulated acceptance rate ~ 70% to 85%
        acceptance_rate = random.uniform(0.70, 0.85)
        accepted = int(proposed * acceptance_rate)
        
        simulated_tps = 190.0
        latency = proposed / simulated_tps
        
        time.sleep(0.1) # Simulated fast generation

        return {
            "response": f"Speculative decoded answer based on context: {context[:50]}...",
            "tokens": proposed,
            "proposed_draft_tokens": proposed,
            "accepted_draft_tokens": accepted,
            "latency": latency,
            "tps": simulated_tps,
            "memory_mb": 1200.5, # Mock VRAM usage
            "early_exits": random.randint(0, 2)
        }

class MockSafetyController:
    """Mock for Member 3's Hallucination Detection."""
    def evaluate_confidence(self, generation_state: Dict[str, Any], query: str) -> Dict[str, Any]:
        """Simulates checking generation confidence."""
        # Randomly assign a confidence score
        confidence = random.uniform(0.0, 1.0)
        is_risky = confidence < 0.3 # 30% chance of being flagged risky
        
        return {
            "confidence": confidence,
            "is_risky": is_risky,
            "action": "early_exit" if is_risky else "continue"
        }

# ==========================================
# FINAL OPTISERVE PIPELINE (Member 5 Integration)
# ==========================================

class OptiServePipeline:
    """
    The unified integration pipeline connecting:
    - RAG (M4)
    - Speculative Engine (M1/M2)
    - Safety Controller (M3)
    """
    def __init__(self, rag_dir: str = "backend/data"):
        self.rag = RAGPipeline()
        # Ingest sample data to initialize the vector store
        try:
            self.rag.ingest(rag_dir)
        except Exception as e:
            print(f"Warning: RAG initialization failed: {e}")
            
        self.engine = MockSpeculativeEngine()
        self.safety = MockSafetyController()

    def generate_answer(self, query: str) -> Dict[str, Any]:
        """End-to-end generation flow."""
        # 1. RAG Module
        context_str = self.rag.retrieve(query)

        
        # 2. Target Signals & Speculative Decoding
        engine_output = self.engine.generate_with_draft(context_str, query)
        
        # 3. Safety Check
        safety_output = self.safety.evaluate_confidence(engine_output, query)
        
        # 4. Final Combination
        final_result = {
            **engine_output,
            "safety": safety_output
        }
        
        return final_result
