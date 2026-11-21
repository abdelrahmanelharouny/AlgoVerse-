import { useMemo } from 'react';
import { StepType } from '../types';
import type { Step, GreedyDecision } from '../types';

export interface AlgorithmState {
    greedyDecisions: GreedyDecision[];
    dpTable: number[][];
    highlightedCell: { row: number; col: number } | null;
    tableConfig: { rows: number; cols: number };
}

type MutableAlgorithmState = AlgorithmState;
type StateCheckpoint = { index: number; state: MutableAlgorithmState };

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

const asNumberArray = (value: unknown): number[] | null => {
    if (!Array.isArray(value)) return null;
    return value.map(item => typeof item === 'number' ? item : Number(item) || 0);
};

const applyStep = (state: MutableAlgorithmState, step: Step) => {
    const data = (step.data ?? {}) as Record<string, unknown>;

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
        const decision: GreedyDecision = {
            itemId,
            weight: Number(data.weight ?? data.current_weight ?? 0),
            value: Number(data.value ?? data.total_value ?? 0),
            ratio: Number(data.ratio ?? 0),
            picked: step.type === StepType.PICK,
            currentTotal: Number(data.total_value ?? data.current_weight ?? 0)
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
