import pytest

from api.models import CoinChangeInput, DijkstraInput, LISInput
from api.algorithms.coin_change import solve_coin_change_dp, solve_coin_change_greedy
from api.algorithms.dijkstra import solve_dijkstra
from api.algorithms.lis import solve_lis_dp


def test_coin_change_dp_finds_optimum_when_greedy_does_not():
    data = CoinChangeInput(amount=6, coins=[1, 3, 4])
    result = solve_coin_change_dp(data)
    greedy = solve_coin_change_greedy(data)

    assert result.result_value == 2
    assert sorted(result.selected_items) == [3, 3]
    assert greedy.result_value == 3


def test_coin_change_handles_zero_amount_and_unreachable_amount():
    zero = solve_coin_change_dp(CoinChangeInput(amount=0, coins=[1, 2]))
    unreachable = solve_coin_change_dp(CoinChangeInput(amount=3, coins=[2, 4]))

    assert zero.result_value == 0
    assert zero.selected_items == []
    assert unreachable.result_value == -1
    assert unreachable.selected_items == []


@pytest.mark.parametrize("coins", [[], [0, 1], [-1, 2]])
def test_coin_change_rejects_invalid_denominations(coins):
    with pytest.raises(ValueError):
        solve_coin_change_dp(CoinChangeInput(amount=5, coins=coins))


def test_dijkstra_includes_neighbor_only_and_unreachable_nodes():
    data = DijkstraInput(
        start_node="A",
        graph={"A": {"B": 4, "C": 1}, "C": {"B": 2}, "Z": {}},
    )
    result = solve_dijkstra(data)
    solution = result.steps[-1].data

    assert solution["distances"] == {"A": 0, "B": 3, "C": 1, "Z": None}
    assert solution["paths"]["B"] == ["A", "C", "B"]
    assert solution["paths"]["Z"] is None


def test_dijkstra_rejects_negative_weights():
    data = DijkstraInput(start_node="A", graph={"A": {"B": -1}, "B": {}})
    with pytest.raises(ValueError, match="negative"):
        solve_dijkstra(data)


def test_lis_returns_correct_original_indices_with_duplicates():
    result = solve_lis_dp(LISInput(sequence=[3, 4, 1, 2, 2, 5]))
    solution = result.steps[-1].data
    indices = solution["indices"]
    sequence = solution["sequence"]

    assert result.result_value == 3
    assert len(indices) == len(sequence) == 3
    assert [3, 4, 1, 2, 2, 5][indices[0]:indices[-1] + 1]  # indices refer to original input
    assert all(indices[i] < indices[i + 1] for i in range(len(indices) - 1))
    assert all(sequence[i] < sequence[i + 1] for i in range(len(sequence) - 1))
