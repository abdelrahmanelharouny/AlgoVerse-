import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Star, Lock, CheckCircle, Filter, Package, Coins, Calendar, Shuffle } from 'lucide-react';
import { CHALLENGES, type Difficulty } from '../data/ChallengeData';
import { useChallengeProgress } from '../hooks/useChallengeProgress';
import { useNavigate } from 'react-router-dom';
import ChallengeStats from '../components/ChallengeStats';

type FilterType = 'all' | Difficulty;
type AlgorithmFilter = 'all' | 'knapsack' | 'coin-change' | 'interval-scheduling';

const ChallengeMode = () => {
    const navigate = useNavigate();
    const {
        isChallengeCompleted,
        getCompletedChallenges,
        getTotalStars,
        getChallengeProgress
    } = useChallengeProgress();

    const [difficultyFilter, setDifficultyFilter] = useState<FilterType>('all');
    const [algorithmFilter, setAlgorithmFilter] = useState<AlgorithmFilter>('all');

    const completedChallenges = getCompletedChallenges();
    const totalStars = getTotalStars();
    const maxStars = CHALLENGES.length * 3;

    // Filter challenges
    const filteredChallenges = CHALLENGES.filter(challenge => {
        const difficultyMatch = difficultyFilter === 'all' || challenge.difficulty === difficultyFilter;
        const algorithmMatch = algorithmFilter === 'all' || challenge.algorithmType === algorithmFilter;
        return difficultyMatch && algorithmMatch;
    });

    const getDifficultyColor = (difficulty: Difficulty) => {
        switch (difficulty) {
            case 'easy': return 'emerald';
            case 'medium': return 'yellow';
            case 'hard': return 'red';
        }
    };

    const getAlgorithmIcon = (type: string) => {
        switch (type) {
            case 'knapsack': return <Package size={18} />;
            case 'coin-change': return <Coins size={18} />;
            case 'interval-scheduling': return <Calendar size={18} />;
            default: return null;
        }
    };

    const isChallengeLocked = (challenge: typeof CHALLENGES[0]) => {
        if (!challenge.prerequisite) return false;
        return !isChallengeCompleted(challenge.prerequisite);
    };

    const handleChallengeClick = (challengeId: string) => {
        const challenge = CHALLENGES.find(c => c.id === challengeId);
        if (!challenge || isChallengeLocked(challenge)) return;
        navigate(`/challenge/${challengeId}`);
    };

    const handleRandomChallenge = () => {
        const unlockedChallenges = CHALLENGES.filter(c => !isChallengeLocked(c));
        if (unlockedChallenges.length === 0) return;
        const randomIndex = Math.floor(Math.random() * unlockedChallenges.length);
        const randomChallenge = unlockedChallenges[randomIndex];
        navigate(`/challenge/${randomChallenge.id}`);
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-12">
            {/* Header */}
            <motion.div
                className="mb-12"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500">
                            Challenge Mode
                        </h1>
                        <p className="text-xl text-slate-400">
                            Test your algorithm skills with progressive challenges
                        </p>
                    </div>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={handleRandomChallenge}
                            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold rounded-lg transition-all shadow-lg shadow-purple-500/30 flex items-center gap-2"
                        >
                            <Shuffle size={20} />
                            Random Challenge
                        </button>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-white mb-1">
                                {completedChallenges.length}/{CHALLENGES.length}
                            </div>
                            <div className="text-sm text-slate-400">Completed</div>
                        </div>
                        <div className="text-center">
                            <div className="flex items-center gap-2 text-3xl font-bold text-yellow-400 mb-1">
                                <Trophy size={28} />
                                {totalStars}/{maxStars}
                            </div>
                            <div className="text-sm text-slate-400">Stars Earned</div>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex items-center gap-6 bg-slate-900 border border-slate-800 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-slate-400">
                        <Filter size={18} />
                        <span className="font-semibold">Filters:</span>
                    </div>

                    {/* Difficulty Filter */}
                    <div className="flex gap-2">
                        <button
                            onClick={() => setDifficultyFilter('all')}
                            className={`px-4 py-2 rounded-lg font-semibold transition-all ${difficultyFilter === 'all'
                                ? 'bg-indigo-600 text-white'
                                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                                }`}
                        >
                            All
                        </button>
                        <button
                            onClick={() => setDifficultyFilter('easy')}
                            className={`px-4 py-2 rounded-lg font-semibold transition-all ${difficultyFilter === 'easy'
                                ? 'bg-emerald-600 text-white'
                                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                                }`}
                        >
                            Easy
                        </button>
                        <button
                            onClick={() => setDifficultyFilter('medium')}
                            className={`px-4 py-2 rounded-lg font-semibold transition-all ${difficultyFilter === 'medium'
                                ? 'bg-yellow-600 text-white'
                                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                                }`}
                        >
                            Medium
                        </button>
                        <button
                            onClick={() => setDifficultyFilter('hard')}
                            className={`px-4 py-2 rounded-lg font-semibold transition-all ${difficultyFilter === 'hard'
                                ? 'bg-red-600 text-white'
                                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                                }`}
                        >
                            Hard
                        </button>
                    </div>

                    {/* Algorithm Filter */}
                    <div className="flex gap-2 ml-auto">
                        <button
                            onClick={() => setAlgorithmFilter('all')}
                            className={`px-4 py-2 rounded-lg font-semibold transition-all ${algorithmFilter === 'all'
                                ? 'bg-purple-600 text-white'
                                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                                }`}
                        >
                            All Types
                        </button>
                        <button
                            onClick={() => setAlgorithmFilter('knapsack')}
                            className={`px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 ${algorithmFilter === 'knapsack'
                                ? 'bg-purple-600 text-white'
                                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                                }`}
                        >
                            <Package size={16} />
                            Knapsack
                        </button>
                        <button
                            onClick={() => setAlgorithmFilter('coin-change')}
                            className={`px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 ${algorithmFilter === 'coin-change'
                                ? 'bg-purple-600 text-white'
                                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                                }`}
                        >
                            <Coins size={16} />
                            Coins
                        </button>
                        <button
                            onClick={() => setAlgorithmFilter('interval-scheduling')}
                            className={`px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 ${algorithmFilter === 'interval-scheduling'
                                ? 'bg-purple-600 text-white'
                                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                                }`}
                        >
                            <Calendar size={16} />
                            Intervals
                        </button>
                    </div>
                </div>
            </motion.div>

            {/* Stats Dashboard */}
            <ChallengeStats
                completedChallenges={completedChallenges.length}
                totalChallenges={CHALLENGES.length}
                totalStars={totalStars}
                maxStars={maxStars}
            />

            {/* Challenge Grid */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={`${difficultyFilter}-${algorithmFilter}`}
                    className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    {filteredChallenges.map((challenge, index) => {
                        const isLocked = isChallengeLocked(challenge);
                        const isCompleted = isChallengeCompleted(challenge.id);
                        const progress = getChallengeProgress(challenge.id);
                        const difficultyColor = getDifficultyColor(challenge.difficulty);

                        return (
                            <motion.div
                                key={challenge.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                onClick={() => handleChallengeClick(challenge.id)}
                                className={`bg-slate-900 border-2 rounded-xl p-6 transition-all ${isLocked
                                    ? 'border-slate-800 opacity-50 cursor-not-allowed'
                                    : `border-slate-700 hover:border-${difficultyColor}-500 cursor-pointer hover:shadow-lg hover:shadow-${difficultyColor}-500/20`
                                    }`}
                            >
                                {/* Header */}
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        {getAlgorithmIcon(challenge.algorithmType)}
                                        <span className={`px-2 py-1 rounded text-xs font-bold uppercase bg-${difficultyColor}-500/20 text-${difficultyColor}-400`}>
                                            {challenge.difficulty}
                                        </span>
                                    </div>
                                    {isLocked && <Lock className="text-slate-600" size={20} />}
                                    {isCompleted && <CheckCircle className="text-emerald-400" size={20} />}
                                </div>

                                {/* Title */}
                                <h3 className="text-xl font-bold text-white mb-2">
                                    {challenge.title}
                                </h3>

                                {/* Description */}
                                <p className="text-sm text-slate-400 mb-4 line-clamp-2">
                                    {challenge.description}
                                </p>

                                {/* Stats */}
                                <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                                    <div className="flex items-center gap-1">
                                        {[1, 2, 3].map(star => (
                                            <Star
                                                key={star}
                                                size={16}
                                                className={
                                                    progress && progress.stars >= star
                                                        ? 'fill-yellow-400 text-yellow-400'
                                                        : 'text-slate-600'
                                                }
                                            />
                                        ))}
                                    </div>
                                    {progress && progress.attempts > 0 && (
                                        <div className="text-xs text-slate-500">
                                            {progress.attempts} attempt{progress.attempts !== 1 ? 's' : ''}
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        );
                    })}
                </motion.div>
            </AnimatePresence>

            {/* Empty State */}
            {filteredChallenges.length === 0 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-20"
                >
                    <Filter className="mx-auto mb-4 text-slate-600" size={64} />
                    <h3 className="text-2xl font-bold text-slate-400 mb-2">
                        No challenges match your filters
                    </h3>
                    <p className="text-slate-500">
                        Try adjusting your filter settings
                    </p>
                </motion.div>
            )}
        </div>
    );
};

export default ChallengeMode;
