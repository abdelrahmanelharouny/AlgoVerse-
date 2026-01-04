import time
from typing import List
from api.models import AlgorithmResult, Step, StepType, Metrics
from pydantic import BaseModel


class CoinChangeInput(BaseModel):
    amount: int
    coins: List[int]


def solve_coin_change_dp(data: CoinChangeInput) -> AlgorithmResult:
    """
    DP Solution: Minimum number of coins to make amount
    dp[i] = minimum coins needed to make amount i
    """
    start_time = time.time()
    steps = []
    amount = data.amount
    coins = data.coins
    
    # Initialize DP array
    dp = [float('inf')] * (amount + 1)
    dp[0] = 0
    
    steps.append(Step(
        type=StepType.INIT,
        description=f"Initialized DP array of size {amount + 1}. dp[0] = 0, rest = ∞",
        data={"rows": 1, "cols": amount + 1}
    ))
    
    # Fill DP table
    for i in range(1, amount + 1):
        steps.append(Step(
            type=StepType.HIGHLIGHT,
            description=f"Computing minimum coins for amount {i}",
            data={"i": 0, "j": i}
        ))
        
        for coin in coins:
            if coin <= i and dp[i - coin] != float('inf'):
                new_val = dp[i - coin] + 1
                if new_val < dp[i]:
                    dp[i] = new_val
                    steps.append(Step(
                        type=StepType.UPDATE,
                        description=f"Using coin {coin}: dp[{i}] = dp[{i - coin}] + 1 = {new_val}",
                        data={
                            "i": 0,
                            "j": i,
                            "value": new_val,
                            "coin_used": coin,
                            "prev_j": i - coin
                        }
                    ))
    
    result_value = dp[amount] if dp[amount] != float('inf') else -1
    
    # Backtrack to find coins used
    selected_coins = []
    if result_value != -1:
        current = amount
        while current > 0:
            for coin in coins:
                if current >= coin and dp[current - coin] == dp[current] - 1:
                    selected_coins.append(coin)
                    current -= coin
                    steps.append(Step(
                        type=StepType.SOLUTION,
                        description=f"Backtracking: Used coin {coin}",
                        data={"coin": coin, "remaining": current}
                    ))
                    break
    
    end_time = time.time()
    
    return AlgorithmResult(
        steps=steps,
        result_value=result_value,
        selected_items=selected_coins,
        metrics=Metrics(
            time_taken=end_time - start_time,
            space_complexity=f"O({amount})",
            time_complexity=f"O({amount} * {len(coins)})",
            step_count=len(steps)
        )
    )


def solve_coin_change_greedy(data: CoinChangeInput) -> AlgorithmResult:
    """
    Greedy Solution: Largest coin first (may not give optimal solution)
    """
    start_time = time.time()
    steps = []
    amount = data.amount
    coins = sorted(data.coins, reverse=True)
    
    steps.append(Step(
        type=StepType.SORT,
        description=f"Sorted coins in descending order: {coins}",
        data={"sorted_coins": coins}
    ))
    
    remaining = amount
    selected_coins = []
    total_coins = 0
    
    for coin in coins:
        count = remaining // coin
        if count > 0:
            remaining -= coin * count
            selected_coins.extend([coin] * count)
            total_coins += count
            
            steps.append(Step(
                type=StepType.PICK,
                description=f"Picked {count} coin(s) of value {coin}. Remaining: {remaining}",
                data={
                    "item_id": coin,
                    "weight": coin,
                    "value": coin,
                    "ratio": 1.0,
                    "count": count,
                    "current_weight": amount - remaining,
                    "total_value": total_coins
                }
            ))
        else:
            steps.append(Step(
                type=StepType.REJECT,
                description=f"Coin {coin} too large for remaining amount {remaining}",
                data={
                    "item_id": coin,
                    "weight": coin,
                    "value": coin,
                    "ratio": 1.0,
                    "current_weight": amount - remaining
                }
            ))
    
    result_value = total_coins if remaining == 0 else -1
    
    if remaining > 0:
        steps.append(Step(
            type=StepType.SOLUTION,
            description=f"Greedy failed: Cannot make exact amount (remaining: {remaining})",
            data={"success": False, "remaining": remaining}
        ))
    
    end_time = time.time()
    
    return AlgorithmResult(
        steps=steps,
        result_value=result_value,
        selected_items=selected_coins if remaining == 0 else [],
        metrics=Metrics(
            time_taken=end_time - start_time,
            space_complexity="O(1)",
            time_complexity=f"O({len(coins)} log {len(coins)})",
            step_count=len(steps)
        )
    )
