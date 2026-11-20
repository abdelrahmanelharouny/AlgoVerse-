import heapq
import time

from api.models import Step, StepType, AlgorithmResult, Metrics, DijkstraInput
from api.algorithms.graph_utils import normalize_undirected_graph


def solve_prims(data: DijkstraInput) -> AlgorithmResult:
    """Compute a minimum spanning forest using Prim's algorithm."""
    start_time = time.perf_counter()
    nodes, adjacency, _ = normalize_undirected_graph(data.graph)
    start_node = data.start_node
    if start_node not in adjacency:
        raise ValueError(f"Start node {start_node!r} is not present in the graph.")

    visited = set()
    mst_edges = []
    total_weight = 0
    components = 0
    steps = [Step(
        type=StepType.INIT,
        description=f"Initialized Prim's algorithm from {start_node}",
        data={"graph": data.graph, "start_node": start_node, "visited": [], "mst_edges": []},
    )]

    roots = [start_node] + [node for node in nodes if node != start_node]
    for root in roots:
        if root in visited:
            continue
        components += 1
        visited.add(root)
        queue = []
        for neighbor, weight in adjacency[root].items():
            heapq.heappush(queue, (weight, root, neighbor))
            steps.append(Step(
                type=StepType.HIGHLIGHT,
                description=f"Added edge {root}-{neighbor} (weight {weight}) to priority queue",
                data={"current_node": root, "checking_neighbor": neighbor, "edge_weight": weight},
            ))

        while queue:
            weight, source, target = heapq.heappop(queue)
            if target in visited:
                continue
            visited.add(target)
            total_weight += weight
            edge = {"u": source, "v": target, "weight": weight}
            mst_edges.append(edge)
            steps.append(Step(
                type=StepType.PICK,
                description=f"Selected edge {source}-{target} (weight {weight})",
                data={"u": source, "v": target, "weight": weight},
            ))
            steps.append(Step(
                type=StepType.UPDATE,
                description=f"Added {target} to the spanning forest; total weight: {total_weight}",
                data={"visited": sorted(visited), "mst_edges": list(mst_edges),
                      "node": target, "total_weight": total_weight},
            ))
            for neighbor, next_weight in adjacency[target].items():
                if neighbor not in visited:
                    heapq.heappush(queue, (next_weight, target, neighbor))

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
        metrics=Metrics(time_taken=elapsed, space_complexity="O(V + E)",
                        time_complexity="O(E log V)", step_count=len(steps)),
    )
