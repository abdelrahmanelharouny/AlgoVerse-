from pydantic import BaseModel
from typing import List, Dict, Any, Optional, Union
from enum import Enum

class AlgorithmType(str, Enum):
    GREEDY = "greedy"
    DP = "dp"

class StepType(str, Enum):
    # Common
    INFO = "info"
    # DP
    INIT = "init"
    UPDATE = "update"
    HIGHLIGHT = "highlight"
    SOLUTION = "solution"
    # Greedy
    PICK = "pick"
    REJECT = "reject"
    SORT = "sort"

class Step(BaseModel):
    type: StepType
    description: str
    data: Dict[str, Any] = {}
    # Optional fields for specific animations can go into 'data'
    # e.g., for DP: i, j, value, dependencies
    # e.g., for Greedy: item_index, current_capacity

class Metrics(BaseModel):
    time_taken: float  # in seconds
    space_complexity: str # e.g. "O(N*W)"
    time_complexity: str # e.g. "O(N*W)"
    step_count: int

class AlgorithmResult(BaseModel):
    steps: List[Step]
    result_value: float
    selected_items: List[int] # Indices of selected items
    metrics: Metrics

class KnapsackItem(BaseModel):
    id: int
    weight: int
    value: int

class KnapsackInput(BaseModel):
    capacity: int
    items: List[KnapsackItem]

class CoinChangeInput(BaseModel):
    amount: int
    coins: List[int]

class Interval(BaseModel):
    id: int
    start: int
    end: int

class IntervalSchedulingInput(BaseModel):
    intervals: List[Interval]

class MatrixChainInput(BaseModel):
    dimensions: List[int]

class HuffmanInput(BaseModel):
    text: str

class LCSInput(BaseModel):
    text1: str
    text2: str

class DijkstraInput(BaseModel):
    graph: dict # Simplified, might need more structure
    start_node: str

class EditDistanceInput(BaseModel):
    text1: str
    text2: str

class LISInput(BaseModel):
    sequence: List[int]

class RodCuttingInput(BaseModel):
    length: int
    prices: List[int]

