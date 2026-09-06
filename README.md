# OptiServe-Edge

An edge-optimized model serving and inference framework designed for efficient scheduling, dynamic memory management, and real-time monitoring on resource-constrained devices.

## Project Structure

```text
OptiServe-Edge/
│
├── README.md
├── requirements.txt
├── .gitignore
│
├── src/
│   ├── server.py
│   ├── scheduler.py
│   ├── memory_manager.py
│   └── monitoring.py
│
├── benchmarks/
│   └── benchmark.py
│
└── tests/
```

## Getting Started

### Installation

```bash
python -m venv .venv
# On Windows:
.venv\Scripts\activate
# On Linux/macOS:
# source .venv/bin/activate

pip install -r requirements.txt
```

### Running the Server

```bash
python -m src.server
```

### Benchmarks

```bash
python -m benchmarks.benchmark
```
