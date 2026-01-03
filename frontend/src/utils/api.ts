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

export const api = {
    solveKnapsack: async (type: AlgorithmType, data: KnapsackInput): Promise<AlgorithmResult> => {
        const response = await fetch(`${API_BASE_URL}/solve/knapsack/${type}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    },

    solveCoinChange: async (type: AlgorithmType, data: CoinChangeInput): Promise<AlgorithmResult> => {
        const response = await fetch(`${API_BASE_URL}/solve/coin-change/${type}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    },

    solveIntervalScheduling: async (type: AlgorithmType, data: IntervalSchedulingInput): Promise<AlgorithmResult> => {
        const response = await fetch(`${API_BASE_URL}/solve/interval-scheduling/${type}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    },

    solveMatrixChain: async (_type: AlgorithmType, data: MatrixChainInput): Promise<AlgorithmResult> => {
        const response = await fetch(`${API_BASE_URL}/solve/matrix-chain/dp`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    },

    solveHuffman: async (data: HuffmanInput): Promise<AlgorithmResult> => {
        const response = await fetch(`${API_BASE_URL}/solve/huffman`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    },

    solveLCS: async (data: LCSInput): Promise<AlgorithmResult> => {
        const response = await fetch(`${API_BASE_URL}/solve/lcs`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    },

    solveDijkstra: async (data: DijkstraInput): Promise<AlgorithmResult> => {
        const response = await fetch(`${API_BASE_URL}/solve/dijkstra`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    },

    solvePrims: async (data: DijkstraInput): Promise<AlgorithmResult> => {
        const response = await fetch(`${API_BASE_URL}/solve/prims`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    },

    solveKruskals: async (data: DijkstraInput): Promise<AlgorithmResult> => {
        const response = await fetch(`${API_BASE_URL}/solve/kruskals`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    },

    solveEditDistance: async (data: LCSInput): Promise<AlgorithmResult> => {
        const response = await fetch(`${API_BASE_URL}/solve/edit-distance`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    },

    solveLIS: async (data: { sequence: number[] }): Promise<AlgorithmResult> => {
        const response = await fetch(`${API_BASE_URL}/solve/lis`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    },

    solveRodCutting: async (data: { length: number; prices: number[] }): Promise<AlgorithmResult> => {
        const response = await fetch(`${API_BASE_URL}/solve/rod-cutting`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    }
};
