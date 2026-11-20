from time import perf_counter
from typing import List

from from app.models import AlgorithmResult, LISInput, Metrics, Step, StepType


def solve_lis_dp(data: LISInput) -> AlgorithmResult:
    """Longest strictly increasing subsequence with O(n²) educational DP trace."""
    started = perf_counter()
    values = data.sequence
    n = len(values)
    if n == 0:
        step = Step(type=StepType.INFO, description="The input sequence is empty; LIS length is zero", data={"length": 0, "sequence": [], "indices": []})
        return AlgorithmResult(steps=[step], result_value=0, selected_items=[], result_data={"sequence": [], "indices": []}, metrics=Metrics(time_taken=0, time_complexity="O(1)", space_complexity="O(1)", step_count=1, operation_count=0))

    lengths = [1] * n
    parent = [-1] * n
    steps: List[Step] = [Step(type=StepType.INIT, description=f"Initialize an LIS length of 1 for each of {n} elements", data={"array": values, "dp": lengths.copy(), "rows": 2, "cols": n})]
    operations = 0
    best_end = 0

    for right in range(n):
        for left in range(right):
            operations += 1
            steps.append(Step(type=StepType.HIGHLIGHT, description=f"Compare values[{left}]={values[left]} with values[{right}]={values[right]}", data={"i": 0, "j": right, "compare_j": left, "arr_i": values[right], "arr_j": values[left]}))
            if values[left] < values[right] and lengths[left] + 1 > lengths[right]:
                lengths[right] = lengths[left] + 1
                parent[right] = left
                steps.append(Step(type=StepType.UPDATE, description=f"Extend the subsequence ending at index {left} to index {right}; length becomes {lengths[right]}", data={"i": 0, "j": right, "value": lengths[right], "dp_array": lengths.copy(), "parent": parent.copy()}))
        if lengths[right] > lengths[best_end]:
            best_end = right

    indices: List[int] = []
    cursor = best_end
    while cursor >= 0:
        indices.append(cursor)
        cursor = parent[cursor]
    indices.reverse()
    sequence = [values[index] for index in indices]
    steps.append(Step(type=StepType.SOLUTION, description=f"LIS length is {len(sequence)}: {sequence}", data={"length": len(sequence), "sequence": sequence, "indices": indices}))
    elapsed = perf_counter() - started

    return AlgorithmResult(
        steps=steps, result_value=len(sequence), selected_items=[],
        result_data={"length": len(sequence), "sequence": sequence, "indices": indices},
        metrics=Metrics(time_taken=elapsed, time_complexity="O(n²)", space_complexity="O(n)", step_count=len(steps), operation_count=operations)
    )
