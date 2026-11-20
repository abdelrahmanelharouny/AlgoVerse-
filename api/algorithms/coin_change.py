import time
from typing import List

from api.models import AlgorithmResult, Step, StepType, Metrics, CoinChangeInput


def _validate_input(data: CoinChangeInput) -> tuple[int, List[int]]:
    amount = data.amount
    coins = data.coins
    if amount < 0:
        raise ValueError("Amount must be non-negative.")
    if not coins or any(not isinstance(c, int) or isinstance(c, bool) or c <= 0 for c in coins):
        raise ValueError("At least one positive integer coin denomination is required.")
    return amount, sorted(set(coins))


def solve_coin_change_dp(data: CoinChangeInput) -> AlgorithmResult:
    """Return the minimum number of coins using unbounded dynamic programming."""
    start_time = time.perf_counter()
    amount, coins = _validate_input(data)
    dp = [float("inf")] * (amount + 1)
    previous_coin = [0] * (amount + 1)
    dp[0] = 0
    steps = [Step(
        type=StepType.INIT,
        description=f"Initialized DP array of size {amount + 1}. dp[0] = 0, rest = ∞",
        data={"rows": 1, "cols": amount + 1},
    )]

    for value in range(1, amount + 1):
        steps.append(Step(
            type=StepType.HIGHLIGHT,
            description=f"Computing minimum coins for amount {value}",
            data={"i": 0, "j": value},
        ))
        for coin in coins:
            if coin > value:
                break
            if dp[value - coin] + 1 < dp[value]:
                dp[value] = dp[value - coin] + 1
                previous_coin[value] = coin
                steps.append(Step(
                    type=StepType.UPDATE,
                    description=f"Using coin {coin}: dp[{value}] = {int(dp[value])}",
                    data={"i": 0, "j": value, "value": int(dp[value]),
                          "coin_used": coin, "prev_j": value - coin},
                ))

    reachable = dp[amount] != float("inf")
    result_value = int(dp[amount]) if reachable else -1
    selected_coins: List[int] = []
    if reachable:
        current = amount
        while current > 0:
            coin = previous_coin[current]
            if coin <= 0:  # Defensive guard against a broken predecessor chain.
                raise RuntimeError("Coin-change reconstruction failed.")
            selected_coins.append(coin)
            current -= coin
            steps.append(Step(
                type=StepType.SOLUTION,
                description=f"Backtracking: Used coin {coin}",
                data={"coin": coin, "remaining": current},
            ))

    elapsed = time.perf_counter() - start_time
    return AlgorithmResult(
        steps=steps,
        result_value=result_value,
        selected_items=selected_coins,
        metrics=Metrics(
            time_taken=elapsed,
            space_complexity=f"O({amount})",
            time_complexity=f"O({amount} * {len(coins)})",
            step_count=len(steps),
        ),
    )


def solve_coin_change_greedy(data: CoinChangeInput) -> AlgorithmResult:
    """Largest-denomination-first heuristic; explicitly not guaranteed optimal."""
    start_time = time.perf_counter()
    amount, coins = _validate_input(data)
    coins = sorted(coins, reverse=True)
    steps = [Step(
        type=StepType.SORT,
        description=f"Sorted coins in descending order: {coins}",
        data={"sorted_coins": coins},
    )]
    remaining = amount
    selected_coins: List[int] = []
    total_coins = 0

    for coin in coins:
        count, remaining_after = divmod(remaining, coin)
        if count:
            remaining = remaining_after
            selected_coins.extend([coin] * count)
            total_coins += count
            steps.append(Step(
                type=StepType.PICK,
                description=f"Picked {count} coin(s) of value {coin}. Remaining: {remaining}",
                data={"item_id": coin, "weight": coin, "value": coin, "ratio": 1.0,
                      "count": count, "current_weight": amount - remaining,
                      "total_value": total_coins},
            ))
        else:
            steps.append(Step(
                type=StepType.REJECT,
                description=f"Coin {coin} is larger than remaining amount {remaining}",
                data={"item_id": coin, "weight": coin, "value": coin, "ratio": 1.0,
                      "current_weight": amount - remaining},
            ))

    success = remaining == 0
    if not success:
        steps.append(Step(
            type=StepType.SOLUTION,
            description=f"Greedy failed: cannot make exact amount (remaining: {remaining})",
            data={"success": False, "remaining": remaining},
        ))

    elapsed = time.perf_counter() - start_time
    return AlgorithmResult(
        steps=steps,
        result_value=total_coins if success else -1,
        selected_items=selected_coins if success else [],
        metrics=Metrics(
            time_taken=elapsed,
            space_complexity=f"O({total_coins})",
            time_complexity=f"O({len(coins)} log {len(coins)})",
            step_count=len(steps),
        ),
    )
