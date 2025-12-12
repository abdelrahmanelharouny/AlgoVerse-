import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BrainCircuit, Check } from 'lucide-react';

interface PredictionModalProps {
    isVisible: boolean;
    question: string;
    options: string[];
    onSelect: (option: string) => void;
    correctAnswer: string | null; // If null, user hasn't answered yet
    onClose: () => void;
}

const PredictionModal: React.FC<PredictionModalProps> = ({ isVisible, question, options, onSelect, correctAnswer, onClose }) => {
    if (!isVisible) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            >
                <motion.div
                    initial={{ scale: 0.9, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    className="bg-slate-900 border border-indigo-500/50 rounded-2xl p-6 max-w-md w-full shadow-2xl relative overflow-hidden"
                >
                    {/* Background decoration */}
                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl"></div>

                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-indigo-500/20 rounded-lg">
                            <BrainCircuit className="text-indigo-400" size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white">Predict the Next Step</h3>
                            <p className="text-slate-400 text-sm">What happens next?</p>
                        </div>
                    </div>

                    <p className="text-lg text-slate-200 mb-6 font-medium leading-relaxed">
                        {question}
                    </p>

                    <div className="space-y-3">
                        {options.map((option, idx) => {
                            let stateClass = "border-slate-700 bg-slate-800 hover:bg-slate-700 hover:border-indigo-500/50";

                            if (correctAnswer) {
                                if (option === correctAnswer) {
                                    stateClass = "border-emerald-500 bg-emerald-500/20 text-emerald-300";
                                } else {
                                    stateClass = "border-slate-800 bg-slate-800/50 text-slate-500";
                                }
                            }

                            return (
                                <button
                                    key={idx}
                                    onClick={() => !correctAnswer && onSelect(option)}
                                    disabled={!!correctAnswer}
                                    className={`w-full p-4 rounded-xl border-2 text-left transition-all flex items-center justify-between group ${stateClass}`}
                                >
                                    <span className="font-semibold">{option}</span>
                                    {correctAnswer === option && <Check size={20} className="text-emerald-400" />}
                                </button>
                            );
                        })}
                    </div>

                    {correctAnswer && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-6 flex justify-end"
                        >
                            <button
                                onClick={onClose}
                                className="px-6 py-2 bg-white text-slate-900 font-bold rounded-lg hover:bg-slate-200 transition-colors"
                            >
                                Continue
                            </button>
                        </motion.div>
                    )}
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default PredictionModal;
