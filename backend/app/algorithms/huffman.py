import heapq
from collections import Counter
from time import perf_counter
from typing import Dict, Optional

from app.models import AlgorithmResult, HuffmanInput, Metrics, Step, StepType


class HuffmanNode:
    def __init__(self, char: Optional[str], frequency: int, node_id: int):
        self.char = char
        self.frequency = frequency
        self.id = node_id
        self.left: Optional["HuffmanNode"] = None
        self.right: Optional["HuffmanNode"] = None


def solve_huffman(data: HuffmanInput) -> AlgorithmResult:
    """Build a deterministic Huffman tree, including the one-symbol edge case."""
    started = perf_counter()
    text = data.text
    if not text:
        step = Step(type=StepType.INFO, description="No input text was provided", data={"codes": {}, "encoded_text": ""})
        return AlgorithmResult(steps=[step], result_value=0, selected_items=[], result_data={"codes": {}, "encoded_text": "", "original_bits": 0, "compressed_bits": 0, "compression_ratio": 0}, metrics=Metrics(time_taken=0, time_complexity="O(1)", space_complexity="O(1)", step_count=1, operation_count=0))

    frequencies = Counter(text)
    steps = [Step(type=StepType.INIT, description="Count the frequency of each character", data={"frequencies": dict(frequencies)})]
    heap = []
    next_id = 0
    for char, frequency in sorted(frequencies.items()):
        node = HuffmanNode(char, frequency, next_id)
        heap.append((frequency, next_id, node))
        next_id += 1
    heapq.heapify(heap)
    steps.append(Step(type=StepType.INIT, description="Insert all leaf nodes into the min-priority queue", data={"nodes": [{"id": node.id, "char": node.char, "freq": node.frequency} for _, _, node in heap]}))
    operations = 0

    while len(heap) > 1:
        left_frequency, _, left = heapq.heappop(heap)
        right_frequency, _, right = heapq.heappop(heap)
        operations += 1
        steps.append(Step(type=StepType.HIGHLIGHT, description=f"Extract the two least frequent nodes ({left_frequency} and {right_frequency})", data={"left_id": left.id, "right_id": right.id, "left_freq": left_frequency, "right_freq": right_frequency}))
        parent = HuffmanNode(None, left_frequency + right_frequency, next_id)
        next_id += 1
        parent.left = left
        parent.right = right
        heapq.heappush(heap, (parent.frequency, parent.id, parent))
        steps.append(Step(type=StepType.UPDATE, description=f"Merge them into a parent node with frequency {parent.frequency}", data={"new_node_id": parent.id, "freq": parent.frequency, "left_child_id": left.id, "right_child_id": right.id, "remaining_count": len(heap)}))

    root = heap[0][2]
    codes: Dict[str, str] = {}

    # Iterative traversal avoids Python recursion-depth failures for a
    # highly skewed frequency distribution with many unique symbols.
    stack = [(root, "")]
    while stack:
        node, prefix = stack.pop()
        if node.char is not None:
            # A one-symbol alphabet still needs a non-empty decodable code.
            codes[node.char] = prefix or "0"
            continue
        if node.right is not None:
            stack.append((node.right, prefix + "1"))
        if node.left is not None:
            stack.append((node.left, prefix + "0"))
    encoded_text = "".join(codes[char] for char in text)
    compressed_bits = len(encoded_text)
    original_bits = len(text.encode("utf-8")) * 8
    ratio = compressed_bits / original_bits if original_bits else 0
    steps.append(Step(type=StepType.SOLUTION, description="Huffman codes and encoded message are ready", data={"codes": codes, "encoded_text": encoded_text, "compressed_bits": compressed_bits, "original_bits": original_bits}))
    elapsed = perf_counter() - started

    return AlgorithmResult(
        steps=steps, result_value=compressed_bits, selected_items=[],
        result_data={"codes": codes, "encoded_text": encoded_text, "frequencies": dict(frequencies), "original_bits": original_bits, "compressed_bits": compressed_bits, "compression_ratio": ratio},
        metrics=Metrics(time_taken=elapsed, time_complexity="O(n + k log k)", space_complexity="O(k + n)", step_count=len(steps), operation_count=operations)
    )
