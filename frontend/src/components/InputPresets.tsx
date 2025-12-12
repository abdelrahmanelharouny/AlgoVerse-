import React from 'react';
import { Sparkles, AlertTriangle, Award, Zap } from 'lucide-react';
import type { KnapsackItem } from '../types';

interface PresetData {
    name: string;
    description: string;
    icon: 'edge' | 'classic' | 'optimal' | 'quick';
    type: 'knapsack' | 'coin-change';
    data: {
        // Knapsack
        items?: KnapsackItem[];
        capacity?: number;
        // Coin Change
        coins?: number[];
        amount?: number;
    };
}

const presets: PresetData[] = [
    // Knapsack presets
    {
        name: 'Greedy Fails',
        description: 'Classic case where greedy picks wrong items',
        icon: 'edge',
        type: 'knapsack',
        data: {
            capacity: 7,
            items: [
                { id: 1, weight: 1, value: 1 },
                { id: 2, weight: 3, value: 4 },
                { id: 3, weight: 4, value: 5 },
                { id: 4, weight: 5, value: 7 },
            ]
        }
    },
    {
        name: 'Small Example',
        description: 'Simple 4-item, capacity 10 problem',
        icon: 'quick',
        type: 'knapsack',
        data: {
            capacity: 10,
            items: [
                { id: 1, weight: 5, value: 10 },
                { id: 2, weight: 4, value: 40 },
                { id: 3, weight: 6, value: 30 },
                { id: 4, weight: 3, value: 50 },
            ]
        }
    },
    {
        name: 'Textbook Classic',
        description: 'Common textbook example',
        icon: 'classic',
        type: 'knapsack',
        data: {
            capacity: 50,
            items: [
                { id: 1, weight: 10, value: 60 },
                { id: 2, weight: 20, value: 100 },
                { id: 3, weight: 30, value: 120 },
            ]
        }
    },
    {
        name: 'Large Instance',
        description: '8 items, capacity 100 - watch DP table grow',
        icon: 'optimal',
        type: 'knapsack',
        data: {
            capacity: 100,
            items: [
                { id: 1, weight: 10, value: 60 },
                { id: 2, weight: 20, value: 100 },
                { id: 3, weight: 30, value: 120 },
                { id: 4, weight: 15, value: 80 },
                { id: 5, weight: 25, value: 95 },
                { id: 6, weight: 35, value: 140 },
                { id: 7, weight: 5, value: 25 },
                { id: 8, weight: 40, value: 165 },
            ]
        }
    },
    // Coin Change presets
    {
        name: 'Greedy Fails',
        description: 'Greedy gives 3 coins, DP gives 2',
        icon: 'edge',
        type: 'coin-change',
        data: {
            coins: [1, 3, 4],
            amount: 6
        }
    },
    {
        name: 'US Coins',
        description: 'Standard US denominations',
        icon: 'classic',
        type: 'coin-change',
        data: {
            coins: [1, 5, 10, 25],
            amount: 63
        }
    },
    {
        name: 'Weird Denoms',
        description: 'Non-standard coins challenge greedy',
        icon: 'edge',
        type: 'coin-change',
        data: {
            coins: [1, 3, 7, 10],
            amount: 14
        }
    },
    {
        name: 'Large Amount',
        description: 'Big DP table visualization',
        icon: 'optimal',
        type: 'coin-change',
        data: {
            coins: [1, 5, 10, 20, 50],
            amount: 99
        }
    },
];

interface InputPresetsProps {
    algorithmType: 'knapsack' | 'coin-change';
    onSelectPreset: (data: PresetData['data']) => void;
}

const InputPresets: React.FC<InputPresetsProps> = ({ algorithmType, onSelectPreset }) => {
    const relevantPresets = presets.filter(p => p.type === algorithmType);

    const getIcon = (icon: PresetData['icon']) => {
        switch (icon) {
            case 'edge': return <AlertTriangle className="text-orange-400" size={14} />;
            case 'classic': return <Sparkles className="text-blue-400" size={14} />;
            case 'optimal': return <Award className="text-purple-400" size={14} />;
            case 'quick': return <Zap className="text-emerald-400" size={14} />;
        }
    };

    return (
        <div className="mb-4">
            <label className="text-xs text-slate-500 mb-2 block">Quick Presets</label>
            <div className="flex flex-wrap gap-2">
                {relevantPresets.map((preset, idx) => (
                    <button
                        key={idx}
                        onClick={() => onSelectPreset(preset.data)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-indigo-500/50 rounded-lg text-xs transition-all group"
                        title={preset.description}
                    >
                        {getIcon(preset.icon)}
                        <span className="text-slate-300 group-hover:text-white">{preset.name}</span>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default InputPresets;
