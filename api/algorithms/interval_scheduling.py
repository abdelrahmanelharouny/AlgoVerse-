import time
from typing import List
from api.models import AlgorithmResult, Step, StepType, Metrics
from pydantic import BaseModel


class Interval(BaseModel):
    id: int
    start: int
    end: int


class IntervalSchedulingInput(BaseModel):
    intervals: List[Interval]


def solve_interval_scheduling_greedy(data: IntervalSchedulingInput) -> AlgorithmResult:
    """
    Greedy Solution: Select maximum non-overlapping intervals
    Sort by end time and greedily pick non-conflicting intervals
    This is optimal for this problem!
    """
    start_time = time.time()
    steps = []
    intervals = data.intervals
    
    # Sort by end time
    sorted_intervals = sorted(intervals, key=lambda x: x.end)
    
    steps.append(Step(
        type=StepType.SORT,
        description=f"Sorted {len(intervals)} intervals by end time (earliest finish first)",
        data={"sorted_order": [f"[{i.start},{i.end}]" for i in sorted_intervals]}
    ))
    
    selected = []
    last_end = -1
    total_selected = 0
    
    for interval in sorted_intervals:
        steps.append(Step(
            type=StepType.HIGHLIGHT,
            description=f"Considering interval [{interval.start}, {interval.end}]",
            data={"interval_id": interval.id, "start": interval.start, "end": interval.end}
        ))
        
        if interval.start >= last_end:
            # No overlap, select this interval
            selected.append(interval.id)
            last_end = interval.end
            total_selected += 1
            
            steps.append(Step(
                type=StepType.PICK,
                description=f"Selected interval [{interval.start}, {interval.end}]. No overlap with previous.",
                data={
                    "item_id": interval.id,
                    "weight": interval.start,
                    "value": interval.end,
                    "ratio": interval.end - interval.start,
                    "current_weight": last_end,
                    "total_value": total_selected
                }
            ))
        else:
            # Overlaps, reject
            steps.append(Step(
                type=StepType.REJECT,
                description=f"Rejected interval [{interval.start}, {interval.end}]. Overlaps with previous (ends at {last_end}).",
                data={
                    "item_id": interval.id,
                    "weight": interval.start,
                    "value": interval.end,
                    "ratio": interval.end - interval.start,
                    "current_weight": last_end
                }
            ))
    
    end_time = time.time()
    
    return AlgorithmResult(
        steps=steps,
        result_value=total_selected,
        selected_items=selected,
        metrics=Metrics(
            time_taken=end_time - start_time,
            space_complexity="O(1)",
            time_complexity=f"O(N log N)",
            step_count=len(steps)
        )
    )


def solve_interval_scheduling_dp(data: IntervalSchedulingInput) -> AlgorithmResult:
    """
    DP Solution: Also finds maximum non-overlapping intervals
    Shows that DP gives same result as greedy for this problem
    """
    start_time = time.time()
    steps = []
    intervals = data.intervals
    n = len(intervals)
    
    # Sort by end time
    sorted_intervals = sorted(intervals, key=lambda x: x.end)
    
    steps.append(Step(
        type=StepType.SORT,
        description=f"Sorted {n} intervals by end time for DP solution",
        data={"sorted_order": [f"[{i.start},{i.end}]" for i in sorted_intervals]}
    ))
    
    # dp[i] = maximum intervals we can select from first i intervals
    dp = [0] * (n + 1)
    
    steps.append(Step(
        type=StepType.INIT,
        description=f"Initialized DP array of size {n + 1}",
        data={"rows": 1, "cols": n + 1}
    ))
    
    # For tracking which intervals were selected
    selected = [[] for _ in range(n + 1)]
    
    for i in range(1, n + 1):
        current = sorted_intervals[i - 1]
        
       # Find latest non-overlapping interval
        j = i - 1
        while j > 0 and sorted_intervals[j - 1].end > current.start:
            j -= 1
        
        # Choice: include current or exclude
        include_val = 1 + dp[j]
        exclude_val = dp[i - 1]
        
        steps.append(Step(
            type=StepType.HIGHLIGHT,
            description=f"DP[{i}]: Interval [{current.start},{current.end}]. Include={include_val}, Exclude={exclude_val}",
            data={"i": 0, "j": i}
        ))
        
        if include_val > exclude_val:
            dp[i] = include_val
            selected[i] = selected[j] + [current.id]
            steps.append(Step(
                type=StepType.UPDATE,
                description=f"Include interval {current.id}: {include_val} > {exclude_val}",
                data={
                    "i": 0,
                    "j": i,
                    "value": include_val,
                    "action": "include",
                    "prev_j": j
                }
            ))
        else:
            dp[i] = exclude_val
            selected[i] = selected[i - 1]
            steps.append(Step(
                type=StepType.UPDATE,
                description=f"Exclude interval {current.id}: {exclude_val} >= {include_val}",
                data={
                    "i": 0,
                    "j": i,
                    "value": exclude_val,
                    "action": "exclude",
                    "prev_j": i - 1
                }
            ))
    
    end_time = time.time()
    
    return AlgorithmResult(
        steps=steps,
        result_value=dp[n],
        selected_items=selected[n],
        metrics=Metrics(
            time_taken=end_time - start_time,
            space_complexity=f"O(N)",
            time_complexity=f"O(N²)",
            step_count=len(steps)
        )
    )
