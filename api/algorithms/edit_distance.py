import time
from typing import List
from api.models import Step, StepType, AlgorithmResult, Metrics

class EditDistanceInput:
    text1: str
    text2: str

def solve_edit_distance_dp(data) -> AlgorithmResult:
    """
    Edit Distance (Levenshtein Distance) - DP Solution
    Finds minimum operations (insert, delete, replace) to convert text1 to text2.
    """
    start_time = time.time()
    steps = []
    
    s1 = data.text1
    s2 = data.text2
    n = len(s1)
    m = len(s2)
    
    # DP table: dp[i][j] = min operations to convert s1[0:i] to s2[0:j]
    dp = [[0 for _ in range(m + 1)] for _ in range(n + 1)]
    
    # Initialize: converting empty string to/from a string
    for i in range(n + 1):
        dp[i][0] = i
    for j in range(m + 1):
        dp[0][j] = j
    
    steps.append(Step(
        type=StepType.INIT,
        description=f"Initialized DP table of size ({n+1} x {m+1}). Base cases: dp[i][0]=i (delete all), dp[0][j]=j (insert all)",
        data={
            "rows": n + 1,
            "cols": m + 1,
            "row_labels": [""] + list(s1),
            "col_labels": [""] + list(s2)
        }
    ))
    
    # Fill DP Table
    for i in range(1, n + 1):
        for j in range(1, m + 1):
            
            # Highlight current comparison
            steps.append(Step(
                type=StepType.HIGHLIGHT,
                description=f"Comparing '{s1[i-1]}' vs '{s2[j-1]}'",
                data={"i": i, "j": j, "compare": [s1[i-1], s2[j-1]]}
            ))
            
            if s1[i-1] == s2[j-1]:
                # Characters match - no operation needed
                dp[i][j] = dp[i-1][j-1]
                steps.append(Step(
                    type=StepType.UPDATE,
                    description=f"Characters match! No operation needed. dp[{i}][{j}] = dp[{i-1}][{j-1}] = {dp[i][j]}",
                    data={
                        "i": i, "j": j, "value": dp[i][j],
                        "operation": "match"
                    }
                ))
            else:
                # Take minimum of three operations
                insert_cost = dp[i][j-1] + 1      # Insert character from s2
                delete_cost = dp[i-1][j] + 1      # Delete character from s1
                replace_cost = dp[i-1][j-1] + 1   # Replace character
                
                min_cost = min(insert_cost, delete_cost, replace_cost)
                dp[i][j] = min_cost
                
                if min_cost == replace_cost:
                    op = "replace"
                    desc = f"Replace '{s1[i-1]}' with '{s2[j-1]}'"
                elif min_cost == insert_cost:
                    op = "insert"
                    desc = f"Insert '{s2[j-1]}'"
                else:
                    op = "delete"
                    desc = f"Delete '{s1[i-1]}'"
                
                steps.append(Step(
                    type=StepType.UPDATE,
                    description=f"{desc}. min(insert:{insert_cost}, delete:{delete_cost}, replace:{replace_cost}) = {min_cost}",
                    data={
                        "i": i, "j": j, "value": min_cost,
                        "operation": op,
                        "choices": {"insert": insert_cost, "delete": delete_cost, "replace": replace_cost}
                    }
                ))
    
    # Backtrack to find the operations
    operations = []
    i, j = n, m
    while i > 0 or j > 0:
        if i > 0 and j > 0 and s1[i-1] == s2[j-1]:
            operations.append(("match", s1[i-1]))
            i -= 1
            j -= 1
        elif j > 0 and (i == 0 or dp[i][j] == dp[i][j-1] + 1):
            operations.append(("insert", s2[j-1]))
            j -= 1
        elif i > 0 and (j == 0 or dp[i][j] == dp[i-1][j] + 1):
            operations.append(("delete", s1[i-1]))
            i -= 1
        else:
            operations.append(("replace", f"{s1[i-1]}->{s2[j-1]}"))
            i -= 1
            j -= 1
    
    operations.reverse()
    
    steps.append(Step(
        type=StepType.SOLUTION,
        description=f"Edit Distance: {dp[n][m]} operations needed to convert '{s1}' to '{s2}'",
        data={"distance": dp[n][m], "operations": operations}
    ))
    
    end_time = time.time()
    
    return AlgorithmResult(
        steps=steps,
        result_value=dp[n][m],
        selected_items=[],
        metrics=Metrics(
            time_taken=end_time - start_time,
            space_complexity=f"O({n}*{m})",
            time_complexity=f"O({n}*{m})",
            step_count=len(steps)
        )
    )
