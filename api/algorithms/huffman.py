
import heapq
import time
from collections import Counter
from typing import List, Optional, Dict
from api.models import AlgorithmResult, Step, StepType, Metrics, HuffmanInput

class HuffmanNode:
    def __init__(self, char: Optional[str], freq: int):
        self.char = char
        self.freq = freq
        self.left: Optional[HuffmanNode] = None
        self.right: Optional[HuffmanNode] = None
        # Unique ID for visualization tracking
        self.id = id(self) 

    def __lt__(self, other):
        return self.freq < other.freq

def solve_huffman(data: HuffmanInput) -> AlgorithmResult:
    start_time = time.time()
    steps = []
    text = data.text
    
    # 1. Frequency Count
    if not text:
         return AlgorithmResult(
            steps=[],
            result_value=0,
            selected_items=[],
            metrics=Metrics(
                time_taken=0,
                space_complexity="O(1)",
                time_complexity="O(1)",
                step_count=0
            )
        )

    freq_map = Counter(text)
    
    steps.append(Step(
        type=StepType.INIT,
        description=f"Calculated frequencies for text: '{text}'",
        data={"frequencies": dict(freq_map)}
    ))

    # 2. Priority Queue
    pq = [HuffmanNode(char, freq) for char, freq in freq_map.items()]
    heapq.heapify(pq)
    
    initial_nodes = [{"id": node.id, "char": node.char, "freq": node.freq} for node in pq]
    steps.append(Step(
        type=StepType.INIT,
        description="Initialized Priority Queue with leaf nodes.",
        data={"nodes": initial_nodes}
    ))

    # 3. Build Tree
    while len(pq) > 1:
        # Extract two smallest
        left = heapq.heappop(pq)
        right = heapq.heappop(pq)
        
        steps.append(Step(
            type=StepType.HIGHLIGHT,
            description=f"Selected two smallest nodes: '{left.char or 'Internal'}' ({left.freq}) and '{right.char or 'Internal'}' ({right.freq})",
            data={
                "left_id": left.id, 
                "right_id": right.id,
                "left_freq": left.freq,
                "right_freq": right.freq
            }
        ))

        # Merge
        merged = HuffmanNode(None, left.freq + right.freq)
        merged.left = left
        merged.right = right
        
        heapq.heappush(pq, merged)
        
        steps.append(Step(
            type=StepType.UPDATE,
            description=f"Merged into new internal node with frequency {merged.freq}",
            data={
                "new_node_id": merged.id,
                "freq": merged.freq,
                "left_child_id": left.id,
                "right_child_id": right.id,
                "remaining_count": len(pq)
            }
        ))

    root = pq[0]
    
    # 4. Generate Codes (DFS)
    codes = {}
    
    def generate_codes(node: HuffmanNode, current_code: str):
        if node.char is not None:
            codes[node.char] = current_code
            return
        
        if node.left:
            generate_codes(node.left, current_code + "0")
        if node.right:
            generate_codes(node.right, current_code + "1")

    generate_codes(root, "")
    
    steps.append(Step(
        type=StepType.SOLUTION,
        description="Huffman Codes Generated",
        data={"codes": codes}
    ))
    
    # Calculate total bits
    total_bits = sum(freq_map[char] * len(code) for char, code in codes.items())
    original_bits = len(text) * 8 # Assuming ASCII/UTF-8 byte is 8 bits for simplicity in comparison

    end_time = time.time()

    return AlgorithmResult(
        steps=steps,
        result_value=total_bits, # Use result_value to return total bits
        selected_items=[], 
        metrics=Metrics(
            time_taken=end_time - start_time,
            space_complexity="O(K) where K is unique chars",
            time_complexity="O(N log K) where N is text length",
            step_count=len(steps)
        )
    )
