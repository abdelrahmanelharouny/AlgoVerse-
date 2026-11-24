from time import perf_counter
from typing import List

from api.models import AlgorithmResult, Metrics, RodCuttingInput, Step, StepType


def solve_rod_cutting_dp(data: RodCuttingInput) -> AlgorithmResult:
    """Maximum revenue for an exact rod length, with safe reconstruction."""
    length = data.length
    prices = data.prices
    if length > 0 and not prices:
        raise ValueError("At least one price is required for a positive rod length")
    started = perf_counter()
    negative_infinity = float("-inf")
    dp = [negative_infinity] * (length + 1)
    first_cut = [0] * (length + 1)
    dp[0] = 0
    steps: List[Step] = [Step(type=StepType.INIT, description=f"Initialize revenue DP for rod length {length}", data={"rows": 1, "cols": length + 1, "prices": prices})]
    operations = 0

    for current_length in range(1, length + 1):
        best_value = negative_infinity
        for cut_length in range(1, min(current_length, len(prices)) + 1):
            if dp[current_length - cut_length] == negative_infinity:
                continue
            operations += 1
            candidate = prices[cut_length - 1] + dp[current_length - cut_length]
            steps.append(Step(type=StepType.HIGHLIGHT, description=f"Try a first cut of {cut_length} for rod length {current_length}", data={"i": 0, "j": current_length, "cut_length": cut_length}))
            if candidate > best_value:
                best_value = candidate
                first_cut[current_length] = cut_length
                steps.append(Step(type=StepType.UPDATE, description=f"New best revenue for length {current_length}: {candidate}", data={"i": 0, "j": current_length, "value": candidate, "cut": cut_length}))
        dp[current_length] = best_value

    if length > 0 and first_cut[length] == 0:
        raise ValueError(f"No exact cutting plan can produce rod length {length} from the supplied prices")

    cuts: List[int] = []
    remaining = length
    while remaining > 0:
        cut = first_cut[remaining]
        if cut <= 0 or cut > remaining:
            raise RuntimeError("Rod-cutting solution reconstruction failed")
        cuts.append(cut)
        remaining -= cut

    steps.append(Step(type=StepType.SOLUTION, description=f"Maximum revenue is {dp[length]}; cut lengths: {cuts}", data={"max_revenue": dp[length], "cuts": cuts, "dp": [None if value == negative_infinity else value for value in dp]}))
    elapsed = perf_counter() - started
    return AlgorithmResult(
        steps=steps, result_value=dp[length], selected_items=[],
        result_data={"max_revenue": dp[length], "cuts": cuts, "length": length},
        metrics=Metrics(time_taken=elapsed, time_complexity="O(n²)", space_complexity="O(n)", step_count=len(steps), operation_count=operations)
    )
