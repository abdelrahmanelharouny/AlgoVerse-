import time

from api.models import Step, StepType, AlgorithmResult, Metrics, LCSInput


def solve_lcs_dp(data: LCSInput) -> AlgorithmResult:
    """Compute a longest common subsequence and return both its length and text."""
    start_time = time.perf_counter()
    s1 = data.text1
    s2 = data.text2
    n, m = len(s1), len(s2)
    dp = [[0 for _ in range(m + 1)] for _ in range(n + 1)]
    steps = [Step(
        type=StepType.INIT,
        description=f"Initialized LCS DP table of size ({n + 1} x {m + 1})",
        data={"rows": n + 1, "cols": m + 1,
              "row_labels": [""] + list(s1), "col_labels": [""] + list(s2)},
    )]

    for i in range(1, n + 1):
        for j in range(1, m + 1):
            steps.append(Step(
                type=StepType.HIGHLIGHT,
                description=f"Comparing {s1[i - 1]!r} with {s2[j - 1]!r}",
                data={"active_cell": {"r": i, "c": j},
                      "compare": [s1[i - 1], s2[j - 1]]},
            ))
            if s1[i - 1] == s2[j - 1]:
                dp[i][j] = dp[i - 1][j - 1] + 1
                previous = {"r": i - 1, "c": j - 1}
            else:
                dp[i][j] = max(dp[i - 1][j], dp[i][j - 1])
                previous = [{"r": i - 1, "c": j}, {"r": i, "c": j - 1}]
            steps.append(Step(
                type=StepType.UPDATE,
                description=f"Updated dp[{i}][{j}] = {dp[i][j]}",
                data={"cell": {"r": i, "c": j}, "value": dp[i][j],
                      "highlight_prev": previous},
            ))

    subsequence = []
    path = []
    i, j = n, m
    while i > 0 and j > 0:
        path.append({"r": i, "c": j})
        if s1[i - 1] == s2[j - 1]:
            subsequence.append(s1[i - 1])
            i -= 1
            j -= 1
        elif dp[i - 1][j] >= dp[i][j - 1]:
            i -= 1
        else:
            j -= 1
    path.append({"r": 0, "c": 0})
    subsequence.reverse()
    result_text = "".join(subsequence)

    steps.append(Step(
        type=StepType.SOLUTION,
        description=f"LCS found: {result_text}",
        data={"path": path, "lcs": result_text, "length": dp[n][m]},
    ))
    elapsed = time.perf_counter() - start_time
    return AlgorithmResult(
        steps=steps,
        result_value=dp[n][m],
        result_text=result_text,
        selected_items=[],
        metrics=Metrics(
            time_taken=elapsed,
            space_complexity=f"O({n} * {m})",
            time_complexity=f"O({n} * {m})",
            step_count=len(steps),
        ),
    )
