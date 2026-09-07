import time
import psutil
try:
    import torch
except ImportError:
    torch = None

from backend.evaluation.metrics import calculate_throughput

class PerformanceMonitor:
    def __init__(self):
        self.start_time = 0
        self.end_time = 0

    def start(self):
        """Start tracking generation time."""
        if torch and torch.cuda.is_available():
            torch.cuda.reset_peak_memory_stats()
        self.start_time = time.time()

    def stop(self):
        """Stop tracking generation time."""
        self.end_time = time.time()

    def get_latency(self) -> float:
        """Return total generation time in seconds."""
        return self.end_time - self.start_time

    def get_throughput(self, tokens: int) -> float:
        """Return tokens per second."""
        return calculate_throughput(tokens, self.get_latency())

    def get_peak_memory_mb(self) -> float:
        """Return peak VRAM usage during generation if CUDA is available."""
        if torch and torch.cuda.is_available():
            return torch.cuda.max_memory_allocated() / (1024 * 1024)
        return 0.0

    def get_system_utilization(self) -> dict:
        """Return overall CPU and system memory usage."""
        return {
            "cpu_percent": psutil.cpu_percent(),
            "ram_used_mb": psutil.virtual_memory().used / (1024 * 1024)
        }
