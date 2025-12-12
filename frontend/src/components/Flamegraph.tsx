import { motion } from 'framer-motion';
import { BarChart3 } from 'lucide-react';

interface FlameSection {
    label: string;
    timeMs: number;
    percentage: number;
    color: string;
}

interface FlamegraphProps {
    sections: FlameSection[];
    totalTime: number;
}

const Flamegraph: React.FC<FlamegraphProps> = ({ sections, totalTime }) => {
    const formatTime = (ms: number): string => {
        if (ms < 1) return `<1ms`;
        if (ms < 1000) return `${Math.round(ms)}ms`;
        return `${(ms / 1000).toFixed(2)}s`;
    };

    return (
        <motion.div
            className="bg-slate-900 border border-slate-700 rounded-xl p-6 shadow-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
        >
            <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="text-orange-400" size={20} />
                <h3 className="font-bold text-white">Performance Breakdown</h3>
                <span className="ml-auto text-sm text-slate-400">
                    Total: {formatTime(totalTime)}
                </span>
            </div>

            {/* Horizontal stacked bar */}
            <div className="relative h-12 bg-slate-950 rounded-lg overflow-hidden mb-4">
                {sections.map((section, index) => (
                    <motion.div
                        key={index}
                        className="absolute top-0 bottom-0 group cursor-pointer"
                        style={{
                            left: `${sections.slice(0, index).reduce((sum, s) => sum + s.percentage, 0)}%`,
                            width: `${section.percentage}%`,
                            backgroundColor: section.color
                        }}
                        initial={{ width: 0 }}
                        animate={{ width: `${section.percentage}%` }}
                        transition={{ delay: index * 0.1, duration: 0.5 }}
                        whileHover={{ opacity: 0.8 }}
                    >
                        {/* Tooltip on hover */}
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                            <p className="text-xs font-bold text-white">{section.label}</p>
                            <p className="text-xs text-slate-400">
                                {formatTime(section.timeMs)} ({section.percentage.toFixed(1)}%)
                            </p>
                        </div>

                        {/* Label inside bar if wide enough */}
                        {section.percentage > 15 && (
                            <div className="flex items-center justify-center h-full px-2">
                                <span className="text-xs font-semibold text-white truncate">
                                    {section.label}
                                </span>
                            </div>
                        )}
                    </motion.div>
                ))}
            </div>

            {/* Legend */}
            <div className="grid grid-cols-2 gap-2">
                {sections.map((section, index) => (
                    <div key={index} className="flex items-center gap-2">
                        <div
                            className="w-4 h-4 rounded"
                            style={{ backgroundColor: section.color }}
                        />
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-white truncate">
                                {section.label}
                            </p>
                            <p className="text-xs text-slate-400">
                                {formatTime(section.timeMs)} • {section.percentage.toFixed(1)}%
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </motion.div>
    );
};

export default Flamegraph;
