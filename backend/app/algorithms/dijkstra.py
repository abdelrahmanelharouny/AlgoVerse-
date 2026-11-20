import heapq
import time
from typing import Any

from app.models import Step, StepType, AlgorithmResult, Metrics, DijkstraInput


def solve_dijkstra(data: DijkstraInput) -> AlgorithmResult:
    """Compute single-source shortest paths for a directed, non-negative weighted graph."""
    start_time = time.perf_counter()
    graph = data.graph
    start_node = data.start_node

    if not isinstance(graph, dict) or not graph:
        raise ValueError("Graph must be a non-empty adjacency dictionary.")
    if start_node not in graph:
        raise ValueError(f"Start node {start_node!r} is not present in the graph.")

    # Include neighbor-only vertices and reject invalid weights before running.
    nodes = set(graph)
    for source, neighbors in graph.items():
        if not isinstance(neighbors, dict):
            raise ValueError(f"Neighbors for node {source!r} must be an adjacency dictionary.")
        nodes.update(neighbors)
        for target, weight in neighbors.items():
            if isinstance(weight, bool) or not isinstance(weight, (int, float)):
                raise ValueError(f"Edge {source!r}->{target!r} must have a numeric weight.")
            if weight < 0:
                raise ValueError("Dijkstra's algorithm does not support negative edge weights.")

    distances = {node: float("inf") for node in nodes}
    predecessors = {node: None for node in nodes}
    distances[start_node] = 0
    queue = [(0, start_node)]
    visited = set()
    steps = [Step(
        type=StepType.INIT,
        description=f"Initialized Dijkstra from node {start_node}",
        data={"distances": {node: (0 if node == start_node else None) for node in nodes},
              "visited": [], "graph": graph, "start_node": start_node},
    )]

    while queue:
        current_dist, current_node = heapq.heappop(queue)
        # Ignore stale heap entries; a better route was pushed later.
        if current_dist != distances[current_node] or current_node in visited:
            continue

        visited.add(current_node)
        steps.append(Step(
            type=StepType.HIGHLIGHT,
            description=f"Visiting node {current_node} with distance {current_dist}",
            data={"current_node": current_node, "current_dist": current_dist,
                  "visited": list(visited)},
        ))

        for neighbor, weight in graph.get(current_node, {}).items():
            steps.append(Step(
                type=StepType.HIGHLIGHT,
                description=f"Checking edge {current_node} -> {neighbor} (weight {weight})",
                data={"current_node": current_node, "checking_neighbor": neighbor,
                      "edge_weight": weight},
            ))
            candidate = current_dist + weight
            if candidate < distances[neighbor]:
                old_distance = distances[neighbor]
                distances[neighbor] = candidate
                predecessors[neighbor] = current_node
                heapq.heappush(queue, (candidate, neighbor))
                steps.append(Step(
                    type=StepType.UPDATE,
                    description=f"Relaxed edge {current_node}->{neighbor}: {candidate}",
                    data={"node": neighbor, "new_dist": candidate,
                          "old_dist": old_distance if old_distance != float("inf") else None,
                          "distances": {node: (value if value != float("inf") else None)
                                        for node, value in distances.items()}},
                ))

    # A stable, JSON-friendly result contract: null means unreachable.
    result_distances = {
        node: (distance if distance != float("inf") else None)
        for node, distance in distances.items()
    }
    paths = {}
    for node in nodes:
        if distances[node] == float("inf"):
            paths[node] = None
            continue
        path = []
        current = node
        while current is not None:
            path.append(current)
            current = predecessors[current]
        paths[node] = list(reversed(path))

    reachable_distances = [d for d in distances.values() if d != float("inf")]
    max_distance = max(reachable_distances, default=0)
    steps.append(Step(
        type=StepType.SOLUTION,
        description="Shortest paths computed. Unreachable nodes are represented by null.",
        data={"distances": result_distances, "paths": paths},
    ))

    elapsed = time.perf_counter() - start_time
    return AlgorithmResult(
        steps=steps,
        result_value=max_distance,
        selected_items=[],
        metrics=Metrics(
            time_taken=elapsed,
            space_complexity="O(V)",
            time_complexity="O((V + E) log V)",
            step_count=len(steps),
        ),
    )
