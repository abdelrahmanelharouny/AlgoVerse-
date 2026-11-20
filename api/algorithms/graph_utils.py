from __future__ import annotations

from typing import Dict, List, Tuple


def undirected_edges(graph: Dict[str, Dict[str, float]]) -> Tuple[List[str], List[Tuple[float, str, str]]]:
    """Validate and normalize an undirected weighted graph into unique edges."""
    nodes = sorted(graph)
    weights: Dict[Tuple[str, str], float] = {}
    for source, neighbors in graph.items():
        for target, weight in neighbors.items():
            if target not in graph:
                raise ValueError(f"Unknown graph node: {target}")
            if source == target:
                continue
            left, right = sorted((source, target))
            key = (left, right)
            if key in weights and weights[key] != weight:
                raise ValueError(f"Conflicting weights for undirected edge {left}-{right}")
            weights[key] = float(weight)
    edges = [(weight, left, right) for (left, right), weight in weights.items()]
    edges.sort(key=lambda edge: (edge[0], edge[1], edge[2]))
    return nodes, edges


def as_undirected_adjacency(nodes: List[str], edges: List[Tuple[float, str, str]]) -> Dict[str, Dict[str, float]]:
    adjacency = {node: {} for node in nodes}
    for weight, left, right in edges:
        adjacency[left][right] = weight
        adjacency[right][left] = weight
    return adjacency
