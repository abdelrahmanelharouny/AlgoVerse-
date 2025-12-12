import { useState, useCallback, useRef } from 'react';
import type { Step } from '../types';

export interface StateSnapshot {
    step: number;
    dpTable?: number[][];
    greedyDecisions?: any[];
    highlightedCells?: Set<string>;
    currentStepData: Step;
    timestamp: number;
}

interface UseStateHistoryReturn {
    history: StateSnapshot[];
    currentIndex: number;
    recordState: (snapshot: Omit<StateSnapshot, 'timestamp'>) => void;
    jumpToStep: (index: number) => StateSnapshot | null;
    goToPrevious: () => StateSnapshot | null;
    goToNext: () => StateSnapshot | null;
    clearHistory: () => void;
    canGoBack: boolean;
    canGoForward: boolean;
    totalSteps: number;
}

export const useStateHistory = (): UseStateHistoryReturn => {
    const [history, setHistory] = useState<StateSnapshot[]>([]);
    const [currentIndex, setCurrentIndex] = useState(-1);
    const maxHistory = useRef(1000); // Limit to prevent memory issues

    const recordState = useCallback((snapshot: Omit<StateSnapshot, 'timestamp'>) => {
        const newSnapshot: StateSnapshot = {
            ...snapshot,
            timestamp: Date.now()
        };

        setHistory(prev => {
            // If we're not at the end, remove future states (new timeline)
            const newHistory = prev.slice(0, currentIndex + 1);

            // Add new snapshot
            newHistory.push(newSnapshot);

            // Enforce max history limit
            if (newHistory.length > maxHistory.current) {
                newHistory.shift();
                setCurrentIndex(newHistory.length - 1);
            } else {
                setCurrentIndex(newHistory.length - 1);
            }

            return newHistory;
        });
    }, [currentIndex]);

    const jumpToStep = useCallback((index: number): StateSnapshot | null => {
        if (index < 0 || index >= history.length) return null;
        setCurrentIndex(index);
        return history[index];
    }, [history]);

    const goToPrevious = useCallback((): StateSnapshot | null => {
        if (currentIndex <= 0) return null;
        const newIndex = currentIndex - 1;
        setCurrentIndex(newIndex);
        return history[newIndex];
    }, [currentIndex, history]);

    const goToNext = useCallback((): StateSnapshot | null => {
        if (currentIndex >= history.length - 1) return null;
        const newIndex = currentIndex + 1;
        setCurrentIndex(newIndex);
        return history[newIndex];
    }, [currentIndex, history]);

    const clearHistory = useCallback(() => {
        setHistory([]);
        setCurrentIndex(-1);
    }, []);

    return {
        history,
        currentIndex,
        recordState,
        jumpToStep,
        goToPrevious,
        goToNext,
        clearHistory,
        canGoBack: currentIndex > 0,
        canGoForward: currentIndex < history.length - 1,
        totalSteps: history.length
    };
};

export default useStateHistory;
