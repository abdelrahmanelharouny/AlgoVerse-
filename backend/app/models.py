from enum import Enum
from typing import Any, Dict, List, Optional, Union

from pydantic import BaseModel, Field, validator


class AlgorithmType(str, Enum):
    GREEDY = "greedy"
    DP = "dp"


class StepType(str, Enum):
    INFO = "info"
    INIT = "init"
    UPDATE = "update"
    HIGHLIGHT = "highlight"
    SOLUTION = "solution"
    PICK = "pick"
    REJECT = "reject"
    SORT = "sort"


class Step(BaseModel):
    type: StepType
    description: str
    data: Dict[str, Any] = Field(default_factory=dict)


class Metrics(BaseModel):
    time_taken: float
    space_complexity: str
    time_complexity: str
    step_count: int
    operation_count: Optional[int] = None
    peak_memory_bytes: Optional[int] = None


class AlgorithmResult(BaseModel):
    steps: List[Step]
    result_value: float
    selected_items: List[Union[int, str]] = Field(default_factory=list)
    metrics: Metrics
    result_data: Dict[str, Any] = Field(default_factory=dict)


class KnapsackItem(BaseModel):
    id: Union[int, str]
    weight: int = Field(ge=0, le=1_000_000)
    value: float = Field(ge=-1_000_000_000, le=1_000_000_000)


class KnapsackInput(BaseModel):
    capacity: int = Field(ge=0, le=300)
    items: List[KnapsackItem] = Field(max_length=50)

    @validator("items")
    def unique_item_ids(cls, items):
        ids = [item.id for item in items]
        if len(ids) != len(set(ids)):
            raise ValueError("Item IDs must be unique")
        return items


class CoinChangeInput(BaseModel):
    amount: int = Field(ge=0, le=500)
    coins: List[int] = Field(min_length=1, max_length=100)

    @validator("coins")
    def positive_unique_coins(cls, coins):
        if any(coin <= 0 for coin in coins):
            raise ValueError("Coin denominations must be positive integers")
        if len(coins) != len(set(coins)):
            raise ValueError("Coin denominations must be unique")
        return coins


class Interval(BaseModel):
    id: Union[int, str]
    start: float
    end: float

    @validator("end")
    def end_not_before_start(cls, end, values):
        start = values.get("start")
        if start is not None and end < start:
            raise ValueError("Interval end must be greater than or equal to start")
        return end


class IntervalSchedulingInput(BaseModel):
    intervals: List[Interval] = Field(max_length=2_000)


class MatrixChainInput(BaseModel):
    dimensions: List[int] = Field(min_length=2, max_length=16)

    @validator("dimensions")
    def positive_dimensions(cls, dimensions):
        if any(dimension <= 0 for dimension in dimensions):
            raise ValueError("Matrix dimensions must be positive")
        return dimensions


class HuffmanInput(BaseModel):
    text: str = Field(max_length=5_000)


class LCSInput(BaseModel):
    text1: str = Field(max_length=150)
    text2: str = Field(max_length=150)


class DijkstraInput(BaseModel):
    graph: Dict[str, Dict[str, float]]
    start_node: str = ""

    @validator("graph")
    def valid_graph_references(cls, graph):
        if len(graph) > 100:
            raise ValueError("Graph cannot contain more than 100 nodes")
        nodes = set(graph)
        for source, neighbors in graph.items():
            for target, weight in neighbors.items():
                if target not in nodes:
                    raise ValueError(f"Neighbor '{target}' referenced by '{source}' is not a graph node")
                if not isinstance(weight, (int, float)) or not __import__("math").isfinite(weight):
                    raise ValueError("Graph edge weights must be finite numbers")
        return graph


class EditDistanceInput(BaseModel):
    text1: str = Field(max_length=250)
    text2: str = Field(max_length=250)


class LISInput(BaseModel):
    sequence: List[float] = Field(max_length=500)


class RodCuttingInput(BaseModel):
    length: int = Field(ge=0, le=200)
    prices: List[float] = Field(max_length=10_000)

    @validator("prices")
    def prices_required_for_positive_length(cls, prices, values):
        if values.get("length", 0) > 0 and not prices:
            raise ValueError("At least one piece price is required for a positive rod length")
        return prices
