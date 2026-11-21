import React from 'react';
import { motion } from 'framer-motion';

interface StepTimelineProps {
    totalSteps: number;
    currentStep: number;
    onStepClick: (step: number) => void;
    stepTypes?: string[];
}

const stepColor = (type?: string): string => {
    switch ((type || '').toLowerCase()) {
        case 'init': return '#83cbd8';
        case 'highlight': return '#ffbd63';
        case 'update': return '#d6f56a';
        case 'pick': return '#9fe0aa';
        case 'reject': return '#ff8063';
        case 'sort': return '#c6a5f5';
        case 'solution': return '#d6f56a';
        default: return '#809187';
    }
};

const StepTimeline: React.FC<StepTimelineProps> = ({
    totalSteps,
    currentStep,
    onStepClick,
    stepTypes = []
}) => {
    const showDots = totalSteps > 0 && totalSteps <= 20;
    const progress = totalSteps > 0
        ? Math.max(0, Math.min(100, ((currentStep + 1) / totalSteps) * 100))
        : 0;
    const activeLabel = currentStep < 0 ? 'Ready to begin' : 'Step ' + (currentStep + 1) + ' of ' + totalSteps;

    return (
        <div className="w-full" aria-label="Execution timeline">
            <div className="mb-2 flex items-center justify-between gap-3">
                <span className="text-[10px] font-semibold text-[#aab7ac]" aria-live="polite">
                    {totalSteps === 0 ? 'No trace loaded' : activeLabel}
                </span>
                <span className="font-mono text-[10px] text-[#d6f56a]">{Math.round(progress)}%</span>
            </div>

            <div className="relative">
                <div className="h-[5px] overflow-hidden rounded-full bg-[#2a392f]">
                    <motion.div
                        className="h-full rounded-full bg-[#d6f56a]"
                        initial={false}
                        animate={{ width: progress + '%' }}
                        transition={{ duration: .2 }}
                    />
                </div>
                {totalSteps > 0 && (
                    <input
                        type="range"
                        min="0"
                        max={Math.max(0, totalSteps - 1)}
                        value={currentStep >= 0 ? currentStep : 0}
                        onChange={event => onStepClick(parseInt(event.target.value, 10))}
                        className="absolute inset-0 z-0 h-[5px] w-full cursor-pointer opacity-0"
                        aria-label="Seek to algorithm step"
                    />
                )}
                {showDots && (
                    <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-between px-[2px]">
                        {Array.from({ length: totalSteps }).map((_, index) => (
                            <button
                                key={index}
                                type="button"
                                onClick={() => onStepClick(index)}
                                className="pointer-events-auto h-[9px] w-[9px] rounded-full border border-[#0f1712] transition-transform hover:scale-150 focus-visible:scale-150"
                                style={{
                                    backgroundColor: index <= currentStep ? stepColor(stepTypes[index]) : '#45554a',
                                    boxShadow: index === currentStep ? '0 0 0 2px #d6f56a' : 'none'
                                }}
                                title={'Go to step ' + (index + 1) + (stepTypes[index] ? ' (' + stepTypes[index] + ')' : '')}
                                aria-label={'Go to step ' + (index + 1)}
                                aria-current={index === currentStep ? 'step' : undefined}
                            />
                        ))}
                    </div>
                )}
            </div>

            <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1.5 text-[9px] text-[#7f8e83]">
                <span className="inline-flex items-center gap-1.5"><i className="h-1.5 w-1.5 rounded-full bg-[#83cbd8]" /> Init</span>
                <span className="inline-flex items-center gap-1.5"><i className="h-1.5 w-1.5 rounded-full bg-[#ffbd63]" /> Check</span>
                <span className="inline-flex items-center gap-1.5"><i className="h-1.5 w-1.5 rounded-full bg-[#d6f56a]" /> Update</span>
                <span className="inline-flex items-center gap-1.5"><i className="h-1.5 w-1.5 rounded-full bg-[#9fe0aa]" /> Pick</span>
                <span className="inline-flex items-center gap-1.5"><i className="h-1.5 w-1.5 rounded-full bg-[#ff8063]" /> Reject</span>
            </div>
        </div>
    );
};

export default StepTimeline;