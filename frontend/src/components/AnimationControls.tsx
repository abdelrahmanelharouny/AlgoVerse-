import React from 'react';
import { Play, Pause, SkipBack, SkipForward, RotateCcw } from 'lucide-react';
import TimelineScrubber from './TimelineScrubber';
import type { Step } from '../types';

interface AnimationControlsProps {
    isPlaying: boolean;
    onTogglePlay: () => void;
    onNext: () => void;
    onPrev: () => void;
    onReset: () => void;
    speed: number;
    onSpeedChange: (speed: number) => void;
    progress: number;
    onSeek: (e: React.ChangeEvent<HTMLInputElement>) => void;
    currentStep: number;
    totalSteps: number;
    steps?: Step[];
}

const AnimationControls: React.FC<AnimationControlsProps> = ({
    isPlaying,
    onTogglePlay,
    onNext,
    onPrev,
    onReset,
    speed,
    onSpeedChange,

    onSeek,
    currentStep,
    totalSteps,
    steps = []
}) => {
    const handleTimelineSeek = (stepIndex: number) => {
        const fakeEvent = {
            target: { value: ((stepIndex / totalSteps) * 100).toString() }
        } as React.ChangeEvent<HTMLInputElement>;
        onSeek(fakeEvent);
    };

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col gap-4 shadow-lg">
            {/* Enhanced Timeline Scrubber */}
            <TimelineScrubber
                totalSteps={totalSteps}
                currentStep={currentStep}
                onSeek={handleTimelineSeek}
                steps={steps}
            />

            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <button
                        onClick={onReset}
                        className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                        title="Reset"
                    >
                        <RotateCcw size={20} />
                    </button>

                    <div className="h-6 w-px bg-slate-700 mx-2" />

                    <button
                        onClick={onPrev}
                        className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                        title="Previous Step"
                    >
                        <SkipBack size={20} />
                    </button>

                    <button
                        onClick={onTogglePlay}
                        className="p-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full shadow-lg shadow-indigo-500/25 transition-all active:scale-95"
                        title={isPlaying ? "Pause" : "Play"}
                    >
                        {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" />}
                    </button>

                    <button
                        onClick={onNext}
                        className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                        title="Next Step"
                    >
                        <SkipForward size={20} />
                    </button>
                </div>

                <div className="flex items-center gap-3">
                    <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Speed</span>
                    <div className="flex bg-slate-800 rounded-lg p-1">
                        {[0.5, 1, 2, 4].map((s) => (
                            <button
                                key={s}
                                onClick={() => onSpeedChange(s)}
                                className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${speed === s
                                    ? 'bg-indigo-600 text-white shadow-sm'
                                    : 'text-slate-400 hover:text-slate-200'
                                    }`}
                            >
                                {s}x
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AnimationControls;
