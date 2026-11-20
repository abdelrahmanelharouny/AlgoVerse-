from time import perf_counter
from typing import List

from from app.models import AlgorithmResult, MatrixChainInput, Metrics, Step, StepType


def solve_matrix_chain_dp(data: MatrixChainInput) -> AlgorithmResult:
    """Minimum scalar multiplications and optimal parenthesization."""
    dimensions = data.dimensions
    if len(dimensions) < 2 or any(value <= 0 for value in dimensions):
        raise ValueError("Provide at least two positive matrix dimensions")
    started = perf_counter()
    n = len(dimensions) - 1
    cost = [[0] * (n + 1) for _ in range(n + 1)]
    split = [[0] * (n + 1) for _ in range(n + 1)]
    steps: List[Step] = [Step(type=StepType.INIT, description=f"Initialize matrix-chain DP for {n} matrices", data={"rows": n + 1, "cols": n + 1, "dimensions": dimensions})]
    operations = 0

    for chain_length in range(2, n + 1):
        for left in range(1, n - chain_length + 2):
            right = left + chain_length - 1
            cost[left][right] = float("inf")
            steps.append(Step(type=StepType.HIGHLIGHT, description=f"Optimize matrix chain A{left}…A{right}", data={"i": left, "j": right}))
            for middle in range(left, right):
                operations += 1
                candidate = cost[left][middle] + cost[middle + 1][right] + dimensions[left - 1] * dimensions[middle] * dimensions[right]
                steps.append(Step(type=StepType.INFO, description=f"Try split after A{middle}: {candidate} scalar multiplications", data={"i": left, "j": right, "k": middle, "cost": candidate}))
                if candidate < cost[left][right]:
                    cost[left][right] = candidate
                    split[left][right] = middle
                    steps.append(Step(type=StepType.UPDATE, description=f"New minimum cost for A{left}…A{right}: {candidate}", data={"i": left, "j": right, "value": candidate, "split": middle}))

    def parenthesize(left: int, right: int) -> str:
        if left == right:
            return f"A{left}"
        middle = split[left][right]
        return f"({parenthesize(left, middle)} × {parenthesize(middle + 1, right)})"

    optimal_order = parenthesize(1, n)
    minimum_cost = cost[1][n]
    steps.append(Step(type=StepType.SOLUTION, description=f"Minimum cost is {minimum_cost}; optimal order is {optimal_order}", data={"minimum_cost": minimum_cost, "parenthesization": optimal_order, "split_table": split}))
    elapsed = perf_counter() - started
    return AlgorithmResult(
        steps=steps, result_value=minimum_cost, selected_items=[],
        result_data={"minimum_cost": minimum_cost, "parenthesization": optimal_order, "split_table": split, "matrix_count": n},
        metrics=Metrics(time_taken=elapsed, time_complexity="O(n³)", space_complexity="O(n²)", step_count=len(steps), operation_count=operations)
    )
