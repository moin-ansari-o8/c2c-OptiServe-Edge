import pytest
from backend.integration.pipeline import OptiServePipeline

def test_pipeline_end_to_end():
    pipeline = OptiServePipeline()
    
    # Run a test query through the entire integrated pipeline
    query = "What is edge computing?"
    result = pipeline.generate_answer(query)
    
    # Assert all keys from different modules are present
    assert "response" in result
    assert "tokens" in result
    assert "proposed_draft_tokens" in result
    assert "accepted_draft_tokens" in result
    assert "latency" in result
    assert "tps" in result
    assert "memory_mb" in result
    assert "safety" in result
    
    # Assert safety dictionary structure
    safety = result["safety"]
    assert "confidence" in safety
    assert "is_risky" in safety
    assert "action" in safety
    
    # Output should not be empty
    assert len(result["response"]) > 0
    
    # Latency should be a positive float
    assert result["latency"] > 0
