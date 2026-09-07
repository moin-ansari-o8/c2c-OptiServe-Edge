Task 1 — Basic Qwen2.5-1.5B Inference

Implemented basic inference using Qwen2.5-1.5B-Instruct with Hugging Face Transformers and PyTorch. The module loads the tokenizer and model, detects whether CUDA is available, and generates a response from a given prompt.

Task 2 — Logits & Token Probabilities

Implemented autoregressive token-by-token generation to access the model's next-token logits. The module converts the logits into probabilities and records the selected token, token ID, and its probability at each generation step.

Task 3 — Token-Level Entropy

Extended the generation pipeline to calculate token-level entropy from the complete next-token probability distribution. Entropy is used as an uncertainty signal, where higher entropy generally indicates greater uncertainty in the model's prediction.

Task 4 — Hidden-State / Activation Features

Added extraction of the model's final hidden-state representation during generation. For each generated token, the module calculates activation statistics including mean, variance, and L2 norm to provide additional signals for the safety layer.

Task 5 — RAG Context Support

Implemented a lightweight method to measure how well the generated response is supported by the retrieved RAG context. The module calculates sentence-level and overall support scores using content-word overlap between the context and generated answer.

Task 6 — Confidence Engine

Implemented a configurable confidence engine that combines entropy, activation features, and RAG context support into a single confidence score between 0 and 1. The module also exposes the individual signals and their weights so that the scoring behavior can be analyzed and tuned.

Task 7 — Early-Termination Controller

Implemented a threshold-based controller that uses the confidence score to determine whether speculative decoding should continue. When confidence falls below the configured threshold, the controller recommends terminating the speculative path and falling back to normal target-model decoding.

This level of detail is appropriate for the safety/README.md because it explains what each task actually implemented and why it exists, without making unsupported claims about hallucination-detection accuracy.
