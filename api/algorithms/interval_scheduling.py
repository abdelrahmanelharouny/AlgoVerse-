from bisect import bisect_right
from time import perf_counter
from typing import List

from from api.models import AlgorithmResult, IntervalSchedulingInput, Metrics, Step, StepType


def solve_interval_scheduling_greedy(data: IntervalSchedulingInput) -> AlgorithmResult:
    """Maximum-cardinality interval scheduling using earliest-finish-time greedy."""
    started = perf_counter()
    ordered = sorted(data.intervals, key=lambda interval: (interval.end, interval.start, str(interval.id)))
    steps: List[Step] = [Step(type=StepType.SORT, description="Sort intervals by non-decreasing finish time", data={"sorted_order": [interval.id for interval in ordered]})]
    selected = []
    last_end = None
    operations = 0

    for interval in ordered:
        operations += 1
        steps.append(Step(type=StepType.HIGHLIGHT, description=f"Consider interval [{interval.start}, {interval.end}]", data={"interval_id": interval.id, "start": interval.start, "end": interval.end}))
        if last_end is None or interval.start >= last_end:
            selected.append(interval.id)
            last_end = interval.end
            steps.append(Step(type=StepType.PICK, description=f"Select interval {interval.id}; it does not overlap the previous selection", data={"item_id": interval.id, "start": interval.start, "end": interval.end, "current_weight": last_end, "total_value": len(selected)}))
        else:
            steps.append(Step(type=StepType.REJECT, description=f"Reject interval {interval.id}; it starts before the selected interval ends at {last_end}", data={"item_id": interval.id, "start": interval.start, "end": interval.end, "current_weight": last_end}))
    elapsed = perf_counter() - started
    return AlgorithmResult(
        steps=steps, result_value=len(selected), selected_items=selected,
        result_data={"selected_intervals": selected, "count": len(selected), "optimal": True},
        metrics=Metrics(time_taken=elapsed, time_complexity="O(n log n)", space_complexity="O(n)", step_count=len(steps), operation_count=operations)
    )


def solve_interval_scheduling_dp(data: IntervalSchedulingInput) -> AlgorithmResult:
    """Weighted-free interval DP formulation, retained for teaching the recurrence."""
    started = perf_counter()
    ordered = sorted(data.intervals, key=lambda interval: (interval.end, interval.start, str(interval.id)))
    ends = [interval.end for interval in ordered]
    n = len(ordered)
    dp = [0] * (n + 1)
    selected: List[List[object]] = [[] for _ in range(n + 1)]
    steps: List[Step] = [Step(type=StepType.SORT, description="Sort intervals by finish time and locate each predecessor", data={"sorted_order": [interval.id for interval in ordered]}), Step(type=StepType.INIT, description=f"Initialize an interval DP array of size {n + 1}", data={"rows": 1, "cols": n + 1})]
    operations = 0

    for i, interval in enumerate(ordered, start=1):
        predecessor_count = bisect_right(ends, interval.start, 0, i - 1)
        include_value = 1 + dp[predecessor_count]
        exclude_value = dp[i - 1]
        operations += 1
        steps.append(Step(type=StepType.HIGHLIGHT, description=f"Compare including interval {interval.id} ({include_value}) against excluding it ({exclude_value})", data={"i": 0, "j": i, "predecessor": predecessor_count}))
        if include_value > exclude_value:
            dp[i] = include_value
            selected[i] = selected[predecessor_count] + [interval.id]
            action = "include"
        else:
            dp[i] = exclude_value
            selected[i] = selected[i - 1]
            action = "exclude"
        steps.append(Step(type=StepType.UPDATE, description=f"{action.capitalize()} interval {interval.id}; dp[{i}] = {dp[i]}", data={"i": 0, "j": i, "value": dp[i], "action": action, "prev_j": predecessor_count if action == "include" else i - 1}))

    elapsed = perf_counter() - started
    return AlgorithmResult(
        steps=steps, result_value=dp[n], selected_items=selected[n],
        result_data={"selected_intervals": selected[n], "count": dp[n], "optimal": True},
        metrics=Metrics(time_taken=elapsed, time_complexity="O(n log n)", space_complexity="O(n)", step_count=len(steps), operation_count=operations)
    )
