import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, RotateCw, Trophy, Zap, Timer, Target, ChevronDown } from 'lucide-react';

interface RaceResult {
    algorithm: string;
    time: number;
    steps: number;
    result: number;
    winner: boolean;
}

interface RaceScenario {
    id: string;
    name: string;
    description: string;
    algorithms: [string, string];
    inputGenerator: () => any;
}

const scenarios: RaceScenario[] = [
    {
        id: 'knapsack',
        name: 'Knapsack: Greedy vs DP',
        description: "Watch Greedy's speed vs DP's precision. Greedy is fast but often wrong!",
        algorithms: ['Greedy (by ratio)', 'Dynamic Programming'],
        inputGenerator: () => ({
            capacity: 50,
            items: Array.from({ length: 8 }, (_, i) => ({
                id: i + 1,
                weight: Math.floor(Math.random() * 20) + 5,
                value: Math.floor(Math.random() * 100) + 10
            }))
        })
    },
    {
        id: 'coin-change',
        name: 'Coin Change: Greedy vs DP',
        description: 'Greedy takes largest coins first. Sometimes optimal, sometimes terrible!',
        algorithms: ['Greedy (largest first)', 'Dynamic Programming'],
        inputGenerator: () => ({
            coins: [1, 3, 4, 5, 7, 10, 25],
            target: Math.floor(Math.random() * 50) + 20
        })
    },
    {
        id: 'scheduling',
        name: 'Interval Scheduling: Both Optimal!',
        description: 'A rare case where Greedy IS optimal. Watch them tie!',
        algorithms: ['Greedy (earliest end)', 'Dynamic Programming'],
        inputGenerator: () => ({
            intervals: Array.from({ length: 10 }, (_, i) => {
                const start = Math.floor(Math.random() * 20);
                return { id: i, start, end: start + Math.floor(Math.random() * 5) + 1 };
            })
        })
    }
];

// Simulate algorithm execution
const simulateRace = async (
    scenario: RaceScenario,
    _input: any,
    onProgress: (algo: number, progress: number) => void
): Promise<RaceResult[]> => {
    return new Promise((resolve) => {
        const results: RaceResult[] = [];
        let algo1Progress = 0;
        let algo2Progress = 0;

        // Greedy is faster but may not be optimal
        const greedySpeed = 50 + Math.random() * 30; // 50-80ms per step
        const dpSpeed = 100 + Math.random() * 50; // 100-150ms per step

        const greedySteps = Math.floor(Math.random() * 5) + 3;
        const dpSteps = Math.floor(Math.random() * 15) + 10;

        // Simulate greedy
        const greedyInterval = setInterval(() => {
            algo1Progress += 100 / greedySteps;
            onProgress(0, Math.min(algo1Progress, 100));
            if (algo1Progress >= 100) {
                clearInterval(greedyInterval);
                // Greedy often gets suboptimal result
                const optimalResult = 100 + Math.floor(Math.random() * 50);
                const greedyResult = Math.random() > 0.3 ?
                    Math.floor(optimalResult * (0.7 + Math.random() * 0.25)) :
                    optimalResult; // 30% chance of being optimal

                results.push({
                    algorithm: scenario.algorithms[0],
                    time: greedySteps * greedySpeed,
                    steps: greedySteps,
                    result: greedyResult,
                    winner: false
                });
                checkComplete();
            }
        }, greedySpeed);

        // Simulate DP
        const dpInterval = setInterval(() => {
            algo2Progress += 100 / dpSteps;
            onProgress(1, Math.min(algo2Progress, 100));
            if (algo2Progress >= 100) {
                clearInterval(dpInterval);
                const optimalResult = 100 + Math.floor(Math.random() * 50);

                results.push({
                    algorithm: scenario.algorithms[1],
                    time: dpSteps * dpSpeed,
                    steps: dpSteps,
                    result: optimalResult,
                    winner: false
                });
                checkComplete();
            }
        }, dpSpeed);

        function checkComplete() {
            if (results.length === 2) {
                // Determine winner by result quality
                const maxResult = Math.max(results[0].result, results[1].result);
                results.forEach(r => {
                    r.winner = r.result === maxResult;
                });
                resolve(results);
            }
        }
    });
};

const AlgorithmRacing: React.FC = () => {
    const [selectedScenario, setSelectedScenario] = useState<RaceScenario>(scenarios[0]);
    const [isRacing, setIsRacing] = useState(false);
    const [progress, setProgress] = useState<[number, number]>([0, 0]);
    const [results, setResults] = useState<RaceResult[] | null>(null);
    const [countdown, setCountdown] = useState<number | null>(null);

    const startRace = async () => {
        setResults(null);
        setProgress([0, 0]);

        // Generate new input
        const newInput = selectedScenario.inputGenerator();

        // Countdown
        for (let i = 3; i > 0; i--) {
            setCountdown(i);
            await new Promise(r => setTimeout(r, 800));
        }
        setCountdown(null);

        // Start race
        setIsRacing(true);

        const raceResults = await simulateRace(
            selectedScenario,
            newInput,
            (algo, prog) => {
                setProgress(prev => {
                    const newProgress: [number, number] = [...prev];
                    newProgress[algo] = prog;
                    return newProgress;
                });
            }
        );

        setIsRacing(false);
        setResults(raceResults);
    };

    const resetRace = () => {
        setIsRacing(false);
        setResults(null);
        setProgress([0, 0]);
        setCountdown(null);
    };

    return (
        <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 p-6 border-b border-slate-800">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                            <Trophy className="text-yellow-400" />
                            Algorithm Racing
                        </h2>
                        <p className="text-slate-400 mt-1">Watch algorithms compete head-to-head!</p>
                    </div>

                    {/* Scenario Selector */}
                    <div className="relative">
                        <select
                            value={selectedScenario.id}
                            onChange={(e) => {
                                const scenario = scenarios.find(s => s.id === e.target.value);
                                if (scenario) {
                                    setSelectedScenario(scenario);
                                    resetRace();
                                }
                            }}
                            disabled={isRacing}
                            className="appearance-none bg-slate-800 text-white px-4 py-2 pr-10 rounded-lg border border-slate-700 focus:border-purple-500 focus:outline-none cursor-pointer disabled:opacity-50"
                        >
                            {scenarios.map(s => (
                                <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                    </div>
                </div>

                <p className="text-sm text-slate-300 mt-4 bg-slate-800/50 p-3 rounded-lg">
                    💡 {selectedScenario.description}
                </p>
            </div>

            {/* Race Track */}
            <div className="p-6 space-y-6">
                {/* Countdown */}
                <AnimatePresence>
                    {countdown !== null && (
                        <motion.div
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 1.5, opacity: 0 }}
                            className="absolute inset-0 flex items-center justify-center z-10 bg-black/50 backdrop-blur-sm"
                        >
                            <span className="text-8xl font-bold text-white">{countdown}</span>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Lanes */}
                {selectedScenario.algorithms.map((algo, index) => {
                    const result = results?.find(r => r.algorithm === algo);
                    const isWinner = result?.winner;

                    return (
                        <div key={algo} className="space-y-2">
                            <div className="flex items-center justify-between">
                                <span className={`font-semibold ${index === 0 ? 'text-orange-400' : 'text-blue-400'}`}>
                                    {algo}
                                </span>
                                {result && (
                                    <div className="flex items-center gap-4 text-sm">
                                        <span className="text-slate-400">
                                            <Timer size={14} className="inline mr-1" />
                                            {result.time.toFixed(0)}ms
                                        </span>
                                        <span className="text-slate-400">
                                            <Zap size={14} className="inline mr-1" />
                                            {result.steps} steps
                                        </span>
                                        <span className={`font-bold ${isWinner ? 'text-green-400' : 'text-red-400'}`}>
                                            <Target size={14} className="inline mr-1" />
                                            Result: {result.result}
                                        </span>
                                        {isWinner && (
                                            <span className="bg-yellow-500 text-black px-2 py-0.5 rounded-full text-xs font-bold">
                                                🏆 WINNER
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Progress Bar */}
                            <div className="h-8 bg-slate-800 rounded-full overflow-hidden relative">
                                <motion.div
                                    className={`h-full ${index === 0 ? 'bg-gradient-to-r from-orange-500 to-yellow-500' : 'bg-gradient-to-r from-blue-500 to-cyan-500'}`}
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progress[index]}%` }}
                                    transition={{ duration: 0.1 }}
                                />

                                {/* Runner Icon */}
                                <motion.div
                                    className="absolute top-1/2 -translate-y-1/2 text-2xl"
                                    animate={{ left: `calc(${progress[index]}% - 16px)` }}
                                    transition={{ duration: 0.1 }}
                                >
                                    {progress[index] >= 100 ? '🏁' : '🏃'}
                                </motion.div>
                            </div>
                        </div>
                    );
                })}

                {/* Race Analysis */}
                {results && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-slate-800/50 rounded-xl p-6 mt-6"
                    >
                        <h3 className="text-lg font-bold text-white mb-4">📊 Race Analysis</h3>

                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="bg-slate-900 rounded-lg p-4">
                                <h4 className="text-orange-400 font-semibold mb-2">Greedy Approach</h4>
                                <ul className="text-sm text-slate-400 space-y-1">
                                    <li>✓ Very fast execution</li>
                                    <li>✓ Simple to implement</li>
                                    <li>✗ May not find optimal solution</li>
                                    <li>✗ No guarantee of correctness</li>
                                </ul>
                            </div>
                            <div className="bg-slate-900 rounded-lg p-4">
                                <h4 className="text-blue-400 font-semibold mb-2">Dynamic Programming</h4>
                                <ul className="text-sm text-slate-400 space-y-1">
                                    <li>✓ Always finds optimal solution</li>
                                    <li>✓ Mathematically proven</li>
                                    <li>✗ Slower execution</li>
                                    <li>✗ Uses more memory</li>
                                </ul>
                            </div>
                        </div>

                        <div className="mt-4 p-4 bg-purple-900/30 border border-purple-500/30 rounded-lg">
                            <p className="text-purple-300">
                                <strong>Lesson:</strong> {results[0].result === results[1].result ?
                                    "Both algorithms found the same result! For some problems, Greedy is optimal." :
                                    results[0].result > results[1].result ?
                                        "Surprisingly, Greedy won! This is rare - usually DP is more reliable." :
                                        "DP found a better solution! This shows why we can't always trust Greedy's speed."
                                }
                            </p>
                        </div>
                    </motion.div>
                )}

                {/* Controls */}
                <div className="flex justify-center gap-4 pt-4">
                    {!isRacing && !results && (
                        <button
                            onClick={startRace}
                            className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-white font-bold rounded-xl flex items-center gap-2 transition-all hover:scale-105"
                        >
                            <Play size={20} />
                            Start Race!
                        </button>
                    )}

                    {isRacing && (
                        <button
                            disabled
                            className="px-8 py-3 bg-slate-700 text-slate-400 font-bold rounded-xl flex items-center gap-2 cursor-not-allowed"
                        >
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            >
                                <RotateCw size={20} />
                            </motion.div>
                            Racing...
                        </button>
                    )}

                    {results && (
                        <button
                            onClick={startRace}
                            className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white font-bold rounded-xl flex items-center gap-2 transition-all hover:scale-105"
                        >
                            <RotateCw size={20} />
                            Race Again
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AlgorithmRacing;
