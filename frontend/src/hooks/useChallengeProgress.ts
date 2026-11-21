import { useEffect, useState } from 'react';

export interface ChallengeProgress {
    challengeId: string;
    completed: boolean;
    bestScore: number;
    stars: number;
    hintsUsed: number;
    attempts: number;
    completedAt?: string;
}

const STORAGE_KEY = 'daa-challenge-progress';

const emptyProgress = (): Map<string, ChallengeProgress> => new Map();

export const useChallengeProgress = () => {
    const [progress, setProgress] = useState<Map<string, ChallengeProgress>>(emptyProgress);
    const [hydrated, setHydrated] = useState(false);

    // Do not persist the initial empty state before localStorage hydration finishes.
    useEffect(() => {
        try {
            const stored = window.localStorage.getItem(STORAGE_KEY);
            if (stored) {
                const parsed: unknown = JSON.parse(stored);
                if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
                    const restored = new Map<string, ChallengeProgress>();
                    for (const [id, value] of Object.entries(parsed)) {
                        if (!value || typeof value !== 'object') continue;
                        const item = value as Partial<ChallengeProgress>;
                        restored.set(id, {
                            challengeId: id,
                            completed: Boolean(item.completed),
                            bestScore: Number(item.bestScore) || 0,
                            stars: Math.max(0, Math.min(3, Number(item.stars) || 0)),
                            hintsUsed: Math.max(0, Number(item.hintsUsed) || 0),
                            attempts: Math.max(0, Number(item.attempts) || 0),
                            completedAt: item.completedAt
                        });
                    }
                    setProgress(restored);
                }
            }
        } catch (error) {
            console.error('Failed to load challenge progress:', error);
        } finally {
            setHydrated(true);
        }
    }, []);

    useEffect(() => {
        if (!hydrated) return;
        try {
            window.localStorage.setItem(STORAGE_KEY, JSON.stringify(Object.fromEntries(progress)));
        } catch (error) {
            console.error('Failed to save challenge progress:', error);
        }
    }, [progress, hydrated]);

    const getChallengeProgress = (challengeId: string): ChallengeProgress | undefined =>
        progress.get(challengeId);

    const isChallengeCompleted = (challengeId: string): boolean =>
        progress.get(challengeId)?.completed ?? false;

    const getCompletedChallenges = (): string[] =>
        Array.from(progress.entries())
            .filter(([, item]) => item.completed)
            .map(([id]) => id);

    const getTotalStars = (): number =>
        Array.from(progress.values()).reduce((sum, item) => sum + item.stars, 0);

    const recordAttempt = (challengeId: string) => {
        setProgress(previous => {
            const next = new Map(previous);
            const current = next.get(challengeId) ?? {
                challengeId,
                completed: false,
                bestScore: 0,
                stars: 0,
                hintsUsed: 0,
                attempts: 0
            };
            next.set(challengeId, { ...current, attempts: current.attempts + 1 });
            return next;
        });
    };

    const recordHintUsed = (challengeId: string) => {
        setProgress(previous => {
            const next = new Map(previous);
            const current = next.get(challengeId) ?? {
                challengeId,
                completed: false,
                bestScore: 0,
                stars: 0,
                hintsUsed: 0,
                attempts: 0
            };
            next.set(challengeId, { ...current, hintsUsed: current.hintsUsed + 1 });
            return next;
        });
    };

    const completeChallenge = (
        challengeId: string,
        score: number,
        stars: number,
        hintsUsed: number
    ) => {
        setProgress(previous => {
            const next = new Map(previous);
            const current = next.get(challengeId);
            const bestScore = Math.max(score, current?.bestScore ?? 0);
            next.set(challengeId, {
                challengeId,
                completed: true,
                bestScore,
                stars: Math.max(current?.stars ?? 0, Math.max(0, Math.min(3, stars))),
                hintsUsed: Math.max(current?.hintsUsed ?? 0, hintsUsed),
                attempts: current?.attempts ?? 0,
                completedAt: current?.completedAt ?? new Date().toISOString()
            });
            return next;
        });
    };

    const resetProgress = () => {
        setProgress(emptyProgress());
        try {
            window.localStorage.removeItem(STORAGE_KEY);
        } catch (error) {
            console.error('Failed to clear challenge progress:', error);
        }
    };

    const resetChallenge = (challengeId: string) => {
        setProgress(previous => {
            const next = new Map(previous);
            next.delete(challengeId);
            return next;
        });
    };

    return {
        hydrated,
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
