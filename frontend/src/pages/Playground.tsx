import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Play, Sparkles, BarChart3, Coins, Package, Pause, RotateCcw, Trophy } from 'lucide-react';
import { api } from '../utils/api';
import { AlgorithmType } from '../types';
import type { AlgorithmResult, KnapsackItem } from '../types';
import KnapsackInputBuilder from '../components/KnapsackInputBuilder';
import CoinChangeInputBuilder from '../components/CoinChangeInputBuilder';
import PerformanceComparison from '../components/PerformanceComparison';
import SplitScreenVisualizer from '../components/SplitScreenVisualizer';
import { useAlgorithmState } from '../hooks/useAlgorithmState';
import DPTableCanvas from '../components/DPTableCanvas';
import GreedyChainCanvas from '../components/GreedyChainCanvas';
import AlgorithmRacing from '../components/AlgorithmRacing';
import InputPresets from '../components/InputPresets';

// Helper component for single run visualization
const SingleRunVisualizer = ({ result, type }: { result: AlgorithmResult, type: 'greedy' | 'dp' }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const state = useAlgorithmState(result.steps, currentStep);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        if (isPlaying && currentStep < result.steps.length - 1) {
            timerRef.current = setTimeout(() => setCurrentStep(p => p + 1), 500);
        } else if (currentStep >= result.steps.length - 1) {
            setIsPlaying(false);
        }
        return () => { if (timerRef.current) clearTimeout(timerRef.current); };
    }, [isPlaying, currentStep, result.steps.length]);

    return (
        <div className="relative h-full w-full">
            {type === 'greedy' ? (
                <GreedyChainCanvas decisions={state.greedyDecisions} currentIndex={state.greedyDecisions.length - 1} />
            ) : (
                <DPTableCanvas data={state.dpTable} highlightedCell={state.highlightedCell} />
            )}

            <div className="absolute bottom-2 right-2 flex gap-2">
                <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="p-2 bg-slate-800/80 hover:bg-slate-700 rounded-full text-white backdrop-blur"
                >
                    {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                </button>
                <button
                    onClick={() => { setIsPlaying(false); setCurrentStep(0); }}
                    className="p-2 bg-slate-800/80 hover:bg-slate-700 rounded-full text-white backdrop-blur"
                >
                    <RotateCcw size={16} />
                </button>
            </div>
            <div className="absolute top-2 left-2 px-2 py-1 bg-slate-900/80 rounded text-xs text-slate-300 backdrop-blur">
                Step {currentStep + 1}/{result.steps.length}
            </div>
        </div>
    );
};

type PlaygroundAlgorithm = 'knapsack' | 'coin-change';

const Playground = () => {
    const [selectedAlgorithm, setSelectedAlgorithm] = useState<PlaygroundAlgorithm>('knapsack');

    // Knapsack State
    const [items, setItems] = useState<KnapsackItem[]>([]);
    const [capacity, setCapacity] = useState(50);

    // Coin Change State
    const [coins, setCoins] = useState<number[]>([]);
    const [amount, setAmount] = useState(0);

    const [greedyResult, setGreedyResult] = useState<AlgorithmResult | null>(null);
    const [dpResult, setDpResult] = useState<AlgorithmResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [mode, setMode] = useState<'build' | 'compare' | 'race'>('build');

    const handleKnapsackChange = (newItems: KnapsackItem[], newCapacity: number) => {
        setItems(newItems);
        setCapacity(newCapacity);
        resetResults();
    };

    const handleCoinChange = (newCoins: number[], newAmount: number) => {
        setCoins(newCoins);
        setAmount(newAmount);
        resetResults();
    };

    const resetResults = () => {
        setGreedyResult(null);
        setDpResult(null);
    };

    // Handle preset selection
    const handlePresetSelect = (data: any) => {
        if (selectedAlgorithm === 'knapsack' && data.items && data.capacity !== undefined) {
            setItems(data.items);
            setCapacity(data.capacity);
            resetResults();
        } else if (selectedAlgorithm === 'coin-change' && data.coins && data.amount !== undefined) {
            setCoins(data.coins);
            setAmount(data.amount);
            resetResults();
        }
    };

    const getAlgorithmType = (method: 'greedy' | 'dp') => {
        if (selectedAlgorithm === 'knapsack') {
            return method === 'greedy' ? AlgorithmType.GREEDY : AlgorithmType.DP;
        } else {
            // Assuming backend supports these types for coin change
            return method === 'greedy' ? AlgorithmType.COIN_CHANGE_GREEDY : AlgorithmType.COIN_CHANGE_DP;
        }
    };



    const runAlgorithm = async (method: 'greedy' | 'dp') => {
        setLoading(true);
        try {
            const type = getAlgorithmType(method);
            let result;

            if (selectedAlgorithm === 'knapsack') {
                const input = {
                    capacity,
                    items: items.map(item => ({
                        id: item.id,
                        weight: item.weight,
                        value: item.value
                    }))
                };
                result = await api.solveKnapsack(type, input);
            } else {
                const input = { amount, coins };
                result = await api.solveCoinChange(type, input);
            }

            if (method === 'greedy') setGreedyResult(result);
            else setDpResult(result);
        } catch (error) {
            console.error(`${method} failed:`, error);
        } finally {
            setLoading(false);
        }
    };

    const runComparison = async () => {
        setLoading(true);
        setMode('compare');
        try {
            let greedy, dp;

            if (selectedAlgorithm === 'knapsack') {
                const input = {
                    capacity,
                    items: items.map(item => ({
                        id: item.id,
                        weight: item.weight,
                        value: item.value
                    }))
                };
                [greedy, dp] = await Promise.all([
                    api.solveKnapsack(getAlgorithmType('greedy'), input),
                    api.solveKnapsack(getAlgorithmType('dp'), input)
                ]);
            } else {
                const input = { amount, coins };
                [greedy, dp] = await Promise.all([
                    api.solveCoinChange(getAlgorithmType('greedy'), input),
                    api.solveCoinChange(getAlgorithmType('dp'), input)
                ]);
            }

            setGreedyResult(greedy);
            setDpResult(dp);
        } catch (error) {
            console.error('Comparison failed:', error);
        } finally {
            setLoading(false);
        }
    };

    const comparisonResults = greedyResult && dpResult ? {
        greedy: {
            result: greedyResult.result_value || 0,
            time: selectedAlgorithm === 'knapsack' ? 'O(n log n)' : 'O(n log n)',
            space: selectedAlgorithm === 'knapsack' ? 'O(1)' : 'O(1)',
            steps: greedyResult.steps.length
        },
        dp: {
            result: dpResult.result_value || 0,
            time: selectedAlgorithm === 'knapsack' ? 'O(n × W)' : 'O(A × C)',
            space: selectedAlgorithm === 'knapsack' ? 'O(n × W)' : 'O(A)',
            steps: dpResult.steps.length
        }
    } : null;

    const hasInput = selectedAlgorithm === 'knapsack' ? items.length > 0 : coins.length > 0;

    return (
        <div className="max-w-7xl mx-auto px-4 py-12">
            {/* Header */}
            <motion.div
                className="mb-12"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <h1 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
                    Algorithm Playground
                </h1>
                <p className="text-xl text-slate-400 mb-8">
                    Build custom inputs and compare algorithm performance
                </p>

                {/* Algorithm Selector */}
                <div className="flex gap-4">
                    <button
                        onClick={() => { setSelectedAlgorithm('knapsack'); resetResults(); }}
                        className={`px-4 py-2 rounded-lg border transition-all flex items-center gap-2 ${selectedAlgorithm === 'knapsack'
                            ? 'bg-purple-600/20 border-purple-500 text-purple-300'
                            : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-600'
                            }`}
                    >
                        <Package size={18} />
                        Knapsack
                    </button>
                    <button
                        onClick={() => { setSelectedAlgorithm('coin-change'); resetResults(); }}
                        className={`px-4 py-2 rounded-lg border transition-all flex items-center gap-2 ${selectedAlgorithm === 'coin-change'
                            ? 'bg-yellow-600/20 border-yellow-500 text-yellow-300'
                            : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-600'
                            }`}
                    >
                        <Coins size={18} />
                        Coin Change
                    </button>
                </div>
            </motion.div>

            {/* Mode Tabs */}
            <div className="flex gap-3 mb-8">
                <button
                    onClick={() => setMode('build')}
                    className={`px-6 py-3 rounded-lg font-semibold transition-all ${mode === 'build'
                        ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        }`}
                >
                    <div className="flex items-center gap-2">
                        <Sparkles size={20} />
                        <span>Build Input</span>
                    </div>
                </button>
                <button
                    onClick={() => setMode('compare')}
                    className={`px-6 py-3 rounded-lg font-semibold transition-all ${mode === 'compare'
                        ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        }`}
                >
                    <div className="flex items-center gap-2">
                        <BarChart3 size={20} />
                        <span>Compare Results</span>
                    </div>
                </button>
                <button
                    onClick={() => setMode('race')}
                    className={`px-6 py-3 rounded-lg font-semibold transition-all ${mode === 'race'
                        ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg shadow-yellow-500/30'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        }`}
                >
                    <div className="flex items-center gap-2">
                        <Trophy size={20} />
                        <span>🏁 Algorithm Racing</span>
                    </div>
                </button>
            </div>

            {/* Race Mode - Full width */}
            {mode === 'race' && (
                <div className="mt-8">
                    <AlgorithmRacing />
                </div>
            )}

            {/* Build/Compare Content */}
            {mode !== 'race' && (
                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Left: Input Builder */}
                    <div className="lg:col-span-1">
                        <motion.div
                            key={selectedAlgorithm}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            {selectedAlgorithm === 'knapsack' ? (
                                <KnapsackInputBuilder onInputChange={handleKnapsackChange} />
                            ) : (
                                <CoinChangeInputBuilder onInputChange={handleCoinChange} />
                            )}

                            {/* Presets */}
                            <div className="mt-4">
                                <InputPresets
                                    algorithmType={selectedAlgorithm}
                                    onSelectPreset={handlePresetSelect}
                                />
                            </div>
                        </motion.div>

                        {/* Action Buttons */}
                        <div className="mt-6 space-y-3">
                            <button
                                onClick={() => runAlgorithm('greedy')}
                                disabled={loading || !hasInput}
                                className="w-full px-6 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-semibold rounded-lg shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-2"
                            >
                                <Play size={20} />
                                Run Greedy
                            </button>

                            <button
                                onClick={() => runAlgorithm('dp')}
                                disabled={loading || !hasInput}
                                className="w-full px-6 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-semibold rounded-lg shadow-lg shadow-indigo-500/25 transition-all flex items-center justify-center gap-2"
                            >
                                <Play size={20} />
                                Run DP
                            </button>

                            <button
                                onClick={runComparison}
                                disabled={loading || !hasInput}
                                className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:from-slate-700 disabled:to-slate-700 disabled:text-slate-500 text-white font-semibold rounded-lg shadow-lg shadow-purple-500/25 transition-all flex items-center justify-center gap-2"
                            >
                                <BarChart3 size={20} />
                                Compare Both
                            </button>
                        </div>
                    </div>

                    {/* Right: Results */}
                    <div className="lg:col-span-2 space-y-6">
                        {mode === 'build' && (
                            <>
                                {/* Visualization Preview */}
                                {(greedyResult || dpResult) && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="space-y-4"
                                    >
                                        <h3 className="text-2xl font-bold text-white">Visualization</h3>

                                        {greedyResult && (
                                            <div className="bg-slate-900 border border-emerald-500/30 rounded-xl p-4 space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-8 h-8 bg-emerald-600/20 rounded-lg flex items-center justify-center">
                                                            <Sparkles className="text-emerald-400" size={16} />
                                                        </div>
                                                        <span className="font-semibold text-emerald-400">Greedy Result: {greedyResult.result_value}</span>
                                                    </div>
                                                    <div className="text-sm text-slate-400">
                                                        {greedyResult.steps.length} steps
                                                    </div>
                                                </div>

                                                {/* Single Run Visualization */}
                                                <div className="h-[300px] relative overflow-hidden rounded-lg bg-slate-950/50">
                                                    <SingleRunVisualizer result={greedyResult} type="greedy" />
                                                </div>
                                            </div>
                                        )}

                                        {dpResult && (
                                            <div className="bg-slate-900 border border-indigo-500/30 rounded-xl p-4 space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-8 h-8 bg-indigo-600/20 rounded-lg flex items-center justify-center">
                                                            <Sparkles className="text-indigo-400" size={16} />
                                                        </div>
                                                        <span className="font-semibold text-indigo-400">DP Result: {dpResult.result_value}</span>
                                                    </div>
                                                    <div className="text-sm text-slate-400">
                                                        {dpResult.steps.length} steps
                                                    </div>
                                                </div>

                                                {/* Single Run Visualization */}
                                                <div className="h-[300px] relative overflow-hidden rounded-lg bg-slate-950/50">
                                                    <SingleRunVisualizer result={dpResult} type="dp" />
                                                </div>
                                            </div>
                                        )}
                                    </motion.div>
                                )}

                                {/* Empty State */}
                                {!greedyResult && !dpResult && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="bg-slate-900/50 border border-slate-800 rounded-xl p-12 text-center"
                                    >
                                        <Sparkles className="mx-auto mb-4 text-slate-600" size={48} />
                                        <h3 className="text-xl font-semibold text-slate-400 mb-2">
                                            Ready to Experiment!
                                        </h3>
                                        <p className="text-slate-500">
                                            Build your input on the left and run an algorithm to see results here
                                        </p>
                                    </motion.div>
                                )}
                            </>
                        )}

                        {mode === 'compare' && (
                            <>
                                {comparisonResults && greedyResult && dpResult ? (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="space-y-8"
                                    >
                                        <h3 className="text-2xl font-bold text-white">Performance Comparison</h3>

                                        {/* Visual Comparison */}
                                        <SplitScreenVisualizer
                                            greedyResult={greedyResult}
                                            dpResult={dpResult}
                                        />

                                        {/* Metrics Comparison */}
                                        <PerformanceComparison results={comparisonResults} />
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="bg-slate-900/50 border border-slate-800 rounded-xl p-12 text-center"
                                    >
                                        <BarChart3 className="mx-auto mb-4 text-slate-600" size={48} />
                                        <h3 className="text-xl font-semibold text-slate-400 mb-2">
                                            No Comparison Yet
                                        </h3>
                                        <p className="text-slate-500 mb-4">
                                            Click "Compare Both" to run Greedy and DP side-by-side
                                        </p>
                                        <button
                                            onClick={runComparison}
                                            disabled={loading || !hasInput}
                                            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:from-slate-700 disabled:to-slate-700 disabled:text-slate-500 text-white font-semibold rounded-lg shadow-lg shadow-purple-500/25 transition-all inline-flex items-center gap-2"
                                        >
                                            <BarChart3 size={20} />
                                            Compare Algorithms
                                        </button>
                                    </motion.div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Playground;
