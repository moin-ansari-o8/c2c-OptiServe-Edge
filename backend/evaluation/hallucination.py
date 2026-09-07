class HallucinationEvaluator:
    def __init__(self):
        self.true_positives = 0  # correctly flagged risky
        self.false_positives = 0 # flagged risky, but was safe
        self.true_negatives = 0  # correctly allowed safe
        self.false_negatives = 0 # allowed safe, but was risky

    def record_decision(self, is_risky_actual: bool, was_flagged_risky: bool):
        if is_risky_actual and was_flagged_risky:
            self.true_positives += 1
        elif not is_risky_actual and was_flagged_risky:
            self.false_positives += 1
        elif not is_risky_actual and not was_flagged_risky:
            self.true_negatives += 1
        elif is_risky_actual and not was_flagged_risky:
            self.false_negatives += 1

    @property
    def total_decisions(self) -> int:
        return self.true_positives + self.false_positives + self.true_negatives + self.false_negatives

    def get_hallucination_rate(self) -> float:
        """Rate of hallucinated/risky responses escaping detection."""
        if self.total_decisions == 0:
            return 0.0
        # Responses that were actually risky
        actual_risky = self.true_positives + self.false_negatives
        return actual_risky / self.total_decisions

    def get_detection_accuracy(self) -> float:
        """Overall accuracy of the safety classifier."""
        if self.total_decisions == 0:
            return 0.0
        correct = self.true_positives + self.true_negatives
        return correct / self.total_decisions

    def get_precision(self) -> float:
        """Precision: Of all flagged, how many were actually risky?"""
        flagged = self.true_positives + self.false_positives
        if flagged == 0:
            return 0.0
        return self.true_positives / flagged

    def get_recall(self) -> float:
        """Recall: Of all actually risky, how many did we catch?"""
        actual_risky = self.true_positives + self.false_negatives
        if actual_risky == 0:
            return 0.0
        return self.true_positives / actual_risky

    def get_f1_score(self) -> float:
        """F1 Score: Harmonic mean of precision and recall."""
        precision = self.get_precision()
        recall = self.get_recall()
        if precision + recall == 0:
            return 0.0
        return 2 * (precision * recall) / (precision + recall)
