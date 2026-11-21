import { useCallback, useEffect, useRef, useState } from 'react';
import type { Step } from '../types';

interface UseAnimationEngineProps {
    steps: Step[];
    speed: number;
    onStepChange?: (index: number, step: Step) => void;
}

/**
 * Playback controller for algorithm timelines.
 * State transitions are committed outside React state updater callbacks so
 * step listeners never run twice under StrictMode's updater replays.
 */
export const useAnimationEngine = ({ steps, speed, onStepChange }: UseAnimationEngineProps) => {
    const [currentStepIndex, setCurrentStepIndex] = useState(-1);
    const [isPlaying, setIsPlaying] = useState(false);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const callbackRef = useRef(onStepChange);
    const stepsRef = useRef(steps);
    const indexRef = useRef(-1);

    useEffect(() => { callbackRef.current = onStepChange; }, [onStepChange]);

    useEffect(() => {
        if (stepsRef.current !== steps) {
            stepsRef.current = steps;
            indexRef.current = -1;
            setIsPlaying(false);
            setCurrentStepIndex(-1);
        }
    }, [steps]);

    useEffect(() => { indexRef.current = currentStepIndex; }, [currentStepIndex]);

    const clearTimer = useCallback(() => {
        if (timerRef.current !== null) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }
    }, []);

    const commitIndex = useCallback((index: number, notify = false) => {
        const timeline = stepsRef.current;
        const safeIndex = timeline.length === 0
            ? -1
            : Math.max(-1, Math.min(index, timeline.length - 1));
        indexRef.current = safeIndex;
        setCurrentStepIndex(safeIndex);
        if (notify && safeIndex >= 0) {
            const step = timeline[safeIndex];
            if (step) callbackRef.current?.(safeIndex, step);
        }
    }, []);

    const currentStep = currentStepIndex >= 0 && currentStepIndex < steps.length
        ? steps[currentStepIndex]
        : null;

    const progress = steps.length > 0
        ? Math.max(0, Math.min(100, ((currentStepIndex + 1) / steps.length) * 100))
        : 0;

    useEffect(() => {
        clearTimer();
        if (!isPlaying || steps.length === 0) {
            if (steps.length === 0) setIsPlaying(false);
            return;
        }
        if (currentStepIndex >= steps.length - 1) {
            setIsPlaying(false);
            return;
        }
        const safeSpeed = Number.isFinite(speed) && speed > 0 ? speed : 1;
        timerRef.current = setTimeout(() => {
            const nextIndex = Math.min(indexRef.current + 1, stepsRef.current.length - 1);
            commitIndex(nextIndex, true);
        }, 1000 / safeSpeed);
        return clearTimer;
    }, [isPlaying, currentStepIndex, steps.length, speed, clearTimer, commitIndex]);

    useEffect(() => clearTimer, [clearTimer]);

    const togglePlay = useCallback(() => {
        if (stepsRef.current.length === 0) return;
        if (isPlaying) {
            setIsPlaying(false);
            return;
        }
        if (indexRef.current >= stepsRef.current.length - 1) commitIndex(-1);
        setIsPlaying(true);
    }, [isPlaying, commitIndex]);

    const nextStep = useCallback(() => {
        setIsPlaying(false);
        commitIndex(indexRef.current + 1, true);
    }, [commitIndex]);

    const prevStep = useCallback(() => {
        setIsPlaying(false);
        commitIndex(indexRef.current - 1, true);
    }, [commitIndex]);

    const reset = useCallback(() => {
        clearTimer();
        setIsPlaying(false);
        commitIndex(-1);
    }, [clearTimer, commitIndex]);

    const seekToStep = useCallback((index: number) => {
        setIsPlaying(false);
        commitIndex(index, true);
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
