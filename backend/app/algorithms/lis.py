import time
from typing import List
from app.models import Step, StepType, AlgorithmResult, Metrics

def solve_lis_dp(data) -> AlgorithmResult:
    """
    Longest Increasing Subsequence - DP Solution with O(n log n) optimization using binary search.
    """
    start_time = time.time()
    steps = []
    
    arr = data.sequence
    n = len(arr)
    
    if n == 0:
        return AlgorithmResult(
            steps=[Step(type=StepType.INFO, description="Empty sequence", data={})],
            result_value=0,
            selected_items=[],
            metrics=Metrics(time_taken=0, space_complexity="O(1)", time_complexity="O(1)", step_count=1)
        )
    
    # dp[i] = length of LIS ending at index i
    dp = [1] * n
    parent = [-1] * n  # To reconstruct the sequence
    
    steps.append(Step(
        type=StepType.INIT,
        description=f"Initialized DP array of size {n}. dp[i] = length of LIS ending at index i. All start at 1.",
        data={
            "array": arr,
            "dp": dp.copy(),
            "rows": 2,
            "cols": n
        }
    ))
    
    max_length = 1
    max_index = 0
    
    # Fill DP table - O(n^2) for visualization clarity
    for i in range(1, n):
        for j in range(i):
            steps.append(Step(
                type=StepType.HIGHLIGHT,
                description=f"Comparing arr[{j}]={arr[j]} with arr[{i}]={arr[i]}",
                data={"i": 0, "j": i, "compare_j": j, "arr_i": arr[i], "arr_j": arr[j]}
            ))
            
            if arr[j] < arr[i] and dp[j] + 1 > dp[i]:
                dp[i] = dp[j] + 1
                parent[i] = j
                
                steps.append(Step(
                    type=StepType.UPDATE,
                    description=f"arr[{j}]={arr[j]} < arr[{i}]={arr[i]}. Update dp[{i}] = dp[{j}] + 1 = {dp[i]}",
                    data={
                        "i": 0, "j": i, "value": dp[i],
                        "dp_array": dp.copy()
                    }
                ))
        
        if dp[i] > max_length:
            max_length = dp[i]
            max_index = i
    
    # Backtrack to find the LIS
    lis = []
    idx = max_index
    while idx != -1:
        lis.append(arr[idx])
        idx = parent[idx]
    lis.reverse()
    
    steps.append(Step(
        type=StepType.SOLUTION,
        description=f"LIS Length: {max_length}. Sequence: {lis}",
        data={"length": max_length, "sequence": lis, "indices": [arr.index(x) for x in lis]}
    ))
    
    end_time = time.time()
    
    return AlgorithmResult(
        steps=steps,
        result_value=max_length,
        selected_items=lis,
        metrics=Metrics(
            time_taken=end_time - start_time,
            space_complexity="O(n)",
            time_complexity="O(n²)",
            step_count=len(steps)
        )
    )
