from time import perf_counter
from typing import List

from from app.models import AlgorithmResult, LCSInput, Metrics, Step, StepType


def solve_lcs_dp(data: LCSInput) -> AlgorithmResult:
    """Longest common subsequence with a replayable DP trace and final subsequence."""
    started = perf_counter()
    left_text, right_text = data.text1, data.text2
    n, m = len(left_text), len(right_text)
    dp = [[0] * (m + 1) for _ in range(n + 1)]
    steps: List[Step] = [Step(type=StepType.INIT, description=f"Initialize an LCS table of size {n + 1} × {m + 1}", data={"rows": n + 1, "cols": m + 1, "row_labels": [""] + list(left_text), "col_labels": [""] + list(right_text)})]
    operations = 0

    for i in range(1, n + 1):
        for j in range(1, m + 1):
            operations += 1
            steps.append(Step(type=StepType.HIGHLIGHT, description=f"Compare '{left_text[i - 1]}' with '{right_text[j - 1]}'", data={"active_cell": {"r": i, "c": j}, "compare": [left_text[i - 1], right_text[j - 1]]}))
            if left_text[i - 1] == right_text[j - 1]:
                dp[i][j] = dp[i - 1][j - 1] + 1
                dependencies = {"r": i - 1, "c": j - 1}
                description = f"Characters match; take the diagonal value and add one → {dp[i][j]}"
            elif dp[i - 1][j] >= dp[i][j - 1]:
                dp[i][j] = dp[i - 1][j]
                dependencies = [{"r": i - 1, "c": j}, {"r": i, "c": j - 1}]
                description = f"No match; take the larger adjacent subsequence length → {dp[i][j]}"
            else:
                dp[i][j] = dp[i][j - 1]
                dependencies = [{"r": i - 1, "c": j}, {"r": i, "c": j - 1}]
                description = f"No match; take the larger adjacent subsequence length → {dp[i][j]}"
            steps.append(Step(type=StepType.UPDATE, description=description, data={"cell": {"r": i, "c": j}, "value": dp[i][j], "highlight_prev": dependencies}))

    indices_left: List[int] = []
    indices_right: List[int] = []
    i, j = n, m
    while i > 0 and j > 0:
        if left_text[i - 1] == right_text[j - 1]:
            indices_left.append(i - 1)
            indices_right.append(j - 1)
            i -= 1
            j -= 1
        elif dp[i - 1][j] >= dp[i][j - 1]:
            i -= 1
        else:
            j -= 1
    indices_left.reverse()
    indices_right.reverse()
    subsequence = "".join(left_text[index] for index in indices_left)
    steps.append(Step(type=StepType.SOLUTION, description=f"LCS length is {len(subsequence)}: {subsequence}", data={"lcs": subsequence, "length": len(subsequence), "indices_text1": indices_left, "indices_text2": indices_right}))
    elapsed = perf_counter() - started
    return AlgorithmResult(
        steps=steps, result_value=dp[n][m], selected_items=[],
        result_data={"lcs": subsequence, "length": dp[n][m], "indices_text1": indices_left, "indices_text2": indices_right},
        metrics=Metrics(time_taken=elapsed, time_complexity="O(mn)", space_complexity="O(mn)", step_count=len(steps), operation_count=operations)
    )
