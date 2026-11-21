from __future__ import annotations

from time import perf_counter
from typing import Any, Dict, List

from api.models import AlgorithmResult, KnapsackInput, Metrics, Step, StepType


def _validate(data: KnapsackInput) -> None:
    if data.capacity < 0:
        raise ValueError("Capacity cannot be negative")
    if any(item.weight < 0 for item in data.items):
        raise ValueError("Item weights cannot be negative")


def solve_knapsack_dp(data: KnapsackInput) -> AlgorithmResult:
    """Exact 0/1 Knapsack using O(nW) dynamic programming."""
    _validate(data)
    started = perf_counter()
    items, capacity = data.items, data.capacity
    n = len(items)
    dp = [[0] * (capacity + 1) for _ in range(n + 1)]
    steps: List[Step] = [
        Step(type=StepType.INIT, description=f"Initialized a {n + 1} × {capacity + 1} DP table", data={"rows": n + 1, "cols": capacity + 1})
    ]
    operations = 0

    for i, item in enumerate(items, start=1):
        for current_capacity in range(capacity + 1):
            operations += 1
            excluded = dp[i - 1][current_capacity]
            included = item.value + dp[i - 1][current_capacity - item.weight] if item.weight <= current_capacity else float("-inf")
            take = included > excluded
            dp[i][current_capacity] = included if take else excluded
            steps.append(Step(
                type=StepType.HIGHLIGHT,
                description=f"Evaluating item {item.id} at capacity {current_capacity}",
                data={"i": i, "j": current_capacity, "item_id": item.id, "compare": {"include": included if included != float("-inf") else None, "exclude": excluded}}
            ))
            steps.append(Step(
                type=StepType.UPDATE,
                description=f"{'Include' if take else 'Exclude'} item {item.id}: best value = {dp[i][current_capacity]}",
                data={"i": i, "j": current_capacity, "value": dp[i][current_capacity], "action": "include" if take else "exclude", "item_id": item.id}
            ))

    selected: List[Any] = []
    current_capacity = capacity
    for i in range(n, 0, -1):
        if dp[i][current_capacity] != dp[i - 1][current_capacity]:
            item = items[i - 1]
            selected.append(item.id)
            current_capacity -= item.weight
            steps.append(Step(type=StepType.SOLUTION, description=f"Backtracking selected item {item.id}", data={"item_id": item.id, "selected": True}))
    selected.reverse()
    elapsed = perf_counter() - started

    return AlgorithmResult(
        steps=steps,
        result_value=dp[n][capacity],
        selected_items=selected,
        result_data={"selected_items": selected, "total_weight": sum(item.weight for item in items if item.id in selected), "capacity": capacity, "optimal": True},
        metrics=Metrics(time_taken=elapsed, time_complexity="O(nW)", space_complexity="O(nW)", step_count=len(steps), operation_count=operations)
    )


def solve_knapsack_greedy(data: KnapsackInput) -> AlgorithmResult:
    """0/1 Knapsack density heuristic. This is not guaranteed to be optimal."""
    _validate(data)
    started = perf_counter()
    steps: List[Step] = [Step(type=StepType.SORT, description="Rank items by value-to-weight ratio", data={})]
    ordered = sorted(
        data.items,
        key=lambda item: (float("inf") if item.weight == 0 and item.value > 0 else (item.value / item.weight if item.weight else float("-inf"))),
        reverse=True
    )
    steps.append(Step(type=StepType.SORT, description="Items sorted by descending value density", data={"sorted_order": [item.id for item in ordered]}))

    total_weight = 0
    total_value = 0
    selected: List[Any] = []
    for item in ordered:
        ratio = float("inf") if item.weight == 0 and item.value > 0 else (item.value / item.weight if item.weight else 0)
        if item.value > 0 and total_weight + item.weight <= data.capacity:
            total_weight += item.weight
            total_value += item.value
            selected.append(item.id)
            steps.append(Step(type=StepType.PICK, description=f"Picked item {item.id} (ratio: {ratio:.2f})", data={"item_id": item.id, "weight": item.weight, "value": item.value, "ratio": ratio, "current_weight": total_weight, "total_value": total_value}))
        else:
            steps.append(Step(type=StepType.REJECT, description=f"Skipped item {item.id}; adding it would not improve a feasible solution", data={"item_id": item.id, "weight": item.weight, "value": item.value, "current_weight": total_weight, "total_value": total_value}))

    elapsed = perf_counter() - started
    return AlgorithmResult(
        steps=steps, result_value=total_value, selected_items=selected,
        result_data={"selected_items": selected, "total_weight": total_weight, "capacity": data.capacity, "optimal": False, "method": "value_density_heuristic"},
        metrics=Metrics(time_taken=elapsed, time_complexity="O(n log n)", space_complexity="O(n)", step_count=len(steps), operation_count=len(ordered))
    )


def solve_fractional_knapsack(data: KnapsackInput) -> AlgorithmResult:
    """Optimal Fractional Knapsack: items may be taken partially."""
    _validate(data)
    started = perf_counter()
    remaining = float(data.capacity)
    total_value = 0.0
    fractions: List[Dict[str, Any]] = []
    steps: List[Step] = [Step(type=StepType.SORT, description="Sort items by value density; zero-weight positive-value items come first", data={})]
    ordered = sorted(
        data.items,
        key=lambda item: (float("inf") if item.weight == 0 and item.value > 0 else (item.value / item.weight if item.weight else float("-inf"))),
        reverse=True
    )
    steps.append(Step(type=StepType.SORT, description="Items sorted by descending value density", data={"sorted_order": [item.id for item in ordered]}))

    for item in ordered:
        if item.value <= 0:
            fraction = 0.0
        elif item.weight == 0:
            fraction = 1.0
        elif remaining <= 0:
            fraction = 0.0
        else:
            fraction = min(1.0, remaining / item.weight)

        if fraction > 0:
            taken_weight = item.weight * fraction
            taken_value = item.value * fraction
            remaining -= taken_weight
            total_value += taken_value
            fractions.append({"item_id": item.id, "fraction": fraction, "weight_taken": taken_weight, "value_taken": taken_value})
            steps.append(Step(type=StepType.PICK, description=f"Take {fraction:.1%} of item {item.id}", data={"item_id": item.id, "fraction": fraction, "weight": taken_weight, "value": taken_value, "current_weight": data.capacity - remaining, "total_value": total_value}))
        else:
            steps.append(Step(type=StepType.REJECT, description=f"Do not take item {item.id}", data={"item_id": item.id, "fraction": 0}))

    elapsed = perf_counter() - started
    return AlgorithmResult(
        steps=steps, result_value=total_value, selected_items=[entry["item_id"] for entry in fractions],
        result_data={"fractions": fractions, "total_weight": data.capacity - remaining, "remaining_capacity": remaining, "optimal": True, "method": "fractional_knapsack"},
        metrics=Metrics(time_taken=elapsed, time_complexity="O(n log n)", space_complexity="O(n)", step_count=len(steps), operation_count=len(ordered))
    )
