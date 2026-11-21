import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Play, Pause, RotateCw, ChevronRight, ChevronLeft, Volume2, VolumeX,
    Code, BrainCircuit, SkipForward, FileJson, Gauge, AlertTriangle
} from 'lucide-react';
import { useAnimationEngine } from '../hooks/useAnimationEngine';
import { useAlgorithmState } from '../hooks/useAlgorithmState';
import useSound from '../hooks/useSound';
import { api } from '../utils/api';
import { AlgorithmType } from '../types';
import type {
    AlgorithmResult, Step, KnapsackItem, KnapsackInput, CoinChangeInput,
    DijkstraInput, IntervalSchedulingInput, HuffmanInput, LCSInput, MatrixChainInput
} from '../types';
import CodeExport from '../components/CodeExport';
import PredictionModal from '../components/PredictionModal';
import GraphCanvas from '../components/GraphCanvas';
import DPTableCanvas from '../components/DPTableCanvas';
import HuffmanCanvas from '../components/HuffmanCanvas';
import GreedyChainCanvas from '../components/GreedyChainCanvas';
import IntervalTimelineCanvas from '../components/IntervalTimelineCanvas';
import StepTimeline from '../components/StepTimeline';
import StepInspector from '../components/StepInspector';
import AlgorithmResultPanel from '../components/AlgorithmResultPanel';
import AlgorithmInfoPanel from '../components/AlgorithmInfoPanel';
import VisualizerInputPresets from '../components/VisualizerInputPresets';
import confetti from 'canvas-confetti';

interface AlgorithmInput {
    capacity?: number;
    items?: KnapsackItem[];
    amount?: number;
    coins?: number[];
    graph?: Record<string, Record<string, number>>;
    start_node?: string;
    text?: string;
    text1?: string;
    text2?: string;
    dimensions?: number[];
    sequence?: number[];
    length?: number;
    prices?: number[];
    intervals?: Array<{ id: string | number; start: number; end: number }>;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === 'object' && value !== null && !Array.isArray(value);

const isFiniteNumberArray = (value: unknown): value is number[] =>
    Array.isArray(value) && value.every(item => typeof item === 'number' && Number.isFinite(item));

const validateInput = (type: AlgorithmType, input: unknown): string | null => {
    if (!isRecord(input)) return 'Input must be a JSON object.';

    const positiveIntegerArray = (value: unknown) =>
        Array.isArray(value) && value.length > 0
        && value.every(item => Number.isInteger(item) && Number(item) > 0);

    if (new Set<AlgorithmType>([AlgorithmType.KNAPSACK, AlgorithmType.KNAPSACK_DP, AlgorithmType.KNAPSACK_GREEDY,
        AlgorithmType.GREEDY, AlgorithmType.FRACTIONAL_KNAPSACK]).has(type)) {
        if (typeof input.capacity !== 'number' || !Number.isFinite(input.capacity) || input.capacity < 0) {
            return 'Knapsack input needs a non-negative numeric capacity.';
        }
        if (!Array.isArray(input.items) || input.items.length === 0) {
            return 'Knapsack input needs at least one item.';
        }
        const validItems = input.items.every(item =>
            isRecord(item)
            && (typeof item.id === 'string' || typeof item.id === 'number')
            && typeof item.weight === 'number' && Number.isFinite(item.weight) && item.weight > 0
            && typeof item.value === 'number' && Number.isFinite(item.value)
        );
        if (!validItems) return 'Each item needs an id, a positive weight, and a numeric value.';
    }

    if (new Set<AlgorithmType>([AlgorithmType.COIN_CHANGE_DP, AlgorithmType.COIN_CHANGE_GREEDY]).has(type)) {
        if (!Number.isInteger(input.amount) || Number(input.amount) < 0) return 'Coin Change needs a non-negative integer amount.';
        if (!positiveIntegerArray(input.coins)) return 'Coin denominations must be positive integers.';
    }

    if (new Set<AlgorithmType>([AlgorithmType.DIJKSTRA, AlgorithmType.PRIMS, AlgorithmType.KRUSKALS]).has(type)) {
        if (!isRecord(input.graph) || Object.keys(input.graph).length === 0) return 'Graph input needs at least one node.';
        const validGraph = Object.values(input.graph).every(neighbors =>
            isRecord(neighbors) && Object.values(neighbors).every(weight =>
                typeof weight === 'number' && Number.isFinite(weight)
                && (type !== AlgorithmType.DIJKSTRA || weight >= 0)
            )
        );
        if (!validGraph) return 'Every graph edge needs a finite weight; Dijkstra does not accept negative weights.';
        if (type !== AlgorithmType.KRUSKALS && (typeof input.start_node !== 'string' || !(input.start_node in input.graph))) {
            return 'The start_node must match one of the graph node names.';
        }
    }

    if (new Set<AlgorithmType>([AlgorithmType.LCS, AlgorithmType.EDIT_DISTANCE]).has(type)) {
        if (typeof input.text1 !== 'string' || typeof input.text2 !== 'string') {
            return 'This algorithm needs both text1 and text2 strings.';
        }
    }

    if (type === AlgorithmType.HUFFMAN && (typeof input.text !== 'string' || input.text.length === 0)) {
        return 'Huffman input needs a non-empty text string.';
    }

    if (type === AlgorithmType.MATRIX_CHAIN && (!positiveIntegerArray(input.dimensions) || (input.dimensions as number[]).length < 2)) {
        return 'Matrix Chain needs at least two positive integer dimensions.';
    }

    if (type === AlgorithmType.INTERVAL_SCHEDULING) {
        if (!Array.isArray(input.intervals) || input.intervals.length === 0) return 'Provide at least one interval.';
        const validIntervals = input.intervals.every(interval =>
            isRecord(interval)
            && (typeof interval.id === 'string' || typeof interval.id === 'number')
            && typeof interval.start === 'number' && Number.isFinite(interval.start)
            && typeof interval.end === 'number' && Number.isFinite(interval.end)
            && interval.start < interval.end
        );
        if (!validIntervals) return 'Each interval needs an id and a start value smaller than its end value.';
    }

    if (type === AlgorithmType.LIS && !isFiniteNumberArray(input.sequence)) {
        return 'LIS input needs a sequence of finite numbers.';
    }

    if (type === AlgorithmType.ROD_CUTTING) {
        if (!Number.isInteger(input.length) || Number(input.length) <= 0) return 'Rod length must be a positive integer.';
        if (!isFiniteNumberArray(input.prices) || input.prices.length === 0) return 'Rod Cutting needs a non-empty prices array.';
    }

    return null;
};

const titleCase = (value: string) =>
    value.replaceAll('-', ' ').replaceAll('_', ' ').replace(/\b\w/g, character => character.toUpperCase());

const Visualizer: React.FC = () => {
    const { algorithm } = useParams<{ algorithm: string }>();
    const [algoType, setAlgoType] = useState<AlgorithmType | null>(null);
    const [unsupportedReason, setUnsupportedReason] = useState<string | null>(null);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [inputData, setInputData] = useState<AlgorithmInput | null>(null);
    const [inputDraft, setInputDraft] = useState('');
    const [inputDraftError, setInputDraftError] = useState<string | null>(null);
    const [steps, setSteps] = useState<Step[]>([]);
    const [algorithmResult, setAlgorithmResult] = useState<AlgorithmResult | null>(null);
    const [speed, setSpeed] = useState(1);
    const [showCode, setShowCode] = useState(true);
    const [soundEnabled, setSoundEnabled] = useState(true);
    const [predictionMode, setPredictionMode] = useState(false);
    const [showPredictionModal, setShowPredictionModal] = useState(false);
    const [predictionQuestion, setPredictionQuestion] = useState<{ q: string; options: string[]; answer: string } | null>(null);
    const [correctPrediction, setCorrectPrediction] = useState<string | null>(null);
    const [hasCompleted, setHasCompleted] = useState(false);
    const requestSequence = useRef(0);

    const { playStep, playSuccess, playError } = useSound();

    const generatePrediction = (_currentStep: Step, nextStep?: Step) => {
        const optionByType: Record<string, string> = {
            init: 'Initialize State',
            sort: 'Sort Candidates',
            highlight: 'Highlight Candidate',
            update: 'Update State',
            pick: 'Accept Candidate',
            reject: 'Reject Candidate',
            solution: 'Finalize Solution',
            info: 'Explain Step'
        };
        const options = [
            'Initialize State', 'Sort Candidates', 'Highlight Candidate', 'Update State',
            'Accept Candidate', 'Reject Candidate', 'Finalize Solution', 'Explain Step'
        ];
        const correct = optionByType[nextStep?.type] ?? 'Finalize Solution';
        setPredictionQuestion({
            q: 'What kind of operation will the algorithm perform next?',
            options: [...options].sort(() => Math.random() - 0.5),
            answer: correct
        });
        setCorrectPrediction(null);
    };

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
            if (predictionMode && !showPredictionModal && index > 0 && index % 5 === 0) {
                if (isPlaying) togglePlay();
                generatePrediction(step, steps[index + 1]);
                setShowPredictionModal(true);
            }
        }
    });

    const algorithmState = useAlgorithmState(steps, currentStepIndex);

    const fetchSolution = useCallback(async (type: AlgorithmType, input: AlgorithmInput) => {
        const requestId = ++requestSequence.current;
        setIsLoading(true);
        setLoadError(null);
        setInputDraftError(null);
        setSteps([]);
        setAlgorithmResult(null);
        setHasCompleted(false);

        try {
            let result: AlgorithmResult | null = null;
            if (type === AlgorithmType.FRACTIONAL_KNAPSACK) {
                result = await api.solveFractionalKnapsack(input as KnapsackInput);
            } else if (type === AlgorithmType.LCS) {
                result = await api.solveLCS(input as LCSInput);
            } else if (type === AlgorithmType.DIJKSTRA) {
                result = await api.solveDijkstra(input as DijkstraInput);
            } else if (type === AlgorithmType.PRIMS) {
                result = await api.solvePrims(input as DijkstraInput);
            } else if (type === AlgorithmType.KRUSKALS) {
                result = await api.solveKruskals(input as DijkstraInput);
            } else if (type === AlgorithmType.KNAPSACK || type === AlgorithmType.KNAPSACK_DP) {
                result = await api.solveKnapsack(AlgorithmType.DP, input as KnapsackInput);
            } else if (type === AlgorithmType.GREEDY || type === AlgorithmType.KNAPSACK_GREEDY) {
                result = await api.solveKnapsack(AlgorithmType.GREEDY, input as KnapsackInput);
            } else if (type === AlgorithmType.MATRIX_CHAIN) {
                result = await api.solveMatrixChain(type, input as MatrixChainInput);
            } else if (type === AlgorithmType.HUFFMAN) {
                result = await api.solveHuffman(input as HuffmanInput);
            } else if (type === AlgorithmType.INTERVAL_SCHEDULING) {
                result = await api.solveIntervalScheduling(AlgorithmType.GREEDY, input as IntervalSchedulingInput);
            } else if (type === AlgorithmType.COIN_CHANGE_DP) {
                result = await api.solveCoinChange(AlgorithmType.DP, input as CoinChangeInput);
            } else if (type === AlgorithmType.COIN_CHANGE_GREEDY) {
                result = await api.solveCoinChange(AlgorithmType.GREEDY, input as CoinChangeInput);
            } else if (type === AlgorithmType.EDIT_DISTANCE) {
                result = await api.solveEditDistance(input as LCSInput);
            } else if (type === AlgorithmType.LIS) {
                result = await api.solveLIS(input as { sequence: number[] });
            } else if (type === AlgorithmType.ROD_CUTTING) {
                result = await api.solveRodCutting(input as { length: number; prices: number[] });
            }

            if (!result) throw new Error('No executable solver is registered for this algorithm.');
            if (!Array.isArray(result.steps) || result.steps.length === 0) {
                throw new Error('The solver returned a result without trace events. Try a different input or preset.');
            }
            if (requestId !== requestSequence.current) return;

            setSteps(result.steps);
            setAlgorithmResult(result);
            setHasCompleted(false);
        } catch (error) {
            if (requestId !== requestSequence.current) return;
            const message = error instanceof Error ? error.message : 'Unable to load this algorithm trace.';
            setLoadError(message);
            console.error('Failed to solve algorithm', error);
        } finally {
            if (requestId === requestSequence.current) setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        setInputDraft(inputData ? JSON.stringify(inputData, null, 2) : '');
        setInputDraftError(null);
    }, [inputData]);

    useEffect(() => () => {
        requestSequence.current += 1;
    }, []);

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
        if (!isPlaying) togglePlay();
    };

    const handleKeyDown = useCallback((event: KeyboardEvent) => {
        const target = event.target;
        if (target instanceof HTMLElement) {
            const tagName = target.tagName;
            if (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT', 'BUTTON'].includes(tagName)) return;
        }
        if (event.altKey || event.ctrlKey || event.metaKey || showPredictionModal) return;

        switch (event.key) {
            case ' ':
                event.preventDefault();
                togglePlay();
                break;
            case 'ArrowRight':
                event.preventDefault();
                nextStep();
                break;
            case 'ArrowLeft':
                event.preventDefault();
                prevStep();
                break;
            case 'r':
            case 'R':
                event.preventDefault();
                reset();
                setHasCompleted(false);
                break;
        }
    }, [togglePlay, nextStep, prevStep, reset, showPredictionModal]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    useEffect(() => {
        if (steps.length > 0 && currentStepIndex === steps.length - 1 && !hasCompleted) {
            setHasCompleted(true);
            if (soundEnabled) playSuccess();
            const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
            if (!reducedMotion) {
                confetti({
                    particleCount: 55,
                    spread: 58,
                    startVelocity: 30,
                    origin: { x: 0.12, y: 0.62 },
                    colors: ['#d6f56a', '#83cbd8', '#ff8063']
                });
                confetti({
                    particleCount: 55,
                    spread: 58,
                    startVelocity: 30,
                    origin: { x: 0.88, y: 0.62 },
                    colors: ['#d6f56a', '#83cbd8', '#ff8063']
                });
            }
        }
    }, [currentStepIndex, steps.length, hasCompleted, soundEnabled, playSuccess]);

    useEffect(() => {
        requestSequence.current += 1;
        if (!algorithm) return;
        setLoadError(null);
        setSteps([]);
        setAlgorithmResult(null);
        setHasCompleted(false);
        setPredictionMode(false);
        setShowPredictionModal(false);

        let type: AlgorithmType | null = null;
        let defaultInput: AlgorithmInput | null = null;
        setUnsupportedReason(null);

        switch (algorithm) {
            case 'knapsack':
            case '0-1-knapsack':
                type = AlgorithmType.KNAPSACK;
                defaultInput = { capacity: 50, items: [{ id: 1, weight: 10, value: 60 }, { id: 2, weight: 20, value: 100 }, { id: 3, weight: 30, value: 120 }] };
                break;
            case 'fractional-knapsack':
                type = AlgorithmType.FRACTIONAL_KNAPSACK;
                defaultInput = { capacity: 50, items: [{ id: 1, weight: 10, value: 60 }, { id: 2, weight: 20, value: 100 }, { id: 3, weight: 30, value: 120 }] };
                break;
            case 'lcs':
                type = AlgorithmType.LCS;
                defaultInput = { text1: 'STONE', text2: 'LONGEST' };
                break;
            case 'dijkstra':
                type = AlgorithmType.DIJKSTRA;
                defaultInput = {
                    graph: {
                        A: { B: 4, C: 2 },
                        B: { C: 5, D: 10 },
                        C: { E: 3 },
                        D: { F: 11 },
                        E: { D: 4 },
                        F: {}
                    },
                    start_node: 'A'
                };
                break;
            case 'prims':
                type = AlgorithmType.PRIMS;
                defaultInput = {
                    graph: {
                        A: { B: 2, C: 3 },
                        B: { A: 2, C: 1, D: 1, E: 4 },
                        C: { A: 3, B: 1, F: 5 },
                        D: { B: 1, E: 1 },
                        E: { B: 4, D: 1, F: 1 },
                        F: { C: 5, E: 1 }
                    },
                    start_node: 'A'
                };
                break;
            case 'kruskals':
                type = AlgorithmType.KRUSKALS;
                defaultInput = {
                    graph: {
                        A: { B: 2, C: 3 },
                        B: { A: 2, C: 1, D: 1, E: 4 },
                        C: { A: 3, B: 1, F: 5 },
                        D: { B: 1, E: 1 },
                        E: { B: 4, D: 1, F: 1 },
                        F: { C: 5, E: 1 }
                    },
                    start_node: 'A'
                };
                break;
            case 'matrix-chain':
                type = AlgorithmType.MATRIX_CHAIN;
                defaultInput = { dimensions: [40, 20, 30, 10, 30] };
                break;
            case 'huffman':
                type = AlgorithmType.HUFFMAN;
                defaultInput = { text: 'abracadabra' };
                break;
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
            case 'coin-change':
            case 'coin-change-min':
                type = AlgorithmType.COIN_CHANGE_DP;
                defaultInput = { amount: 11, coins: [1, 2, 5] };
                break;
            case 'edit-distance':
                type = AlgorithmType.EDIT_DISTANCE;
                defaultInput = { text1: 'sunday', text2: 'saturday' };
                break;
            case 'lis':
                type = AlgorithmType.LIS;
                defaultInput = { sequence: [10, 22, 9, 33, 21, 50, 41, 60, 80] };
                break;
            case 'rod-cutting':
                type = AlgorithmType.ROD_CUTTING;
                defaultInput = { length: 8, prices: [1, 5, 8, 9, 10, 17, 17, 20] };
                break;
            case 'tsp-dp':
            case 'weighted-interval':
            case 'optimal-bst':
            case 'assignment-bitmask':
            case 'tree-dp-independent':
            case 'job-sequencing':
                setUnsupportedReason(algorithm + ' is listed in the catalog but its executable algorithm is not implemented yet.');
                break;
            default:
                setUnsupportedReason('No executable visualizer is registered for "' + algorithm + '".');
        }

        setAlgoType(type);
        setInputData(defaultInput);
        if (type && defaultInput) fetchSolution(type, defaultInput);
    }, [algorithm, fetchSolution]);

    const applyCustomInput = () => {
        if (!algoType) return;
        try {
            const parsed: unknown = JSON.parse(inputDraft);
            const validationMessage = validateInput(algoType, parsed);
            if (validationMessage) {
                setInputDraftError(validationMessage);
                return;
            }
            const nextInput = parsed as AlgorithmInput;
            setInputData(nextInput);
            setInputDraftError(null);
            fetchSolution(algoType, nextInput);
        } catch {
            setInputDraftError('This is not valid JSON. Check commas, quotes, and brackets.');
        }
    };

    const renderCanvas = () => {
        if (!algoType) {
            return (
                <div className="av-stage__empty" role="status">
                    <AlertTriangle size={22} className="mx-auto mb-3 text-[#d6f56a]" />
                    <strong className="mb-2 block text-sm text-[#edf0e7]">Visualizer not available</strong>
                    <span className="text-xs leading-relaxed">{unsupportedReason || 'This algorithm has no registered implementation yet.'}</span>
                </div>
            );
        }

        const stepData = (currentStep?.data ?? {}) as {
            item_id?: string | number;
            interval_id?: string | number;
        };

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
                    rowLabels={['0', ...(inputData?.items?.map((_, index) => 'Item ' + (index + 1)) || [])]}
                    colLabels={Array.from({ length: (inputData?.capacity || 0) + 1 }, (_, index) => index.toString())}
                />;
            case AlgorithmType.COIN_CHANGE_DP:
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
                    visitedNodes={algorithmState.graphVisitedNodes}
                    startNode={algoType === AlgorithmType.KRUSKALS ? undefined : inputData?.start_node}
                    directed={algoType === AlgorithmType.DIJKSTRA}
                    accumulatedMstEdges={algorithmState.graphMstEdges}
                    accumulatedPathEdges={algorithmState.graphPathEdges}
                    distanceLabels={algorithmState.graphDistances}
                />;
            case AlgorithmType.HUFFMAN:
                return <HuffmanCanvas
                    currentStepData={currentStep?.data || {}}
                    stepIndex={currentStepIndex}
                    allSteps={steps}
                />;
            case AlgorithmType.INTERVAL_SCHEDULING:
                return <IntervalTimelineCanvas
                    intervals={inputData?.intervals ?? []}
                    decisions={algorithmState.greedyDecisions}
                    activeIntervalId={stepData.item_id ?? stepData.interval_id}
                />;
            case AlgorithmType.COIN_CHANGE_GREEDY:
                return <GreedyChainCanvas
                    mode="coins"
                    amount={inputData?.amount ?? 0}
                    decisions={algorithmState.greedyDecisions}
                    currentIndex={algorithmState.greedyDecisions.length - 1}
                />;
            case AlgorithmType.FRACTIONAL_KNAPSACK:
                return <GreedyChainCanvas
                    mode="fractional"
                    decisions={algorithmState.greedyDecisions}
                    currentIndex={algorithmState.greedyDecisions.length - 1}
                />;
            case AlgorithmType.GREEDY:
            case AlgorithmType.KNAPSACK_GREEDY:
                return <GreedyChainCanvas
                    decisions={algorithmState.greedyDecisions}
                    currentIndex={algorithmState.greedyDecisions.length - 1}
                />;
            default:
                return <div className="av-stage__empty">Visualization is not available for this algorithm type yet.</div>;
        }
    };

    const safeSpeed = Number.isFinite(speed) ? speed : 1;
    const currentStepLabel = currentStepIndex < 0 ? 'Ready' : String(currentStepIndex + 1);

    return (
        <div className="av-workspace">
            <aside className="av-workspace__rail">
                <div>
                    <p className="av-workspace__eyebrow">The algorithm lab / workspace</p>
                    <h1 className="av-workspace__title">{algorithm ? titleCase(algorithm) : 'Algorithm visualizer'}</h1>
                    <p className="av-workspace__description">Change the input, run the trace, and move through each decision at your own pace.</p>
                </div>

                <section className="av-rail-card" aria-label="Algorithm input">
                    <div className="av-rail-card__heading">
                        <span>Input & examples</span>
                        <span className="av-rail-card__eyebrow">01 / Configure</span>
                    </div>
                    <button
                        type="button"
                        onClick={() => {
                            if (algoType && inputData) fetchSolution(algoType, inputData);
                        }}
                        disabled={!algoType || !inputData || isLoading}
                        className="av-run-button"
                    >
                        <RotateCw size={14} /> {isLoading ? 'Building trace…' : 'Run with current input'}
                    </button>

                    <VisualizerInputPresets
                        algorithmType={algoType}
                        onSelect={(data) => {
                            if (!algoType) return;
                            setInputData(data);
                            fetchSolution(algoType, data);
                        }}
                    />

                    <details className="av-json-editor">
                        <summary><FileJson size={13} className="mr-1 inline" /> Edit input as JSON</summary>
                        <p className="av-json-editor__hint">Use the fields expected by this algorithm. We validate the structure before sending it to the solver.</p>
                        <textarea
                            value={inputDraft}
                            onChange={event => {
                                setInputDraft(event.target.value);
                                setInputDraftError(null);
                            }}
                            spellCheck={false}
                            aria-label="Custom algorithm input JSON"
                        />
                        {inputDraftError && <p className="av-json-editor__error" role="alert">{inputDraftError}</p>}
                        <button type="button" className="av-json-editor__apply" onClick={applyCustomInput} disabled={!algoType || isLoading}>
                            Validate & run custom input
                        </button>
                    </details>
                </section>

                <section className="av-rail-card av-playback" aria-label="Playback controls">
                    <div className="av-rail-card__heading">
                        <span>Playback</span>
                        <span className="av-rail-card__eyebrow">02 / Inspect</span>
                    </div>
                    <label className="av-playback__speed" htmlFor="playback-speed">
                        <span><Gauge size={13} className="mr-1 inline" /> Playback speed</span>
                        <strong>{safeSpeed.toFixed(1)}×</strong>
                    </label>
                    <input
                        id="playback-speed"
                        type="range"
                        min="0.5"
                        max="5"
                        step="0.5"
                        value={safeSpeed}
                        onChange={event => setSpeed(parseFloat(event.target.value))}
                        className="av-range"
                    />

                    <div className="av-playback__buttons">
                        <button type="button" onClick={() => { reset(); setHasCompleted(false); }} className="av-control-button" title="Reset (R)" aria-label="Reset playback" disabled={steps.length === 0}>
                            <RotateCw size={16} />
                        </button>
                        <button type="button" onClick={prevStep} className="av-control-button" title="Previous step (Left arrow)" aria-label="Previous step" disabled={steps.length === 0 || currentStepIndex <= 0}>
                            <ChevronLeft size={19} />
                        </button>
                        <button type="button" onClick={togglePlay} className="av-control-button av-control-button--primary" title="Play or pause (Space)" aria-label={isPlaying ? 'Pause playback' : 'Play playback'} disabled={steps.length === 0}>
                            {isPlaying ? <Pause size={19} fill="currentColor" /> : <Play size={19} fill="currentColor" className="ml-0.5" />}
                        </button>
                        <button type="button" onClick={nextStep} className="av-control-button" title="Next step (Right arrow)" aria-label="Next step" disabled={steps.length === 0 || currentStepIndex >= steps.length - 1}>
                            <ChevronRight size={19} />
                        </button>
                        <button type="button" onClick={() => setCurrentStepIndex(steps.length - 1)} className="av-control-button" title="Skip to final state" aria-label="Skip to final state" disabled={steps.length === 0}>
                            <SkipForward size={15} />
                        </button>
                    </div>

                    <StepTimeline
                        totalSteps={steps.length}
                        currentStep={currentStepIndex}
                        onStepClick={step => setCurrentStepIndex(step)}
                        stepTypes={steps.map(step => step.type)}
                    />
                </section>

                <section className="space-y-2" aria-label="Learning options">
                    <button
                        type="button"
                        className="av-toggle-row"
                        onClick={() => setPredictionMode(enabled => !enabled)}
                        aria-pressed={predictionMode}
                    >
                        <span><BrainCircuit size={14} className="mr-2 inline" /> Predict the next step</span>
                        <span className="av-toggle-row__state" aria-hidden="true" />
                    </button>
                    <button
                        type="button"
                        className="av-toggle-row"
                        onClick={() => setSoundEnabled(enabled => !enabled)}
                        aria-pressed={soundEnabled}
                    >
                        <span>{soundEnabled ? <Volume2 size={14} className="mr-2 inline" /> : <VolumeX size={14} className="mr-2 inline" />} Sound effects</span>
                        <span className="av-toggle-row__state" aria-hidden="true" />
                    </button>
                </section>

                <div className="border-t border-[#2b3931] pt-4">
                    <div className="mb-3 flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-[.12em] text-[#87968a]">Algorithm notes</span>
                        <span className="text-[9px] font-mono text-[#6e7d72]">03 / Context</span>
                    </div>
                    <AlgorithmInfoPanel
                        algorithmName={algorithm || ''}
                        algorithmId={algorithm || ''}
                        currentStep={currentStep || undefined}
                        stepIndex={currentStepIndex}
                        totalSteps={steps.length}
                    />
                </div>
            </aside>

            <section className="av-workspace__stage" aria-label="Algorithm visualization stage">
                <header className="av-stage__header">
                    <div>
                        <p className="av-overline">Execution trace / live state</p>
                        <h2 className="av-stage__title">{algorithm ? titleCase(algorithm) : 'Algorithm trace'}</h2>
                    </div>
                    <div className="av-stage__stats" aria-live="polite">
                        <span className="av-stage__stat">Events <strong>{steps.length}</strong></span>
                        <span className="av-stage__stat">Step <strong>{currentStepLabel}</strong>{steps.length > 0 ? ' / ' + steps.length : ''}</span>
                    </div>
                </header>

                <div className="av-stage__progress" aria-label="Playback progress">
                    <motion.div
                        className="av-stage__progress-fill"
                        initial={false}
                        animate={{ width: progress + '%' }}
                        transition={{ ease: 'linear', duration: isPlaying ? 1 / safeSpeed : .18 }}
                    />
                </div>

                <div className="av-stage__canvas">
                    {isLoading ? (
                        <div className="av-stage__loading" role="status">
                            <span className="av-stage__loading-mark" />
                            <strong className="block text-sm text-[#edf0e7]">Building the execution trace</strong>
                            <span className="mt-2 block text-xs">Preparing the data structure and step-by-step state.</span>
                        </div>
                    ) : loadError ? (
                        <div className="av-stage__error" role="alert">
                            <strong>Could not run this algorithm</strong>
                            <p>{loadError}</p>
                            {inputData && algoType && (
                                <button
                                    type="button"
                                    onClick={() => fetchSolution(algoType, inputData)}
                                    className="mt-4 rounded-md border border-[#ff8063]/50 bg-[#ff8063]/10 px-4 py-2 text-xs font-bold text-[#ffb19e]"
                                >
                                    Try again
                                </button>
                            )}
                        </div>
                    ) : renderCanvas()}
                </div>

                <StepInspector
                    step={currentStep}
                    stepIndex={currentStepIndex}
                    totalSteps={steps.length}
                    algorithmName={algorithm || ''}
                />
                <AlgorithmResultPanel
                    result={currentStepIndex === steps.length - 1 ? algorithmResult : null}
                    algorithmName={algorithm || ''}
                />
            </section>

            {showCode && (
                <aside className="av-workspace__code" aria-label="Code and execution metrics">
                    <div className="av-code__header">
                        <div>
                            <div className="av-code__title"><Code size={14} className="mr-2 inline text-[#d6f56a]" /> Code implementation</div>
                            <span className="av-code__subtitle">Reference / source view</span>
                        </div>
                        <button type="button" onClick={() => setShowCode(false)} className="av-control-button" aria-label="Hide code panel">
                            <ChevronRight size={16} />
                        </button>
                    </div>
                    <div className="av-code__body">
                        <CodeExport algorithm={algorithm || 'knapsack'} />
                    </div>
                    <div className="av-code__metrics">
                        <h4>Current step metrics</h4>
                        <div className="av-code__metric-grid">
                            <div className="av-code__metric">
                                <span>Comparisons</span>
                                <strong>{currentStep?.metrics?.comparisons ?? 0}</strong>
                            </div>
                            <div className="av-code__metric">
                                <span>Swaps / operations</span>
                                <strong>{currentStep?.metrics?.swaps ?? 0}</strong>
                            </div>
                        </div>
                    </div>
                </aside>
            )}

            {!showCode && (
                <button type="button" onClick={() => setShowCode(true)} className="av-code-toggle" aria-label="Show code panel">
                    <ChevronLeft size={17} />
                </button>
            )}

            <PredictionModal
                isVisible={showPredictionModal}
                question={predictionQuestion?.q || ''}
                options={predictionQuestion?.options || []}
                correctAnswer={correctPrediction}
                onSelect={handlePredictionSelect}
                onClose={handlePredictionClose}
            />
        </div>
    );
};

export default Visualizer;