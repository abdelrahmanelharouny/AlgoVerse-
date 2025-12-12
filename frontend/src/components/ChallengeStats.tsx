import { motion } from 'framer-motion';
import { Trophy, Star, Target, Zap, Award, Crown } from 'lucide-react';

interface AchievementBadge {
    id: string;
    title: string;
    description: string;
    icon: React.ReactNode;
    unlocked: boolean;
    requirement: string;
}

interface ChallengeStatsProps {
    completedChallenges: number;
    totalChallenges: number;
    totalStars: number;
    maxStars: number;
}

const ChallengeStats: React.FC<ChallengeStatsProps> = ({
    completedChallenges,
    totalChallenges,
    totalStars,
    maxStars
}) => {
    const completionPercentage = (completedChallenges / totalChallenges) * 100;
    const starPercentage = (totalStars / maxStars) * 100;

    // Calculate achievements
    const achievements: AchievementBadge[] = [
        {
            id: 'first-blood',
            title: 'First Blood',
            description: 'Complete your first challenge',
            icon: <Target size={24} />,
            unlocked: completedChallenges >= 1,
            requirement: '1 challenge'
        },
        {
            id: 'rising-star',
            title: 'Rising Star',
            description: 'Earn 10 stars',
            icon: <Star size={24} />,
            unlocked: totalStars >= 10,
            requirement: '10 stars'
        },
        {
            id: 'speed-runner',
            title: 'Perfect Run',
            description: 'Get 3 stars on any challenge',
            icon: <Zap size={24} />,
            unlocked: totalStars >= 3 && completedChallenges >= 1, // Simplified check
            requirement: '1× 3-star challenge'
        },
        {
            id: 'completionist',
            title: 'Completionist',
            description: 'Complete all challenges',
            icon: <Trophy size={24} />,
            unlocked: completedChallenges === totalChallenges,
            requirement: `${totalChallenges} challenges`
        },
        {
            id: 'perfectionist',
            title: 'Perfectionist',
            description: 'Earn all 36 stars',
            icon: <Crown size={24} />,
            unlocked: totalStars === maxStars,
            requirement: `${maxStars} stars`
        }
    ];

    const unlockedCount = achievements.filter(a => a.unlocked).length;

    return (
        <motion.div
            className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-2xl p-6 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
        >
            <div className="grid md:grid-cols-2 gap-6">
                {/* Left: Progress Bars */}
                <div className="space-y-4">
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <Trophy className="text-yellow-400" size={24} />
                        Your Progress
                    </h3>

                    {/* Completion Progress */}
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-semibold text-slate-300">Challenges Completed</span>
                            <span className="text-sm font-bold text-white">{completedChallenges}/{totalChallenges}</span>
                        </div>
                        <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
                            <motion.div
                                className="h-full bg-gradient-to-r from-emerald-500 to-green-500"
                                initial={{ width: 0 }}
                                animate={{ width: `${completionPercentage}%` }}
                                transition={{ duration: 1, ease: 'easeOut' }}
                            />
                        </div>
                        <p className="text-xs text-slate-500 mt-1">{Math.round(completionPercentage)}% complete</p>
                    </div>

                    {/* Stars Progress */}
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-semibold text-slate-300">Stars Collected</span>
                            <span className="text-sm font-bold text-yellow-400">{totalStars}/{maxStars} ⭐</span>
                        </div>
                        <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
                            <motion.div
                                className="h-full bg-gradient-to-r from-yellow-500 to-orange-500"
                                initial={{ width: 0 }}
                                animate={{ width: `${starPercentage}%` }}
                                transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
                            />
                        </div>
                        <p className="text-xs text-slate-500 mt-1">{Math.round(starPercentage)}% of max stars</p>
                    </div>
                </div>

                {/* Right: Achievements */}
                <div>
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <Award className="text-purple-400" size={24} />
                        Achievements ({unlockedCount}/{achievements.length})
                    </h3>

                    <div className="grid grid-cols-5 gap-2">
                        {achievements.map((achievement, index) => (
                            <motion.div
                                key={achievement.id}
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: index * 0.1 }}
                                className="relative group"
                                title={`${achievement.title}\n${achievement.description}\n${achievement.requirement}`}
                            >
                                <div className={`w-12 h-12 rounded-lg flex items-center justify-center transition-all ${achievement.unlocked
                                        ? 'bg-gradient-to-br from-yellow-500 to-orange-500 shadow-lg shadow-yellow-500/30'
                                        : 'bg-slate-800 opacity-30'
                                    }`}>
                                    {achievement.unlocked ? (
                                        achievement.icon
                                    ) : (
                                        <div className="text-slate-600">{achievement.icon}</div>
                                    )}
                                </div>

                                {/* Tooltip */}
                                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                                    <p className="text-xs font-bold text-white">{achievement.title}</p>
                                    <p className="text-xs text-slate-400">{achievement.description}</p>
                                    <p className="text-xs text-slate-500 mt-1">{achievement.requirement}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default ChallengeStats;
