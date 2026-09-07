# OptiServe-Edge

**OptiServe-Edge** is an edge-optimized LLM inference and serving framework designed to make multi-agent AI workloads more efficient and reliable on resource-constrained consumer GPUs.

The project combines inference optimization, memory management, RAG, speculative decoding, and safety mechanisms into a unified middleware layer for local AI inference.

---

## Project Goals

Running multiple LLM agents concurrently on consumer GPUs can lead to:

* High VRAM consumption
* KV-cache growth
* GPU memory fragmentation
* Increased latency under concurrent workloads
* Poor GPU utilization
* Out-of-memory (OOM) failures
* Unreliable generated responses in RAG-based workflows

OptiServe-Edge aims to address these problems through:

1. **Memory-efficient inference**
2. **Intelligent request scheduling**
3. **RAG-based retrieval**
4. **Speculative decoding**
5. **Early hallucination-risk detection**
6. **Resilience and telemetry**

---

## System Architecture

```text
                    ┌──────────────────────┐
                    │   Multi-Agent Apps   │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │ Resilience Middleware│
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │ Request Scheduler    │
                    └──────────┬───────────┘
                               │
             ┌─────────────────┴─────────────────┐
             │                                   │
             ▼                                   ▼
   ┌────────────────────┐              ┌────────────────────┐
   │ RAG Pipeline       │              │ Inference Engine   │
   │                    │              │                    │
   │ Loader             │              │ Quantization       │
   │ Chunker            │              │ KV Cache           │
   │ Embeddings         │              │ Batching            │
   │ Retriever          │              │ Speculative Decode │
   │ Vector Store       │              │                    │
   └─────────┬──────────┘              └─────────┬──────────┘
             │                                   │
             └────────────────┬──────────────────┘
                              ▼
                   ┌──────────────────────┐
                   │ Safety Intelligence  │
                   │ Layer                │
                   │                      │
                   │ Entropy              │
                   │ Activation Signals   │
                   │ Context Support      │
                   │ Confidence Engine    │
                   │ Early Termination    │
                   └──────────┬───────────┘
                              │
                              ▼
                    ┌──────────────────────┐
                    │ Local LLM Inference  │
                    └──────────────────────┘
```

---

## Core Optimization Components

### 1. INT4 / AWQ Quantization

Reduces the memory footprint of model weights using 4-bit quantization.

This allows larger models to operate within the limited VRAM available on consumer GPUs.

### 2. Paged KV Cache

Manages the KV cache using page/block-based allocation to improve memory utilization and reduce fragmentation.

### 3. Prefix Caching

Reuses KV states for repeated prompt prefixes, reducing redundant prefill computation for requests that share common context.

### 4. Continuous Batching

Dynamically admits and removes requests during generation instead of waiting for a fixed batch to complete.

This improves GPU utilization and system throughput under concurrent workloads.

### 5. Memory-Aware Admission Control

Estimates whether a new request can safely execute within the available memory budget.

Requests that cannot safely execute can be queued or rejected instead of allowing uncontrolled GPU memory pressure.

### 6. Resilience Middleware

Provides safeguards such as:

* Request queuing
* Backpressure
* Admission control
* Timeouts
* Request prioritization
* Controlled rejection

The objective is to reduce the probability of inference failures under high load.

### 7. Telemetry

Tracks inference and system-level metrics such as:

* Time to First Token (TTFT)
* Generation time
* Tokens generated
* Tokens/second
* VRAM utilization
* Batch size
* Cache behavior
* OOM events

---

# RAG Pipeline

OptiServe-Edge includes a modular Retrieval-Augmented Generation pipeline.

```text
Documents
    │
    ▼
Document Loader
    │
    ▼
Text Chunking
    │
    ▼
Embeddings
    │
    ▼
Vector Store
    │
    ▼
Retriever
    │
    ▼
Retrieved Context
    │
    ▼
LLM Generation
```

Current RAG components include:

* Document loading
* Text chunking
* Embedding generation
* Vector storage
* Context retrieval
* RAG pipeline orchestration

Sample datasets are available under:

```text
backend/data/
```

---

# Safety Intelligence Layer

The Safety Intelligence Layer is responsible for estimating whether generated content is sufficiently reliable to continue speculative decoding.

The current implementation is based on several signals.

## Entropy Analysis

Token-level entropy is calculated from the next-token probability distribution.

Higher entropy generally indicates greater uncertainty in the model's next-token prediction.

```text
Logits
   │
   ▼
Softmax
   │
   ▼
Probability Distribution
   │
   ▼
Entropy
```

## Activation Features

The safety layer extracts features from the model's final hidden state, including:

* Activation mean
* Activation variance
* L2 norm

These features provide additional signals about the model's internal representation during generation.

## Context Support

Generated responses can be compared against retrieved RAG context using a lightweight lexical support analysis.

The system produces:

* Overall context-support score
* Sentence-level support scores
* Number of supported sentences
* Total number of sentences

This is currently a **support signal**, not a definitive hallucination detector.

## Confidence Engine

The confidence engine combines:

```text
Entropy Signal
      +
Activation Signal
      +
RAG Context Support
      │
      ▼
Confidence Score (0–1)
```

The weighting of these signals is configurable.

## Early-Termination Controller

The controller compares the calculated confidence against a configurable threshold.

```text
                 Confidence
                     │
          ┌──────────┴──────────┐
          │                     │
     Above threshold       Below threshold
          │                     │
          ▼                     ▼
 Continue speculation     Stop speculation
                                │
                                ▼
                     Normal target decoding
```

The controller returns:

* Confidence score
* Safety threshold
* Continue/stop decision
* Decision reason

---

# Current Safety Implementation

The safety module currently contains:

```text
safety/
├── README.md
├── task1_qwen.py
├── task2_logits.py
├── task3_entropy.py
├── task4_activation_features.py
├── task5_context_support.py
├── task6_confidence.py
└── task7_controller.py
```

### Task Breakdown

| Task | Component                        | Status             |
| ---- | -------------------------------- | ------------------ |
| 1    | Basic Qwen inference             | Completed          |
| 2    | Logits & token probabilities     | Completed          |
| 3    | Entropy analysis                 | Completed          |
| 4    | Activation features              | Completed          |
| 5    | RAG context support              | Completed          |
| 6    | Confidence engine                | Completed          |
| 7    | Early-termination controller     | Completed          |
| 8    | Speculative-decoding integration | Handled separately |

The safety components are intentionally modular so they can be connected to the speculative-decoding engine without tightly coupling the two implementations.

---

# Backend Structure

```text
OptiServe-Edge/
│
├── backend/
│   ├── data/
│   │   ├── sample_college.txt
│   │   └── sample_edge_computing.txt
│   │
│   ├── rag/
│   │   ├── chunker.py
│   │   ├── embeddings.py
│   │   ├── loader.py
│   │   ├── pipeline.py
│   │   ├── retriever.py
│   │   └── vector_store.py
│   │
│   └── tests/
│       ├── test_rag.py
│       └── test_retriever.py
│
├── safety/
│   ├── README.md
│   ├── task1_qwen.py
│   ├── task2_logits.py
│   ├── task3_entropy.py
│   ├── task4_activation_features.py
│   ├── task5_context_support.py
│   ├── task6_confidence.py
│   └── task7_controller.py
│
├── frontend/
│   ├── src/
│   ├── index.html
│   ├── package.json
│   └── vite.config.ts
│
├── requirements.txt
├── merge.md
└── README.md
```

---

# Installation

Create and activate a Python virtual environment:

```bash
python -m venv .venv
```

### Linux / macOS

```bash
source .venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

---

# Running the Safety Components

The safety modules can be executed individually during development.

For example:

```bash
python safety/task3_entropy.py
```

or:

```bash
python safety/task6_confidence.py
```

and:

```bash
python safety/task7_controller.py
```

The Qwen inference tasks require a compatible Transformers/PyTorch environment and sufficient hardware for the model.

---

# Development Principles

OptiServe-Edge follows several design principles:

### Modular

Each optimization and safety component is implemented independently so that components can be benchmarked and replaced without redesigning the entire system.

### Resource-Aware

The system is designed around the constraints of consumer GPU hardware, particularly limited VRAM and concurrent inference workloads.

### Explainable

The safety layer exposes intermediate signals such as entropy, activation features, context support, and confidence rather than producing an unexplained binary decision.

### Measurable

System improvements should be evaluated using measurable inference metrics such as:

* TTFT
* Tokens/second
* Throughput
* VRAM usage
* Batch utilization
* Cache hit rate
* OOM/failure rate
* Safety decision accuracy

---

# Project Status

**Current development status:**

* RAG pipeline: **Implemented**
* Safety Intelligence Layer: **Implemented through Task 7**
* Inference optimization components: **Under development/integration**
* Speculative decoding integration: **Being handled separately**
* End-to-end benchmarking: **Pending integration**

The project is being developed as a hackathon prototype with an emphasis on demonstrating measurable improvements in local multi-agent LLM serving under constrained GPU resources.
