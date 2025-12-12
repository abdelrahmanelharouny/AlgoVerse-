import heapq
import time
from typing import Dict, List, Any
from app.models import Step, StepType, AlgorithmResult, Metrics, DijkstraInput

def solve_dijkstra(data: DijkstraInput) -> AlgorithmResult:
    start_time = time.time()
    steps = []
    
    # Graph format: { "A": {"B": 4, "C": 2}, "B": {"C": 1, "D": 5}, ... }
    graph = data.graph
    start_node = data.start_node
    
    # Initialize distances and priority queue
    # Using float('inf') for infinity
    distances = {node: float('inf') for node in graph}
    distances[start_node] = 0
    
    # Priority queue stores tuples of (current_distance, node_id)
    pq = [(0, start_node)]
    
    # Predecessors to reconstruct path
    predecessors = {node: None for node in graph}
    
    # Visited set
    visited = set()
    
    steps.append(Step(
        type=StepType.INIT,
        description=f"Initialized Dijkstra from node {start_node}",
        data={
            "distances": {k: (float('inf') if v == float('inf') else 0) for k, v in distances.items()},
            "visited": [],
            "graph": graph,
            "start_node": start_node
        }
    ))
    
    while pq:
        # Step: Sort happens implicitly in heap, but we can visualize "Selection"
        current_dist, current_node = heapq.heappop(pq)
        
        # If we found a shorter path to this node already, skip
        if current_node in visited:
            continue

        visited.add(current_node)
        
        steps.append(Step(
            type=StepType.HIGHLIGHT,
            description=f"Visiting node {current_node} with distance {current_dist}",
            data={
                "current_node": current_node,
                "current_dist": current_dist,
                "visited": list(visited)
            }
        ))
        
        # For each neighbor
        if current_node in graph:
            for neighbor, weight in graph[current_node].items():
                if neighbor in visited:
                    continue
                    
                steps.append(Step(
                    type=StepType.HIGHLIGHT,
                    description=f"Checking edge {current_node} -> {neighbor} (weight {weight})",
                    data={
                        "current_node": current_node,
                        "checking_neighbor": neighbor,
                        "edge_weight": weight
                    }
                ))
                
                new_dist = current_dist + weight
                
                if new_dist < distances[neighbor]:
                    old_dist = distances[neighbor]
                    distances[neighbor] = new_dist
                    predecessors[neighbor] = current_node
                    heapq.heappush(pq, (new_dist, neighbor))
                    
                    steps.append(Step(
                        type=StepType.UPDATE,
                        description=f"Relaxing edge {current_node}->{neighbor}. Updated distance: {new_dist} (was {old_dist if old_dist != float('inf') else '∞'})",
                        data={
                            "node": neighbor,
                            "new_dist": new_dist,
                            "distances": {k: (9999 if v == float('inf') else v) for k, v in distances.items()} # Use 9999 for infinity in JSON
                        }
                    ))
    
    end_time = time.time()
    
    return AlgorithmResult(
        steps=steps,
        result_value=0, # Not a single scalar for Dijkstra typically, but could be max dist or ignored
        selected_items=[], # Not used
        metrics=Metrics(
            time_taken=end_time - start_time,
            space_complexity=f"O(V)",
            time_complexity=f"O(E log V)",
            step_count=len(steps)
        )
    )
