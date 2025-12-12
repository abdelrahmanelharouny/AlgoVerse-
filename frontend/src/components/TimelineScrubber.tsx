import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { StepType } from '../types';
import type { Step } from '../types';

interface TimelineScrubberProps {
    totalSteps: number;
    currentStep: number;
    onSeek: (step: number) => void;
    steps?: Step[];
}

const TimelineScrubber: React.FC<TimelineScrubberProps> = ({
    totalSteps,
    currentStep,
    onSeek,
    steps = []
}) => {
    const [isDragging, setIsDragging] = useState(false);
    const trackRef = useRef<HTMLDivElement>(null);

    const progress = totalSteps > 0 ? (currentStep / totalSteps) * 100 : 0;

    const handleMouseDown = () => {
        setIsDragging(true);
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (isDragging && trackRef.current) {
            const rect = trackRef.current.getBoundingClientRect();
            const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
            const percentage = x / rect.width;
            const newStep = Math.floor(percentage * totalSteps);
            onSeek(newStep);
        }
    };

    const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (trackRef.current) {
            const rect = trackRef.current.getBoundingClientRect();
            const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
            const percentage = x / rect.width;
            const newStep = Math.floor(percentage * totalSteps);
            onSeek(newStep);
        }
    };

    // Get important step markers
    const getStepMarkers = () => {
        return steps
            .map((step, index) => ({
                index,
                type: step.type,
                position: (index / totalSteps) * 100
            }))
            .filter(marker =>
                marker.type === StepType.INIT ||
                marker.type === StepType.PICK ||
                marker.type === StepType.REJECT ||
                marker.type === StepType.SOLUTION
            );
    };

    const markers = getStepMarkers();

    const getMarkerColor = (type: StepType) => {
        switch (type) {
            case StepType.INIT:
                return 'bg-blue-400';
            case StepType.PICK:
                return 'bg-emerald-400';
            case StepType.REJECT:
                return 'bg-red-400';
            case StepType.SOLUTION:
                return 'bg-purple-400';
            default:
                return 'bg-slate-400';
        }
    };

    React.useEffect(() => {
        if (isDragging) {
            document.addEventListener('mouseup', handleMouseUp as any);
            return () => {
                document.removeEventListener('mouseup', handleMouseUp as any);
            };
        }
    }, [isDragging]);

    return (
        <div className="w-full space-y-2">
            {/* Step counter */}
            <div className="flex justify-between items-center text-xs text-slate-400">
                <span>Step {currentStep + 1} of {totalSteps}</span>
                <span>{progress.toFixed(0)}%</span>
            </div>

            {/* Timeline track */}
            <div
                ref={trackRef}
                className="relative h-3 bg-slate-800 rounded-full cursor-pointer group"
                onClick={handleClick}
                onMouseMove={handleMouseMove}
                onMouseDown={handleMouseDown}
            >
                {/* Progress fill */}
                <motion.div
                    className="absolute left-0 top-0 h-full bg-gradient-to-r from-indigo-600 to-indigo-500 rounded-full"
                    style={{ width: `${progress}%` }}
                    initial={false}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: isDragging ? 0 : 0.2 }}
                />

                {/* Step markers */}
                {markers.map((marker, idx) => (
                    <div
                        key={idx}
                        className={`absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full ${getMarkerColor(marker.type)} opacity-70 group-hover:opacity-100 transition-opacity`}
                        style={{ left: `${marker.position}%` }}
                        title={`${marker.type} (Step ${marker.index + 1})`}
                    />
                ))}

                {/* Scrubber handle */}
                <motion.div
                    className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 bg-white rounded-full shadow-lg border-2 border-indigo-500 cursor-grab ${isDragging ? 'cursor-grabbing scale-110' : 'scale-100'
                        } transition-transform`}
                    style={{ left: `${progress}%`, marginLeft: '-10px' }}
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 1.1 }}
                >
                    <div className="absolute inset-0 rounded-full bg-indigo-500 opacity-20 animate-ping" />
                </motion.div>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 text-xs text-slate-500">
                <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-blue-400" />
                    <span>Init</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span>Pick</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-red-400" />
                    <span>Reject</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-purple-400" />
                    <span>Solution</span>
                </div>
            </div>
        </div>
    );
};

export default TimelineScrubber;
