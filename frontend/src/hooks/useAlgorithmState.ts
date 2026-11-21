import { useMemo } from 'react';
import { StepType } from '../types';
import type { Step, GreedyDecision } from '../types';

export interface GraphEdgeState {
    u: string;
    v: string;
    weight?: number;
}

export interface AlgorithmState {
    greedyDecisions: GreedyDecision[];
    dpTable: number[][];
    highlightedCell: { row: number; col: number } | null;
    tableConfig: { rows: number; cols: number };
    graphVisitedNodes: string[];
    graphDistances: Record<string, number | null>;
    graphMstEdges: GraphEdgeState[];
    graphPathEdges: GraphEdgeState[];
}

type MutableAlgorithmState = AlgorithmState;
type StateCheckpoint = { index: number; state: MutableAlgorithmState };

const MAX_CHECKPOINTS = 64;
const SNAPSHOT_CELL_BUDGET = 250_000;

const emptyState = (): MutableAlgorithmState => ({
    greedyDecisions: [],
    dpTable: [],
    highlightedCell: null,
    tableConfig: { rows: 0, cols: 0 },
    graphVisitedNodes: [],
    graphDistances: {},
    graphMstEdges: [],
    graphPathEdges: []
});

const cloneState = (state: MutableAlgorithmState): MutableAlgorithmState => ({
    greedyDecisions: state.greedyDecisions.map(item => ({ ...item })),
    dpTable: state.dpTable.map(row => [...row]),
    highlightedCell: state.highlightedCell ? { ...state.highlightedCell } : null,
    tableConfig: { ...state.tableConfig },
    graphVisitedNodes: [...state.graphVisitedNodes],
    graphDistances: { ...state.graphDistances },
    graphMstEdges: state.graphMstEdges.map(edge => ({ ...edge })),
    graphPathEdges: state.graphPathEdges.map(edge => ({ ...edge }))
});

const isRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === 'object' && value !== null && !Array.isArray(value);

const asCell = (value: unknown): { row: number; col: number } | null => {
    if (!isRecord(value)) return null;
    const row = typeof value.r === 'number' ? value.r
        : typeof value.row === 'number' ? value.row : null;
    const col = typeof value.c === 'number' ? value.c
        : typeof value.col === 'number' ? value.col : null;
    return row !== null && col !== null ? { row, col } : null;
};

const asNumberArray = (value: unknown): number[] | null => {
    if (!Array.isArray(value)) return null;
    return value.map(item => typeof item === 'number' ? item : Number(item) || 0);
};

const asStringArray = (value: unknown): string[] | null => {
    if (!Array.isArray(value)) return null;
    return value.filter((item): item is string => typeof item === 'string');
};

const asDistanceMap = (value: unknown): Record<string, number | null> | null => {
    if (!isRecord(value)) return null;
    const distances: Record<string, number | null> = {};
    for (const [node, distance] of Object.entries(value)) {
        if (distance === null) distances[node] = null;
        else if (typeof distance === 'number' && Number.isFinite(distance)) distances[node] = distance;
    }
    return distances;
};

const asGraphEdges = (value: unknown): GraphEdgeState[] | null => {
    if (!Array.isArray(value)) return null;
    return value.flatMap(item => {
        if (!isRecord(item) || typeof item.u !== 'string' || typeof item.v !== 'string') return [];
        return [{
            u: item.u,
            v: item.v,
            ...(typeof item.weight === 'number' && Number.isFinite(item.weight) ? { weight: item.weight } : {})
        }];
    });
};

const edgesFromPredecessors = (value: unknown): GraphEdgeState[] | null => {
    if (!isRecord(value)) return null;
    return Object.entries(value).flatMap(([node, parent]) =>
        typeof parent === 'string' ? [{ u: parent, v: node }] : []
    );
};

const applyStep = (state: MutableAlgorithmState, step: Step) => {
    const data = (step.data ?? {}) as Record<string, unknown>;

    // Graph state is cumulative: the current event often contains only the
    // changed edge/node, while the visualizer must retain the full structure.
    const visited = asStringArray(data.visited);
    if (visited) state.graphVisitedNodes = visited;

    const distances = asDistanceMap(data.distances);
    if (distances) state.graphDistances = distances;

    const mstEdges = asGraphEdges(data.mst_edges);
    if (mstEdges) state.graphMstEdges = mstEdges;

    const explicitPathEdges = asGraphEdges(data.path_edges);
    const predecessorEdges = edgesFromPredecessors(data.predecessors);
    if (explicitPathEdges) state.graphPathEdges = explicitPathEdges;
    else if (predecessorEdges) state.graphPathEdges = predecessorEdges;

    if (step.type === StepType.INIT) {
        if (typeof data.rows === 'number' && typeof data.cols === 'number') {
            const rows = Math.max(0, data.rows);
            const cols = Math.max(0, data.cols);
            state.tableConfig = { rows, cols };
            state.dpTable = Array.from({ length: rows }, () => Array<number>(cols).fill(0));

            const initialTable = Array.isArray(data.initial_table)
                ? data.initial_table.map(row => asNumberArray(row) ?? [])
                : null;
            if (initialTable) {
                state.dpTable = initialTable;
                state.tableConfig = {
                    rows: initialTable.length,
                    cols: Math.max(0, ...initialTable.map(row => row.length))
                };
            }

            const initialRow = asNumberArray(data.dp);
            if (initialRow && state.dpTable.length > 0) {
                state.dpTable[0] = initialRow;
            }
        }
        return;
    }

    if (step.type === StepType.HIGHLIGHT) {
        const cell = asCell(data.active_cell) ?? asCell(data.cell)
            ?? (typeof data.i === 'number' && typeof data.j === 'number'
                ? { row: data.i, col: data.j } : null);
        if (cell) state.highlightedCell = cell;
        return;
    }

    if (step.type === StepType.UPDATE) {
        const dpArray = asNumberArray(data.dp_array);
        if (dpArray) {
            if (state.dpTable.length === 0) state.dpTable = [[], []];
            if (state.dpTable.length === 1) state.dpTable.push([]);
            state.dpTable[1] = dpArray;
            state.tableConfig = { rows: 2, cols: dpArray.length };
            return;
        }

        const cell = asCell(data.cell) ?? (typeof data.i === 'number' && typeof data.j === 'number'
            ? { row: data.i, col: data.j } : null);
        if (cell && typeof data.value === 'number') {
            const { row, col } = cell;
            if (row >= 0 && col >= 0) {
                while (state.dpTable.length <= row) state.dpTable.push([]);
                while (state.dpTable[row].length <= col) state.dpTable[row].push(0);
                state.dpTable[row][col] = data.value;
                state.tableConfig = {
                    rows: Math.max(state.tableConfig.rows, state.dpTable.length),
                    cols: Math.max(state.tableConfig.cols, col + 1)
                };
                state.highlightedCell = cell;
            }
        }
        return;
    }

    if (step.type === StepType.PICK || step.type === StepType.REJECT) {
        const rawId = data.item_id ?? data.itemId ?? data.coin ?? -1;
        const itemId = typeof rawId === 'string' || typeof rawId === 'number' ? rawId : -1;
        const previousDecision = state.greedyDecisions[state.greedyDecisions.length - 1];
        const weight = Number(data.weight ?? 0);
        const value = Number(data.value ?? 0);
        const decision: GreedyDecision = {
            itemId,
            weight,
            value,
            ratio: Number(data.ratio ?? (weight > 0 ? value / weight : 0)),
            picked: step.type === StepType.PICK,
            currentTotal: Number(data.total_value ?? previousDecision?.currentTotal ?? 0),
            cumulativeWeight: Number(data.current_weight ?? previousDecision?.cumulativeWeight ?? 0),
            ...(typeof data.start === 'number' ? { start: data.start } : {}),
            ...(typeof data.end === 'number' ? { end: data.end } : {}),
            ...(typeof data.count === 'number' ? { count: data.count } : {}),
            ...(typeof data.remaining === 'number' ? { remaining: data.remaining } : {}),
            ...(typeof data.fraction === 'number' ? { fraction: data.fraction } : {})
        };
        state.greedyDecisions.push(decision);
    }
};

const getCheckpointInterval = (steps: Step[]): number => {
    const initStep = steps.find(step =>
        step.type === StepType.INIT
        && typeof step.data?.rows === 'number'
        && typeof step.data?.cols === 'number'
    );
    const rows = initStep && typeof initStep.data.rows === 'number' ? initStep.data.rows : 1;
    const cols = initStep && typeof initStep.data.cols === 'number' ? initStep.data.cols : 1;
    const tableCellCount = Math.max(1, rows * cols);
    const checkpointBudget = Math.max(2, Math.min(
        MAX_CHECKPOINTS,
        Math.floor(SNAPSHOT_CELL_BUDGET / tableCellCount)
    ));
    return Math.max(64, Math.ceil(Math.max(1, steps.length) / checkpointBudget));
};

export const useAlgorithmState = (steps: Step[], currentStepIndex: number): AlgorithmState => {
    // Build immutable checkpoints once per timeline; each render then replays only
    // the short tail from the nearest checkpoint to the requested step.
    const checkpoints = useMemo(() => {
        const interval = getCheckpointInterval(steps);
        const state = emptyState();
        const result: StateCheckpoint[] = [{ index: -1, state: cloneState(state) }];

        for (let index = 0; index < steps.length; index++) {
            applyStep(state, steps[index]);
            if ((index + 1) % interval === 0) {
                result.push({ index, state: cloneState(state) });
            }
        }
        return result;
    }, [steps]);

    const targetIndex = Math.min(currentStepIndex, steps.length - 1);
    return useMemo(() => {
        if (targetIndex < 0 || steps.length === 0) return emptyState();

        let checkpoint = checkpoints[0];
        for (const candidate of checkpoints) {
            if (candidate.index <= targetIndex && candidate.index > checkpoint.index) {
                checkpoint = candidate;
            }
        }

        const state = cloneState(checkpoint.state);
        for (let index = checkpoint.index + 1; index <= targetIndex; index++) {
            applyStep(state, steps[index]);
        }
        return state;
    }, [steps, targetIndex, checkpoints]);
};