import { AlgorithmType } from '../types';
import type {
    AlgorithmResult,
    KnapsackInput,
    CoinChangeInput,
    IntervalSchedulingInput,
    MatrixChainInput,
    HuffmanInput,
    LCSInput,
    DijkstraInput
} from '../types';

const API_BASE_URL = '/api';

export class ApiError extends Error {
    readonly status: number;
    readonly detail: unknown;

    constructor(message: string, status: number, detail?: unknown) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.detail = detail;
    }
}

async function request<T>(path: string, data?: unknown): Promise<T> {
    let response: Response;
    try {
        response = await fetch(`${API_BASE_URL}${path}`, {
            method: data === undefined ? 'GET' : 'POST',
            headers: data === undefined ? { Accept: 'application/json' } : {
                Accept: 'application/json',
                'Content-Type': 'application/json'
            },
            body: data === undefined ? undefined : JSON.stringify(data),
            credentials: 'same-origin'
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Network request failed';
        throw new ApiError(`Unable to reach the AlgoVerse API: ${message}`, 0);
    }

    const contentType = response.headers.get('content-type') ?? '';
    const payload: unknown = contentType.includes('application/json')
        ? await response.json().catch(() => null)
        : await response.text().catch(() => '');

    if (!response.ok) {
        const detail = payload && typeof payload === 'object' && 'detail' in payload
            ? (payload as { detail: unknown }).detail
            : payload;
        const message = typeof detail === 'string'
            ? detail
            : detail !== null && detail !== undefined
                ? JSON.stringify(detail)
                : `Request failed with HTTP ${response.status}`;
        throw new ApiError(message, response.status, detail);
    }

    if (payload === null || payload === '') {
        throw new ApiError('The API returned an empty response', response.status);
    }
    return payload as T;
}

export const api = {
    health: () => request<{ status: string }>('/health'),

    solveKnapsack: (type: AlgorithmType, data: KnapsackInput): Promise<AlgorithmResult> =>
        request(`/solve/knapsack/${type}`, data),

    solveFractionalKnapsack: (data: KnapsackInput): Promise<AlgorithmResult> =>
        request('/solve/fractional-knapsack', data),

    solveCoinChange: (type: AlgorithmType, data: CoinChangeInput): Promise<AlgorithmResult> =>
        request(`/solve/coin-change/${type}`, data),

    solveIntervalScheduling: (type: AlgorithmType, data: IntervalSchedulingInput): Promise<AlgorithmResult> =>
        request(`/solve/interval-scheduling/${type}`, data),

    solveMatrixChain: (_type: AlgorithmType, data: MatrixChainInput): Promise<AlgorithmResult> =>
        request('/solve/matrix-chain/dp', data),

    solveHuffman: (data: HuffmanInput): Promise<AlgorithmResult> =>
        request('/solve/huffman', data),

    solveLCS: (data: LCSInput): Promise<AlgorithmResult> =>
        request('/solve/lcs', data),

    solveDijkstra: (data: DijkstraInput): Promise<AlgorithmResult> =>
        request('/solve/dijkstra', data),

    solvePrims: (data: DijkstraInput): Promise<AlgorithmResult> =>
        request('/solve/prims', data),

    solveKruskals: (data: DijkstraInput): Promise<AlgorithmResult> =>
        request('/solve/kruskals', data),

    solveEditDistance: (data: LCSInput): Promise<AlgorithmResult> =>
        request('/solve/edit-distance', data),

    solveLIS: (data: { sequence: number[] }): Promise<AlgorithmResult> =>
        request('/solve/lis', data),

    solveRodCutting: (data: { length: number; prices: number[] }): Promise<AlgorithmResult> =>
        request('/solve/rod-cutting', data)
};
