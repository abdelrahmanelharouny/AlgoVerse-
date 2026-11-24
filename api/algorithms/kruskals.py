from time import perf_counter
from typing import Dict, List

from api.algorithms.graph_utils import undirected_edges
from api.models import AlgorithmResult, DijkstraInput, Metrics, Step, StepType


class UnionFind:
    def __init__(self, nodes):
        self.parent = {node: node for node in nodes}
        self.rank = {node: 0 for node in nodes}
        self.components = len(self.parent)

    def find(self, node):
        if node not in self.parent:
            raise ValueError(f"Unknown graph node: {node}")
        if self.parent[node] != node:
            self.parent[node] = self.find(self.parent[node])
        return self.parent[node]

    def union(self, left, right):
        root_left = self.find(left)
        root_right = self.find(right)
        if root_left == root_right:
            return False
        if self.rank[root_left] < self.rank[root_right]:
            root_left, root_right = root_right, root_left
        self.parent[root_right] = root_left
        if self.rank[root_left] == self.rank[root_right]:
            self.rank[root_left] += 1
        self.components -= 1
        return True


def solve_kruskals(data: DijkstraInput) -> AlgorithmResult:
    """Minimum spanning forest using Kruskal and path-compressed Union-Find."""
    nodes, edges = undirected_edges(data.graph)
    started = perf_counter()
    steps: List[Step] = [Step(type=StepType.SORT, description=f"Sort {len(edges)} unique undirected edges by increasing weight", data={"edges": [{"u": left, "v": right, "weight": weight} for weight, left, right in edges]})]
    union_find = UnionFind(nodes)
    mst_edges: List[Dict[str, object]] = []
    total_weight = 0.0
    operations = 0

    for weight, left, right in edges:
        operations += 1
        steps.append(Step(type=StepType.HIGHLIGHT, description=f"Evaluate edge {left} — {right} (weight {weight:g})", data={"u": left, "v": right, "weight": weight, "current_node": left, "checking_neighbor": right}))
        if union_find.union(left, right):
            edge = {"u": left, "v": right, "weight": weight}
            mst_edges.append(edge)
            total_weight += weight
            steps.append(Step(type=StepType.PICK, description=f"Accept {left} — {right}; it connects two different components", data={"u": left, "v": right, "weight": weight, "mst_edges": list(mst_edges), "total_weight": total_weight}))
        else:
            steps.append(Step(type=StepType.REJECT, description=f"Reject {left} — {right}; it would create a cycle", data={"u": left, "v": right, "weight": weight, "mst_edges": list(mst_edges)}))

    component_count = union_find.components
    is_spanning_tree = len(nodes) > 0 and component_count == 1
    steps.append(Step(type=StepType.SOLUTION, description=f"Minimum spanning forest complete: {len(mst_edges)} edges across {component_count} component(s)", data={"mst_edges": mst_edges, "total_weight": total_weight, "components_count": component_count, "is_spanning_tree": is_spanning_tree}))
    elapsed = perf_counter() - started
    return AlgorithmResult(
        steps=steps, result_value=total_weight, selected_items=[],
        result_data={"mst_edges": mst_edges, "total_weight": total_weight, "components_count": component_count, "is_spanning_tree": is_spanning_tree},
        metrics=Metrics(time_taken=elapsed, time_complexity="O(E log E)", space_complexity="O(V + E)", step_count=len(steps), operation_count=operations)
    )
