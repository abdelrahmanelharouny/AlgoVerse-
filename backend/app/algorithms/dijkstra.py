import heapq
from time import perf_counter
from typing import Dict, List

from from app.models import AlgorithmResult, DijkstraInput, Metrics, Step, StepType


def solve_dijkstra(data: DijkstraInput) -> AlgorithmResult:
    """Single-source shortest paths for directed or undirected graphs with non-negative weights."""
    graph = data.graph
    start = data.start_node
    if start not in graph:
        raise ValueError(f"Start node '{start}' does not exist in the graph")
    for source, neighbors in graph.items():
        for target, weight in neighbors.items():
            if target not in graph:
                raise ValueError(f"Edge {source}->{target} references an unknown node")
            if weight < 0:
                raise ValueError("Dijkstra cannot process negative edge weights")

    started = perf_counter()
    distances: Dict[str, float] = {node: float("inf") for node in graph}
    predecessors: Dict[str, str | None] = {node: None for node in graph}
    distances[start] = 0
    queue = [(0.0, start)]
    visited = set()
    steps: List[Step] = [Step(
        type=StepType.INIT,
        description=f"Initialize Dijkstra from node {start}",
        data={"distances": {node: (0 if node == start else None) for node in graph}, "visited": [], "start_node": start, "graph": graph}
    )]
    operations = 0

    while queue:
        current_distance, node = heapq.heappop(queue)
        if node in visited or current_distance != distances[node]:
            continue
        visited.add(node)
        steps.append(Step(type=StepType.HIGHLIGHT, description=f"Visit {node} with its best known distance {current_distance:g}", data={"current_node": node, "current_dist": current_distance, "visited": sorted(visited)}))

        for neighbor, weight in graph[node].items():
            operations += 1
            if neighbor in visited:
                continue
            steps.append(Step(type=StepType.HIGHLIGHT, description=f"Check edge {node} → {neighbor} (weight {weight:g})", data={"current_node": node, "checking_neighbor": neighbor, "edge_weight": weight}))
            candidate = current_distance + weight
            if candidate < distances[neighbor]:
                previous = distances[neighbor]
                distances[neighbor] = candidate
                predecessors[neighbor] = node
                heapq.heappush(queue, (candidate, neighbor))
                snapshot = {key: (None if value == float("inf") else value) for key, value in distances.items()}
                steps.append(Step(type=StepType.UPDATE, description=f"Improve distance to {neighbor}: {candidate:g}", data={"node": neighbor, "new_dist": candidate, "old_dist": None if previous == float("inf") else previous, "distances": snapshot, "predecessors": dict(predecessors)}))

    def build_path(target: str) -> List[str]:
        if distances[target] == float("inf"):
            return []
        path: List[str] = []
        current: str | None = target
        while current is not None:
            path.append(current)
            current = predecessors[current]
        return list(reversed(path))

    final_distances = {node: (None if value == float("inf") else value) for node, value in distances.items()}
    paths = {node: build_path(node) for node in graph}
    reachable = [node for node, distance in final_distances.items() if distance is not None]
    steps.append(Step(type=StepType.SOLUTION, description="Shortest distances and paths are finalized", data={"distances": final_distances, "paths": paths, "predecessors": predecessors, "unreachable": [node for node in graph if node not in reachable]}))
    elapsed = perf_counter() - started
    return AlgorithmResult(
        steps=steps,
        result_value=max((distances[node] for node in reachable), default=0),
        selected_items=[],
        result_data={"start_node": start, "distances": final_distances, "paths": paths, "predecessors": predecessors, "reachable_nodes": reachable, "unreachable_nodes": [node for node in graph if node not in reachable]},
        metrics=Metrics(time_taken=elapsed, time_complexity="O((V + E) log V)", space_complexity="O(V + E)", step_count=len(steps), operation_count=operations)
    )
