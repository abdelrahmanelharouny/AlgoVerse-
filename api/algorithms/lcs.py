from api.models import Step, StepType, AlgorithmResult, Metrics
from collections import deque
import time

class LCSInput(object): # Placeholder, will be defined in models.py
    pass

def solve_lcs_dp(data) -> AlgorithmResult:
    start_time = time.time()
    steps = []
    
    s1 = data.text1
    s2 = data.text2
    n = len(s1)
    m = len(s2)
    
    # DP table to store lengths of longest common subsequence.
    # Dimensions: (n+1) x (m+1) to accommodate empty strings at index 0.
    dp = [[0 for _ in range(m + 1)] for _ in range(n + 1)]
    
    steps.append(Step(
        type=StepType.INIT,
        description=f"Initialized DP table of size ({n+1} x {m+1})",
        data={
            "rows": n + 1,
            "cols": m + 1,
            "row_labels": [""] + list(s1),
            "col_labels": [""] + list(s2)
        }
    ))
    
    # Build DP Table
    for i in range(1, n + 1):
        for j in range(1, m + 1):
            
            # Highlight current comparison
            steps.append(Step(
                type=StepType.HIGHLIGHT,
                description=f"Comparing '{s1[i-1]}' vs '{s2[j-1]}'",
                data={"active_cell": {"r": i, "c": j}, "compare": [s1[i-1], s2[j-1]]}
            ))
            
            if s1[i - 1] == s2[j - 1]:
                val = dp[i - 1][j - 1] + 1
                dp[i][j] = val
                
                steps.append(Step(
                    type=StepType.UPDATE,
                    description=f"Characters match! 1 + dp[{i-1}][{j-1}] = {val}",
                    data={
                        "cell": {"r": i, "c": j}, 
                        "value": val,
                        "highlight_prev": {"r": i-1, "c": j-1}
                    }
                ))
            else:
                val1 = dp[i - 1][j]
                val2 = dp[i][j - 1]
                val = max(val1, val2)
                dp[i][j] = val
                
                steps.append(Step(
                    type=StepType.UPDATE,
                    description=f"No match. max(dp[{i-1}][{j}] ({val1}), dp[{i}][{j-1}] ({val2})) = {val}",
                    data={
                        "cell": {"r": i, "c": j}, 
                        "value": val,
                        "highlight_prev": [{"r": i-1, "c": j}, {"r": i, "c": j-1}]
                    }
                ))
    
    # Backtrack to find the LCS string
    lcs_algo = []
    i, j = n, m
    path = []
    
    while i > 0 and j > 0:
        path.append({"r": i, "c": j})
        if s1[i-1] == s2[j-1]:
            lcs_algo.append(s1[i-1])
            i -= 1
            j -= 1
        elif dp[i-1][j] > dp[i][j-1]:
            i -= 1
        else:
            j -= 1
    
    path.append({"r": 0, "c": 0}) # Optional: highlight start
    lcs_algo.reverse()
    result_str = "".join(lcs_algo)
    
    steps.append(Step(
        type=StepType.SOLUTION,
        description=f"LCS Found: {result_str}",
        data={"path": path, "lcs": result_str}
    ))

    end_time = time.time()
    
    return AlgorithmResult(
        steps=steps,
        result_value=dp[n][m],
        result_text=result_str,
        selected_items=[],
        metrics=Metrics(
            time_taken=end_time - start_time,
            space_complexity=f"O({m}*{n})",
            time_complexity=f"O({m}*{n})",
            step_count=len(steps)
        )
    )
