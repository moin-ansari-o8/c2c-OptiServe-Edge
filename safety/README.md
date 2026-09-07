# Speculative Decoding & Safety Module

This directory contains the implementation of the speculative decoding
and early hallucination detection components of OptiServe-Edge.

## Task 1 — Basic Qwen2.5-1.5B Inference

The first task establishes basic inference using:

- Qwen2.5-1.5B-Instruct
- Hugging Face Transformers
- PyTorch
- CUDA when available

### Current functionality

- Load the tokenizer
- Load the target model
- Detect available device
- Generate text from a prompt

### Upcoming tasks

1. Logit and token-probability extraction
2. Token-level entropy
3. Hidden-state/activation features
4. RAG context support
5. Confidence scoring
6. Early-exit controller
7. Speculative decoding integration
