import heapq
from time import perf_counter
from typing import Dict, List

from app.algorithms.graph_utils import as_undirected_adjacency, undirected_edges
from app.models import AlgorithmResult, DijkstraInput, Metrics, Step, StepType


def solve_prims(data: DijkstraInput) -> AlgorithmResult:
    """Minimum spanning forest using Prim; disconnected components are handled explicitly."""
    nodes, edges = undirected_edges(data.graph)
    if not nodes:
        return AlgorithmResult(steps=[Step(type=StepType.INFO, description="The graph is empty", data={})], result_value=0, selected_items=[], result_data={"mst_edges": [], "components_count": 0, "is_spanning_tree": False}, metrics=Metrics(time_taken=0, time_complexity="O(E log V)", space_complexity="O(V + E)", step_count=1, operation_count=0))
    start = data.start_node or nodes[0]
    if start not in nodes:
        raise ValueError(f"Start node '{start}' does not exist in the graph")
    adjacency = as_undirected_adjacency(nodes, edges)
    started = perf_counter()
    visited = set()
    mst_edges: List[Dict[str, object]] = []
    total_weight = 0.0
    components = [start] + [node for node in nodes if node != start]
    steps: List[Step] = [Step(type=StepType.INIT, description=f"Initialize Prim from node {start}; remaining components will be processed if needed", data={"visited": [], "mst_edges": [], "graph": adjacency, "start_node": start})]
    operations = 0

    for component_start in components:
        if component_start in visited:
            continue
        if visited:
            steps.append(Step(type=StepType.INFO, description=f"Graph is disconnected; start a new forest component at {component_start}", data={"component_start": component_start, "visited": sorted(visited)}))
        visited.add(component_start)
        queue = []
        for neighbor, weight in adjacency[component_start].items():
            heapq.heappush(queue, (weight, component_start, neighbor))
        while queue:
            weight, source, target = heapq.heappop(queue)
            operations += 1
            if target in visited:
                continue
            visited.add(target)
            edge = {"u": source, "v": target, "weight": weight}
            mst_edges.append(edge)
            total_weight += weight
            steps.append(Step(type=StepType.PICK, description=f"Accept edge {source} — {target} with weight {weight:g}", data={"u": source, "v": target, "weight": weight, "mst_edges": list(mst_edges)}))
            steps.append(Step(type=StepType.UPDATE, description=f"Add {target} to the spanning forest; total weight is {total_weight:g}", data={"node": target, "visited": sorted(visited), "mst_edges": list(mst_edges), "total_weight": total_weight}))
            for neighbor, next_weight in adjacency[target].items():
                if neighbor not in visited:
                    heapq.heappush(queue, (next_weight, target, neighbor))
                    steps.append(Step(type=StepType.HIGHLIGHT, description=f"Add candidate edge {target} — {neighbor} to the priority queue", data={"current_node": target, "checking_neighbor": neighbor, "edge_weight": next_weight, "visited": sorted(visited)}))

    component_count = len(nodes) - len(mst_edges)
    is_spanning_tree = component_count == 1
    steps.append(Step(type=StepType.SOLUTION, description=f"Minimum spanning forest complete: {len(mst_edges)} edges across {component_count} component(s)", data={"mst_edges": mst_edges, "total_weight": total_weight, "components_count": component_count, "is_spanning_tree": is_spanning_tree}))
    elapsed = perf_counter() - started
    return AlgorithmResult(
        steps=steps, result_value=total_weight, selected_items=[],
        result_data={"mst_edges": mst_edges, "total_weight": total_weight, "components_count": component_count, "is_spanning_tree": is_spanning_tree},
        metrics=Metrics(time_taken=elapsed, time_complexity="O(E log V)", space_complexity="O(V + E)", step_count=len(steps), operation_count=operations)
    )
