import { useCallback, useEffect, useRef, useState } from 'react';
import type { Step } from '../types';

interface UseAnimationEngineProps {
    steps: Step[];
    speed: number;
    onStepChange?: (index: number, step: Step) => void;
}

/**
 * Playback controller for algorithm timelines.
 *
 * - Keeps the timer stable when parent callbacks are recreated.
 * - Supports deterministic manual stepping and playback.
 * - Stops safely when a new result replaces the previous timeline.
 * - Never starts a timer for an empty timeline or an invalid speed.
 */
export const useAnimationEngine = ({
    steps,
    speed,
    onStepChange
}: UseAnimationEngineProps) => {
    const [currentStepIndex, setCurrentStepIndex] = useState(-1);
    const [isPlaying, setIsPlaying] = useState(false);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const callbackRef = useRef(onStepChange);
    const stepsRef = useRef(steps);

    useEffect(() => {
        callbackRef.current = onStepChange;
    }, [onStepChange]);

    useEffect(() => {
        if (stepsRef.current !== steps) {
            stepsRef.current = steps;
            setIsPlaying(false);
            setCurrentStepIndex(-1);
        }
    }, [steps]);

    const clearTimer = useCallback(() => {
        if (timerRef.current !== null) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }
    }, []);

    const emitStep = useCallback((index: number) => {
        const step = stepsRef.current[index];
        if (step) callbackRef.current?.(index, step);
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
            const nextIndex = currentStepIndex + 1;
            setCurrentStepIndex(nextIndex);
            emitStep(nextIndex);
        }, 1000 / safeSpeed);

        return clearTimer;
    }, [isPlaying, currentStepIndex, steps.length, speed, clearTimer, emitStep]);

    useEffect(() => clearTimer, [clearTimer]);

    const togglePlay = useCallback(() => {
        if (stepsRef.current.length === 0) return;

        setIsPlaying(previous => {
            if (previous) return false;
            setCurrentStepIndex(index => index >= stepsRef.current.length - 1 ? -1 : index);
            return true;
        });
    }, []);

    const nextStep = useCallback(() => {
        setIsPlaying(false);
        setCurrentStepIndex(index => {
            const nextIndex = Math.min(index + 1, stepsRef.current.length - 1);
            if (nextIndex >= 0) emitStep(nextIndex);
            return nextIndex;
        });
    }, [emitStep]);

    const prevStep = useCallback(() => {
        setIsPlaying(false);
        setCurrentStepIndex(index => {
            const previousIndex = Math.max(-1, index - 1);
            if (previousIndex >= 0) emitStep(previousIndex);
            return previousIndex;
        });
    }, [emitStep]);

    const reset = useCallback(() => {
        clearTimer();
        setIsPlaying(false);
        setCurrentStepIndex(-1);
    }, [clearTimer]);

    const seekToStep = useCallback((index: number) => {
        setIsPlaying(false);
        const safeIndex = stepsRef.current.length === 0
            ? -1
            : Math.max(-1, Math.min(index, stepsRef.current.length - 1));
        setCurrentStepIndex(safeIndex);
        if (safeIndex >= 0) emitStep(safeIndex);
    }, [emitStep]);

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
