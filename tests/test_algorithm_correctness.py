from api.algorithms.coin_change import solve_coin_change_dp, solve_coin_change_greedy
from api.algorithms.dijkstra import solve_dijkstra
from api.algorithms.huffman import solve_huffman
from api.algorithms.interval_scheduling import solve_interval_scheduling_dp, solve_interval_scheduling_greedy
from api.algorithms.kruskals import solve_kruskals
from api.algorithms.knapsack import solve_fractional_knapsack, solve_knapsack_dp, solve_knapsack_greedy
from api.algorithms.lis import solve_lis_dp
from api.algorithms.matrix_chain import solve_matrix_chain_dp
from api.algorithms.prims import solve_prims
from api.algorithms.rod_cutting import solve_rod_cutting_dp
import pytest

from api.models import (
    CoinChangeInput, DijkstraInput, HuffmanInput, Interval, IntervalSchedulingInput,
    KnapsackInput, KnapsackItem, LISInput, MatrixChainInput, RodCuttingInput
)


def test_fractional_and_zero_one_knapsack_are_distinct():
    data = KnapsackInput(capacity=50, items=[
        KnapsackItem(id=1, weight=10, value=60),
        KnapsackItem(id=2, weight=20, value=100),
        KnapsackItem(id=3, weight=30, value=120),
    ])
    assert solve_fractional_knapsack(data).result_value == 240
    assert solve_knapsack_dp(data).result_value == 220


def test_coin_change_greedy_counterexample():
    data = CoinChangeInput(amount=6, coins=[1, 3, 4])
    assert solve_coin_change_dp(data).result_value == 2
    assert solve_coin_change_greedy(data).result_value == 3


def test_lis_indices_are_correct_with_duplicates():
    result = solve_lis_dp(LISInput(sequence=[2, 1, 2, 3]))
    assert result.result_value == 3
    assert result.result_data["indices"] == [1, 2, 3]
    assert [2, 1, 2, 3][result.result_data["indices"][0]] == 1


def test_interval_scheduling_accepts_negative_start_times():
    data = IntervalSchedulingInput(intervals=[
        Interval(id="a", start=-10, end=-5),
        Interval(id="b", start=-5, end=0),
        Interval(id="c", start=-8, end=-4),
    ])
    result = solve_interval_scheduling_greedy(data)
    assert result.result_value == 2
    assert result.selected_items == ["a", "b"]


def test_rod_cutting_has_finite_solution_and_reconstruction():
    result = solve_rod_cutting_dp(RodCuttingInput(length=8, prices=[1, 5, 8, 9, 10, 17, 17, 20]))
    assert result.result_value == 22
    assert sum(result.result_data["cuts"]) == 8


def test_huffman_single_character_uses_non_empty_code():
    result = solve_huffman(HuffmanInput(text="aaaaaa"))
    assert result.result_data["codes"]["a"] == "0"
    assert result.result_data["encoded_text"] == "000000"
    assert result.result_value == 6


def test_matrix_chain_returns_parenthesization():
    result = solve_matrix_chain_dp(MatrixChainInput(dimensions=[40, 20, 30, 10, 30]))
    assert result.result_value == 26000
    assert "A" in result.result_data["parenthesization"]


def test_dijkstra_returns_paths_and_rejects_negative_weights():
    data = DijkstraInput(graph={"A": {"B": 4, "C": 2}, "B": {"D": 1}, "C": {"B": 1, "D": 5}, "D": {}}, start_node="A")
    result = solve_dijkstra(data)
    assert result.result_data["distances"]["D"] == 4
    assert result.result_data["paths"]["D"] == ["A", "C", "B", "D"]
    edge_checks = [step for step in result.steps if step.type.value == "highlight" and "checking_neighbor" in step.data]
    assert edge_checks
    assert all("visited" in step.data for step in edge_checks)


def test_prim_and_kruskal_return_same_forest_weight_on_disconnected_graph():
    graph = {"A": {"B": 2}, "B": {"A": 2}, "C": {"D": 3}, "D": {"C": 3}}
    data = DijkstraInput(graph=graph, start_node="A")
    prim = solve_prims(data)
    kruskal = solve_kruskals(data)
    assert prim.result_value == kruskal.result_value == 5
    assert prim.result_data["components_count"] == kruskal.result_data["components_count"] == 2
    assert not prim.result_data["is_spanning_tree"]
    prim_edge_checks = [step for step in prim.steps if step.type.value == "highlight" and "checking_neighbor" in step.data]
    assert all("visited" in step.data for step in prim_edge_checks)



def test_dijkstra_rejects_negative_edges():
    data = DijkstraInput(graph={"A": {"B": -1}, "B": {}}, start_node="A")
    with pytest.raises(ValueError, match="negative edge"):
        solve_dijkstra(data)


def test_knapsack_greedy_handles_zero_weight_positive_value():
    data = KnapsackInput(capacity=5, items=[
        KnapsackItem(id="free", weight=0, value=10),
        KnapsackItem(id="paid", weight=5, value=12),
    ])
    result = solve_knapsack_greedy(data)
    assert result.result_value == 22
    assert set(result.selected_items) == {"free", "paid"}


def test_coin_change_rejects_zero_denomination():
    with pytest.raises(ValueError):
        CoinChangeInput(amount=5, coins=[1, 0, 2])


@pytest.mark.parametrize("solver", [solve_prims, solve_kruskals])
def test_mst_rejects_conflicting_undirected_edge_weights(solver):
    graph = {"A": {"B": 2}, "B": {"A": 3}}
    data = DijkstraInput(graph=graph, start_node="A")
    with pytest.raises(ValueError, match="Conflicting weights"):
        solver(data)



def test_interval_scheduling_dp_reconstructs_selected_intervals_with_linear_state():
    data = IntervalSchedulingInput(intervals=[
        Interval(id="a", start=-10, end=-5),
        Interval(id="b", start=-5, end=0),
        Interval(id="c", start=-8, end=-4),
        Interval(id="d", start=0, end=2),
    ])
    result = solve_interval_scheduling_dp(data)
    assert result.result_value == 3
    assert result.selected_items == ["a", "b", "d"]
    assert result.result_data["selected_intervals"] == ["a", "b", "d"]



def test_coin_change_zero_and_unreachable_amounts():
    zero = solve_coin_change_dp(CoinChangeInput(amount=0, coins=[1, 2]))
    unreachable = solve_coin_change_dp(CoinChangeInput(amount=3, coins=[2, 4]))
    assert zero.result_value == 0
    assert zero.selected_items == []
    assert unreachable.result_value == -1
    assert unreachable.selected_items == []


@pytest.mark.parametrize("weight", [float("nan"), float("inf"), float("-inf")])
def test_dijkstra_rejects_non_finite_edge_weights(weight):
    with pytest.raises(ValueError, match="finite"):
        DijkstraInput(graph={"A": {"B": weight}}, start_node="A")


def test_dijkstra_includes_neighbor_only_and_unreachable_nodes():
    data = DijkstraInput(
        start_node="A",
        graph={"A": {"B": 4, "C": 1}, "C": {"B": 2}, "Z": {}},
    )
    result = solve_dijkstra(data)
    assert result.result_data["distances"] == {"A": 0, "B": 3, "C": 1, "Z": None}
    assert result.result_data["paths"]["B"] == ["A", "C", "B"]
    assert result.result_data["paths"]["Z"] == []
    assert result.result_data["unreachable_nodes"] == ["Z"]


@pytest.mark.parametrize("solver", [solve_prims, solve_kruskals])
def test_mst_algorithms_include_neighbor_only_nodes(solver):
    data = DijkstraInput(
        start_node="A",
        graph={"A": {"B": 1}, "B": {"A": 1, "C": 2}, "D": {}},
    )
    result = solver(data)
    assert result.result_value == 3
    assert len(result.result_data["mst_edges"]) == 2
    assert result.result_data["components_count"] == 2
    assert result.result_data["is_spanning_tree"] is False


def test_rod_cutting_zero_length_and_missing_prices():
    zero = solve_rod_cutting_dp(RodCuttingInput(length=0, prices=[]))
    assert zero.result_value == 0
    assert zero.result_data["cuts"] == []
    with pytest.raises(ValueError, match="price"):
        RodCuttingInput(length=3, prices=[])


def test_lcs_result_contains_reconstructed_subsequence():
    from api.algorithms.lcs import solve_lcs_dp
    from api.models import LCSInput

    result = solve_lcs_dp(LCSInput(text1="AGGTAB", text2="GXTXAYB"))
    assert result.result_value == 4
    assert result.result_data["lcs"] == "GTAB"

@pytest.mark.parametrize("coins", [[1, 0, 2], [1, -2], []])
def test_coin_change_rejects_all_invalid_denomination_shapes(coins):
    with pytest.raises(ValueError):
        CoinChangeInput(amount=5, coins=coins)


def test_fractional_knapsack_reconstructs_partial_item_selection():
    data = KnapsackInput(capacity=50, items=[
        KnapsackItem(id=1, weight=10, value=60),
        KnapsackItem(id=2, weight=20, value=100),
        KnapsackItem(id=3, weight=30, value=120),
    ])
    result = solve_fractional_knapsack(data)
    fractions = result.result_data["fractions"]

    assert result.result_value == pytest.approx(240.0)
    assert fractions[-1]["item_id"] == 3
    assert fractions[-1]["fraction"] == pytest.approx(2 / 3)
    assert result.result_data["total_weight"] == pytest.approx(50.0)


def test_lis_reconstruction_preserves_original_indices_with_duplicate_values():
    original = [3, 4, 1, 2, 2, 5]
    result = solve_lis_dp(LISInput(sequence=original))
    indices = result.result_data["indices"]
    sequence = result.result_data["sequence"]

    assert result.result_value == 3
    assert len(indices) == len(sequence) == 3
    assert [original[index] for index in indices] == sequence
    assert all(indices[i] < indices[i + 1] for i in range(len(indices) - 1))
    assert all(sequence[i] < sequence[i + 1] for i in range(len(sequence) - 1))


def test_rod_cutting_reconstructs_an_optimal_exact_length_plan():
    result = solve_rod_cutting_dp(RodCuttingInput(length=4, prices=[1, 5, 8, 9]))

    assert result.result_value == 10
    assert result.result_data["cuts"] == [2, 2]
    assert sum(result.result_data["cuts"]) == 4
