import time
from typing import List
from api.models import KnapsackInput, AlgorithmResult, Step, StepType, Metrics

def solve_knapsack_dp(data: KnapsackInput) -> AlgorithmResult:
    start_time = time.time()
    steps = []
    capacity = data.capacity
    items = data.items
    n = len(items)

    # Initialize DP table
    # dp[i][w] = max value using first i items with capacity w
    dp = [[0 for _ in range(capacity + 1)] for _ in range(n + 1)]
    
    steps.append(Step(
        type=StepType.INIT,
        description=f"Initialized DP table of size ({n+1} x {capacity+1})",
        data={"rows": n + 1, "cols": capacity + 1}
    ))

    # Fill DP table
    for i in range(1, n + 1):
        item = items[i-1]
        for w in range(capacity + 1):
            
            # Highlight current cell calculation
            steps.append(Step(
                type=StepType.HIGHLIGHT,
                description=f"Calculating for Item {item.id} (wt:{item.weight}, val:{item.value}) at capacity {w}",
                data={"i": i, "j": w}
            ))

            if item.weight <= w:
                val_exclude = dp[i-1][w]
                val_include = item.value + dp[i-1][w - item.weight]
                
                if val_include > val_exclude:
                    dp[i][w] = val_include
                    steps.append(Step(
                        type=StepType.UPDATE,
                        description=f"Include Item {item.id}: {item.value} + {dp[i-1][w-item.weight]} > {val_exclude}",
                        data={
                            "i": i, "j": w, "value": val_include,
                            "action": "include",
                            "prev_i": i-1, "prev_j_include": w-item.weight, "prev_j_exclude": w
                        }
                    ))
                else:
                    dp[i][w] = val_exclude
                    steps.append(Step(
                        type=StepType.UPDATE,
                        description=f"Exclude Item {item.id}: {val_exclude} >= {val_include}",
                        data={
                            "i": i, "j": w, "value": val_exclude,
                            "action": "exclude",
                            "prev_i": i-1, "prev_j_exclude": w
                        }
                    ))
            else:
                dp[i][w] = dp[i-1][w]
                steps.append(Step(
                    type=StepType.UPDATE,
                    description=f"Item {item.id} too heavy ({item.weight} > {w}). Copy from above.",
                    data={
                        "i": i, "j": w, "value": dp[i][w],
                        "action": "skip",
                        "prev_i": i-1, "prev_j_exclude": w
                    }
                ))

    # Backtrack to find selected items
    selected_items = []
    w = capacity
    for i in range(n, 0, -1):
        if dp[i][w] != dp[i-1][w]:
            item = items[i-1]
            selected_items.append(item.id)
            w -= item.weight
            steps.append(Step(
                type=StepType.SOLUTION,
                description=f"Backtracking: Item {item.id} was selected",
                data={"item_id": item.id, "selected": True}
            ))
        else:
             steps.append(Step(
                type=StepType.SOLUTION,
                description=f"Backtracking: Item {items[i-1].id} was NOT selected",
                data={"item_id": items[i-1].id, "selected": False}
            ))

    end_time = time.time()
    
    return AlgorithmResult(
        steps=steps,
        result_value=dp[n][capacity],
        selected_items=selected_items,
        metrics=Metrics(
            time_taken=end_time - start_time,
            space_complexity=f"O({n} * {capacity})",
            time_complexity=f"O({n} * {capacity})",
            step_count=len(steps)
        )
    )

def solve_knapsack_greedy(data: KnapsackInput) -> AlgorithmResult:
    start_time = time.time()
    steps = []
    capacity = data.capacity
    items = data.items
    
    # Calculate ratios
    # We need to preserve original indices/objects, so we'll work with tuples or the objects themselves
    # Let's assume we sort by value/weight ratio descending
    
    steps.append(Step(
        type=StepType.SORT,
        description="Calculating value/weight ratios for all items",
        data={}
    ))
    
    # Sort items by ratio
    sorted_items = sorted(items, key=lambda x: x.value / x.weight, reverse=True)
    
    steps.append(Step(
        type=StepType.SORT,
        description="Sorted items by Ratio (Value/Weight) in descending order",
        data={"sorted_order": [item.id for item in sorted_items]}
    ))

    current_weight = 0
    total_value = 0
    selected_items = []

    for item in sorted_items:
        steps.append(Step(
            type=StepType.HIGHLIGHT,
            description=f"Considering Item {item.id} (Wt: {item.weight}, Val: {item.value}, Ratio: {item.value/item.weight:.2f})",
            data={"item_id": item.id}
        ))

        if current_weight + item.weight <= capacity:
            current_weight += item.weight
            total_value += item.value
            selected_items.append(item.id)
            steps.append(Step(
                type=StepType.PICK,
                description=f"Picked Item {item.id}. Current Weight: {current_weight}/{capacity}",
                data={"item_id": item.id, "current_weight": current_weight, "total_value": total_value}
            ))
        else:
            steps.append(Step(
                type=StepType.REJECT,
                description=f"Rejected Item {item.id}. Adding it would exceed capacity ({current_weight} + {item.weight} > {capacity})",
                data={"item_id": item.id, "current_weight": current_weight}
            ))

    end_time = time.time()

    return AlgorithmResult(
        steps=steps,
        result_value=total_value,
        selected_items=selected_items,
        metrics=Metrics(
            time_taken=end_time - start_time,
            space_complexity="O(1) (auxiliary)", # Sorting takes O(N) or O(log N) stack space usually
            time_complexity="O(N log N)",
            step_count=len(steps)
        )
    )
