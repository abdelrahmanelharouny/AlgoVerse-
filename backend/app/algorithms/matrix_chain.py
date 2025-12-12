import sys
from app.models import AlgorithmResult, Step, StepType, Metrics
import time

def solve_matrix_chain_dp(data):
    start_time = time.time()
    dims = data.dimensions
    n = len(dims) - 1  # Number of matrices
    
    # m[i][j] stores min multiplications for A[i]...A[j]
    # s[i][j] stores the optimal split index k
    m = [[0 for _ in range(n + 1)] for _ in range(n + 1)]
    s = [[0 for _ in range(n + 1)] for _ in range(n + 1)]
    
    steps = []
    
    # Init step
    steps.append(Step(
        type=StepType.INIT,
        description=f"Initialized DP table for {n} matrices.",
        data={"rows": n + 1, "cols": n + 1, "dimensions": dims}
    ))

    # l is chain length
    for l in range(2, n + 1):
        for i in range(1, n - l + 2):
            j = i + l - 1
            m[i][j] = sys.maxsize
            
            steps.append(Step(
                type=StepType.HIGHLIGHT,
                description=f"Computing min cost for chain A{i}...A{j} (Length {l})",
                data={"i": i, "j": j}
            ))
            
            # Try every split k
            for k in range(i, j):
                # cost = cost(left) + cost(right) + cost(multiplication)
                q = m[i][k] + m[k+1][j] + dims[i-1] * dims[k] * dims[j]
                
                steps.append(Step(
                    type=StepType.INFO,
                    description=f"Checking split at k={k}: Cost = {m[i][k]} + {m[k+1][j]} + {dims[i-1]}*{dims[k]}*{dims[j]} = {q}",
                    data={"i": i, "j": j, "k": k, "cost": q}
                ))
                
                if q < m[i][j]:
                    m[i][j] = q
                    s[i][j] = k
                    steps.append(Step(
                        type=StepType.UPDATE,
                        description=f"New min cost for A{i}...A{j} is {q} (Split at k={k})",
                        data={"i": i, "j": j, "value": q, "split": k}
                    ))
    
    total_time = time.time() - start_time
    
    return AlgorithmResult(
        steps=steps,
        result_value=m[1][n],
        selected_items=[], # Not used for this problem
        metrics=Metrics(
            time_taken=total_time,
            space_complexity="O(n^2)",
            time_complexity="O(n^3)",
            step_count=len(steps)
        )
    )
