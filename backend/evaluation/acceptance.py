from backend.evaluation.metrics import calculate_acceptance_rate

class AcceptanceEvaluator:
    def __init__(self):
        self.total_proposed = 0
        self.total_accepted = 0
        self.iterations = 0

    def record_iteration(self, proposed: int, accepted: int):
        """Record the results of a single speculative decoding iteration."""
        self.total_proposed += proposed
        self.total_accepted += accepted
        self.iterations += 1

    def get_acceptance_rate(self) -> float:
        """Return the overall draft acceptance rate as a percentage."""
        return calculate_acceptance_rate(self.total_accepted, self.total_proposed)

    def get_avg_accepted_per_iteration(self) -> float:
        """Return the average number of draft tokens accepted per iteration."""
        if self.iterations == 0:
            return 0.0
        return self.total_accepted / self.iterations
