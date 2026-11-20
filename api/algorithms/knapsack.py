import time

from api.models import KnapsackInput, AlgorithmResult, Step, StepType, Metrics


def _validate_knapsack_input(data: KnapsackInput) -> None:
    if data.capacity < 0:
        raise ValueError("Knapsack capacity must be non-negative.")
    ids = [item.id for item in data.items]
    if len(ids) != len(set(ids)):
        raise ValueError("Knapsack item IDs must be unique.")
    if any(item.weight <= 0 for item in data.items):
        raise ValueError("Knapsack item weights must be positive.")
    if any(item.value < 0 for item in data.items):
        raise ValueError("Knapsack item values must be non-negative.")


def solve_knapsack_dp(data: KnapsackInput) -> AlgorithmResult:
    """Solve the 0/1 knapsack problem: each item is either selected or skipped."""
    start_time = time.perf_counter()
    _validate_knapsack_input(data)
    capacity = data.capacity
    items = data.items
    n = len(items)
    dp = [[0 for _ in range(capacity + 1)] for _ in range(n + 1)]
    steps = [Step(
        type=StepType.INIT,
        description=f"Initialized 0/1 DP table of size ({n + 1} x {capacity + 1})",
        data={"rows": n + 1, "cols": capacity + 1},
    )]

    for i, item in enumerate(items, start=1):
        for current_capacity in range(capacity + 1):
            steps.append(Step(
                type=StepType.HIGHLIGHT,
                description=f"Evaluating item {item.id} at capacity {current_capacity}",
                data={"i": i, "j": current_capacity},
            ))
            excluded = dp[i - 1][current_capacity]
            included = (item.value + dp[i - 1][current_capacity - item.weight]
                        if item.weight <= current_capacity else float("-inf"))
            dp[i][current_capacity] = max(excluded, included)
            steps.append(Step(
                type=StepType.UPDATE,
                description=(f"Include item {item.id}" if included > excluded
                             else f"Exclude item {item.id}"),
                data={"i": i, "j": current_capacity,
                      "value": dp[i][current_capacity],
                      "action": "include" if included > excluded else "exclude",
                      "prev_i": i - 1},
            ))

    selected_items = []
    current_capacity = capacity
    for i in range(n, 0, -1):
        if dp[i][current_capacity] != dp[i - 1][current_capacity]:
            item = items[i - 1]
            selected_items.append(item.id)
            current_capacity -= item.weight
            steps.append(Step(
                type=StepType.SOLUTION,
                description=f"Backtracking: selected item {item.id}",
                data={"item_id": item.id, "selected": True},
            ))
        else:
            steps.append(Step(
                type=StepType.SOLUTION,
                description=f"Backtracking: skipped item {items[i - 1].id}",
                data={"item_id": items[i - 1].id, "selected": False},
            ))

    selected_items.reverse()
    elapsed = time.perf_counter() - start_time
    return AlgorithmResult(
        steps=steps,
        result_value=dp[n][capacity],
        selected_items=selected_items,
        metrics=Metrics(
            time_taken=elapsed,
            space_complexity=f"O({n} * {capacity})",
            time_complexity=f"O({n} * {capacity})",
            step_count=len(steps),
        ),
    )


def solve_knapsack_greedy(data: KnapsackInput) -> AlgorithmResult:
    """Solve fractional knapsack optimally by descending value/weight ratio."""
    start_time = time.perf_counter()
    _validate_knapsack_input(data)
    items = sorted(data.items, key=lambda item: item.value / item.weight, reverse=True)
    capacity = data.capacity
    remaining = capacity
    total_value = 0.0
    selected_items = []
    selected_fractions = []
    steps = [Step(
        type=StepType.SORT,
        description="Sorted items by descending value-to-weight ratio",
        data={"sorted_order": [item.id for item in items],
              "ratios": {str(item.id): item.value / item.weight for item in items}},
    )]

    for item in items:
        ratio = item.value / item.weight
        steps.append(Step(
            type=StepType.HIGHLIGHT,
            description=f"Considering item {item.id} (weight {item.weight}, value {item.value}, ratio {ratio:.4f})",
            data={"item_id": item.id, "ratio": ratio},
        ))
        if remaining <= 0 or item.value == 0:
            steps.append(Step(
                type=StepType.REJECT,
                description=f"Skipped item {item.id}; no remaining capacity or no value",
                data={"item_id": item.id, "remaining_capacity": remaining},
            ))
            continue

        fraction = min(1.0, remaining / item.weight)
        taken_weight = item.weight * fraction
        added_value = item.value * fraction
        remaining -= taken_weight
        total_value += added_value
        selected_items.append(item.id)
        selected_fractions.append({"item_id": item.id, "fraction": fraction,
                                   "weight_taken": taken_weight, "value_added": added_value})
        steps.append(Step(
            type=StepType.PICK,
            description=f"Picked {fraction:.2%} of item {item.id}; added value {added_value:.4f}",
            data={"item_id": item.id, "fraction": fraction,
                  "weight_taken": taken_weight, "value_added": added_value,
                  "current_weight": capacity - remaining, "total_value": total_value},
        ))

    steps.append(Step(
        type=StepType.SOLUTION,
        description=f"Maximum fractional-knapsack value: {total_value:.4f}",
        data={"selected_fractions": selected_fractions,
              "total_weight": capacity - remaining, "total_value": total_value},
    ))
    elapsed = time.perf_counter() - start_time
    return AlgorithmResult(
        steps=steps,
        result_value=total_value,
        selected_items=selected_items,
        metrics=Metrics(
            time_taken=elapsed,
            space_complexity=f"O({len(items)})",
            time_complexity=f"O({len(items)} log {len(items)})",
            step_count=len(steps),
        ),
    )
