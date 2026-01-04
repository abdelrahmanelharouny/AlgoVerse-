from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from mangum import Mangum

# Import algorithm modules from api folder
from api.algorithms.knapsack import solve_knapsack_dp, solve_knapsack_greedy
from api.algorithms.coin_change import solve_coin_change_dp, solve_coin_change_greedy
from api.algorithms.interval_scheduling import solve_interval_scheduling_greedy, solve_interval_scheduling_dp
from api.algorithms.matrix_chain import solve_matrix_chain_dp
from api.algorithms.huffman import solve_huffman
from api.algorithms.lcs import solve_lcs_dp
from api.algorithms.dijkstra import solve_dijkstra
from api.algorithms.prims import solve_prims
from api.algorithms.kruskals import solve_kruskals
from api.algorithms.edit_distance import solve_edit_distance_dp
from api.algorithms.lis import solve_lis_dp
from api.algorithms.rod_cutting import solve_rod_cutting_dp
from api.models import (
    AlgorithmType, AlgorithmResult, KnapsackInput, CoinChangeInput, 
    IntervalSchedulingInput, MatrixChainInput, HuffmanInput, LCSInput, 
    DijkstraInput, EditDistanceInput, LISInput, RodCuttingInput
)

app = FastAPI(title="Algorithm Visualizer API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Algorithm Visualizer API"}

@app.post("/solve/knapsack/{algorithm_type}", response_model=AlgorithmResult)
def solve_knapsack(algorithm_type: str, data: KnapsackInput):
    if algorithm_type == AlgorithmType.DP:
        return solve_knapsack_dp(data)
    elif algorithm_type == AlgorithmType.GREEDY:
        return solve_knapsack_greedy(data)
    else:
        raise HTTPException(status_code=400, detail=f"Unknown algorithm type: {algorithm_type}")

@app.post("/solve/coin-change/{algorithm_type}", response_model=AlgorithmResult)
def solve_coin_change(algorithm_type: str, data: CoinChangeInput):
    if algorithm_type == AlgorithmType.DP:
        return solve_coin_change_dp(data)
    elif algorithm_type == AlgorithmType.GREEDY:
        return solve_coin_change_greedy(data)
    else:
        raise HTTPException(status_code=400, detail=f"Unknown algorithm type: {algorithm_type}")

@app.post("/solve/interval-scheduling/{algorithm_type}", response_model=AlgorithmResult)
def solve_interval_scheduling(algorithm_type: str, data: IntervalSchedulingInput):
    if algorithm_type == AlgorithmType.DP:
        return solve_interval_scheduling_dp(data)
    elif algorithm_type == AlgorithmType.GREEDY:
        return solve_interval_scheduling_greedy(data)
    else:
        raise HTTPException(status_code=400, detail=f"Unknown algorithm type: {algorithm_type}")

@app.post("/solve/matrix-chain/{algorithm_type}", response_model=AlgorithmResult)
def solve_matrix_chain(algorithm_type: str, data: MatrixChainInput):
    if algorithm_type == AlgorithmType.DP:
        return solve_matrix_chain_dp(data)
    else:
        raise HTTPException(status_code=400, detail="Matrix Chain optimization is a DP problem.")

@app.post("/solve/huffman", response_model=AlgorithmResult)
def solve_huffman_endpoint(data: HuffmanInput):
    return solve_huffman(data)

@app.post("/solve/lcs", response_model=AlgorithmResult)
def solve_lcs_endpoint(data: LCSInput):
    return solve_lcs_dp(data)

@app.post("/solve/dijkstra", response_model=AlgorithmResult)
def solve_dijkstra_endpoint(data: DijkstraInput):
    return solve_dijkstra(data)

@app.post("/solve/prims", response_model=AlgorithmResult)
def solve_prims_endpoint(data: DijkstraInput):
    return solve_prims(data)

@app.post("/solve/kruskals", response_model=AlgorithmResult)
def solve_kruskals_endpoint(data: DijkstraInput):
    return solve_kruskals(data)

@app.post("/solve/edit-distance", response_model=AlgorithmResult)
def solve_edit_distance_endpoint(data: EditDistanceInput):
    return solve_edit_distance_dp(data)

@app.post("/solve/lis", response_model=AlgorithmResult)
def solve_lis_endpoint(data: LISInput):
    return solve_lis_dp(data)

@app.post("/solve/rod-cutting", response_model=AlgorithmResult)
def solve_rod_cutting_endpoint(data: RodCuttingInput):
    return solve_rod_cutting_dp(data)

# Vercel Serverless Handler
handler = Mangum(app)
