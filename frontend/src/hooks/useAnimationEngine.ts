import { useState, useEffect, useRef } from 'react';
import type { Step } from '../types';

interface UseAnimationEngineProps {
    steps: Step[];
    speed: number;
    onStepChange?: (index: number, step: Step) => void;
}

export const useAnimationEngine = ({
    steps,
    speed,
    onStepChange
}: UseAnimationEngineProps) => {
    const [currentStepIndex, setCurrentStepIndex] = useState(-1);
    const [isPlaying, setIsPlaying] = useState(false);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const currentStep = currentStepIndex >= 0 && currentStepIndex < steps.length
        ? steps[currentStepIndex]
        : null;

    const progress = steps.length > 0
        ? ((currentStepIndex + 1) / steps.length) * 100
        : 0;

    useEffect(() => {
        if (isPlaying && currentStepIndex < steps.length - 1) {
            timerRef.current = setTimeout(() => {
                const nextIndex = currentStepIndex + 1;
                setCurrentStepIndex(nextIndex);
                if (onStepChange && steps[nextIndex]) {
                    onStepChange(nextIndex, steps[nextIndex]);
                }
            }, 1000 / speed);
        } else if (currentStepIndex >= steps.length - 1) {
            setIsPlaying(false);
        }

        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
        };
    }, [isPlaying, currentStepIndex, steps, speed, onStepChange]);

    const togglePlay = () => {
        if (currentStepIndex >= steps.length - 1) {
            setCurrentStepIndex(-1);
        }
        setIsPlaying(!isPlaying);
    };

    const nextStep = () => {
        if (currentStepIndex < steps.length - 1) {
            const nextIndex = currentStepIndex + 1;
            setCurrentStepIndex(nextIndex);
            if (onStepChange && steps[nextIndex]) {
                onStepChange(nextIndex, steps[nextIndex]);
            }
        }
    };

    const prevStep = () => {
        if (currentStepIndex > -1) {
            const prevIndex = currentStepIndex - 1;
            setCurrentStepIndex(prevIndex);
            if (onStepChange && prevIndex >= 0 && steps[prevIndex]) {
                onStepChange(prevIndex, steps[prevIndex]);
            }
        }
    };

    const reset = () => {
        setIsPlaying(false);
        setCurrentStepIndex(-1);
        if (timerRef.current) {
            clearTimeout(timerRef.current);
        }
    };

    return {
        currentStep,
        currentStepIndex,
        isPlaying,
        togglePlay,
        nextStep,
        prevStep,
        reset,
        progress,
        setCurrentStepIndex
    };
};
