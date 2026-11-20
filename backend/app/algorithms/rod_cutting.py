import time

from app.models import Step, StepType, AlgorithmResult, Metrics


def solve_rod_cutting_dp(data) -> AlgorithmResult:
    """Maximize revenue while cutting the rod into priced integer-length pieces."""
    start_time = time.perf_counter()
    length = data.length
    prices = data.prices

    if isinstance(length, bool) or not isinstance(length, int) or length < 0:
        raise ValueError("Rod length must be a non-negative integer.")
    if any(isinstance(price, bool) or not isinstance(price, (int, float)) for price in prices):
        raise ValueError("Rod prices must be numeric.")

    dp = [float("-inf")] * (length + 1)
    first_cut = [0] * (length + 1)
    dp[0] = 0
    steps = [Step(
        type=StepType.INIT,
        description=f"Initialized rod-cutting DP for length {length}",
        data={"rows": 1, "cols": length + 1, "prices": prices},
    )]

    for current_length in range(1, length + 1):
        best = float("-inf")
        for piece_length in range(1, min(current_length, len(prices)) + 1):
            if dp[current_length - piece_length] == float("-inf"):
                continue
            candidate = prices[piece_length - 1] + dp[current_length - piece_length]
            steps.append(Step(
                type=StepType.HIGHLIGHT,
                description=(f"For rod length {current_length}: try piece {piece_length} "
                             f"with price {prices[piece_length - 1]}"),
                data={"i": 0, "j": current_length, "cut_length": piece_length},
            ))
            if candidate > best:
                best = candidate
                first_cut[current_length] = piece_length
                steps.append(Step(
                    type=StepType.UPDATE,
                    description=f"New best for length {current_length}: {candidate}",
                    data={"i": 0, "j": current_length, "value": candidate,
                          "cut": piece_length},
                ))
        dp[current_length] = best

    if dp[length] == float("-inf"):
        raise ValueError(f"Rod length {length} cannot be formed from the supplied price list.")

    cuts = []
    remaining = length
    while remaining > 0:
        piece_length = first_cut[remaining]
        if piece_length <= 0:
            raise RuntimeError("Rod-cutting reconstruction failed.")
        cuts.append(piece_length)
        remaining -= piece_length

    steps.append(Step(
        type=StepType.SOLUTION,
        description=f"Maximum revenue: {dp[length]}. Cuts: {cuts}",
        data={"max_revenue": dp[length], "cuts": cuts, "dp": dp},
    ))
    elapsed = time.perf_counter() - start_time
    return AlgorithmResult(
        steps=steps,
        result_value=dp[length],
        selected_items=cuts,
        metrics=Metrics(
            time_taken=elapsed,
            space_complexity=f"O({length})",
            time_complexity=f"O({length} * min({length}, {len(prices)}))",
            step_count=len(steps),
        ),
    )
