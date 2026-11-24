# AlgoVerse

**An interactive lab for learning, visualizing, and analyzing algorithms.**

AlgoVerse turns algorithm execution into an explorable learning experience: students can inspect state transitions, step through decisions, compare approaches, and connect the visual result to the underlying recurrence or graph operation.

## What is included

### Algorithm visualizers
- Dynamic programming: 0/1 Knapsack, Coin Change, Matrix Chain Multiplication, Longest Common Subsequence, Edit Distance, Longest Increasing Subsequence, Rod Cutting, and Interval Scheduling.
- Greedy: Knapsack density heuristic, Fractional Knapsack, Coin Change, Interval Scheduling, and Huffman Coding.
- Graphs: Dijkstra, Prim, and Kruskal.

### Learning tools
- Step-by-step playback, pause, seek, reset, and speed controls.
- DP table and graph visualizations.
- Code implementation panel and contextual step explanations.
- Input presets, challenge mode, and algorithm comparison playground.
- Complexity and performance analysis.

> The product distinguishes learning traces from benchmark measurements. A generated visualization trace is not a substitute for measuring the algorithm without rendering overhead.

## Technology

| Layer | Technologies |
|---|---|
| Frontend | React, TypeScript, Vite, Tailwind CSS, Framer Motion |
| Visualization | Canvas API and custom graph/DP renderers |
| API | FastAPI, Pydantic, Mangum |
| Runtime | Python 3.12 |
| Local deployment | Docker Compose |
| Production deployment | Vercel |
| Quality | pytest, ESLint, TypeScript build, GitHub Actions |

## Repository layout

```text
AlgoVerse/
├── api/                    # Vercel FastAPI entrypoint and algorithm package
├── backend/
│   ├── app/
│   │   ├── algorithms/     # Local FastAPI algorithm package
│   │   ├── main.py
│   │   └── models.py
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   └── src/
│       ├── components/
│       ├── hooks/
│       ├── pages/
│       ├── types/
│       └── utils/
├── tests/                  # Backend regression tests
├── requirements.txt
├── requirements-dev.txt
├── docker-compose.yml
└── vercel.json
```

The `api/` and `backend/app/` packages are deployment entrypoint-specific copies in the current structure. Keep their algorithm implementations and contracts synchronized until they are consolidated into a single shared package.

## Run locally

### 1. Backend

Use Python 3.12.

```bash
python -m venv .venv
# Windows PowerShell:
.venv\Scripts\Activate.ps1
# macOS / Linux:
# source .venv/bin/activate

python -m pip install --upgrade pip
pip install -r requirements-dev.txt
uvicorn app.main:app --app-dir backend --reload --port 8000
```

API documentation is available at `http://localhost:8000/docs`.

### 2. Frontend

In another terminal:

```bash
cd frontend
npm ci
npm run dev
```

Vite proxies `/api` requests to `http://127.0.0.1:8000`.

### 3. Docker Compose

```bash
docker compose up --build
```

The API is exposed on `http://localhost:8000`.

## Tests and quality checks

```bash
python scripts/check_algorithm_parity.py
python -m pytest -q
cd frontend
npm run lint
npm run build
```

GitHub Actions checks that the API and Docker algorithm implementations remain identical, runs backend regression tests, and runs frontend lint/build checks on pushes and pull requests.

## Configuration

| Variable | Purpose | Default |
|---|---|---|
| `ALLOWED_ORIGINS` | Comma-separated browser origins allowed by CORS | `http://localhost:5173,http://127.0.0.1:5173` |

For production, set `ALLOWED_ORIGINS` to the exact deployed frontend origin(s). Do not use a wildcard origin.

## API endpoints

- `GET /` — API status.
- `GET /health` — health check.
- `POST /solve/knapsack/{dp|greedy}` — 0/1 Knapsack.
- `POST /solve/fractional-knapsack` — Fractional Knapsack.
- `POST /solve/coin-change/{dp|greedy}` — Coin Change.
- `POST /solve/interval-scheduling/{dp|greedy}` — Interval Scheduling.
- `POST /solve/matrix-chain/dp` — Matrix Chain Multiplication.
- `POST /solve/huffman` — Huffman Coding.
- `POST /solve/lcs` — Longest Common Subsequence.
- `POST /solve/edit-distance` — Edit Distance.
- `POST /solve/lis` — Longest Increasing Subsequence.
- `POST /solve/rod-cutting` — Rod Cutting.
- `POST /solve/dijkstra` — Single-source shortest paths.
- `POST /solve/prims` — Minimum spanning forest with Prim.
- `POST /solve/kruskals` — Minimum spanning forest with Kruskal.

Every algorithm response contains a shared result contract, typed metrics, a replayable step trace, and a `result_data` object for algorithm-specific output.

Graph inputs may declare a vertex as an adjacency key or only as a neighbor. The API normalizes both forms and applies the 100-node limit to the complete vertex set.

## Engineering principles

1. **Correctness before new algorithms.** Every algorithm needs deterministic edge-case tests.
2. **One event contract.** Visualizers should consume stable step payloads rather than algorithm-specific guesswork.
3. **Explain decisions.** A step should show what changed and why.
4. **Measure honestly.** Benchmark execution separately from step generation and rendering.
5. **Fail clearly.** Invalid inputs should be rejected at the API boundary with actionable messages.
6. **Protect the stable branch.** Merge changes only after CI and production smoke checks pass.

## Deployment notes

Vercel serves the React frontend and the Python API entrypoint. Configure the frontend build, Python runtime, and `ALLOWED_ORIGINS` in the Vercel project settings. Docker Compose is intended for local backend development and validation.
