import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Play, Package, Coins, Calendar, Trophy } from 'lucide-react';
import { getChallengeById, CHALLENGES } from '../data/ChallengeData';
import { useChallengeProgress } from '../hooks/useChallengeProgress';
import KnapsackInputBuilder from '../components/KnapsackInputBuilder';
import CoinChangeInputBuilder from '../components/CoinChangeInputBuilder';
import IntervalInputBuilder from '../components/IntervalInputBuilder';
import HintPanel from '../components/HintPanel';
import ChallengeResults from '../components/ChallengeResults';
import type { KnapsackInput, CoinChangeInput, IntervalSchedulingInput } from '../types';
import { api } from '../utils/api';

const ChallengeDetail = () => {
    const { challengeId } = useParams<{ challengeId: string }>();
    const navigate = useNavigate();
    const {
        recordAttempt,
        recordHintUsed,
        completeChallenge,
        isChallengeCompleted
    } = useChallengeProgress();

    const challenge = challengeId ? getChallengeById(challengeId) : undefined;

    const [knapsackInput, setKnapsackInput] = useState<KnapsackInput | null>(null);
    const [coinChangeInput, setCoinChangeInput] = useState<CoinChangeInput | null>(null);
    const [intervalInput, setIntervalInput] = useState<IntervalSchedulingInput | null>(null);
    const [hintsUsed, setHintsUsed] = useState(0);
    const [showResults, setShowResults] = useState(false);
    const [testResults, setTestResults] = useState<any[]>([]);
    const [passed, setPassed] = useState(false);
    const [stars, setStars] = useState(0);
    const [loading, setLoading] = useState(false);

    if (!challenge) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-12 text-center">
                <h1 className="text-3xl font-bold text-white mb-4">Challenge Not Found</h1>
                <button
                    onClick={() => navigate('/challenge')}
                    className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg transition-colors"
                >
                    Back to Challenges
                </button>
            </div>
        );
    }

    const isCompleted = isChallengeCompleted(challenge.id);

    const getAlgorithmIcon = () => {
        switch (challenge.algorithmType) {
            case 'knapsack': return <Package size={24} />;
            case 'coin-change': return <Coins size={24} />;
            case 'interval-scheduling': return <Calendar size={24} />;
        }
    };

    const getDifficultyColor = () => {
        switch (challenge.difficulty) {
            case 'easy': return 'emerald';
            case 'medium': return 'yellow';
            case 'hard': return 'red';
        }
    };

    const handleHintRevealed = () => {
        setHintsUsed(prev => prev + 1);
        if (challengeId) {
            recordHintUsed(challengeId);
        }
    };

    const validateTestCase = async (testCase: any, userInput: any): Promise<{ passed: boolean; actual: number }> => {
        try {
            let result;

            if (challenge.algorithmType === 'knapsack') {
                result = await api.solveKnapsack(challenge.dpType, userInput);
            } else if (challenge.algorithmType === 'coin-change') {
                result = await api.solveCoinChange(challenge.dpType, userInput);
            } else {
                result = await api.solveIntervalScheduling(challenge.dpType, userInput);
            }

            return {
                passed: result.result_value === testCase.expectedValue,
                actual: result.result_value
            };
        } catch (error) {
            console.error('Validation error:', error);
            return { passed: false, actual: -1 };
        }
    };

    const calculateStars = (allPassed: boolean, hintsUsedCount: number): number => {
        if (!allPassed) return 0;

        // 3 stars: no hints
        // 2 stars: 1 hint
        // 1 star: 2+ hints
        if (hintsUsedCount === 0) return 3;
        if (hintsUsedCount === 1) return 2;
        return 1;
    };

    const handleSubmit = async () => {
        if (!challengeId) return;

        const currentInput =
            challenge.algorithmType === 'knapsack' ? knapsackInput :
                challenge.algorithmType === 'coin-change' ? coinChangeInput :
                    intervalInput;

        if (!currentInput) {
            alert('Please configure the input first!');
            return;
        }

        setLoading(true);
        recordAttempt(challengeId);

        try {
            const results = await Promise.all(
                challenge.testCases.map(async (testCase) => {
                    const validation = await validateTestCase(testCase, currentInput);
                    return {
                        name: testCase.name,
                        passed: validation.passed,
                        expected: testCase.expectedValue,
                        actual: validation.actual
                    };
                })
            );

            const allPassed = results.every(r => r.passed);
            const earnedStars = calculateStars(allPassed, hintsUsed);

            setTestResults(results);
            setPassed(allPassed);
            setStars(earnedStars);

            if (allPassed) {
                completeChallenge(challengeId, challenge.optimalValue, earnedStars, hintsUsed);
            }

            setShowResults(true);
        } catch (error) {
            console.error('Submit error:', error);
            alert('An error occurred while validating your solution. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleRetry = () => {
        setShowResults(false);
        setTestResults([]);
        setPassed(false);
        setStars(0);
    };

    const handleNextChallenge = () => {
        const currentIndex = CHALLENGES.findIndex(c => c.id === challengeId);
        if (currentIndex < CHALLENGES.length - 1) {
            const nextChallenge = CHALLENGES[currentIndex + 1];
            navigate(`/challenge/${nextChallenge.id}`);
            window.location.reload(); // Reset state
        } else {
            navigate('/challenge');
        }
    };

    const difficultyColor = getDifficultyColor();

    return (
        <div className="max-w-6xl mx-auto px-4 py-12">
            {/* Back Button */}
            <button
                onClick={() => navigate('/challenge')}
                className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6"
            >
                <ArrowLeft size={20} />
                Back to Challenges
            </button>

            {/* Header */}
            <motion.div
                className="mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-4">
                        <div className={`w-16 h-16 bg-${difficultyColor}-500/20 rounded-xl flex items-center justify-center`}>
                            {getAlgorithmIcon()}
                        </div>
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <h1 className="text-4xl font-bold text-white">
                                    {challenge.title}
                                </h1>
                                <span className={`px-3 py-1 rounded-lg text-sm font-bold uppercase bg-${difficultyColor}-500/20 text-${difficultyColor}-400`}>
                                    {challenge.difficulty}
                                </span>
                                {isCompleted && (
                                    <span className="px-3 py-1 rounded-lg text-sm font-bold bg-emerald-500/20 text-emerald-400 flex items-center gap-1">
                                        <Trophy size={14} />
                                        Completed
                                    </span>
                                )}
                            </div>
                            <p className="text-lg text-slate-400">
                                {challenge.description}
                            </p>
                        </div>
                    </div>
                </div>
            </motion.div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Left: Input Builder */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                        <h3 className="text-xl font-bold text-white mb-4">Configure Input</h3>

                        {challenge.algorithmType === 'knapsack' && (
                            <KnapsackInputBuilder onInputChange={(items, capacity) => {
                                setKnapsackInput({ items, capacity });
                            }} />
                        )}

                        {challenge.algorithmType === 'coin-change' && (
                            <CoinChangeInputBuilder onInputChange={(coins, amount) => {
                                setCoinChangeInput({ coins, amount });
                            }} />
                        )}

                        {challenge.algorithmType === 'interval-scheduling' && (
                            <IntervalInputBuilder onInputChange={(intervals) => {
                                setIntervalInput({ intervals });
                            }} />
                        )}
                    </div>

                    {/* Submit Button */}
                    <button
                        onClick={handleSubmit}
                        disabled={loading || (!knapsackInput && !coinChangeInput && !intervalInput)}
                        className="w-full px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:from-slate-700 disabled:to-slate-700 disabled:text-slate-500 text-white font-bold text-lg rounded-xl transition-colors shadow-lg shadow-indigo-500/30 flex items-center justify-center gap-3"
                    >
                        <Play size={24} />
                        {loading ? 'Validating...' : 'Submit Solution'}
                    </button>
                </div>

                {/* Right: Hints */}
                <div>
                    <HintPanel hints={challenge.hints} onHintRevealed={handleHintRevealed} />
                </div>
            </div>

            {/* Results Modal */}
            {showResults && (
                <ChallengeResults
                    passed={passed}
                    stars={stars}
                    testResults={testResults}
                    hintsUsed={hintsUsed}
                    onNextChallenge={handleNextChallenge}
                    onRetry={handleRetry}
                    onBackToList={() => navigate('/challenge')}
                />
            )}
        </div>
    );
};

export default ChallengeDetail;
