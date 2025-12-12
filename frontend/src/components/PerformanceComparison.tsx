import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Target, Zap, Clock, Database } from 'lucide-react';

interface ComparisonResult {
    greedy: {
        result: number;
        time: string;
        space: string;
        steps: number;
    };
    dp: {
        result: number;
        time: string;
        space: string;
        steps: number;
    };
}

interface PerformanceComparisonProps {
    results: ComparisonResult;
}

export const PerformanceComparison: React.FC<PerformanceComparisonProps> = ({ results }) => {
    const greedyOptimal = results.greedy.result === results.dp.result;
    const winner = results.dp.result >= results.greedy.result ? 'dp' : 'greedy';
    const difference = Math.abs(results.dp.result - results.greedy.result);
    const percentOff = results.dp.result > 0
        ? ((difference / results.dp.result) * 100).toFixed(1)
        : '0';

    return (
        <div className="space-y-6">
            {/* Winner Banner */}
            {!greedyOptimal && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`bg-gradient-to-r ${winner === 'dp'
                            ? 'from-indigo-600/20 to-purple-600/20 border-indigo-500/30'
                            : 'from-emerald-600/20 to-green-600/20 border-emerald-500/30'
                        } border rounded-xl p-4`}
                >
                    <div className="flex items-center gap-3">
                        <Target className={winner === 'dp' ? 'text-indigo-400' : 'text-emerald-400'} size={24} />
                        <div>
                            <div className="font-semibold text-white">
                                {winner === 'dp' ? 'Dynamic Programming' : 'Greedy'} Found Better Solution
                            </div>
                            <div className="text-sm text-slate-300">
                                {difference} units better ({percentOff}% improvement)
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}

            {greedyOptimal && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-r from-emerald-600/20 to-indigo-600/20 border border-emerald-500/30 rounded-xl p-4"
                >
                    <div className="flex items-center gap-3">
                        <TrendingUp className="text-emerald-400" size={24} />
                        <div>
                            <div className="font-semibold text-white">Both Algorithms Optimal!</div>
                            <div className="text-sm text-slate-300">
                                Greedy found the optimal solution - much faster than DP
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Comparison Grid */}
            <div className="grid md:grid-cols-2 gap-6">
                {/* Greedy Results */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`bg-slate-900 border-2 ${greedyOptimal
                            ? 'border-emerald-500/50'
                            : winner === 'greedy'
                                ? 'border-yellow-500/50'
                                : 'border-slate-700'
                        } rounded-xl p-6`}
                >
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-12 bg-emerald-600/20 rounded-lg flex items-center justify-center">
                            <Zap className="text-emerald-400" size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-emerald-400">Greedy Approach</h3>
                            <p className="text-sm text-slate-400">Fast heuristic</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {/* Result Value */}
                        <div className="bg-slate-950 rounded-lg p-4">
                            <div className="text-sm text-slate-400 mb-1">Result Value</div>
                            <div className="text-4xl font-bold text-white">{results.greedy.result}</div>
                            {!greedyOptimal && winner !== 'greedy' && (
                                <div className="flex items-center gap-1 mt-2 text-red-400 text-sm">
                                    <TrendingDown size={16} />
                                    <span>{difference} below optimal</span>
                                </div>
                            )}
                            {greedyOptimal && (
                                <div className="flex items-center gap-1 mt-2 text-emerald-400 text-sm">
                                    <Target size={16} />
                                    <span>Optimal solution!</span>
                                </div>
                            )}
                        </div>

                        {/* Metrics */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-slate-950 rounded-lg p-3">
                                <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                                    <Clock size={14} />
                                    <span>Time</span>
                                </div>
                                <div className="font-mono text-emerald-300 text-sm">{results.greedy.time}</div>
                            </div>
                            <div className="bg-slate-950 rounded-lg p-3">
                                <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                                    <Database size={14} />
                                    <span>Space</span>
                                </div>
                                <div className="font-mono text-emerald-300 text-sm">{results.greedy.space}</div>
                            </div>
                        </div>

                        {/* Steps */}
                        <div className="bg-emerald-900/20 border border-emerald-500/30 rounded-lg p-3">
                            <div className="text-sm text-emerald-400 mb-1">Total Steps</div>
                            <div className="text-2xl font-bold text-white">{results.greedy.steps}</div>
                        </div>
                    </div>
                </motion.div>

                {/* DP Results */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`bg-slate-900 border-2 ${winner === 'dp' && !greedyOptimal
                            ? 'border-indigo-500/50'
                            : 'border-slate-700'
                        } rounded-xl p-6`}
                >
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-12 bg-indigo-600/20 rounded-lg flex items-center justify-center">
                            <Target className="text-indigo-400" size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-indigo-400">Dynamic Programming</h3>
                            <p className="text-sm text-slate-400">Guaranteed optimal</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {/* Result Value */}
                        <div className="bg-slate-950 rounded-lg p-4">
                            <div className="text-sm text-slate-400 mb-1">Result Value</div>
                            <div className="text-4xl font-bold text-white">{results.dp.result}</div>
                            <div className="flex items-center gap-1 mt-2 text-indigo-400 text-sm">
                                <Target size={16} />
                                <span>Optimal solution</span>
                            </div>
                        </div>

                        {/* Metrics */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-slate-950 rounded-lg p-3">
                                <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                                    <Clock size={14} />
                                    <span>Time</span>
                                </div>
                                <div className="font-mono text-indigo-300 text-sm">{results.dp.time}</div>
                            </div>
                            <div className="bg-slate-950 rounded-lg p-3">
                                <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                                    <Database size={14} />
                                    <span>Space</span>
                                </div>
                                <div className="font-mono text-indigo-300 text-sm">{results.dp.space}</div>
                            </div>
                        </div>

                        {/* Steps */}
                        <div className="bg-indigo-900/20 border border-indigo-500/30 rounded-lg p-3">
                            <div className="text-sm text-indigo-400 mb-1">Total Steps</div>
                            <div className="text-2xl font-bold text-white">{results.dp.steps}</div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default PerformanceComparison;
