import { motion } from 'framer-motion';
import { Cpu, Zap, Database, Clock } from 'lucide-react';
import type { ComplexityMetrics } from '../hooks/useComplexityMetrics';

interface ComplexityAnalyzerProps {
    metrics: ComplexityMetrics;
    isRunning: boolean;
}

const ComplexityAnalyzer: React.FC<ComplexityAnalyzerProps> = ({ metrics, isRunning }) => {
    const formatTime = (ms: number): string => {
        if (ms < 1000) return `${ms}ms`;
        return `${(ms / 1000).toFixed(2)}s`;
    };

    const formatBytes = (bytes: number): string => {
        if (bytes < 1024) return `${bytes}B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
    };

    return (
        <motion.div
            className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-xl p-6 shadow-lg"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
        >
            <div className="flex items-center gap-2 mb-4">
                <Cpu className="text-purple-400" size={20} />
                <h3 className="font-bold text-white">Performance Metrics</h3>
                {isRunning && (
                    <motion.div
                        className="ml-auto px-2 py-1 bg-green-500/20 text-green-400 text-xs font-semibold rounded"
                        animate={{ opacity: [1, 0.5, 1] }}
                        transition={{ repeat: Infinity, duration: 1 }}
                    >
                        RUNNING
                    </motion.div>
                )}
            </div>

            <div className="grid grid-cols-2 gap-4">
                {/* Operations */}
                <div className="bg-slate-950/50 rounded-lg p-4 border border-slate-800">
                    <div className="flex items-center gap-2 mb-2">
                        <Zap className="text-yellow-400" size={16} />
                        <span className="text-xs font-semibold text-slate-400">Operations</span>
                    </div>
                    <motion.div
                        className="text-2xl font-bold text-white font-mono"
                        key={metrics.operations}
                        initial={{ scale: 1.2, color: '#FBBF24' }}
                        animate={{ scale: 1, color: '#FFFFFF' }}
                        transition={{ duration: 0.2 }}
                    >
                        {metrics.operations.toLocaleString()}
                    </motion.div>
                    <div className="text-xs text-slate-500 mt-1">
                        {metrics.timeComplexity}
                    </div>
                </div>

                {/* Memory */}
                <div className="bg-slate-950/50 rounded-lg p-4 border border-slate-800">
                    <div className="flex items-center gap-2 mb-2">
                        <Database className="text-blue-400" size={16} />
                        <span className="text-xs font-semibold text-slate-400">Memory</span>
                    </div>
                    <div className="text-2xl font-bold text-white font-mono">
                        {formatBytes(metrics.memoryBytes)}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                        {metrics.spaceComplexity}
                    </div>
                </div>

                {/* Time */}
                <div className="bg-slate-950/50 rounded-lg p-4 border border-slate-800">
                    <div className="flex items-center gap-2 mb-2">
                        <Clock className="text-emerald-400" size={16} />
                        <span className="text-xs font-semibold text-slate-400">Real Time</span>
                    </div>
                    <motion.div
                        className="text-2xl font-bold text-white font-mono"
                        key={metrics.realTimeMs}
                        initial={{ scale: 1.05 }}
                        animate={{ scale: 1 }}
                    >
                        {formatTime(metrics.realTimeMs)}
                    </motion.div>
                </div>

                {/* Comparisons (if applicable) */}
                {metrics.comparisonCount !== undefined && metrics.comparisonCount > 0 && (
                    <div className="bg-slate-950/50 rounded-lg p-4 border border-slate-800">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs font-semibold text-slate-400">Comparisons</span>
                        </div>
                        <div className="text-2xl font-bold text-white font-mono">
                            {metrics.comparisonCount.toLocaleString()}
                        </div>
                    </div>
                )}
            </div>

            {/* Progress Bar */}
            {isRunning && (
                <motion.div
                    className="mt-4 h-1 bg-slate-800 rounded-full overflow-hidden"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                >
                    <motion.div
                        className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                        animate={{ x: ['-100%', '100%'] }}
                        transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
                    />
                </motion.div>
            )}
        </motion.div>
    );
};

export default ComplexityAnalyzer;
