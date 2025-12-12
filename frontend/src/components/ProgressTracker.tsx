import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
    Trophy, Star, Target, Clock, Flame,
    CheckCircle2, Circle, TrendingUp, Calendar,
    Award
} from 'lucide-react';

interface AlgorithmProgress {
    id: string;
    name: string;
    category: string;
    completed: boolean;
    viewedAt?: string;
    bestScore?: number;
}

interface ProgressStats {
    totalAlgorithms: number;
    completed: number;
    streak: number;
    lastSession: string;
    totalTime: number;
}

const STORAGE_KEY = 'algoverse_progress';

const defaultAlgorithms: AlgorithmProgress[] = [
    { id: 'dijkstra', name: "Dijkstra's Algorithm", category: 'Graph', completed: false },
    { id: 'prims', name: "Prim's MST", category: 'Graph', completed: false },
    { id: 'kruskals', name: "Kruskal's MST", category: 'Graph', completed: false },
    { id: '0-1-knapsack', name: '0/1 Knapsack', category: 'DP', completed: false },
    { id: 'fractional-knapsack', name: 'Fractional Knapsack', category: 'Greedy', completed: false },
    { id: 'lcs', name: 'Longest Common Subsequence', category: 'DP', completed: false },
    { id: 'coin-change', name: 'Coin Change', category: 'DP', completed: false },
    { id: 'edit-distance', name: 'Edit Distance', category: 'DP', completed: false },
    { id: 'lis', name: 'Longest Increasing Subsequence', category: 'DP', completed: false },
    { id: 'rod-cutting', name: 'Rod Cutting', category: 'DP', completed: false },
    { id: 'huffman', name: 'Huffman Coding', category: 'Greedy', completed: false },
    { id: 'activity-selection', name: 'Activity Selection', category: 'Greedy', completed: false },
    { id: 'matrix-chain', name: 'Matrix Chain Multiplication', category: 'DP', completed: false },
];

const ProgressTracker: React.FC = () => {
    const [algorithms, setAlgorithms] = useState<AlgorithmProgress[]>(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch {
                return defaultAlgorithms;
            }
        }
        return defaultAlgorithms;
    });

    const [stats, setStats] = useState<ProgressStats>({
        totalAlgorithms: defaultAlgorithms.length,
        completed: 0,
        streak: 0,
        lastSession: new Date().toISOString(),
        totalTime: 0
    });

    // Save to localStorage
    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(algorithms));

        const completed = algorithms.filter(a => a.completed).length;
        setStats(prev => ({ ...prev, completed }));
    }, [algorithms]);

    const toggleCompletion = (id: string) => {
        setAlgorithms(prev => prev.map(alg =>
            alg.id === id ? { ...alg, completed: !alg.completed, viewedAt: new Date().toISOString() } : alg
        ));
    };

    const resetProgress = () => {
        if (window.confirm('Are you sure you want to reset all progress?')) {
            setAlgorithms(defaultAlgorithms);
            localStorage.removeItem(STORAGE_KEY);
        }
    };

    const completionPercentage = Math.round((stats.completed / stats.totalAlgorithms) * 100);

    const categories = [...new Set(algorithms.map(a => a.category))];

    return (
        <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-900/50 to-teal-900/50 p-6 border-b border-slate-800">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                            <Trophy className="text-yellow-400" />
                            Learning Progress
                        </h2>
                        <p className="text-slate-400 mt-1">Track your algorithm mastery journey</p>
                    </div>

                    <button
                        onClick={resetProgress}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-400 text-sm rounded-lg transition-colors"
                    >
                        Reset
                    </button>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="p-6 border-b border-slate-800">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-slate-800/50 rounded-xl p-4 text-center">
                        <Target className="mx-auto text-emerald-400 mb-2" size={24} />
                        <div className="text-2xl font-bold text-white">{stats.completed}/{stats.totalAlgorithms}</div>
                        <div className="text-xs text-slate-500">Completed</div>
                    </div>
                    <div className="bg-slate-800/50 rounded-xl p-4 text-center">
                        <TrendingUp className="mx-auto text-blue-400 mb-2" size={24} />
                        <div className="text-2xl font-bold text-white">{completionPercentage}%</div>
                        <div className="text-xs text-slate-500">Progress</div>
                    </div>
                    <div className="bg-slate-800/50 rounded-xl p-4 text-center">
                        <Flame className="mx-auto text-orange-400 mb-2" size={24} />
                        <div className="text-2xl font-bold text-white">{stats.streak}</div>
                        <div className="text-xs text-slate-500">Day Streak</div>
                    </div>
                    <div className="bg-slate-800/50 rounded-xl p-4 text-center">
                        <Clock className="mx-auto text-purple-400 mb-2" size={24} />
                        <div className="text-2xl font-bold text-white">{Math.floor(stats.totalTime / 60)}m</div>
                        <div className="text-xs text-slate-500">Total Time</div>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-6">
                    <div className="h-4 bg-slate-800 rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-gradient-to-r from-emerald-500 to-teal-500"
                            initial={{ width: 0 }}
                            animate={{ width: `${completionPercentage}%` }}
                            transition={{ duration: 0.5 }}
                        />
                    </div>
                    {completionPercentage >= 100 && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="mt-4 text-center"
                        >
                            <Award className="mx-auto text-yellow-400 mb-2" size={48} />
                            <p className="text-lg font-bold text-yellow-400">🎉 Congratulations! You've completed all algorithms!</p>
                        </motion.div>
                    )}
                </div>
            </div>

            {/* Algorithm List by Category */}
            <div className="p-6 space-y-6">
                {categories.map(category => (
                    <div key={category}>
                        <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                            <Star className="text-yellow-400" size={18} />
                            {category} Algorithms
                            <span className="text-sm text-slate-500 ml-2">
                                ({algorithms.filter(a => a.category === category && a.completed).length}/
                                {algorithms.filter(a => a.category === category).length})
                            </span>
                        </h3>

                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {algorithms.filter(a => a.category === category).map(algo => (
                                <div
                                    key={algo.id}
                                    className={`p-4 rounded-lg border transition-all cursor-pointer ${algo.completed
                                            ? 'bg-emerald-900/20 border-emerald-500/50'
                                            : 'bg-slate-800/50 border-slate-700 hover:border-slate-600'
                                        }`}
                                    onClick={() => toggleCompletion(algo.id)}
                                >
                                    <div className="flex items-center gap-3">
                                        {algo.completed ? (
                                            <CheckCircle2 className="text-emerald-400 flex-shrink-0" size={20} />
                                        ) : (
                                            <Circle className="text-slate-500 flex-shrink-0" size={20} />
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <p className={`font-medium truncate ${algo.completed ? 'text-emerald-300' : 'text-white'}`}>
                                                {algo.name}
                                            </p>
                                            {algo.viewedAt && (
                                                <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                                                    <Calendar size={10} />
                                                    Last: {new Date(algo.viewedAt).toLocaleDateString()}
                                                </p>
                                            )}
                                        </div>
                                        <Link
                                            to={`/visualizer/${algo.id}`}
                                            className="px-2 py-1 bg-purple-600/30 hover:bg-purple-600/50 text-purple-300 text-xs rounded transition-colors"
                                            onClick={e => e.stopPropagation()}
                                        >
                                            View →
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ProgressTracker;
