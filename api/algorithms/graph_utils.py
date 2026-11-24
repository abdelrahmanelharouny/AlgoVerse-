from __future__ import annotations

import math
from typing import Dict, List, Tuple


def undirected_edges(graph: Dict[str, Dict[str, float]]) -> Tuple[List[str], List[Tuple[float, str, str]]]:
    """Validate and normalize an undirected weighted graph into unique edges.

    Vertices may be declared explicitly as keys or appear only as neighbors.
    Reciprocal declarations must agree on their weight.
    """
    nodes = set(graph)
    weights: Dict[Tuple[str, str], float] = {}

    for source, neighbors in graph.items():
        if not isinstance(source, str) or not isinstance(neighbors, dict):
            raise ValueError("Graph nodes must be strings with adjacency dictionaries")
        for target, weight in neighbors.items():
            if not isinstance(target, str):
                raise ValueError("Graph node identifiers must be strings")
            if isinstance(weight, bool) or not isinstance(weight, (int, float)) or not math.isfinite(weight):
                raise ValueError(f"Edge {source!r}-{target!r} must have a finite numeric weight")

            nodes.add(target)
            if source == target:
                continue
            left, right = sorted((source, target))
            key = (left, right)
            if key in weights and weights[key] != weight:
                raise ValueError(f"Conflicting weights for undirected edge {left}-{right}")
            weights[key] = float(weight)

    edges = [(weight, left, right) for (left, right), weight in weights.items()]
    edges.sort(key=lambda edge: (edge[0], edge[1], edge[2]))
    return sorted(nodes), edges


def as_undirected_adjacency(nodes: List[str], edges: List[Tuple[float, str, str]]) -> Dict[str, Dict[str, float]]:
    adjacency = {node: {} for node in nodes}
    for weight, left, right in edges:
        adjacency[left][right] = weight
        adjacency[right][left] = weight
    return adjacency
