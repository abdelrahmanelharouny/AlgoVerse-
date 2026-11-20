import time

from app.models import Step, StepType, AlgorithmResult, Metrics, DijkstraInput
from app.algorithms.graph_utils import normalize_undirected_graph


class UnionFind:
    def __init__(self, nodes):
        self.parent = {node: node for node in nodes}
        self.rank = {node: 0 for node in nodes}

    def find(self, node):
        root = node
        while self.parent[root] != root:
            root = self.parent[root]
        while self.parent[node] != node:
            parent = self.parent[node]
            self.parent[node] = root
            node = parent
        return root

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
        return True


def solve_kruskals(data: DijkstraInput) -> AlgorithmResult:
    """Compute a minimum spanning forest using Kruskal's algorithm."""
    start_time = time.perf_counter()
    nodes, _, edges = normalize_undirected_graph(data.graph)
    steps = [Step(
        type=StepType.SORT,
        description=f"Sorted {len(edges)} unique undirected edges by weight",
        data={"edges": [{"u": u, "v": v, "weight": weight}
                        for weight, u, v in edges]},
    )]
    union_find = UnionFind(nodes)
    mst_edges = []
    total_weight = 0

    for weight, u, v in edges:
        steps.append(Step(
            type=StepType.HIGHLIGHT,
            description=f"Checking edge {u}-{v} (weight {weight})",
            data={"u": u, "v": v, "weight": weight,
                  "current_node": u, "checking_neighbor": v},
        ))
        if union_find.union(u, v):
            total_weight += weight
            mst_edges.append({"u": u, "v": v, "weight": weight})
            steps.append(Step(
                type=StepType.PICK,
                description=f"Added edge {u}-{v}; no cycle created",
                data={"u": u, "v": v, "weight": weight,
                      "mst_edges": list(mst_edges)},
            ))
        else:
            steps.append(Step(
                type=StepType.REJECT,
                description=f"Skipped edge {u}-{v}; it would create a cycle",
                data={"u": u, "v": v, "weight": weight,
                      "mst_edges": list(mst_edges)},
            ))

    components = len({union_find.find(node) for node in nodes})
    steps.append(Step(
        type=StepType.SOLUTION,
        description=("Minimum spanning tree found" if components == 1
                     else f"Minimum spanning forest found across {components} components"),
        data={"mst_edges": mst_edges, "total_weight": total_weight,
              "components": components, "is_spanning_tree": components == 1},
    ))
    elapsed = time.perf_counter() - start_time
    return AlgorithmResult(
        steps=steps, result_value=total_weight, selected_items=[],
        metrics=Metrics(time_taken=elapsed, space_complexity="O(V)",
                        time_complexity="O(E log E)", step_count=len(steps)),
    )
