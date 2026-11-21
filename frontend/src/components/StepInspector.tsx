import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import type { Step } from '../types';

interface StepInspectorProps {
    step: Step | null;
    stepIndex: number;
    totalSteps: number;
    algorithmName: string;
}

const stepTone: Record<string, string> = {
    init: 'border-sky-500/30 bg-sky-500/10 text-sky-300',
    highlight: 'border-amber-500/30 bg-amber-500/10 text-amber-300',
    update: 'border-indigo-500/30 bg-indigo-500/10 text-indigo-300',
    pick: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
    reject: 'border-rose-500/30 bg-rose-500/10 text-rose-300',
    sort: 'border-violet-500/30 bg-violet-500/10 text-violet-300',
    solution: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
    info: 'border-slate-700 bg-slate-800/70 text-slate-300'
};

const explainStep = (step: Step, algorithmName: string): string => {
    const data = (step.data ?? {}) as Record<string, any>;
    switch (step.type) {
        case 'init':
            return 'The algorithm is preparing its data structures and establishing the starting state. Check the initial values before following the next decision.';
        case 'highlight':
            if (data.active_cell || data.cell || (data.i !== undefined && data.j !== undefined)) {
                return 'The highlighted cell is the current subproblem. Its value will be derived from previously computed states, not guessed independently.';
            }
            if (data.checking_neighbor !== undefined) {
                return 'The algorithm is examining a candidate edge. Compare its weight or cost with the best-known alternative before accepting an update.';
            }
            return 'This step focuses attention on the candidate currently being evaluated. Watch which state or edge changes next.';
        case 'update':
            if (data.action === 'include' || data.action === 'exclude' || data.action === 'skip') {
                return 'A DP transition has been committed. The action explains which recurrence branch won and which earlier state supplied the value.';
            }
            if (data.operation) {
                return 'The string transformation state has been updated using the selected edit operation. The highlighted cell records the minimum cost so far.';
            }
            return 'A state has changed because the candidate improved the previously recorded value. Compare the old and new values to understand why.';
        case 'pick':
            return 'The greedy or graph algorithm accepted this candidate. Confirm that it satisfies the selection rule and does not violate the problem constraints.';
        case 'reject':
            return 'The candidate was rejected. The reason is part of the algorithm: a local choice can be invalid, exceed a constraint, or create a cycle.';
        case 'sort':
            return 'The candidates are being ordered so the next selection follows the algorithm’s strategy. Pay attention to the sorting key.';
        case 'solution':
            return 'The algorithm has reconstructed or finalized its answer. Verify that the selected items, path, or sequence satisfies the original problem.';
        default:
            return `This is an explanatory event in the ${algorithmName || 'algorithm'} trace. Use the code and state panels to connect it to the implementation.`;
    }
};

const StepInspector: React.FC<StepInspectorProps> = ({ step, stepIndex, totalSteps, algorithmName }) => {
    const detailItems = useMemo(() => {
        if (!step?.data) return [];
        const ignored = new Set(['graph', 'distances', 'dp', 'dp_array', 'mst_edges', 'edges', 'path', 'path_edges', 'frequencies', 'codes', 'operations', 'nodes']);
        return Object.entries(step.data)
            .filter(([key, value]) => !ignored.has(key) && value !== null && ['string', 'number', 'boolean'].includes(typeof value))
            .slice(0, 5);
    }, [step]);

    if (!step) {
        return (
            <div className="mx-6 mb-5 rounded-xl border border-slate-800 bg-slate-900/70 px-4 py-3 text-sm text-slate-500">
                Press Play or Next Step to inspect the algorithm’s decisions.
            </div>
        );
    }

    const tone = stepTone[step.type] ?? stepTone.info;

    return (
        <motion.section
            key={stepIndex}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-6 mb-5 rounded-xl border border-slate-800 bg-slate-900/90 p-4 shadow-xl"
            aria-live="polite"
            aria-label={`Step ${stepIndex + 1} explanation`}
        >
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                    <span className={`rounded-md border px-2 py-1 text-[10px] font-bold uppercase tracking-wider ${tone}`}>
                        {step.type}
                    </span>
                    <span className="text-xs text-slate-500">
                        Step {stepIndex + 1} of {totalSteps}
                    </span>
                </div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                    Decision inspector
                </span>
            </div>
            <p className="text-sm font-semibold leading-relaxed text-slate-100">
                {step.description || 'Processing algorithm state…'}
            </p>
            <p className="mt-2 text-xs leading-relaxed text-slate-400">
                {explainStep(step, algorithmName)}
            </p>
            {detailItems.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                    {detailItems.map(([key, value]) => (
                        <span key={key} className="rounded-lg border border-slate-800 bg-slate-950 px-2.5 py-1 text-[11px] text-slate-400">
                            <span className="text-slate-500">{key.replaceAll('_', ' ')}:</span>{' '}
                            <strong className="font-mono font-medium text-slate-200">{String(value)}</strong>
                        </span>
                    ))}
                </div>
            )}
        </motion.section>
    );
};

export default StepInspector;
