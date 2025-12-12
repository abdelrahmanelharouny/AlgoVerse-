import { useState, useEffect, useCallback, useRef } from 'react';

export interface ComplexityMetrics {
    operations: number;
    timeComplexity: string;
    spaceComplexity: string;
    memoryBytes: number;
    realTimeMs: number;
    comparisonCount?: number;
    swapCount?: number;
}

interface UseComplexityMetricsOptions {
    algorithmType: 'dp' | 'greedy';
    inputSize: number;
    auxiliarySpace?: number;
}

interface UseComplexityMetricsReturn extends ComplexityMetrics {
    incrementOps: () => void;
    incrementComparisons: () => void;
    incrementSwaps: () => void;
    startTimer: () => void;
    stopTimer: () => void;
    reset: () => void;
}

export const useComplexityMetrics = (
    options: UseComplexityMetricsOptions
): UseComplexityMetricsReturn => {
    const [operations, setOperations] = useState(0);
    const [comparisonCount, setComparisonCount] = useState(0);
    const [swapCount, setSwapCount] = useState(0);
    const [realTimeMs, setRealTimeMs] = useState(0);

    const startTime = useRef<number | null>(null);
    const timerInterval = useRef<number | null>(null);

    // Calculate theoretical complexity
    const getTimeComplexity = useCallback((): string => {
        const { algorithmType } = options;

        if (algorithmType === 'dp') {
            return `O(n²)`;
        } else {
            return `O(n log n)`;
        }
    }, [options]);

    const getSpaceComplexity = useCallback((): string => {
        const { algorithmType } = options;

        if (algorithmType === 'dp') {
            return `O(n × W)`;
        } else {
            return `O(n)`;
        }
    }, [options]);

    const calculateMemoryBytes = useCallback((): number => {
        const { algorithmType, inputSize, auxiliarySpace = 0 } = options;

        // Rough estimation: each number = 8 bytes (64-bit)
        if (algorithmType === 'dp') {
            // DP table: n × W cells
            return inputSize * (auxiliarySpace || inputSize) * 8;
        } else {
            // Greedy: typically just array of decisions
            return inputSize * 8;
        }
    }, [options]);

    const incrementOps = useCallback(() => {
        setOperations(prev => prev + 1);
    }, []);

    const incrementComparisons = useCallback(() => {
        setComparisonCount(prev => prev + 1);
    }, []);

    const incrementSwaps = useCallback(() => {
        setSwapCount(prev => prev + 1);
    }, []);

    const startTimer = useCallback(() => {
        startTime.current = Date.now();
        timerInterval.current = setInterval(() => {
            if (startTime.current) {
                setRealTimeMs(Date.now() - startTime.current);
            }
        }, 10); // Update every 10ms
    }, []);

    const stopTimer = useCallback(() => {
        if (timerInterval.current) {
            clearInterval(timerInterval.current);
            timerInterval.current = null;
        }
        if (startTime.current) {
            setRealTimeMs(Date.now() - startTime.current);
        }
    }, []);

    const reset = useCallback(() => {
        setOperations(0);
        setComparisonCount(0);
        setSwapCount(0);
        setRealTimeMs(0);
        startTime.current = null;
        if (timerInterval.current) {
            clearInterval(timerInterval.current);
            timerInterval.current = null;
        }
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (timerInterval.current) {
                clearInterval(timerInterval.current);
            }
        };
    }, []);

    return {
        operations,
        timeComplexity: getTimeComplexity(),
        spaceComplexity: getSpaceComplexity(),
        memoryBytes: calculateMemoryBytes(),
        realTimeMs,
        comparisonCount,
        swapCount,
        incrementOps,
        incrementComparisons,
        incrementSwaps,
        startTimer,
        stopTimer,
        reset
    };
};

export default useComplexityMetrics;
