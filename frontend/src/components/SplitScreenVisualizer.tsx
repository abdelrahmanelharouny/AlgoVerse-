import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, SkipForward, SkipBack, Zap, Target } from 'lucide-react';
import DPTableCanvas from './DPTableCanvas';
import GreedyChainCanvas from './GreedyChainCanvas';
import type { AlgorithmResult } from '../types';
import { useAlgorithmState } from '../hooks/useAlgorithmState';

interface SplitScreenVisualizerProps {
    greedyResult: AlgorithmResult;
    dpResult: AlgorithmResult;
}

const SplitScreenVisualizer: React.FC<SplitScreenVisualizerProps> = ({
    greedyResult,
    dpResult
}) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [speed, setSpeed] = useState(1);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Determine max steps to synchronize
    const maxSteps = Math.max(greedyResult.steps.length, dpResult.steps.length);

    // Map current synchronized step to individual algorithm steps
    const greedyStepIndex = Math.min(currentStep, greedyResult.steps.length - 1);
    const dpStepIndex = Math.min(currentStep, dpResult.steps.length - 1);

    // Compute state for both algorithms
    const greedyState = useAlgorithmState(greedyResult.steps, greedyStepIndex);
    const dpState = useAlgorithmState(dpResult.steps, dpStepIndex);

    const greedyStep = greedyResult.steps[greedyStepIndex];
    const dpStep = dpResult.steps[dpStepIndex];

    useEffect(() => {
        if (isPlaying && currentStep < maxSteps - 1) {
            timerRef.current = setTimeout(() => {
                setCurrentStep(prev => prev + 1);
            }, 1000 / speed);
        } else if (currentStep >= maxSteps - 1) {
            setIsPlaying(false);
        }

        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, [isPlaying, currentStep, maxSteps, speed]);

    const togglePlay = () => setIsPlaying(!isPlaying);
    const reset = () => {
        setIsPlaying(false);
        setCurrentStep(0);
    };
    const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, maxSteps - 1));
    const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 0));

    return (
        <div className="space-y-6">
            {/* Controls */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={togglePlay}
                        className="p-3 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-white transition-colors"
                    >
                        {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                    </button>
                    <div className="flex gap-2">
                        <button onClick={reset} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors">
                            <RotateCcw size={18} />
                        </button>
                        <button onClick={prevStep} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors">
                            <SkipBack size={18} />
                        </button>
                        <button onClick={nextStep} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors">
                            <SkipForward size={18} />
                        </button>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="text-sm font-mono text-slate-400">
                        Step {currentStep + 1} / {maxSteps}
                    </div>
                    <select
                        value={speed}
                        onChange={(e) => setSpeed(Number(e.target.value))}
                        className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-300 focus:outline-none focus:border-indigo-500"
                    >
                        <option value={0.5}>0.5x</option>
                        <option value={1}>1x</option>
                        <option value={2}>2x</option>
                        <option value={4}>4x</option>
                    </select>
                </div>
            </div>

            {/* Split View */}
            <div className="grid lg:grid-cols-2 gap-6">
                {/* Greedy Side */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Zap className="text-emerald-400" size={20} />
                            <h3 className="font-bold text-white">Greedy Execution</h3>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full ${currentStep >= greedyResult.steps.length - 1
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-slate-800 text-slate-400'
                            }`}>
                            {currentStep >= greedyResult.steps.length - 1 ? 'Completed' : 'Running'}
                        </span>
                    </div>

                    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden h-[400px] relative">
                        <GreedyChainCanvas
                            decisions={greedyState.greedyDecisions}
                            currentIndex={greedyState.greedyDecisions.length - 1}
                        />

                        {/* Step Description Overlay */}
                        <div className="absolute bottom-4 left-4 right-4 bg-slate-950/90 backdrop-blur border border-slate-800 p-3 rounded-lg">
                            <p className="text-sm text-slate-300">
                                {greedyStep.description}
                            </p>
                        </div>
                    </div>
                </div>

                {/* DP Side */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Target className="text-indigo-400" size={20} />
                            <h3 className="font-bold text-white">DP Execution</h3>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full ${currentStep >= dpResult.steps.length - 1
                            ? 'bg-indigo-500/20 text-indigo-400'
                            : 'bg-slate-800 text-slate-400'
                            }`}>
                            {currentStep >= dpResult.steps.length - 1 ? 'Completed' : 'Running'}
                        </span>
                    </div>

                    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden h-[400px] relative">
                        <DPTableCanvas
                            data={dpState.dpTable}
                            highlightedCell={dpState.highlightedCell}
                        />

                        {/* Step Description Overlay */}
                        <div className="absolute bottom-4 left-4 right-4 bg-slate-950/90 backdrop-blur border border-slate-800 p-3 rounded-lg">
                            <p className="text-sm text-slate-300">
                                {dpStep.description}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SplitScreenVisualizer;
