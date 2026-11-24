import React from 'react';
import { motion } from 'framer-motion';
import { StepType } from '../types';
import type { Step } from '../types';

interface TimelineScrubberProps {
    totalSteps: number;
    currentStep: number;
    onSeek: (step: number) => void;
    steps?: Step[];
}

const markerColor = (type: StepType): string => {
    switch (type) {
        case StepType.INIT: return '#78b8ff';
        case StepType.PICK: return '#d5ef79';
        case StepType.REJECT: return '#ed765f';
        case StepType.SOLUTION: return '#b7a2ff';
        default: return '#a9b8c9';
    }
};

const TimelineScrubber: React.FC<TimelineScrubberProps> = ({
    totalSteps,
    currentStep,
    onSeek,
    steps = []
}) => {
    const safeTotal = Math.max(0, Math.floor(totalSteps));
    const lastIndex = Math.max(0, safeTotal - 1);
    const activeIndex = Math.max(0, Math.min(currentStep, lastIndex));
    const hasActiveStep = safeTotal > 0 && currentStep >= 0;
    const progress = hasActiveStep ? ((activeIndex + 1) / safeTotal) * 100 : 0;

    const markers = steps
        .map((step, index) => ({
            index,
            type: step.type,
            position: safeTotal > 1 ? (index / (safeTotal - 1)) * 100 : 0
        }))
        .filter(marker =>
            marker.type === StepType.INIT ||
            marker.type === StepType.PICK ||
            marker.type === StepType.REJECT ||
            marker.type === StepType.SOLUTION
        );

    return (
        <div className="av-timeline-scrubber">
            <div className="av-timeline-scrubber__meta" aria-live="polite">
                <span>{safeTotal === 0 ? 'No trace loaded' : hasActiveStep ? `Step ${activeIndex + 1} / ${safeTotal}` : `Ready · ${safeTotal} steps`}</span>
                <strong>{Math.round(progress)}%</strong>
            </div>

            <div className="av-timeline-scrubber__control">
                <input
                    className="av-timeline-scrubber__input"
                    type="range"
                    min={0}
                    max={lastIndex}
                    step={1}
                    value={activeIndex}
                    disabled={safeTotal === 0}
                    onChange={event => onSeek(Number(event.currentTarget.value))}
                    aria-label="Seek through algorithm execution"
                    aria-valuetext={safeTotal === 0
                        ? 'No steps available'
                        : hasActiveStep
                            ? `Step ${activeIndex + 1} of ${safeTotal}`
                            : `Before step 1 of ${safeTotal}`}
                />
                <div className="av-timeline-scrubber__track" aria-hidden="true">
                    <motion.div
                        className="av-timeline-scrubber__fill"
                        initial={false}
                        animate={{ width: progress + '%' }}
                        transition={{ duration: 0.16, ease: 'easeOut' }}
                    />
                    <div className="av-timeline-scrubber__markers">
                        {markers.map(marker => (
                            <span
                                key={marker.index}
                                className="av-timeline-scrubber__marker"
                                style={{ left: marker.position + '%', backgroundColor: markerColor(marker.type) }}
                                title={`${marker.type} · step ${marker.index + 1}`}
                            />
                        ))}
                    </div>
                </div>
            </div>

            <div className="av-timeline-scrubber__legend" aria-label="Timeline event legend">
                <span><i style={{ backgroundColor: '#78b8ff' }} />Init</span>
                <span><i style={{ backgroundColor: '#d5ef79' }} />Pick</span>
                <span><i style={{ backgroundColor: '#ed765f' }} />Reject</span>
                <span><i style={{ backgroundColor: '#b7a2ff' }} />Solution</span>
            </div>
        </div>
    );
};

export default TimelineScrubber;
