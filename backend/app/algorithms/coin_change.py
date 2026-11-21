from time import perf_counter
from typing import List

from app.models import AlgorithmResult, CoinChangeInput, Metrics, Step, StepType


def _validate(data: CoinChangeInput) -> None:
    if data.amount < 0:
        raise ValueError("Amount cannot be negative")
    if not data.coins or any(coin <= 0 for coin in data.coins):
        raise ValueError("Coin denominations must be positive integers")


def solve_coin_change_dp(data: CoinChangeInput) -> AlgorithmResult:
    """Minimum-coin change using unbounded dynamic programming."""
    _validate(data)
    started = perf_counter()
    amount = data.amount
    coins = sorted(set(data.coins))
    unreachable = amount + 1
    dp = [unreachable] * (amount + 1)
    previous_coin = [0] * (amount + 1)
    dp[0] = 0
    steps: List[Step] = [Step(type=StepType.INIT, description=f"Initialized minimum-coin DP for amounts 0..{amount}", data={"rows": 1, "cols": amount + 1})]
    operations = 0

    for current in range(1, amount + 1):
        steps.append(Step(type=StepType.HIGHLIGHT, description=f"Compute the minimum coins for amount {current}", data={"i": 0, "j": current}))
        for coin in coins:
            if coin > current:
                break
            operations += 1
            candidate = dp[current - coin] + 1
            if candidate < dp[current]:
                dp[current] = candidate
                previous_coin[current] = coin
                steps.append(Step(type=StepType.UPDATE, description=f"Use coin {coin}: dp[{current}] becomes {candidate}", data={"i": 0, "j": current, "value": candidate, "coin_used": coin, "prev_j": current - coin}))

    possible = dp[amount] != unreachable
    selected: List[int] = []
    current = amount
    if possible:
        while current > 0:
            coin = previous_coin[current]
            if coin <= 0:
                raise RuntimeError("Could not reconstruct a valid minimum-coin solution")
            selected.append(coin)
            current -= coin
            steps.append(Step(type=StepType.SOLUTION, description=f"Take coin {coin}; {current} remains", data={"coin": coin, "remaining": current}))
    selected.reverse()

    result_value = dp[amount] if possible else -1
    elapsed = perf_counter() - started
    return AlgorithmResult(
        steps=steps, result_value=result_value, selected_items=selected,
        result_data={"possible": possible, "coins": selected, "amount": amount, "coin_count": result_value},
        metrics=Metrics(time_taken=elapsed, time_complexity=f"O(amount × {len(coins)})", space_complexity=f"O(amount)", step_count=len(steps), operation_count=operations)
    )


def solve_coin_change_greedy(data: CoinChangeInput) -> AlgorithmResult:
    """Largest-denomination-first heuristic; may fail or be non-optimal."""
    _validate(data)
    started = perf_counter()
    remaining = data.amount
    selected: List[int] = []
    steps: List[Step] = [Step(type=StepType.SORT, description="Sort coin denominations from largest to smallest", data={"sorted_coins": sorted(data.coins, reverse=True)})]
    operations = 0

    for coin in sorted(set(data.coins), reverse=True):
        operations += 1
        count, remainder = divmod(remaining, coin)
        if count:
            selected.extend([coin] * count)
            remaining = remainder
            steps.append(Step(type=StepType.PICK, description=f"Take {count} coin(s) of value {coin}; {remaining} remains", data={"item_id": coin, "coin": coin, "count": count, "current_weight": data.amount - remaining, "total_value": len(selected)}))
        else:
            steps.append(Step(type=StepType.REJECT, description=f"Coin {coin} is larger than the remaining amount", data={"item_id": coin, "coin": coin, "current_weight": data.amount - remaining}))

    possible = remaining == 0
    if not possible:
        steps.append(Step(type=StepType.SOLUTION, description=f"Greedy could not make the exact amount; {remaining} remains", data={"success": False, "remaining": remaining}))
    elapsed = perf_counter() - started
    return AlgorithmResult(
        steps=steps, result_value=len(selected) if possible else -1, selected_items=selected if possible else [],
        result_data={"possible": possible, "coins": selected if possible else [], "remaining": remaining, "amount": data.amount, "optimal": False},
        metrics=Metrics(time_taken=elapsed, time_complexity=f"O(k log k)", space_complexity="O(amount)", step_count=len(steps), operation_count=operations)
    )
