import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, RefreshCw, Calendar, Clock } from 'lucide-react';

interface Interval {
    id: string;
    start: number;
    end: number;
}

interface IntervalInputBuilderProps {
    onInputChange: (intervals: Interval[]) => void;
}

const IntervalInputBuilder: React.FC<IntervalInputBuilderProps> = ({ onInputChange }) => {
    const [intervals, setIntervals] = useState<Interval[]>([
        { id: '1', start: 1, end: 4 },
        { id: '2', start: 3, end: 5 },
        { id: '3', start: 0, end: 6 },
        { id: '4', start: 5, end: 7 },
        { id: '5', start: 3, end: 9 },
        { id: '6', start: 5, end: 9 },
        { id: '7', start: 6, end: 10 },
        { id: '8', start: 8, end: 11 },
        { id: '9', start: 8, end: 12 },
        { id: '10', start: 2, end: 14 },
        { id: '11', start: 12, end: 16 }
    ]);

    useEffect(() => {
        onInputChange(intervals);
    }, [intervals, onInputChange]);

    const addInterval = () => {
        const newId = (Math.max(...intervals.map(i => parseInt(i.id))) + 1).toString();
        const start = Math.floor(Math.random() * 10);
        const end = start + Math.floor(Math.random() * 5) + 1;
        setIntervals([...intervals, { id: newId, start, end }]);
    };

    const removeInterval = (id: string) => {
        setIntervals(intervals.filter(i => i.id !== id));
    };

    const updateInterval = (id: string, field: 'start' | 'end', value: number) => {
        setIntervals(intervals.map(i => {
            if (i.id === id) {
                return { ...i, [field]: value };
            }
            return i;
        }));
    };

    const generateRandom = () => {
        const count = Math.floor(Math.random() * 5) + 5; // 5-10 intervals
        const newIntervals: Interval[] = [];
        for (let i = 0; i < count; i++) {
            const start = Math.floor(Math.random() * 15);
            const duration = Math.floor(Math.random() * 5) + 1;
            newIntervals.push({
                id: (i + 1).toString(),
                start,
                end: start + duration
            });
        }
        setIntervals(newIntervals);
    };

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Calendar className="text-blue-400" />
                    Intervals
                </h2>
                <button
                    onClick={generateRandom}
                    className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
                    title="Randomize"
                >
                    <RefreshCw size={18} />
                </button>
            </div>

            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                <AnimatePresence mode="popLayout">
                    {intervals.map((interval) => (
                        <motion.div
                            key={interval.id}
                            layout
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="bg-slate-800/50 border border-slate-700 rounded-lg p-3 flex items-center gap-4 group"
                        >
                            <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold text-sm">
                                {interval.id}
                            </div>

                            <div className="flex-1 grid grid-cols-2 gap-4">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-slate-500">Start</span>
                                    <input
                                        type="number"
                                        value={interval.start}
                                        onChange={(e) => updateInterval(interval.id, 'start', Number(e.target.value))}
                                        className="w-full bg-slate-900/50 border border-slate-700 rounded px-2 py-1 text-sm text-white focus:ring-1 focus:ring-blue-500 outline-none"
                                    />
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-slate-500">End</span>
                                    <input
                                        type="number"
                                        value={interval.end}
                                        onChange={(e) => updateInterval(interval.id, 'end', Number(e.target.value))}
                                        className="w-full bg-slate-900/50 border border-slate-700 rounded px-2 py-1 text-sm text-white focus:ring-1 focus:ring-blue-500 outline-none"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
                                <Clock size={12} />
                                {interval.end - interval.start}h
                            </div>

                            <button
                                onClick={() => removeInterval(interval.id)}
                                className="opacity-0 group-hover:opacity-100 p-2 hover:bg-red-500/20 hover:text-red-400 rounded-lg transition-all"
                            >
                                <Trash2 size={16} />
                            </button>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            <button
                onClick={addInterval}
                className="w-full py-3 border-2 border-dashed border-slate-700 hover:border-slate-600 rounded-lg text-slate-500 hover:text-slate-300 transition-colors flex items-center justify-center gap-2"
            >
                <Plus size={20} />
                Add Interval
            </button>
        </div>
    );
};

export default IntervalInputBuilder;
