import time
from typing import List
from app.models import Step, StepType, AlgorithmResult, Metrics

def solve_rod_cutting_dp(data) -> AlgorithmResult:
    """
    Rod Cutting Problem - DP Solution
    Given a rod of length n and prices for each piece length, find max profit.
    """
    start_time = time.time()
    steps = []
    
    length = data.length
    prices = data.prices  # prices[i] = price for piece of length i+1
    
    # dp[i] = max revenue for rod of length i
    dp = [0] * (length + 1)
    cuts = [0] * (length + 1)  # To track where to cut
    
    steps.append(Step(
        type=StepType.INIT,
        description=f"Initialized DP array for rod of length {length}. prices = {prices}",
        data={
            "rows": 1,
            "cols": length + 1,
            "prices": prices
        }
    ))
    
    # Fill DP table
    for i in range(1, length + 1):
        best = -float('inf')
        for j in range(1, i + 1):
            if j <= len(prices):
                steps.append(Step(
                    type=StepType.HIGHLIGHT,
                    description=f"For rod length {i}: considering cut of {j} (price {prices[j-1]}) + remaining {i-j}",
                    data={"i": 0, "j": i, "cut_length": j}
                ))
                
                if prices[j-1] + dp[i-j] > best:
                    best = prices[j-1] + dp[i-j]
                    cuts[i] = j
                    
                    steps.append(Step(
                        type=StepType.UPDATE,
                        description=f"New best for length {i}: cut {j} (${prices[j-1]}) + dp[{i-j}] (${dp[i-j]}) = ${best}",
                        data={"i": 0, "j": i, "value": best, "cut": j}
                    ))
        
        dp[i] = best
    
    # Backtrack to find the cuts
    result_cuts = []
    remaining = length
    while remaining > 0:
        result_cuts.append(cuts[remaining])
        remaining -= cuts[remaining]
    
    steps.append(Step(
        type=StepType.SOLUTION,
        description=f"Maximum Revenue: ${dp[length]}. Cuts: {result_cuts}",
        data={"max_revenue": dp[length], "cuts": result_cuts, "dp": dp}
    ))
    
    end_time = time.time()
    
    return AlgorithmResult(
        steps=steps,
        result_value=dp[length],
        selected_items=result_cuts,
        metrics=Metrics(
            time_taken=end_time - start_time,
            space_complexity="O(n)",
            time_complexity="O(n²)",
            step_count=len(steps)
        )
    )
