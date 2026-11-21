import { useMemo, useRef } from 'react';
import { StepType } from '../types';
import type { Step, GreedyDecision } from '../types';

export interface AlgorithmState {
    greedyDecisions: GreedyDecision[];
    dpTable: number[][];
    highlightedCell: { row: number; col: number } | null;
    tableConfig: { rows: number; cols: number };
}

interface MutableAlgorithmState extends AlgorithmState {}
interface Checkpoint { index: number; state: MutableAlgorithmState; }

const MAX_CHECKPOINTS = 64;
const SNAPSHOT_CELL_BUDGET = 250_000;

const emptyState = (): MutableAlgorithmState => ({
    greedyDecisions: [],
    dpTable: [],
    highlightedCell: null,
    tableConfig: { rows: 0, cols: 0 }
});

const cloneState = (state: MutableAlgorithmState): MutableAlgorithmState => ({
    greedyDecisions: state.greedyDecisions.map(item => ({ ...item })),
    dpTable: state.dpTable.map(row => [...row]),
    highlightedCell: state.highlightedCell ? { ...state.highlightedCell } : null,
    tableConfig: { ...state.tableConfig }
});

const asCell = (value: unknown): { row: number; col: number } | null => {
    if (!value || typeof value !== 'object') return null;
    const candidate = value as Record<string, unknown>;
    const row = typeof candidate.r === 'number' ? candidate.r
        : typeof candidate.row === 'number' ? candidate.row : null;
    const col = typeof candidate.c === 'number' ? candidate.c
        : typeof candidate.col === 'number' ? candidate.col : null;
    return row !== null && col !== null ? { row, col } : null;
};

const applyStep = (state: MutableAlgorithmState, step: Step) => {
    const data = (step.data ?? {}) as Record<string, any>;

    if (step.type === StepType.INIT) {
        if (typeof data.rows === 'number' && typeof data.cols === 'number') {
            const rows = Math.max(0, data.rows);
            const cols = Math.max(0, data.cols);
            state.tableConfig = { rows, cols };
            state.dpTable = Array.from({ length: rows }, () => Array<number>(cols).fill(0));
            if (Array.isArray(data.initial_table)) {
                state.dpTable = data.initial_table.map((row: unknown[]) => row.map(value => Number(value) || 0));
                state.tableConfig = { rows: state.dpTable.length, cols: Math.max(0, ...state.dpTable.map(row => row.length)) };
            }

            // Some one-dimensional DP algorithms expose their initial row.
            if (Array.isArray(data.dp) && state.dpTable.length > 0) {
                state.dpTable[0] = [...data.dp];
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
        // 1-D DP implementations publish a full row snapshot for efficient replay.
        if (Array.isArray(data.dp_array)) {
            if (state.dpTable.length === 0) state.dpTable = [[], []];
            if (state.dpTable.length === 1) state.dpTable.push([]);
            state.dpTable[1] = [...data.dp_array];
            state.tableConfig = { rows: 2, cols: data.dp_array.length };
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
        const decision: GreedyDecision = {
            itemId: Number(data.item_id ?? data.itemId ?? data.coin ?? -1),
            weight: Number(data.weight ?? data.current_weight ?? 0),
            value: Number(data.value ?? data.total_value ?? 0),
            ratio: Number(data.ratio ?? 0),
            picked: step.type === StepType.PICK,
            currentTotal: Number(data.total_value ?? data.current_weight ?? 0)
        };
        state.greedyDecisions.push(decision);
    }
};

export const useAlgorithmState = (steps: Step[], currentStepIndex: number): AlgorithmState => {
    const cacheRef = useRef<{ source: Step[]; index: number; state: MutableAlgorithmState; checkpoints: Map<number, MutableAlgorithmState> } | null>(null);

    return useMemo(() => {
        let cache = cacheRef.current;
        if (!cache || cache.source !== steps) {
            const initial = emptyState();
            cache = {
                source: steps,
                index: -1,
                state: initial,
                checkpoints: new Map<number, MutableAlgorithmState>([[-1, cloneState(initial)]])
            };
        }

        const targetIndex = Math.min(currentStepIndex, steps.length - 1);
        const initStep = steps.find(step => step.type === StepType.INIT && typeof step.data?.rows === 'number' && typeof step.data?.cols === 'number');
        const tableCellCount = initStep ? Math.max(1, initStep.data.rows * initStep.data.cols) : 1;
        const checkpointBudget = Math.max(2, Math.min(MAX_CHECKPOINTS, Math.floor(SNAPSHOT_CELL_BUDGET / tableCellCount)));
        const checkpointInterval = Math.max(64, Math.ceil(Math.max(1, steps.length) / checkpointBudget));
        if (targetIndex < -1 || steps.length === 0) {
            cache.index = -1;
            cache.state = emptyState();
        } else if (targetIndex >= cache.index) {
            // Normal playback: apply only the newly reached events.
            for (let index = cache.index + 1; index <= targetIndex; index++) {
                applyStep(cache.state, steps[index]);
                if ((index + 1) % checkpointInterval === 0) {
                    cache.checkpoints.set(index, cloneState(cache.state));
                }
            }
            cache.index = targetIndex;
        } else {
            // Reverse seeking: restore the nearest checkpoint, then replay a short tail.
            let checkpointIndex = -1;
            for (const index of cache.checkpoints.keys()) {
                if (index <= targetIndex && index > checkpointIndex) checkpointIndex = index;
            }
            const snapshot = cache.checkpoints.get(checkpointIndex) ?? emptyState();
            cache.state = cloneState(snapshot);
            for (let index = checkpointIndex + 1; index <= targetIndex; index++) {
                applyStep(cache.state, steps[index]);
            }
            cache.index = targetIndex;
        }

        cacheRef.current = cache;
        return cloneState(cache.state);
    }, [steps, currentStepIndex]);
};
