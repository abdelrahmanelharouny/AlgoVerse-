import math


def normalize_undirected_graph(graph):
    """Validate and normalize an adjacency dictionary as an undirected weighted graph."""
    if not isinstance(graph, dict) or not graph:
        raise ValueError("Graph must be a non-empty adjacency dictionary.")
    if any(not isinstance(node, str) for node in graph):
        raise ValueError("Graph node identifiers must be strings.")

    nodes = set(graph)
    edge_weights = {}
    for source, neighbors in graph.items():
        if not isinstance(neighbors, dict):
            raise ValueError(f"Neighbors for node {source!r} must be an adjacency dictionary.")
        if any(not isinstance(node, str) for node in neighbors):
            raise ValueError("Graph node identifiers must be strings.")
        nodes.update(neighbors)
        for target, weight in neighbors.items():
            if isinstance(weight, bool) or not isinstance(weight, (int, float)) or not math.isfinite(weight):
                raise ValueError(f"Edge {source!r}-{target!r} must have a finite numeric weight.")
            key = tuple(sorted((source, target)))
            if key in edge_weights and edge_weights[key] != weight:
                raise ValueError(f"Conflicting weights were supplied for undirected edge {source!r}-{target!r}.")
            edge_weights[key] = weight

    adjacency = {node: {} for node in nodes}
    edges = []
    for (u, v), weight in edge_weights.items():
        adjacency[u][v] = weight
        adjacency[v][u] = weight
        if u != v:
            edges.append((weight, u, v))

    return sorted(nodes), adjacency, sorted(edges)
