import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCw, ChevronRight, ChevronLeft, Volume2, VolumeX, Code, BrainCircuit } from 'lucide-react';
import { useAnimationEngine } from '../hooks/useAnimationEngine';
import { useAlgorithmState } from '../hooks/useAlgorithmState';
import useSound from '../hooks/useSound';
import { api } from '../utils/api';
import { AlgorithmType } from '../types';
import CodeExport from '../components/CodeExport';
import PredictionModal from '../components/PredictionModal';
import GraphCanvas from '../components/GraphCanvas';
import DPTableCanvas from '../components/DPTableCanvas';
import HuffmanCanvas from '../components/HuffmanCanvas';
import GreedyChainCanvas from '../components/GreedyChainCanvas';
import StepTimeline from '../components/StepTimeline';
import AlgorithmInfoPanel from '../components/AlgorithmInfoPanel';
import VisualizerInputPresets from '../components/VisualizerInputPresets';
import confetti from 'canvas-confetti';
import { SkipForward } from 'lucide-react';

const Visualizer: React.FC = () => {
    const { algorithm } = useParams<{ algorithm: string }>();
    const [algoType, setAlgoType] = useState<AlgorithmType | null>(null);
    const [inputData, setInputData] = useState<any>(null);
    const [steps, setSteps] = useState<any[]>([]);
    const [speed, setSpeed] = useState(1);
    const [showCode, setShowCode] = useState(true);
    const [soundEnabled, setSoundEnabled] = useState(true);
    const [predictionMode, setPredictionMode] = useState(false);
    const [showPredictionModal, setShowPredictionModal] = useState(false);
    const [predictionQuestion, setPredictionQuestion] = useState<{ q: string, options: string[], answer: string } | null>(null);
    const [correctPrediction, setCorrectPrediction] = useState<string | null>(null);
    const [hasCompleted, setHasCompleted] = useState(false);

    const { playStep, playSuccess, playError } = useSound();

    // Engine
    const {
        currentStep,
        currentStepIndex,
        isPlaying,
        togglePlay,
        nextStep,
        prevStep,
        reset,
        progress,
        setCurrentStepIndex
    } = useAnimationEngine({
        steps,
        speed,
        onStepChange: (index, step) => {
            if (soundEnabled) playStep();

            // Prediction Mode Logic
            if (predictionMode && !showPredictionModal && index > 0 && Math.random() < 0.3) {
                if (isPlaying) togglePlay();

                generatePrediction(step);
                setShowPredictionModal(true);
            }
        }
    });

    // Use the algorithm state hook to accumulate DP table and greedy decisions
    const algorithmState = useAlgorithmState(steps, currentStepIndex);

    const generatePrediction = (_step: any) => {
        const options = ["Update Value", "Highlight Node", "Swap Elements", "Complete"];
        const correct = options[0];

        setPredictionQuestion({
            q: `What will be the next operation at step ${currentStepIndex + 2}?`,
            options: options.sort(() => Math.random() - 0.5),
            answer: correct
        });
        setCorrectPrediction(null);
    };

    const handlePredictionSelect = (option: string) => {
        if (predictionQuestion && option === predictionQuestion.answer) {
            if (soundEnabled) playSuccess();
            setCorrectPrediction(option);
        } else {
            if (soundEnabled) playError();
            setCorrectPrediction(predictionQuestion?.answer || null);
        }
    };

    const handlePredictionClose = () => {
        setShowPredictionModal(false);
        if (!isPlaying) togglePlay(); // Resume
    };

    // Keyboard shortcuts
    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        // Ignore if user is typing in an input
        if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

        switch (e.key) {
            case ' ':
                e.preventDefault();
                togglePlay();
                break;
            case 'ArrowRight':
                e.preventDefault();
                nextStep();
                break;
            case 'ArrowLeft':
                e.preventDefault();
                prevStep();
                break;
            case 'r':
            case 'R':
                e.preventDefault();
                reset();
                setHasCompleted(false);
                break;
        }
    }, [togglePlay, nextStep, prevStep, reset]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    // Confetti on completion
    useEffect(() => {
        if (steps.length > 0 && currentStepIndex === steps.length - 1 && !hasCompleted) {
            setHasCompleted(true);
            if (soundEnabled) playSuccess();

            // Fire confetti from both sides
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { x: 0.1, y: 0.6 }
            });
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { x: 0.9, y: 0.6 }
            });
        }
    }, [currentStepIndex, steps.length, hasCompleted, soundEnabled, playSuccess]);

    // Initialize Algorithm Type & Data
    useEffect(() => {
        if (!algorithm) return;

        let type: AlgorithmType | null = null;
        let defaultInput: any = null;

        switch (algorithm) {
            // Knapsack variants
            case 'knapsack':
            case '0-1-knapsack':
                type = AlgorithmType.KNAPSACK;
                defaultInput = { capacity: 50, items: [{ id: 1, weight: 10, value: 60 }, { id: 2, weight: 20, value: 100 }, { id: 3, weight: 30, value: 120 }] };
                break;
            case 'fractional-knapsack':
                type = AlgorithmType.GREEDY;
                defaultInput = { capacity: 50, items: [{ id: 1, weight: 10, value: 60 }, { id: 2, weight: 20, value: 100 }, { id: 3, weight: 30, value: 120 }] };
                break;

            // String algorithms
            case 'lcs':
                type = AlgorithmType.LCS;
                defaultInput = { text1: "STONE", text2: "LONGEST" };
                break;

            // Graph algorithms
            case 'dijkstra':
                type = AlgorithmType.DIJKSTRA;
                defaultInput = {
                    graph: {
                        "A": { "B": 4, "C": 2 },
                        "B": { "C": 5, "D": 10 },
                        "C": { "E": 3 },
                        "D": { "F": 11 },
                        "E": { "D": 4 },
                        "F": {}
                    },
                    start_node: "A"
                };
                break;
            case 'prims':
                type = AlgorithmType.PRIMS;
                defaultInput = {
                    graph: {
                        "A": { "B": 2, "C": 3 },
                        "B": { "A": 2, "C": 1, "D": 1, "E": 4 },
                        "C": { "A": 3, "B": 1, "F": 5 },
                        "D": { "B": 1, "E": 1 },
                        "E": { "B": 4, "D": 1, "F": 1 },
                        "F": { "C": 5, "E": 1 }
                    },
                    start_node: "A"
                };
                break;
            case 'kruskals':
                type = AlgorithmType.KRUSKALS;
                defaultInput = {
                    graph: {
                        "A": { "B": 2, "C": 3 },
                        "B": { "A": 2, "C": 1, "D": 1, "E": 4 },
                        "C": { "A": 3, "B": 1, "F": 5 },
                        "D": { "B": 1, "E": 1 },
                        "E": { "B": 4, "D": 1, "F": 1 },
                        "F": { "C": 5, "E": 1 }
                    },
                    start_node: "A"
                };
                break;

            // Matrix Chain
            case 'matrix-chain':
                type = AlgorithmType.MATRIX_CHAIN;
                defaultInput = { dimensions: [40, 20, 30, 10, 30] };
                break;

            // Huffman Encoding
            case 'huffman':
                type = AlgorithmType.HUFFMAN;
                defaultInput = { text: "abracadabra" };
                break;

            // Interval/Activity scheduling
            case 'activity-selection':
            case 'interval-scheduling':
                type = AlgorithmType.INTERVAL_SCHEDULING;
                defaultInput = {
                    intervals: [
                        { id: 1, start: 1, end: 3 },
                        { id: 2, start: 2, end: 5 },
                        { id: 3, start: 4, end: 6 },
                        { id: 4, start: 6, end: 8 },
                        { id: 5, start: 5, end: 7 }
                    ]
                };
                break;

            // Coin Change
            case 'coin-change':
            case 'coin-change-min':
                type = AlgorithmType.COIN_CHANGE_DP;
                defaultInput = { amount: 11, coins: [1, 2, 5] };
                break;

            // Edit Distance
            case 'edit-distance':
                type = AlgorithmType.EDIT_DISTANCE;
                defaultInput = { text1: "sunday", text2: "saturday" };
                break;

            // Longest Increasing Subsequence
            case 'lis':
                type = AlgorithmType.LIS;
                defaultInput = { sequence: [10, 22, 9, 33, 21, 50, 41, 60, 80] };
                break;

            // Rod Cutting
            case 'rod-cutting':
                type = AlgorithmType.ROD_CUTTING;
                defaultInput = { length: 8, prices: [1, 5, 8, 9, 10, 17, 17, 20] };
                break;

            // Other DP problems - fallback to placeholder
            case 'tsp-dp':
            case 'weighted-interval':
            case 'optimal-bst':
            case 'assignment-bitmask':
            case 'tree-dp-independent':
            case 'job-sequencing':
                type = AlgorithmType.KNAPSACK; // Placeholder - not yet implemented
                defaultInput = { capacity: 50, items: [{ id: 1, weight: 10, value: 60 }, { id: 2, weight: 20, value: 100 }] };
                break;

            default:
                type = AlgorithmType.KNAPSACK; // Fallback
                defaultInput = { capacity: 10, items: [] };
        }

        setAlgoType(type);
        setInputData(defaultInput);

        // Initial Solve
        if (type && defaultInput) {
            fetchSolution(type, defaultInput);
        }
    }, [algorithm]);

    const fetchSolution = async (type: AlgorithmType, input: any) => {
        try {
            let result;
            if (type === AlgorithmType.LCS) {
                result = await api.solveLCS(input);
            } else if (type === AlgorithmType.DIJKSTRA) {
                result = await api.solveDijkstra(input);
            } else if (type === AlgorithmType.PRIMS) {
                result = await api.solvePrims(input);
            } else if (type === AlgorithmType.KRUSKALS) {
                result = await api.solveKruskals(input);
            } else if (type === AlgorithmType.KNAPSACK || type === AlgorithmType.KNAPSACK_DP) {
                result = await api.solveKnapsack(AlgorithmType.DP, input);
            } else if (type === AlgorithmType.GREEDY || type === AlgorithmType.KNAPSACK_GREEDY) {
                result = await api.solveKnapsack(AlgorithmType.GREEDY, input);
            } else if (type === AlgorithmType.MATRIX_CHAIN) {
                result = await api.solveMatrixChain(type, input);
            } else if (type === AlgorithmType.HUFFMAN) {
                result = await api.solveHuffman(input);
            } else if (type === AlgorithmType.INTERVAL_SCHEDULING) {
                result = await api.solveIntervalScheduling(AlgorithmType.GREEDY, input);
            } else if (type === AlgorithmType.COIN_CHANGE_DP) {
                result = await api.solveCoinChange(AlgorithmType.DP, input);
            } else if (type === AlgorithmType.COIN_CHANGE_GREEDY) {
                result = await api.solveCoinChange(AlgorithmType.GREEDY, input);
            } else if (type === AlgorithmType.EDIT_DISTANCE) {
                result = await api.solveEditDistance(input);
            } else if (type === AlgorithmType.LIS) {
                result = await api.solveLIS(input);
            } else if (type === AlgorithmType.ROD_CUTTING) {
                result = await api.solveRodCutting(input);
            }

            if (result) {
                setSteps(result.steps);
                setCurrentStepIndex(-1);
            }
        } catch (e) {
            console.error("Failed to solve", e);
        }
    };

    // Render Canvas based on Algorithm
    const renderCanvas = () => {
        if (!algoType) return null;

        switch (algoType) {
            case AlgorithmType.LCS:
                return <DPTableCanvas
                    data={algorithmState.dpTable}
                    highlightedCell={algorithmState.highlightedCell}
                    currentStepData={currentStep?.data}
                    rowLabels={inputData?.text1 ? ['', ...inputData.text1.split('')] : []}
                    colLabels={inputData?.text2 ? ['', ...inputData.text2.split('')] : []}
                />;
            case AlgorithmType.KNAPSACK:
                return <DPTableCanvas
                    data={algorithmState.dpTable}
                    highlightedCell={algorithmState.highlightedCell}
                    currentStepData={currentStep?.data}
                    rowLabels={['0', ...(inputData?.items?.map((_: any, i: number) => `Item ${i + 1}`) || [])]}
                    colLabels={Array.from({ length: (inputData?.capacity || 0) + 1 }, (_, i) => i.toString())}
                />;
            case AlgorithmType.COIN_CHANGE_DP:
            case AlgorithmType.COIN_CHANGE_GREEDY:
            case AlgorithmType.MATRIX_CHAIN:
            case AlgorithmType.LIS:
            case AlgorithmType.ROD_CUTTING:
                return <DPTableCanvas
                    data={algorithmState.dpTable}
                    highlightedCell={algorithmState.highlightedCell}
                    currentStepData={currentStep?.data}
                />;
            case AlgorithmType.EDIT_DISTANCE:
                return <DPTableCanvas
                    data={algorithmState.dpTable}
                    highlightedCell={algorithmState.highlightedCell}
                    currentStepData={currentStep?.data}
                    rowLabels={inputData?.text1 ? ['', ...inputData.text1.split('')] : []}
                    colLabels={inputData?.text2 ? ['', ...inputData.text2.split('')] : []}
                />;
            case AlgorithmType.DIJKSTRA:
            case AlgorithmType.PRIMS:
            case AlgorithmType.KRUSKALS:
                return <GraphCanvas
                    graph={inputData?.graph || {}}
                    currentStepData={currentStep?.data || {}}
                    visitedNodes={(currentStep?.data as any)?.visited || []}
                />;
            case AlgorithmType.HUFFMAN:
                return <HuffmanCanvas
                    currentStepData={currentStep?.data || {}}
                    stepIndex={currentStepIndex}
                    allSteps={steps}
                />;
            case AlgorithmType.INTERVAL_SCHEDULING:
            case AlgorithmType.GREEDY:
            case AlgorithmType.KNAPSACK_GREEDY:
                return <GreedyChainCanvas
                    decisions={algorithmState.greedyDecisions}
                    currentIndex={algorithmState.greedyDecisions.length - 1}
                />;
            default:
                return <div className="flex items-center justify-center h-full text-slate-500">Visualization not implemented for this type yet.</div>;
        }
    };

    return (
        <div className="flex h-[calc(100vh-64px)] bg-slate-950 pt-16">
            {/* Left Sidebar: Controls & Input */}
            <div className="w-80 border-r border-slate-800 bg-slate-900/50 p-6 flex flex-col gap-6 overflow-y-auto">
                <div>
                    <h2 className="text-xl font-bold text-white mb-2 capitalize">{algorithm?.replace('-', ' ')}</h2>
                    <p className="text-sm text-slate-400">Configure parameters and control visualization.</p>
                </div>

                {/* Input Section Placeholder */}
                <div className="p-4 bg-slate-900 rounded-xl border border-slate-800">
                    <h3 className="text-sm font-semibold text-slate-300 mb-3">Input Data</h3>
                    <button onClick={() => fetchSolution(algoType!, inputData)} className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-colors">
                        Re-Generate
                    </button>

                    <VisualizerInputPresets
                        algorithmType={algoType}
                        onSelect={(data) => {
                            setInputData(data);
                            fetchSolution(algoType!, data);
                        }}
                    />
                </div>

                {/* Controls */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-400">Playback Speed</span>
                        <span className="text-xs font-mono text-indigo-400">{speed}x</span>
                    </div>
                    <input
                        type="range" min="0.5" max="5" step="0.5"
                        value={speed} onChange={(e) => setSpeed(parseFloat(e.target.value))}
                        className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                    />

                    <div className="flex items-center gap-2 justify-center pt-2">
                        <button onClick={reset} className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors" title="Reset (R)">
                            <RotateCw size={20} />
                        </button>
                        <button onClick={prevStep} className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors" title="Previous (←)">
                            <ChevronLeft size={24} />
                        </button>
                        <button onClick={togglePlay} className="p-4 bg-indigo-600 hover:bg-indigo-500 rounded-full text-white shadow-lg shadow-indigo-500/30 transition-all hover:scale-105 active:scale-95" title="Play/Pause (Space)">
                            {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-0.5" />}
                        </button>
                        <button onClick={nextStep} className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors" title="Next (→)">
                            <ChevronRight size={24} />
                        </button>
                        <button onClick={() => setCurrentStepIndex(steps.length - 1)} className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors" title="Skip to End">
                            <SkipForward size={20} />
                        </button>
                    </div>

                    {/* Step Timeline */}
                    <div className="pt-4">
                        <StepTimeline
                            totalSteps={steps.length}
                            currentStep={currentStepIndex}
                            onStepClick={(step) => setCurrentStepIndex(step)}
                            stepTypes={steps.map(s => s.type)}
                        />
                    </div>
                </div>

                {/* Toggles */}
                <div className="space-y-2 pt-4 border-t border-slate-800">
                    <button onClick={() => setPredictionMode(!predictionMode)} className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all ${predictionMode ? 'bg-purple-500/20 border-purple-500/50 text-purple-300' : 'bg-slate-900 border-slate-800 text-slate-400'}`}>
                        <span className="flex items-center gap-2 text-sm font-medium"><BrainCircuit size={16} /> Predict Mode</span>
                        <div className={`w-8 h-4 rounded-full relative transition-colors ${predictionMode ? 'bg-purple-500' : 'bg-slate-700'}`}>
                            <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${predictionMode ? 'left-4.5' : 'left-0.5'}`} style={{ left: predictionMode ? '1.1rem' : '0.15rem' }}></div>
                        </div>
                    </button>

                    <button onClick={() => setSoundEnabled(!soundEnabled)} className="w-full flex items-center justify-between p-3 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors">
                        <span className="flex items-center gap-2 text-sm font-medium">
                            {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
                            Sound Effects
                        </span>
                    </button>
                </div>

                {/* Algorithm Info Panel */}
                <div className="pt-4 border-t border-slate-800">
                    <AlgorithmInfoPanel
                        algorithmName={algorithm || ''}
                        algorithmId={algorithm || ''}
                        currentStep={currentStep || undefined}
                        stepIndex={currentStepIndex}
                        totalSteps={steps.length}
                    />
                </div>
            </div>

            {/* Main Canvas Area */}
            <div className="flex-1 flex flex-col relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-slate-950"></div>

                {/* Progress Bar */}
                <div className="h-1 bg-slate-900 w-full relative z-10">
                    <motion.div
                        className="h-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ ease: "linear", duration: isPlaying ? 1 / speed : 0.3 }}
                    />
                </div>

                <div className="flex-1 p-8 overflow-auto flex items-center justify-center relative z-0">
                    {renderCanvas()}
                </div>

                {/* Step Description Overlay */}
                <AnimatePresence mode="wait">
                    {currentStep && (
                        <motion.div
                            key={currentStepIndex}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-slate-900/90 backdrop-blur-md border border-slate-700 px-6 py-4 rounded-2xl shadow-2xl max-w-2xl text-center z-20"
                        >
                            <span className="text-xs font-bold tracking-wider text-indigo-400 uppercase mb-1 block">
                                Step {currentStepIndex + 1} / {steps.length}
                            </span>
                            <p className="text-lg text-slate-200 font-medium">
                                {currentStep.description || "Processing..."}
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Right Panel: Code & Details */}
            {showCode && (
                <div className="w-96 border-l border-slate-800 bg-slate-900/50 flex flex-col">
                    <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                        <h3 className="font-semibold text-white flex items-center gap-2">
                            <Code size={18} className="text-indigo-400" /> Code Implementation
                        </h3>
                        <button onClick={() => setShowCode(false)} className="p-1 hover:bg-slate-800 rounded text-slate-500 hover:text-white">
                            <ChevronRight size={18} />
                        </button>
                    </div>
                    <div className="flex-1 p-4 overflow-hidden">
                        <CodeExport algorithm={algorithm || 'knapsack'} />
                    </div>
                    <div className="p-4 border-t border-slate-800">
                        <h4 className="text-xs font-bold text-slate-500 uppercase mb-3">Metrics</h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                                <span className="text-xs text-slate-400 block mb-1">Comparisons</span>
                                <span className="text-xl font-bold text-white font-mono">{currentStep?.metrics?.comparisons || 0}</span>
                            </div>
                            <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                                <span className="text-xs text-slate-400 block mb-1">Swaps/Ops</span>
                                <span className="text-xl font-bold text-white font-mono">{currentStep?.metrics?.swaps || 0}</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {!showCode && (
                <button
                    onClick={() => setShowCode(true)}
                    className="absolute right-0 top-1/2 -translate-y-1/2 bg-slate-800 p-2 rounded-l-xl text-indigo-400 shadow-lg border-y border-l border-slate-700 hover:bg-slate-700 transition-all hover:pr-3 z-30"
                >
                    <ChevronLeft size={20} />
                </button>
            )}

            {/* Prediction Modal */}
            <PredictionModal
                isVisible={showPredictionModal}
                question={predictionQuestion?.q || ""}
                options={predictionQuestion?.options || []}
                correctAnswer={correctPrediction}
                onSelect={handlePredictionSelect}
                onClose={handlePredictionClose}
            />
        </div>
    );
};

export default Visualizer;
