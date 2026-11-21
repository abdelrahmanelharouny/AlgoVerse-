import { useCallback, useEffect, useRef, useState } from 'react';
import type { Step } from '../types';

interface UseAnimationEngineProps {
    steps: Step[];
    speed: number;
    onStepChange?: (index: number, step: Step) => void;
}

interface PlaybackState {
    timeline: Step[];
    index: number;
    playing: boolean;
}

/**
 * Deterministic timeline controller. The active timeline is stored with playback
 * state, so replacing a result resets the visible position without synchronously
 * setting React state from an effect.
 */
export const useAnimationEngine = ({ steps, speed, onStepChange }: UseAnimationEngineProps) => {
    const [playback, setPlayback] = useState<PlaybackState>(() => ({
        timeline: steps,
        index: -1,
        playing: false
    }));
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const callbackRef = useRef(onStepChange);

    useEffect(() => {
        callbackRef.current = onStepChange;
    }, [onStepChange]);

    const sameTimeline = playback.timeline === steps;
    const currentStepIndex = sameTimeline ? playback.index : -1;
    const isPlaying = sameTimeline && playback.playing
        && steps.length > 0 && currentStepIndex < steps.length - 1;

    const currentStep = currentStepIndex >= 0 && currentStepIndex < steps.length
        ? steps[currentStepIndex]
        : null;

    const progress = steps.length > 0
        ? Math.max(0, Math.min(100, ((currentStepIndex + 1) / steps.length) * 100))
        : 0;

    const clearTimer = useCallback(() => {
        if (timerRef.current !== null) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }
    }, []);

    const commitIndex = useCallback((index: number, playing = false, notify = false) => {
        const safeIndex = steps.length === 0
            ? -1
            : Math.max(-1, Math.min(index, steps.length - 1));
        setPlayback({ timeline: steps, index: safeIndex, playing });
        if (notify && safeIndex >= 0) {
            const step = steps[safeIndex];
            if (step) callbackRef.current?.(safeIndex, step);
        }
    }, [steps]);

    useEffect(() => {
        clearTimer();
        if (!isPlaying) return;

        const safeSpeed = Number.isFinite(speed) && speed > 0 ? speed : 1;
        timerRef.current = setTimeout(() => {
            const nextIndex = Math.min(currentStepIndex + 1, steps.length - 1);
            const keepPlaying = nextIndex < steps.length - 1;
            setPlayback({ timeline: steps, index: nextIndex, playing: keepPlaying });
            const step = steps[nextIndex];
            if (step) callbackRef.current?.(nextIndex, step);
        }, 1000 / safeSpeed);

        return clearTimer;
    }, [isPlaying, currentStepIndex, steps, speed, clearTimer]);

    useEffect(() => clearTimer, [clearTimer]);

    const togglePlay = useCallback(() => {
        if (steps.length === 0) return;
        if (isPlaying) {
            commitIndex(currentStepIndex, false);
            return;
        }
        const startIndex = currentStepIndex >= steps.length - 1 ? -1 : currentStepIndex;
        commitIndex(startIndex, true);
    }, [steps.length, isPlaying, currentStepIndex, commitIndex]);

    const nextStep = useCallback(() => {
        commitIndex(currentStepIndex + 1, false, true);
    }, [currentStepIndex, commitIndex]);

    const prevStep = useCallback(() => {
        commitIndex(currentStepIndex - 1, false, true);
    }, [currentStepIndex, commitIndex]);

    const reset = useCallback(() => {
        clearTimer();
        commitIndex(-1, false);
    }, [clearTimer, commitIndex]);

    const seekToStep = useCallback((index: number) => {
        commitIndex(index, false, true);
    }, [commitIndex]);

    return {
        currentStep,
        currentStepIndex,
        isPlaying,
        togglePlay,
        nextStep,
        prevStep,
        reset,
        progress,
        setCurrentStepIndex: seekToStep
    };
};
