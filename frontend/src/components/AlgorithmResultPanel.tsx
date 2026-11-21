import React from 'react';
import { ChevronDown, Clock3, Layers3, Target } from 'lucide-react';
import type { AlgorithmResult } from '../types';

interface AlgorithmResultPanelProps {
    result: AlgorithmResult | null;
    algorithmName: string;
}

const titleCase = (value: string) =>
    value.replaceAll('-', ' ').replaceAll('_', ' ').replace(/\b\w/g, character => character.toUpperCase());

const AlgorithmResultPanel: React.FC<AlgorithmResultPanelProps> = ({ result, algorithmName }) => {
    if (!result) return null;

    const detail = result.result_data ?? {};
    const entries = Object.entries(detail).filter(([, value]) => value !== undefined && value !== null);

    return (
        <section className="mx-6 mb-6 overflow-hidden rounded-xl border border-emerald-500/20 bg-slate-900/95 shadow-lg">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 px-4 py-3">
                <div>
                    <div className="flex items-center gap-2 text-sm font-semibold text-white">
                        <Target size={16} className="text-emerald-400" />
                        Final result
                    </div>
                    <p className="mt-1 text-[11px] text-slate-500">{titleCase(algorithmName)} · computed output</p>
                </div>
                <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-right">
                    <span className="block text-[10px] uppercase tracking-wider text-emerald-300/70">Reported value</span>
                    <strong className="font-mono text-xl text-emerald-300">{String(result.result_value)}</strong>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-2 p-3 sm:grid-cols-4">
                <div className="rounded-lg bg-slate-950 px-3 py-2">
                    <span className="flex items-center gap-1 text-[10px] text-slate-500"><Layers3 size={12} /> Trace events</span>
                    <strong className="mt-1 block font-mono text-sm text-slate-200">{result.metrics.step_count}</strong>
                </div>
                <div className="rounded-lg bg-slate-950 px-3 py-2">
                    <span className="flex items-center gap-1 text-[10px] text-slate-500"><Clock3 size={12} /> Trace build</span>
                    <strong className="mt-1 block font-mono text-sm text-slate-200">{(result.metrics.time_taken * 1000).toFixed(2)} ms</strong>
                </div>
                <div className="rounded-lg bg-slate-950 px-3 py-2">
                    <span className="block text-[10px] text-slate-500">Time complexity</span>
                    <strong className="mt-1 block font-mono text-sm text-slate-200">{result.metrics.time_complexity}</strong>
                </div>
                <div className="rounded-lg bg-slate-950 px-3 py-2">
                    <span className="block text-[10px] text-slate-500">Space complexity</span>
                    <strong className="mt-1 block font-mono text-sm text-slate-200">{result.metrics.space_complexity}</strong>
                </div>
            </div>

            <div className="px-3 pb-3">
                <details className="group rounded-lg border border-slate-800 bg-slate-950">
                    <summary className="flex cursor-pointer list-none items-center justify-between px-3 py-2.5 text-xs font-medium text-slate-300">
                        Inspect algorithm-specific output
                        <ChevronDown size={14} className="text-slate-500 transition-transform group-open:rotate-180" />
                    </summary>
                    <div className="border-t border-slate-800 p-3">
                        {entries.length === 0 ? (
                            <p className="text-xs text-slate-500">No additional structured output was returned.</p>
                        ) : (
                            <dl className="grid gap-2 sm:grid-cols-2">
                                {entries.map(([key, value]) => (
                                    <div key={key} className="min-w-0 rounded-md bg-slate-900 px-3 py-2">
                                        <dt className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500">{titleCase(key)}</dt>
                                        <dd className="max-h-40 overflow-auto whitespace-pre-wrap break-words font-mono text-[11px] leading-relaxed text-slate-200">
                                            {typeof value === 'string' ? value : JSON.stringify(value, null, 2)}
                                        </dd>
                                    </div>
                                ))}
                            </dl>
                        )}
                    </div>
                </details>
                <p className="mt-2 text-[10px] leading-relaxed text-slate-500">
                    The displayed time includes algorithm execution and trace-event generation. Use the benchmark view for isolated runtime comparisons.
                </p>
            </div>
        </section>
    );
};

export default AlgorithmResultPanel;
