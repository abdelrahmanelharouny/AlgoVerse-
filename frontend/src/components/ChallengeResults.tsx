import { motion } from 'framer-motion';
import { Star, Trophy, CheckCircle, XCircle, ArrowRight, RotateCcw } from 'lucide-react';
import { useEffect } from 'react';
import confetti from 'canvas-confetti';
import useSound from '../hooks/useSound';

interface TestCaseResult {
    name: string;
    passed: boolean;
    expected: number;
    actual: number;
}

interface ChallengeResultsProps {
    passed: boolean;
    stars: number;
    testResults: TestCaseResult[];
    hintsUsed: number;
    onNextChallenge?: () => void;
    onRetry: () => void;
    onBackToList: () => void;
}

const ChallengeResults: React.FC<ChallengeResultsProps> = ({
    passed,
    stars,
    testResults,
    hintsUsed,
    onNextChallenge,
    onRetry,
    onBackToList
}) => {
    const allTestsPassed = testResults.every(t => t.passed);
    const { playComplete, playPerfect } = useSound();

    // Trigger confetti and sound on mount if passed
    useEffect(() => {
        if (passed) {
            // Play sound
            if (stars === 3) {
                playPerfect();
            } else {
                playComplete();
            }

            // Fire confetti
            const duration = stars === 3 ? 3000 : 1500;
            const animationEnd = Date.now() + duration;
            const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

            function randomInRange(min: number, max: number) {
                return Math.random() * (max - min) + min;
            }

            const interval = setInterval(() => {
                const timeLeft = animationEnd - Date.now();

                if (timeLeft <= 0) {
                    clearInterval(interval);
                    return;
                }

                const particleCount = 50 * (timeLeft / duration);

                // Golden confetti for 3 stars
                if (stars === 3) {
                    confetti({
                        ...defaults,
                        particleCount,
                        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
                        colors: ['#FFD700', '#FFA500', '#FFFF00']
                    });
                    confetti({
                        ...defaults,
                        particleCount,
                        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
                        colors: ['#FFD700', '#FFA500', '#FFFF00']
                    });
                } else {
                    // Regular confetti for 1-2 stars
                    confetti({
                        ...defaults,
                        particleCount,
                        origin: { x: randomInRange(0.1, 0.9), y: Math.random() - 0.2 }
                    });
                }
            }, 250);

            return () => clearInterval(interval);
        }
    }, [passed, stars, playComplete, playPerfect]);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
            <motion.div
                initial={{ y: 50 }}
                animate={{ y: 0 }}
                className="bg-slate-900 border-2 border-slate-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
                {/* Header */}
                <div className={`p-8 text-center border-b-2 ${passed ? 'border-emerald-500/30 bg-emerald-500/10' : 'border-red-500/30 bg-red-500/10'
                    }`}>
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                        className="inline-block mb-4"
                    >
                        {passed ? (
                            <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto">
                                <Trophy className="text-emerald-400" size={40} />
                            </div>
                        ) : (
                            <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto">
                                <XCircle className="text-red-400" size={40} />
                            </div>
                        )}
                    </motion.div>

                    <h2 className={`text-3xl font-bold mb-2 ${passed ? 'text-emerald-400' : 'text-red-400'
                        }`}>
                        {passed ? 'Challenge Complete!' : 'Not Quite There'}
                    </h2>
                    <p className="text-slate-400">
                        {passed
                            ? 'Congratulations! You solved the challenge.'
                            : 'Keep trying! Review the hints and test cases.'}
                    </p>

                    {/* Stars (only if passed) */}
                    {passed && (
                        <motion.div
                            className="flex items-center justify-center gap-2 mt-6"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4 }}
                        >
                            {[1, 2, 3].map(starNum => (
                                <motion.div
                                    key={starNum}
                                    initial={{ scale: 0, rotate: -180 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    transition={{
                                        delay: 0.5 + starNum * 0.1,
                                        type: 'spring',
                                        stiffness: 200
                                    }}
                                >
                                    <Star
                                        size={32}
                                        className={
                                            starNum <= stars
                                                ? 'fill-yellow-400 text-yellow-400'
                                                : 'text-slate-600'
                                        }
                                    />
                                </motion.div>
                            ))}
                        </motion.div>
                    )}

                    {/* Hints Used */}
                    {hintsUsed > 0 && (
                        <p className="text-sm text-slate-500 mt-4">
                            {hintsUsed} hint{hintsUsed !== 1 ? 's' : ''} used
                        </p>
                    )}
                </div>

                {/* Test Results */}
                <div className="p-6 space-y-3">
                    <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                        <span>Test Case Results</span>
                        <span className={`text-sm px-2 py-1 rounded ${allTestsPassed ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                            }`}>
                            {testResults.filter(t => t.passed).length}/{testResults.length} passed
                        </span>
                    </h3>

                    {testResults.map((result, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.6 + index * 0.1 }}
                            className={`p-4 rounded-lg border ${result.passed
                                ? 'bg-emerald-500/10 border-emerald-500/30'
                                : 'bg-red-500/10 border-red-500/30'
                                }`}
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    {result.passed ? (
                                        <CheckCircle className="text-emerald-400 flex-shrink-0" size={20} />
                                    ) : (
                                        <XCircle className="text-red-400 flex-shrink-0" size={20} />
                                    )}
                                    <div>
                                        <p className="font-semibold text-white">{result.name}</p>
                                        <p className="text-sm text-slate-400 mt-1">
                                            Expected: <span className="text-white font-mono">{result.expected}</span>
                                            {!result.passed && (
                                                <>
                                                    {' • '}Got: <span className="text-red-400 font-mono">{result.actual}</span>
                                                </>
                                            )}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Actions */}
                <div className="p-6 border-t border-slate-800 flex gap-3">
                    <button
                        onClick={onBackToList}
                        className="flex-1 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-lg transition-colors"
                    >
                        Back to Challenges
                    </button>

                    {!passed && (
                        <button
                            onClick={onRetry}
                            className="flex-1 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
                        >
                            <RotateCcw size={18} />
                            Try Again
                        </button>
                    )}

                    {passed && onNextChallenge && (
                        <button
                            onClick={onNextChallenge}
                            className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/30"
                        >
                            Next Challenge
                            <ArrowRight size={18} />
                        </button>
                    )}
                </div>
            </motion.div>
        </motion.div>
    );
};

export default ChallengeResults;
