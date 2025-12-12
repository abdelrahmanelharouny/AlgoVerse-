// Algorithm types
export const AlgorithmType = {
    DP: 'dp',
    GREEDY: 'greedy',
    KNAPSACK_DP: 'knapsack_dp',
    KNAPSACK_GREEDY: 'knapsack_greedy',
    KNAPSACK: 'knapsack',
    COIN_CHANGE_DP: 'coin_change_dp',
    COIN_CHANGE_GREEDY: 'coin_change_greedy',
    MATRIX_CHAIN: 'matrix-chain',
    HUFFMAN: 'huffman',
    LCS: 'lcs',
    DIJKSTRA: 'dijkstra',
    PRIMS: 'prims',
    KRUSKALS: 'kruskals',
    INTERVAL_SCHEDULING: 'interval-scheduling',
    EDIT_DISTANCE: 'edit-distance',
    LIS: 'lis',
    ROD_CUTTING: 'rod-cutting'
} as const;

export type AlgorithmType = typeof AlgorithmType[keyof typeof AlgorithmType];

// Step types
export const StepType = {
    INFO: 'info',
    INIT: 'init',
    UPDATE: 'update',
    HIGHLIGHT: 'highlight',
    SOLUTION: 'solution',
    PICK: 'pick',
    REJECT: 'reject',
    SORT: 'sort'
} as const;

export type StepType = typeof StepType[keyof typeof StepType];

export interface Step {
    type: StepType;
    description: string;
    data: any;
    metrics?: {
        comparisons?: number;
        swaps?: number;
    };
    highlights?: any[];
}

export interface Metrics {
    time_taken: number;
    space_complexity: string;
    time_complexity: string;
    step_count: number;
}

export interface AlgorithmResult {
    steps: Step[];
    result_value: number;
    selected_items: number[];
    metrics: Metrics;
}

export interface KnapsackItem {
    id: string | number;
    weight: number;
    value: number;
}


export interface KnapsackInput {
    capacity: number;
    items: KnapsackItem[];
}

export interface MatrixChainInput {
    dimensions: number[];
}

export interface CoinChangeInput {
    amount: number;
    coins: number[];
}

export interface HuffmanInput {
    text: string;
}

export interface LCSInput {
    text1: string;
    text2: string;
}

export interface DijkstraInput {
    graph: Record<string, Record<string, number>>;
    start_node: string;
}

export interface Interval {
    id: string | number;
    start: number;
    end: number;
}

export interface IntervalSchedulingInput {
    intervals: Interval[];
}

export interface GreedyDecision {
    itemId: number;
    weight: number;
    value: number;
    ratio: number;
    picked: boolean;
    currentTotal: number;
}

export interface PrimsInput {
    graph: Record<string, Record<string, number>>;
    start_node: string;
}

export interface KruskalsInput {
    graph: Record<string, Record<string, number>>;
}
