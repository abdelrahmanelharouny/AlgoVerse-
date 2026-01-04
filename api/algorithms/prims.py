import heapq
import time
from typing import Dict, List, Any
from api.models import Step, StepType, AlgorithmResult, Metrics, DijkstraInput

# Prim's uses the same input structure as Dijkstra (Graph + Start Node)
def solve_prims(data: DijkstraInput) -> AlgorithmResult:
    start_time = time.time()
    steps = []
    
    graph = data.graph
    start_node = data.start_node
    
    # Priority Queue: (weight, from_node, to_node)
    # We start with edges from the start node
    pq = []
    
    visited = set([start_node])
    mst_edges = []
    mst_weight = 0
    
    steps.append(Step(
        type=StepType.INIT,
        description=f"Initialized Prim's Algorithm starting at {start_node}",
        data={
            "visited": list(visited),
            "mst_edges": [],
            "graph": graph,
            "start_node": start_node
        }
    ))
    
    # Add initial edges
    if start_node in graph:
        for neighbor, weight in graph[start_node].items():
            heapq.heappush(pq, (weight, start_node, neighbor))
            steps.append(Step(
                type=StepType.HIGHLIGHT,
                description=f"Added edge {start_node}->{neighbor} (weight {weight}) to PQ",
                data={
                     "current_node": start_node,
                     "checking_neighbor": neighbor,
                     "edge_weight": weight
                }
            ))

    while pq:
        # Get smallest edge
        weight, u, v = heapq.heappop(pq)
        
        # If v is already visited, skip (cycle)
        if v in visited:
            continue
            
        steps.append(Step(
            type=StepType.PICK,
            description=f"Selected edge {u}->{v} (weight {weight}) for MST",
            data={
                "u": u,
                "v": v,
                "weight": weight
            }
        ))
        
        # Add to MST
        visited.add(v)
        mst_edges.append({"u": u, "v": v, "weight": weight})
        mst_weight += weight
        
        steps.append(Step(
            type=StepType.UPDATE,
            description=f"Included node {v} in MST. Total weight: {mst_weight}",
            data={
                "visited": list(visited),
                "mst_edges": mst_edges,
                "node": v
            }
        ))
        
        # Add neigbors of v
        if v in graph:
            for neighbor, w in graph[v].items():
                if neighbor not in visited:
                    heapq.heappush(pq, (w, v, neighbor))
                    steps.append(Step(
                        type=StepType.HIGHLIGHT,
                        description=f"Added edge {v}->{neighbor} (weight {w}) to PQ",
                        data={
                            "current_node": v,
                            "checking_neighbor": neighbor,
                            "edge_weight": w
                        }
                    ))

    end_time = time.time()
    
    return AlgorithmResult(
        steps=steps,
        result_value=mst_weight,
        selected_items=[],
        metrics=Metrics(
            time_taken=end_time - start_time,
            space_complexity=f"O(V+E)",
            time_complexity=f"O(E log V)",
            step_count=len(steps)
        )
    )
