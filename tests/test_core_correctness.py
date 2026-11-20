import pytest

from api.models import CoinChangeInput, DijkstraInput, LISInput, KnapsackInput, KnapsackItem, LCSInput, RodCuttingInput
from api.algorithms.coin_change import solve_coin_change_dp, solve_coin_change_greedy
from api.algorithms.knapsack import solve_knapsack_dp, solve_knapsack_greedy
from api.algorithms.dijkstra import solve_dijkstra
from api.algorithms.lis import solve_lis_dp
from api.algorithms.lcs import solve_lcs_dp
from api.algorithms.rod_cutting import solve_rod_cutting_dp
from api.algorithms.prims import solve_prims
from api.algorithms.kruskals import solve_kruskals


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
    original = [3, 4, 1, 2, 2, 5]
    assert [original[index] for index in indices] == sequence
    assert all(indices[i] < indices[i + 1] for i in range(len(indices) - 1))
    assert all(sequence[i] < sequence[i + 1] for i in range(len(sequence) - 1))

@pytest.mark.parametrize("weight", [float("nan"), float("inf"), -1])
def test_dijkstra_rejects_non_finite_or_negative_weights(weight):
    data = DijkstraInput(start_node="A", graph={"A": {"B": weight}, "B": {}})
    with pytest.raises(ValueError):
        solve_dijkstra(data)

def test_fractional_knapsack_takes_partial_item_and_is_optimal():
    data = KnapsackInput(
        capacity=50,
        items=[
            KnapsackItem(id=1, weight=10, value=60),
            KnapsackItem(id=2, weight=20, value=100),
            KnapsackItem(id=3, weight=30, value=120),
        ],
    )
    result = solve_knapsack_greedy(data)
    solution = result.steps[-1].data

    assert result.result_value == pytest.approx(240.0)
    assert solution["selected_fractions"][-1]["fraction"] == pytest.approx(2 / 3)
    assert solution["total_weight"] == pytest.approx(50.0)


def test_zero_one_knapsack_does_not_take_fractional_items():
    data = KnapsackInput(
        capacity=50,
        items=[
            KnapsackItem(id=1, weight=10, value=60),
            KnapsackItem(id=2, weight=20, value=100),
            KnapsackItem(id=3, weight=30, value=120),
        ],
    )
    result = solve_knapsack_dp(data)

    assert result.result_value == 220
    assert set(result.selected_items) == {2, 3}


def test_knapsack_rejects_non_positive_weights():
    data = KnapsackInput(capacity=10, items=[KnapsackItem(id=1, weight=0, value=10)])
    with pytest.raises(ValueError, match="positive"):
        solve_knapsack_greedy(data)

def test_lcs_exposes_text_in_result_contract():
    result = solve_lcs_dp(LCSInput(text1="AGGTAB", text2="GXTXAYB"))

    assert result.result_value == 4
    assert result.result_text == "GTAB"
    assert result.steps[-1].data["lcs"] == result.result_text


def test_rod_cutting_finds_optimal_revenue_and_reconstructs_cuts():
    result = solve_rod_cutting_dp(
        RodCuttingInput(length=4, prices=[1, 5, 8, 9])
    )

    assert result.result_value == 10
    assert result.selected_items == [2, 2]
    assert sum(result.selected_items) == 4


def test_rod_cutting_handles_zero_length_and_rejects_missing_prices():
    zero = solve_rod_cutting_dp(RodCuttingInput(length=0, prices=[]))
    assert zero.result_value == 0
    assert zero.selected_items == []

    with pytest.raises(ValueError, match="cannot be formed"):
        solve_rod_cutting_dp(RodCuttingInput(length=3, prices=[]))

@pytest.mark.parametrize("solver", [solve_prims, solve_kruskals])
def test_mst_algorithms_include_neighbor_only_nodes_and_report_disconnected_forest(solver):
    data = DijkstraInput(
        start_node="A",
        graph={"A": {"B": 1}, "B": {"A": 1, "C": 2}, "D": {}},
    )
    result = solver(data)
    solution = result.steps[-1].data

    assert result.result_value == 3
    assert len(solution["mst_edges"]) == 2
    assert solution["components"] == 2
    assert solution["is_spanning_tree"] is False


@pytest.mark.parametrize("solver", [solve_prims, solve_kruskals])
def test_mst_algorithms_reject_conflicting_undirected_edge_weights(solver):
    data = DijkstraInput(
        start_node="A",
        graph={"A": {"B": 1}, "B": {"A": 2}},
    )
    with pytest.raises(ValueError, match="Conflicting weights"):
        solver(data)
