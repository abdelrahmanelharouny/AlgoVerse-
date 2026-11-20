import time

from app.models import Step, StepType, AlgorithmResult, Metrics


def solve_lis_dp(data) -> AlgorithmResult:
    """Find a longest strictly increasing subsequence in O(n^2) time."""
    start_time = time.perf_counter()
    arr = data.sequence
    n = len(arr)

    if n == 0:
        steps = [Step(type=StepType.INFO, description="Empty sequence", data={})]
        return AlgorithmResult(
            steps=steps, result_value=0, selected_items=[],
            metrics=Metrics(time_taken=time.perf_counter() - start_time,
                            space_complexity="O(1)", time_complexity="O(1)",
                            step_count=len(steps)),
        )

    dp = [1] * n
    parent = [-1] * n
    steps = [Step(
        type=StepType.INIT,
        description=f"Initialized DP array of size {n}. dp[i] is the LIS length ending at i.",
        data={"array": arr, "dp": dp.copy(), "rows": 2, "cols": n},
    )]

    max_length = 1
    max_index = 0
    for i in range(n):
        for j in range(i):
            steps.append(Step(
                type=StepType.HIGHLIGHT,
                description=f"Comparing arr[{j}]={arr[j]} with arr[{i}]={arr[i]}",
                data={"i": 0, "j": i, "compare_j": j, "arr_i": arr[i], "arr_j": arr[j]},
            ))
            if arr[j] < arr[i] and dp[j] + 1 > dp[i]:
                dp[i] = dp[j] + 1
                parent[i] = j
                steps.append(Step(
                    type=StepType.UPDATE,
                    description=f"Updated dp[{i}] = dp[{j}] + 1 = {dp[i]}",
                    data={"i": 0, "j": i, "value": dp[i], "dp_array": dp.copy()},
                ))
        if dp[i] > max_length:
            max_length = dp[i]
            max_index = i

    indices = []
    index = max_index
    while index != -1:
        indices.append(index)
        index = parent[index]
    indices.reverse()
    lis = [arr[index] for index in indices]

    steps.append(Step(
        type=StepType.SOLUTION,
        description=f"LIS Length: {max_length}. Sequence: {lis}",
        data={"length": max_length, "sequence": lis, "indices": indices},
    ))

    elapsed = time.perf_counter() - start_time
    return AlgorithmResult(
        steps=steps, result_value=max_length, selected_items=lis,
        metrics=Metrics(time_taken=elapsed, space_complexity="O(n)",
                        time_complexity="O(n^2)", step_count=len(steps)),
    )
