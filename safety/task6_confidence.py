from dataclasses import dataclass
from typing import Dict


@dataclass
class ConfidenceWeights:
    """
    Weights used to combine the safety signals.

    The weights should be treated as configurable parameters
    and should be tuned using validation data.
    """

    entropy: float = 0.4
    activation: float = 0.2
    context_support: float = 0.4

    def validate(self) -> None:
        """Validate that weights are non-negative and sum to 1."""
        weights = [
            self.entropy,
            self.activation,
            self.context_support,
        ]

        if any(weight < 0 for weight in weights):
            raise ValueError(
                "Confidence weights must be non-negative."
            )

        total = sum(weights)

        if abs(total - 1.0) > 1e-6:
            raise ValueError(
                f"Confidence weights must sum to 1.0. "
                f"Current sum: {total:.6f}"
            )


def normalize_entropy(
    entropy: float,
    min_entropy: float,
    max_entropy: float,
) -> float:
    """
    Normalize entropy to a [0, 1] uncertainty score.

    0 = relatively low uncertainty
    1 = relatively high uncertainty
    """
    if max_entropy <= min_entropy:
        raise ValueError(
            "max_entropy must be greater than min_entropy."
        )

    normalized = (
        (entropy - min_entropy)
        / (max_entropy - min_entropy)
    )

    return max(0.0, min(1.0, normalized))


def normalize_activation(
    activation_value: float,
    min_activation: float,
    max_activation: float,
) -> float:
    """
    Normalize an activation-derived value to [0, 1].

    This function does not assume that high activation values
    indicate hallucination. The interpretation depends on
    calibration data.
    """
    if max_activation <= min_activation:
        raise ValueError(
            "max_activation must be greater than "
            "min_activation."
        )

    normalized = (
        (activation_value - min_activation)
        / (max_activation - min_activation)
    )

    return max(0.0, min(1.0, normalized))


def calculate_activation_signal(
    activation_mean: float,
    activation_variance: float,
    activation_l2_norm: float,
) -> float:
    """
    Combine the three activation features into a single
    normalized activation signal.

    The features are first converted into simple bounded
    components using stable mathematical transforms.

    This is a baseline feature aggregation strategy and
    should be calibrated against validation data later.
    """

    mean_component = abs(activation_mean)

    variance_component = activation_variance

    norm_component = activation_l2_norm

    # Log compression reduces the effect of very large values.
    mean_component = mean_component / (1.0 + mean_component)

    variance_component = variance_component / (
        1.0 + variance_component
    )

    norm_component = norm_component / (
        1.0 + norm_component
    )

    activation_signal = (
        mean_component
        + variance_component
        + norm_component
    ) / 3.0

    return max(0.0, min(1.0, activation_signal))


def calculate_confidence(
    entropy: float,
    activation_mean: float,
    activation_variance: float,
    activation_l2_norm: float,
    context_support: float,
    entropy_range: tuple = (0.0, 10.0),
    weights: ConfidenceWeights = None,
) -> Dict:
    """
    Calculate a baseline confidence score.

    Inputs:
        entropy:
            Token-level entropy.

        activation_mean:
            Mean of the final-layer hidden representation.

        activation_variance:
            Variance of the final-layer hidden representation.

        activation_l2_norm:
            L2 norm of the final-layer hidden representation.

        context_support:
            Context-support score from Task 5.

    Returns:
        Dictionary containing the intermediate signals
        and final confidence score.

    Important:
        This is a heuristic confidence score, not a
        validated hallucination probability.
    """

    if weights is None:
        weights = ConfidenceWeights()

    weights.validate()

    if not 0.0 <= context_support <= 1.0:
        raise ValueError(
            "context_support must be between 0 and 1."
        )

    # Convert entropy into an uncertainty value.
    entropy_uncertainty = normalize_entropy(
        entropy,
        entropy_range[0],
        entropy_range[1],
    )

    # Convert uncertainty into confidence.
    entropy_confidence = 1.0 - entropy_uncertainty

    # Calculate activation signal.
    activation_signal = calculate_activation_signal(
        activation_mean,
        activation_variance,
        activation_l2_norm,
    )

    # This baseline treats the activation signal as an
    # uncertainty contribution.
    activation_confidence = 1.0 - activation_signal

    # Task 5 already provides a [0, 1] support score.
    context_confidence = context_support

    # Weighted confidence score.
    confidence = (
        weights.entropy * entropy_confidence
        + weights.activation * activation_confidence
        + weights.context_support * context_confidence
    )

    confidence = max(0.0, min(1.0, confidence))

    return {
        "confidence": round(confidence, 4),
        "entropy_uncertainty": round(
            entropy_uncertainty,
            4,
        ),
        "entropy_confidence": round(
            entropy_confidence,
            4,
        ),
        "activation_signal": round(
            activation_signal,
            4,
        ),
        "activation_confidence": round(
            activation_confidence,
            4,
        ),
        "context_confidence": round(
            context_confidence,
            4,
        ),
        "weights": {
            "entropy": weights.entropy,
            "activation": weights.activation,
            "context_support": weights.context_support,
        },
    }


if __name__ == "__main__":

    result = calculate_confidence(
        entropy=2.5,
        activation_mean=0.02,
        activation_variance=0.8,
        activation_l2_norm=12.0,
        context_support=0.85,
    )

    print("Confidence Engine")
    print("-----------------")

    for key, value in result.items():
        print(f"{key}: {value}")
