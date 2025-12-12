import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Info, TrendingUp, AlertCircle } from 'lucide-react';

interface StepExplanationProps {
    title: string;
    description: string;
    type?: 'info' | 'success' | 'warning' | 'error';
}

const StepExplanation: React.FC<StepExplanationProps> = ({
    title,
    description,
    type = 'info'
}) => {
    const getTypeStyles = () => {
        switch (type) {
            case 'success':
                return {
                    bg: 'bg-emerald-900/20',
                    border: 'border-emerald-500/30',
                    icon: <TrendingUp className="text-emerald-400" size={20} />,
                    titleColor: 'text-emerald-400'
                };
            case 'warning':
                return {
                    bg: 'bg-yellow-900/20',
                    border: 'border-yellow-500/30',
                    icon: <AlertCircle className="text-yellow-400" size={20} />,
                    titleColor: 'text-yellow-400'
                };
            case 'error':
                return {
                    bg: 'bg-red-900/20',
                    border: 'border-red-500/30',
                    icon: <AlertCircle className="text-red-400" size={20} />,
                    titleColor: 'text-red-400'
                };
            default:
                return {
                    bg: 'bg-indigo-900/20',
                    border: 'border-indigo-500/30',
                    icon: <Info className="text-indigo-400" size={20} />,
                    titleColor: 'text-indigo-400'
                };
        }
    };

    const styles = getTypeStyles();

    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={title}
                className={`${styles.bg} ${styles.border} border rounded-xl p-4`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
            >
                <div className="flex items-start gap-3">
                    <div className="mt-0.5">{styles.icon}</div>
                    <div className="flex-1">
                        <h4 className={`font-semibold mb-1 ${styles.titleColor}`}>
                            {title}
                        </h4>
                        <p className="text-sm text-slate-300 leading-relaxed">
                            {description}
                        </p>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

export default StepExplanation;
