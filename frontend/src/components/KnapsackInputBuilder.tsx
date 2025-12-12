import React, { useState } from 'react';
import { Plus, X, Shuffle, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface KnapsackItem {
    id: string;
    weight: number;
    value: number;
}

interface KnapsackInputBuilderProps {
    onInputChange: (items: KnapsackItem[], capacity: number) => void;
}

export const KnapsackInputBuilder: React.FC<KnapsackInputBuilderProps> = ({ onInputChange }) => {
    const [capacity, setCapacity] = useState(50);
    const [items, setItems] = useState<KnapsackItem[]>([
        { id: '1', weight: 10, value: 60 },
        { id: '2', weight: 20, value: 100 },
        { id: '3', weight: 30, value: 120 }
    ]);

    const addItem = () => {
        const newItem: KnapsackItem = {
            id: Date.now().toString(),
            weight: 10,
            value: 50
        };
        const newItems = [...items, newItem];
        setItems(newItems);
        onInputChange(newItems, capacity);
    };

    const removeItem = (id: string) => {
        const newItems = items.filter(item => item.id !== id);
        setItems(newItems);
        onInputChange(newItems, capacity);
    };

    const updateItem = (id: string, field: 'weight' | 'value', value: number) => {
        const newItems = items.map(item =>
            item.id === id ? { ...item, [field]: value } : item
        );
        setItems(newItems);
        onInputChange(newItems, capacity);
    };

    const updateCapacity = (value: number) => {
        setCapacity(value);
        onInputChange(items, value);
    };

    const randomizeItems = () => {
        const newItems = items.map(item => ({
            ...item,
            weight: Math.floor(Math.random() * 40) + 5,
            value: Math.floor(Math.random() * 150) + 10
        }));
        setItems(newItems);
        onInputChange(newItems, capacity);
    };

    const loadPreset = (preset: 'easy' | 'medium' | 'hard') => {
        let newItems: KnapsackItem[] = [];
        let newCapacity = 50;

        switch (preset) {
            case 'easy':
                newItems = [
                    { id: '1', weight: 10, value: 60 },
                    { id: '2', weight: 20, value: 100 },
                    { id: '3', weight: 30, value: 120 }
                ];
                newCapacity = 50;
                break;
            case 'medium':
                newItems = [
                    { id: '1', weight: 15, value: 30 },
                    { id: '2', weight: 10, value: 25 },
                    { id: '3', weight: 8, value: 24 },
                    { id: '4', weight: 12, value: 18 },
                    { id: '5', weight: 20, value: 40 }
                ];
                newCapacity = 35;
                break;
            case 'hard':
                newItems = [
                    { id: '1', weight: 5, value: 10 },
                    { id: '2', weight: 4, value: 40 },
                    { id: '3', weight: 6, value: 30 },
                    { id: '4', weight: 3, value: 50 },
                    { id: '5', weight: 7, value: 20 },
                    { id: '6', weight: 8, value: 60 }
                ];
                newCapacity = 15;
                break;
        }

        setItems(newItems);
        setCapacity(newCapacity);
        onInputChange(newItems, newCapacity);
    };

    return (
        <div className="space-y-6">
            {/* Capacity Control */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                <label className="flex items-center justify-between mb-3">
                    <span className="text-lg font-semibold text-white">Knapsack Capacity</span>
                    <span className="text-2xl font-bold text-indigo-400">{capacity}</span>
                </label>
                <input
                    type="range"
                    min="10"
                    max="100"
                    value={capacity}
                    onChange={(e) => updateCapacity(parseInt(e.target.value))}
                    className="w-full h-3 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
                <div className="flex justify-between text-xs text-slate-500 mt-2">
                    <span>10</span>
                    <span>100</span>
                </div>
            </div>

            {/* Items List */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">Items ({items.length})</h3>
                    <div className="flex gap-2">
                        <button
                            onClick={randomizeItems}
                            className="px-3 py-1.5 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 rounded-lg text-sm text-purple-300 transition-colors flex items-center gap-2"
                        >
                            <Shuffle size={16} />
                            Randomize
                        </button>
                        <div className="relative group">
                            <button className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm text-slate-300 transition-colors flex items-center gap-2">
                                <BookOpen size={16} />
                                Presets
                            </button>
                            <div className="absolute right-0 top-full mt-2 bg-slate-800 border border-slate-700 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 min-w-[120px]">
                                <button
                                    onClick={() => loadPreset('easy')}
                                    className="w-full px-4 py-2 text-left text-sm text-slate-300 hover:bg-slate-700 rounded-t-lg transition-colors"
                                >
                                    Easy
                                </button>
                                <button
                                    onClick={() => loadPreset('medium')}
                                    className="w-full px-4 py-2 text-left text-sm text-slate-300 hover:bg-slate-700 transition-colors"
                                >
                                    Medium
                                </button>
                                <button
                                    onClick={() => loadPreset('hard')}
                                    className="w-full px-4 py-2 text-left text-sm text-slate-300 hover:bg-slate-700 rounded-b-lg transition-colors"
                                >
                                    Hard
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-3">
                    <AnimatePresence>
                        {items.map((item, index) => (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, x: -100 }}
                                className="bg-slate-950 border border-slate-700 rounded-lg p-4"
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <span className="font-semibold text-white">Item {index + 1}</span>
                                    <button
                                        onClick={() => removeItem(item.id)}
                                        className="p-1 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded transition-colors"
                                        title="Remove item"
                                    >
                                        <X size={18} />
                                    </button>
                                </div>

                                <div className="space-y-3">
                                    {/* Weight Slider */}
                                    <div>
                                        <label className="flex items-center justify-between text-sm mb-2">
                                            <span className="text-slate-400">Weight</span>
                                            <span className="font-mono text-indigo-300">{item.weight}</span>
                                        </label>
                                        <input
                                            type="range"
                                            min="1"
                                            max="50"
                                            value={item.weight}
                                            onChange={(e) => updateItem(item.id, 'weight', parseInt(e.target.value))}
                                            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                                        />
                                    </div>

                                    {/* Value Slider */}
                                    <div>
                                        <label className="flex items-center justify-between text-sm mb-2">
                                            <span className="text-slate-400">Value</span>
                                            <span className="font-mono text-emerald-300">{item.value}</span>
                                        </label>
                                        <input
                                            type="range"
                                            min="1"
                                            max="200"
                                            value={item.value}
                                            onChange={(e) => updateItem(item.id, 'value', parseInt(e.target.value))}
                                            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                                        />
                                    </div>

                                    {/* Ratio Display */}
                                    <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                                        <span>Ratio:</span>
                                        <span className="font-mono">{(item.value / item.weight).toFixed(2)}</span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                {/* Add Item Button */}
                <button
                    onClick={addItem}
                    className="w-full mt-4 px-4 py-3 bg-indigo-600/20 hover:bg-indigo-600/30 border-2 border-dashed border-indigo-500/30 hover:border-indigo-500/50 rounded-lg text-indigo-300 font-medium transition-colors flex items-center justify-center gap-2"
                >
                    <Plus size={20} />
                    Add Item
                </button>
            </div>

            {/* Summary */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <span className="text-slate-400">Total Items:</span>
                        <span className="ml-2 font-semibold text-white">{items.length}</span>
                    </div>
                    <div>
                        <span className="text-slate-400">Total Weight:</span>
                        <span className="ml-2 font-semibold text-white">
                            {items.reduce((sum, item) => sum + item.weight, 0)}
                        </span>
                    </div>
                    <div>
                        <span className="text-slate-400">Total Value:</span>
                        <span className="ml-2 font-semibold text-white">
                            {items.reduce((sum, item) => sum + item.value, 0)}
                        </span>
                    </div>
                    <div>
                        <span className="text-slate-400">Capacity:</span>
                        <span className="ml-2 font-semibold text-white">{capacity}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default KnapsackInputBuilder;
