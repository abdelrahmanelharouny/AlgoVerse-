import time
from typing import Dict, List, Any
from api.models import Step, StepType, AlgorithmResult, Metrics, DijkstraInput

class UnionFind:
    def __init__(self, nodes):
        self.parent = {node: node for node in nodes}
        self.rank = {node: 0 for node in nodes}
    
    def find(self, node):
        if self.parent[node] != node:
            self.parent[node] = self.find(self.parent[node])
        return self.parent[node]
    
    def union(self, u, v):
        root_u = self.find(u)
        root_v = self.find(v)
        
        if root_u != root_v:
            if self.rank[root_u] > self.rank[root_v]:
                self.parent[root_v] = root_u
            elif self.rank[root_u] < self.rank[root_v]:
                self.parent[root_u] = root_v
            else:
                self.parent[root_v] = root_u
                self.rank[root_u] += 1
            return True
        return False

def solve_kruskals(data: DijkstraInput) -> AlgorithmResult:
    start_time = time.time()
    steps = []
    
    graph = data.graph
    
    # Extract all edges: (weight, u, v)
    edges = []
    seen_edges = set()
    
    # DijkstraInput graph is directed-ish structure but usually used as undirected for MST
    # We'll treat A->B with weight W as the same edge as B->A with weight W
    for u, neighbors in graph.items():
        for v, w in neighbors.items():
            edge_key = tuple(sorted((u, v)))
            if edge_key not in seen_edges:
                edges.append((w, u, v))
                seen_edges.add(edge_key)
                
    # Sort edges by weight
    edges.sort()
    
    steps.append(Step(
        type=StepType.SORT,
        description=f"Sorted {len(edges)} edges by weight",
        data={
            "edges": [{"u": u, "v": v, "weight": w} for w, u, v in edges],
            "graph": graph
        }
    ))
    
    uf = UnionFind(graph.keys())
    mst_weight = 0
    mst_edges = []
    
    for w, u, v in edges:
        steps.append(Step(
            type=StepType.HIGHLIGHT,
            description=f"Checking edge {u}-{v} (weight {w})",
            data={
                "u": u, 
                "v": v, 
                "weight": w,
                "current_node": u,
                "checking_neighbor": v
            }
        ))
        
        if uf.union(u, v):
            mst_weight += w
            mst_edges.append({"u": u, "v": v, "weight": w})
            
            steps.append(Step(
                type=StepType.PICK,
                description=f"Added edge {u}-{v} to MST. No cycle detected.",
                data={
                    "u": u,
                    "v": v, 
                    "weight": w,
                    "mst_edges": mst_edges
                }
            ))
        else:
            steps.append(Step(
                type=StepType.REJECT,
                description=f"Skipped edge {u}-{v}. Cycle detected.",
                data={
                    "u": u,
                    "v": v,
                    "weight": w,
                    "mst_edges": mst_edges
                }
            ))
            
    end_time = time.time()
    
    return AlgorithmResult(
        steps=steps,
        result_value=mst_weight,
        selected_items=[],
        metrics=Metrics(
            time_taken=end_time - start_time,
            space_complexity=f"O(V)",
            time_complexity=f"O(E log E)",
            step_count=len(steps)
        )
    )
