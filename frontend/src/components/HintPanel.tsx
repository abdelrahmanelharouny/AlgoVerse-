import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, Lightbulb, Lock, ChevronDown } from 'lucide-react';

interface HintPanelProps {
    hints: string[];
    onHintRevealed: () => void;
}

const HintPanel: React.FC<HintPanelProps> = ({ hints, onHintRevealed }) => {
    const [revealedHints, setRevealedHints] = useState<number[]>([]);
    const [isExpanded, setIsExpanded] = useState(false);

    const revealNextHint = () => {
        const nextHintIndex = revealedHints.length;
        if (nextHintIndex < hints.length) {
            setRevealedHints([...revealedHints, nextHintIndex]);
            onHintRevealed();
            if (!isExpanded) setIsExpanded(true);
        }
    };

    const canRevealMore = revealedHints.length < hints.length;

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            {/* Header */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-800/50 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center">
                        <Lightbulb className="text-amber-400" size={20} />
                    </div>
                    <div className="text-left">
                        <h3 className="font-bold text-white">Hints</h3>
                        <p className="text-sm text-slate-400">
                            {revealedHints.length}/{hints.length} revealed
                        </p>
                    </div>
                </div>
                <motion.div
                    animate={{ rotate: isExpanded ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                >
                    <ChevronDown className="text-slate-400" size={20} />
                </motion.div>
            </button>

            {/* Content */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: 'auto' }}
                        exit={{ height: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="px-6 pb-6 space-y-3">
                            {/* Revealed Hints */}
                            {hints.map((hint, index) => {
                                const isRevealed = revealedHints.includes(index);

                                return (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        className={`p-4 rounded-lg border ${isRevealed
                                                ? 'bg-amber-500/10 border-amber-500/30'
                                                : 'bg-slate-800/50 border-slate-700/50'
                                            }`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${isRevealed
                                                    ? 'bg-amber-500/20 text-amber-400'
                                                    : 'bg-slate-700 text-slate-500'
                                                }`}>
                                                {index + 1}
                                            </div>
                                            {isRevealed ? (
                                                <p className="text-sm text-slate-200 flex-1">
                                                    {hint}
                                                </p>
                                            ) : (
                                                <div className="flex items-center gap-2 text-slate-500">
                                                    <Lock size={14} />
                                                    <span className="text-sm">Locked</span>
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                );
                            })}

                            {/* Reveal Button */}
                            {canRevealMore && (
                                <motion.button
                                    onClick={revealNextHint}
                                    className="w-full px-4 py-3 bg-amber-600 hover:bg-amber-500 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <HelpCircle size={18} />
                                    Reveal Hint {revealedHints.length + 1}
                                </motion.button>
                            )}

                            {/* All Hints Revealed */}
                            {!canRevealMore && (
                                <div className="text-center py-2 text-sm text-amber-400">
                                    ✨ All hints revealed!
                                </div>
                            )}

                            {/* Warning */}
                            {canRevealMore && revealedHints.length > 0 && (
                                <p className="text-xs text-center text-slate-500 mt-2">
                                    Using hints may affect your star rating
                                </p>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default HintPanel;
