from dataclasses import dataclass
from typing import Dict


@dataclass
class ControllerConfig:
    """
    Configuration for the speculative-decoding safety controller.

    The threshold is an initial configurable value and should
    be tuned using validation data.
    """

    confidence_threshold: float = 0.60

    def validate(self) -> None:
        """Validate controller configuration."""

        if not 0.0 <= self.confidence_threshold <= 1.0:
            raise ValueError(
                "confidence_threshold must be between 0 and 1."
            )


def make_decision(
    confidence: float,
    config: ControllerConfig = None,
) -> Dict:
    """
    Decide whether speculative decoding should continue.

    Args:
        confidence:
            Confidence score produced by Task 6.

        config:
            Controller configuration containing the
            confidence threshold.

    Returns:
        Dictionary containing:
            confidence
            threshold
            continue_speculation
            reason
    """

    if config is None:
        config = ControllerConfig()

    config.validate()

    if not 0.0 <= confidence <= 1.0:
        raise ValueError(
            "confidence must be between 0 and 1."
        )

    threshold = config.confidence_threshold

    if confidence >= threshold:
        continue_speculation = True
        reason = "Confidence is above the safety threshold."
    else:
        continue_speculation = False
        reason = (
            "Confidence is below the safety threshold; "
            "terminate speculative decoding and fall back "
            "to normal target-model decoding."
        )

    return {
        "confidence": round(confidence, 4),
        "threshold": threshold,
        "continue_speculation": continue_speculation,
        "reason": reason,
    }


if __name__ == "__main__":

    config = ControllerConfig(
        confidence_threshold=0.60
    )

    test_confidences = [
        0.85,
        0.45,
        0.60,
    ]

    print("Early-Termination Controller")
    print("----------------------------")

    for confidence in test_confidences:

        result = make_decision(
            confidence,
            config,
        )

        print(
            f"\nConfidence: "
            f"{result['confidence']:.4f}"
        )

        print(
            f"Threshold: "
            f"{result['threshold']:.4f}"
        )

        print(
            f"Continue speculation: "
            f"{result['continue_speculation']}"
        )

        print(
            f"Reason: "
            f"{result['reason']}"
        )
