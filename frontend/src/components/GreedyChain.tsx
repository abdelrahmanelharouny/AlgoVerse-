import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X } from 'lucide-react';
import { type GreedyDecision } from '../types';

interface GreedyChainProps {
    decisions: GreedyDecision[];
}

const GreedyChain: React.FC<GreedyChainProps> = ({ decisions }) => {
    return (
        <div className="flex flex-col gap-3 w-full max-h-[calc(100vh-400px)] overflow-y-auto pr-2">
            <AnimatePresence mode="popLayout">
                {decisions.map((decision, index) => (
                    <motion.div
                        key={`decision-${decision.itemId}-${index}`}
                        initial={{ opacity: 0, x: -50, scale: 0.9 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: 50, scale: 0.9 }}
                        transition={{
                            type: "spring",
                            stiffness: 300,
                            damping: 25,
                            delay: index * 0.1
                        }}
                        className={`
              relative flex items-center gap-4 p-4 rounded-xl border-2 transition-all
              ${decision.picked
                                ? 'bg-emerald-900/30 border-emerald-500/50 shadow-lg shadow-emerald-500/10'
                                : 'bg-slate-900/30 border-slate-700/50'
                            }
            `}
                    >
                        {/* Decision Icon */}
                        <div className={`
              flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center
              ${decision.picked
                                ? 'bg-emerald-600 shadow-lg shadow-emerald-500/30'
                                : 'bg-red-900/50'
                            }
            `}>
                            {decision.picked ? (
                                <Check className="text-white" size={24} strokeWidth={3} />
                            ) : (
                                <X className="text-red-400" size={24} strokeWidth={3} />
                            )}
                        </div>

                        {/* Item Info */}
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="font-bold text-lg text-white">Item #{decision.itemId}</span>
                                <span className={`
                  px-2 py-0.5 rounded-full  text-xs font-semibold
                  ${decision.picked ? 'bg-emerald-600/30 text-emerald-300' : 'bg-red-900/30 text-red-300'}
                `}>
                                    {decision.picked ? 'PICKED' : 'REJECTED'}
                                </span>
                            </div>

                            <div className="grid grid-cols-3 gap-2 text-sm">
                                <div className="text-slate-400">
                                    Weight: <span className="font-mono text-white">{decision.weight}</span>
                                </div>
                                <div className="text-slate-400">
                                    Value: <span className="font-mono text-white">{decision.value}</span>
                                </div>
                                <div className="text-slate-400">
                                    Ratio: <span className="font-mono text-indigo-300">{decision.ratio.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Current Total Badge */}
                        {decision.picked && (
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="flex-shrink-0 px-4 py-2 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg shadow-lg"
                            >
                                <div className="text-xs text-indigo-200">Total Value</div>
                                <div className="text-xl font-bold text-white">{decision.currentTotal}</div>
                            </motion.div>
                        )}

                        {/* Connecting Line */}
                        {index < decisions.length - 1 && (
                            <motion.div
                                initial={{ scaleY: 0 }}
                                animate={{ scaleY: 1 }}
                                transition={{ delay: index * 0.1 + 0.2 }}
                                className={`
                  absolute left-6 bottom-0 w-0.5 h-3 translate-y-full
                  ${decision.picked ? 'bg-emerald-500/50' : 'bg-slate-700/50'}
                `}
                            />
                        )}
                    </motion.div>
                ))}
            </AnimatePresence>

            {decisions.length === 0 && (
                <div className="text-center py-12 text-slate-500 italic">
                    Greedy algorithm will make decisions here...
                </div>
            )}
        </div>
    );
};

export default GreedyChain;
