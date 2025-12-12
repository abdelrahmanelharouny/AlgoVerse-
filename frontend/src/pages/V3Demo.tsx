import { useState } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import ComplexityAnalyzer from '../components/ComplexityAnalyzer';
import CodeTracePanel from '../components/CodeTracePanel';
import Flamegraph from '../components/Flamegraph';
import CodeExporter from '../components/CodeExporter';
import { useComplexityMetrics } from '../hooks/useComplexityMetrics';
import { useStateHistory } from '../hooks/useStateHistory';
import useSound from '../hooks/useSound';

const V3Demo = () => {
    const [isRunning, setIsRunning] = useState(false);
    const [currentLine, setCurrentLine] = useState(1);

    // Test Complexity Metrics
    const metrics = useComplexityMetrics({
        algorithmType: 'dp',
        inputSize: 5,
        auxiliarySpace: 10
    });

    // Test State History
    const stateHistory = useStateHistory();

    // Test Sound
    const { playPerfect } = useSound();

    // Sample Python code for Code Trace
    const sampleCode = `def knapsack_dp(items, capacity):
    """Dynamic Programming Knapsack"""
    n = len(items)
    dp = [[0] * (capacity + 1) for _ in range(n + 1)]
    
    for i in range(1, n + 1):
        for w in range(capacity + 1):
            if items[i-1]['weight'] <= w:
                dp[i][w] = max(
                    dp[i-1][w],
                    dp[i-1][w - items[i-1]['weight']] + items[i-1]['value']
                )
            else:
                dp[i][w] = dp[i-1][w]
    
    return dp[n][capacity]`;

    // Sample Flamegraph data
    const flameData = [
        { label: 'Initialization', timeMs: 245, percentage: 10, color: '#3B82F6' },
        { label: 'DP Table Loop', timeMs: 1800, percentage: 60, color: '#F59E0B' },
        { label: 'Backtracking', timeMs: 720, percentage: 30, color: '#10B981' }
    ];

    // Sample input for Code Exporter
    const sampleInput = {
        items: [
            { id: 1, weight: 3, value: 4 },
            { id: 2, weight: 4, value: 5 },
            { id: 3, weight: 2, value: 3 }
        ],
        capacity: 10
    };

    // Test Functions
    const testConfetti = () => {
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#FFD700', '#FFA500', '#FFFF00']
        });
    };

    const testComplexityAnalyzer = () => {
        setIsRunning(true);
        metrics.startTimer();

        // Simulate algorithm execution
        const interval = setInterval(() => {
            metrics.incrementOps();
            if (metrics.operations >= 50) {
                clearInterval(interval);
                metrics.stopTimer();
                setIsRunning(false);
            }
        }, 100);
    };

    const testCodeTrace = () => {
        setIsRunning(true);
        let line = 1;
        const interval = setInterval(() => {
            setCurrentLine(line);
            line++;
            if (line > 15) {
                clearInterval(interval);
                setIsRunning(false);
                setCurrentLine(1);
            }
        }, 500);
    };

    const testStateHistory = () => {
        // Record some states
        for (let i = 0; i < 10; i++) {
            stateHistory.recordState({
                step: i,
                currentStepData: { type: 'update', description: `Step ${i}` } as any
            });
        }
        alert(`Recorded ${stateHistory.totalSteps} states! Can go back: ${stateHistory.canGoBack}, Can go forward: ${stateHistory.canGoForward}`);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 py-12 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <motion.div
                    className="text-center mb-12"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <h1 className="text-6xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-red-500">
                        v3.0 Feature Demo
                    </h1>
                    <p className="text-xl text-slate-400">
                        Testing all 7 premium features
                    </p>
                </motion.div>

                {/* Test Controls */}
                <div className="grid md:grid-cols-3 gap-4 mb-8">
                    <button
                        onClick={testConfetti}
                        className="px-6 py-4 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 text-white font-bold rounded-xl transition-all shadow-lg"
                    >
                        🎊 Test Confetti
                    </button>
                    <button
                        onClick={() => playPerfect()}
                        className="px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold rounded-xl transition-all shadow-lg"
                    >
                        🔊 Test Sound
                    </button>
                    <button
                        onClick={testComplexityAnalyzer}
                        className="px-6 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold rounded-xl transition-all shadow-lg"
                    >
                        📊 Test Complexity
                    </button>
                    <button
                        onClick={testCodeTrace}
                        className="px-6 py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold rounded-xl transition-all shadow-lg"
                    >
                        💻 Test Code Trace
                    </button>
                    <button
                        onClick={testStateHistory}
                        className="px-6 py-4 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold rounded-xl transition-all shadow-lg"
                    >
                        ⏪ Test State History
                    </button>
                    <button
                        onClick={() => metrics.reset()}
                        className="px-6 py-4 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-xl transition-all"
                    >
                        🔄 Reset Metrics
                    </button>
                </div>

                {/* Feature Grid */}
                <div className="grid lg:grid-cols-2 gap-6">
                    {/* Complexity Analyzer */}
                    <ComplexityAnalyzer metrics={metrics} isRunning={isRunning} />

                    {/* Flamegraph */}
                    <Flamegraph sections={flameData} totalTime={2765} />

                    {/* Code Trace Panel */}
                    <div className="lg:col-span-2">
                        <CodeTracePanel
                            code={sampleCode}
                            language="python"
                            highlightedLine={currentLine}
                            title="Knapsack DP Algorithm"
                        />
                    </div>

                    {/* Code Exporter */}
                    <div className="lg:col-span-2">
                        <CodeExporter
                            algorithmType="knapsack"
                            variant="dp"
                            inputData={sampleInput}
                        />
                    </div>
                </div>

                {/* State History Info */}
                <motion.div
                    className="mt-8 bg-slate-900 border border-slate-700 rounded-xl p-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                >
                    <h3 className="text-xl font-bold text-white mb-4">State History Status</h3>
                    <div className="grid md:grid-cols-4 gap-4 text-center">
                        <div>
                            <div className="text-3xl font-bold text-white">{stateHistory.totalSteps}</div>
                            <div className="text-sm text-slate-400">Total States</div>
                        </div>
                        <div>
                            <div className="text-3xl font-bold text-white">{stateHistory.currentIndex + 1}</div>
                            <div className="text-sm text-slate-400">Current Index</div>
                        </div>
                        <div>
                            <div className={`text-3xl font-bold ${stateHistory.canGoBack ? 'text-green-400' : 'text-red-400'}`}>
                                {stateHistory.canGoBack ? '✓' : '✗'}
                            </div>
                            <div className="text-sm text-slate-400">Can Go Back</div>
                        </div>
                        <div>
                            <div className={`text-3xl font-bold ${stateHistory.canGoForward ? 'text-green-400' : 'text-red-400'}`}>
                                {stateHistory.canGoForward ? '✓' : '✗'}
                            </div>
                            <div className="text-sm text-slate-400">Can Go Forward</div>
                        </div>
                    </div>
                </motion.div>

                {/* Feature Checklist */}
                <motion.div
                    className="mt-8 bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-xl p-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                >
                    <h3 className="text-xl font-bold text-white mb-4">v3.0 Feature Checklist</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                        {[
                            { name: 'Confetti & Sound', icon: '🎊', tested: true },
                            { name: 'Complexity Analyzer', icon: '📊', tested: true },
                            { name: 'Code Trace Panel', icon: '💻', tested: true },
                            { name: 'Flamegraph', icon: '🔥', tested: true },
                            { name: 'Code Exporter', icon: '📥', tested: true },
                            { name: 'State History', icon: '⏪', tested: true },
                            { name: 'Sound Manager', icon: '🔊', tested: true }
                        ].map((feature, index) => (
                            <div
                                key={index}
                                className="flex items-center gap-3 bg-slate-950/50 p-4 rounded-lg"
                            >
                                <span className="text-3xl">{feature.icon}</span>
                                <div className="flex-1">
                                    <div className="font-semibold text-white">{feature.name}</div>
                                    <div className={`text-sm ${feature.tested ? 'text-green-400' : 'text-slate-500'}`}>
                                        {feature.tested ? '✓ Available' : 'Not tested'}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default V3Demo;
