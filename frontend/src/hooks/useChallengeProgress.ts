import { useState, useEffect } from 'react';

export interface ChallengeProgress {
    challengeId: string;
    completed: boolean;
    bestScore: number;
    stars: number; // 0-3
    hintsUsed: number;
    attempts: number;
    completedAt?: string;
}

const STORAGE_KEY = 'daa-challenge-progress';

export const useChallengeProgress = () => {
    const [progress, setProgress] = useState<Map<string, ChallengeProgress>>(new Map());

    // Load progress from localStorage on mount
    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                setProgress(new Map(Object.entries(parsed)));
            } catch (error) {
                console.error('Failed to load challenge progress:', error);
            }
        }
    }, []);

    // Save progress to localStorage whenever it changes
    useEffect(() => {
        const obj = Object.fromEntries(progress);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(obj));
    }, [progress]);

    const getChallengeProgress = (challengeId: string): ChallengeProgress | undefined => {
        return progress.get(challengeId);
    };

    const isChallengeCompleted = (challengeId: string): boolean => {
        return progress.get(challengeId)?.completed || false;
    };

    const getCompletedChallenges = (): string[] => {
        return Array.from(progress.entries())
            .filter(([_, p]) => p.completed)
            .map(([id, _]) => id);
    };

    const getTotalStars = (): number => {
        return Array.from(progress.values())
            .reduce((sum, p) => sum + (p.stars || 0), 0);
    };

    const recordAttempt = (challengeId: string) => {
        setProgress(prev => {
            const newProgress = new Map(prev);
            const current = newProgress.get(challengeId) || {
                challengeId,
                completed: false,
                bestScore: 0,
                stars: 0,
                hintsUsed: 0,
                attempts: 0
            };
            newProgress.set(challengeId, {
                ...current,
                attempts: current.attempts + 1
            });
            return newProgress;
        });
    };

    const recordHintUsed = (challengeId: string) => {
        setProgress(prev => {
            const newProgress = new Map(prev);
            const current = newProgress.get(challengeId) || {
                challengeId,
                completed: false,
                bestScore: 0,
                stars: 0,
                hintsUsed: 0,
                attempts: 0
            };
            newProgress.set(challengeId, {
                ...current,
                hintsUsed: current.hintsUsed + 1
            });
            return newProgress;
        });
    };

    const completeChallenge = (
        challengeId: string,
        score: number,
        stars: number,
        hintsUsed: number
    ) => {
        setProgress(prev => {
            const newProgress = new Map(prev);
            const current = newProgress.get(challengeId);

            // Only update if this is a better score or first completion
            if (!current || !current.completed || score > current.bestScore) {
                newProgress.set(challengeId, {
                    challengeId,
                    completed: true,
                    bestScore: score,
                    stars: Math.max(stars, current?.stars || 0),
                    hintsUsed: current?.hintsUsed || hintsUsed,
                    attempts: (current?.attempts || 0) + 1,
                    completedAt: new Date().toISOString()
                });
            }

            return newProgress;
        });
    };

    const resetProgress = () => {
        setProgress(new Map());
        localStorage.removeItem(STORAGE_KEY);
    };

    const resetChallenge = (challengeId: string) => {
        setProgress(prev => {
            const newProgress = new Map(prev);
            newProgress.delete(challengeId);
            return newProgress;
        });
    };

    return {
        getChallengeProgress,
        isChallengeCompleted,
        getCompletedChallenges,
        getTotalStars,
        recordAttempt,
        recordHintUsed,
        completeChallenge,
        resetProgress,
        resetChallenge
    };
};
