import { useMemo } from 'react';
import { StepType } from '../types';
import type { Step, GreedyDecision } from '../types';

export interface AlgorithmState {
    greedyDecisions: GreedyDecision[];
    dpTable: number[][];
    highlightedCell: { row: number; col: number } | null;
    tableConfig: { rows: number; cols: number };
}

export const useAlgorithmState = (steps: Step[], currentStepIndex: number): AlgorithmState => {
    return useMemo(() => {
        let greedyDecisions: GreedyDecision[] = [];
        let dpTable: number[][] = [];
        let highlightedCell: { row: number; col: number } | null = null;
        let tableConfig = { rows: 0, cols: 0 };

        // Replay steps up to current index
        for (let i = 0; i <= currentStepIndex && i < steps.length; i++) {
            const step = steps[i];

            switch (step.type) {
                case StepType.INIT:
                    if (step.data.rows && step.data.cols) {
                        tableConfig = { rows: step.data.rows, cols: step.data.cols };
                        dpTable = Array(step.data.rows).fill(0).map(() => Array(step.data.cols).fill(0));
                    }
                    break;

                case StepType.UPDATE:
                    if (dpTable.length > 0) {
                        const { i: row, j: col, value } = step.data;
                        // Create deep copy for immutability during replay (though strictly not needed inside loop if we don't expose intermediate states)
                        // For performance in a loop, we can mutate the local dpTable since it's fresh for this memo execution
                        if (dpTable[row]) dpTable[row][col] = value;
                        highlightedCell = { row, col };
                    }
                    break;

                case StepType.HIGHLIGHT:
                    highlightedCell = { row: step.data.i, col: step.data.j };
                    break;

                case StepType.PICK:
                case StepType.REJECT:
                    const decision: GreedyDecision = {
                        itemId: step.data.item_id,
                        weight: step.data.weight || 0,
                        value: step.data.value || 0,
                        ratio: step.data.ratio || 0,
                        picked: step.type === StepType.PICK,
                        currentTotal: step.data.total_value || 0
                    };
                    greedyDecisions.push(decision);
                    break;
            }
        }

        return { greedyDecisions, dpTable, highlightedCell, tableConfig };
    }, [steps, currentStepIndex]);
};
