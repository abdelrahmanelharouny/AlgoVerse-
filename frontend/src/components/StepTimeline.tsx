import React from 'react';
import { motion } from 'framer-motion';

interface StepTimelineProps {
    totalSteps: number;
    currentStep: number;
    onStepClick: (step: number) => void;
    stepTypes?: string[];
}

const StepTimeline: React.FC<StepTimelineProps> = ({
    totalSteps,
    currentStep,
    onStepClick,
    stepTypes = []
}) => {
    // Show up to 20 dots for steps, otherwise use condensed view
    const showDots = totalSteps <= 20;
    const progress = totalSteps > 0 ? ((currentStep + 1) / totalSteps) * 100 : 0;

    const getStepColor = (type?: string) => {
        switch (type) {
            case 'INIT': return 'bg-blue-500';
            case 'HIGHLIGHT': return 'bg-yellow-500';
            case 'UPDATE': return 'bg-emerald-500';
            case 'PICK': return 'bg-green-500';
            case 'REJECT': return 'bg-red-500';
            case 'COMPARE': return 'bg-purple-500';
            case 'SORT': return 'bg-orange-500';
            default: return 'bg-indigo-500';
        }
    };

    return (
        <div className="w-full">
            {/* Progress bar with step info */}
            <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-slate-400">
                    Step <span className="text-white font-semibold">{currentStep + 1}</span> of {totalSteps}
                </span>
                <span className="text-xs text-indigo-400 font-mono">
                    {Math.round(progress)}%
                </span>
            </div>

            {/* Timeline track */}
            <div className="relative">
                {/* Background track */}
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.2 }}
                    />
                </div>

                {/* Clickable slider handle */}
                <input
                    type="range"
                    min="0"
                    max={Math.max(0, totalSteps - 1)}
                    value={currentStep >= 0 ? currentStep : 0}
                    onChange={(e) => onStepClick(parseInt(e.target.value))}
                    className="absolute inset-0 w-full h-2 opacity-0 cursor-pointer"
                    style={{ margin: 0 }}
                />

                {/* Show dots for small step counts */}
                {showDots && totalSteps > 0 && (
                    <div className="absolute inset-0 flex items-center justify-between px-1 pointer-events-none">
                        {Array.from({ length: totalSteps }).map((_, i) => (
                            <button
                                key={i}
                                onClick={() => onStepClick(i)}
                                className={`w-2 h-2 rounded-full transition-all pointer-events-auto hover:scale-150 ${i <= currentStep
                                        ? getStepColor(stepTypes[i])
                                        : 'bg-slate-600'
                                    } ${i === currentStep ? 'ring-2 ring-white ring-offset-1 ring-offset-slate-950' : ''}`}
                                title={`Step ${i + 1}${stepTypes[i] ? ` (${stepTypes[i]})` : ''}`}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Step type legend */}
            <div className="flex flex-wrap gap-2 mt-3 text-xs">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500"></span> Init</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-500"></span> Check</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> Update</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500"></span> Pick</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500"></span> Reject</span>
            </div>
        </div>
    );
};

export default StepTimeline;
