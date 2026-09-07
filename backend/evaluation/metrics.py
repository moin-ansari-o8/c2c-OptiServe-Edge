def calculate_throughput(tokens: int, time_seconds: float) -> float:
    """Calculate generation speed in tokens per second."""
    if time_seconds <= 0:
        return 0.0
    return tokens / time_seconds

def calculate_acceptance_rate(accepted: int, proposed: int) -> float:
    """Calculate the percentage of draft tokens accepted by the target model."""
    if proposed == 0:
        return 0.0
    return accepted / proposed

def calculate_speedup(baseline_tps: float, speculative_tps: float) -> float:
    """Calculate the speedup factor of the speculative system vs baseline."""
    if baseline_tps <= 0:
        return 0.0
    return speculative_tps / baseline_tps
