import React from 'react';
import { Zap, Award, BookOpen, AlertCircle } from 'lucide-react';
import { AlgorithmType } from '../types';

interface PresetData {
    name: string;
    description: string;
    icon: 'classic' | 'edge' | 'optimal' | 'complex';
    input: any;
}

// Preset library for all algorithms
const presets: Record<string, PresetData[]> = {
    [AlgorithmType.DIJKSTRA]: [
        {
            name: 'Simple Grid',
            description: 'Basic grid-like graph',
            icon: 'classic',
            input: {
                start_node: 'A',
                graph: {
                    "A": { "B": 2, "C": 4 },
                    "B": { "A": 2, "C": 1, "D": 7 },
                    "C": { "A": 4, "B": 1, "D": 3 },
                    "D": { "B": 7, "C": 3 }
                }
            }
        },
        {
            name: 'Complex Network',
            description: 'More nodes and connections',
            icon: 'complex',
            input: {
                start_node: 'S',
                graph: {
                    "S": { "A": 4, "B": 2 },
                    "A": { "S": 4, "B": 5, "C": 10 },
                    "B": { "S": 2, "A": 5, "C": 3 },
                    "C": { "A": 10, "B": 3, "D": 4 },
                    "D": { "C": 4, "E": 11 },
                    "E": { "D": 11 }
                }
            }
        }
    ],
    [AlgorithmType.KNAPSACK]: [
        {
            name: 'Textbook Example',
            description: 'Classic DP example',
            icon: 'classic',
            input: {
                capacity: 50,
                items: [
                    { id: 1, weight: 10, value: 60 },
                    { id: 2, weight: 20, value: 100 },
                    { id: 3, weight: 30, value: 120 }
                ]
            }
        },
        {
            name: 'Greedy Fails',
            description: 'Where density heuristic fails',
            icon: 'edge',
            input: {
                capacity: 50,
                items: [
                    { id: 1, weight: 10, value: 60 },
                    { id: 2, weight: 20, value: 100 },
                    { id: 3, weight: 30, value: 120 }
                ]
            }
        }
    ],
    [AlgorithmType.LCS]: [
        {
            name: 'DNA Sequence',
            description: 'Genetic comparison',
            icon: 'classic',
            input: { text1: 'AGGTAB', text2: 'GXTXAYB' }
        },
        {
            name: 'Similar Words',
            description: 'Spell checking scenario',
            icon: 'optimal',
            input: { text1: 'intention', text2: 'execution' }
        }
    ],
    [AlgorithmType.EDIT_DISTANCE]: [
        {
            name: 'Short Change',
            description: 'Simple transformation',
            icon: 'classic',
            input: { text1: 'horse', text2: 'ros' }
        },
        {
            name: 'Long Words',
            description: 'Complex transformation',
            icon: 'complex',
            input: { text1: 'algorithm', text2: 'altruistic' }
        }
    ],
    [AlgorithmType.COIN_CHANGE_DP]: [
        {
            name: 'US Coins',
            description: 'Standard denominations',
            icon: 'classic',
            input: { amount: 63, coins: [1, 5, 10, 25] }
        },
        {
            name: 'Greedy Fails',
            description: 'Counter-example for greedy',
            icon: 'edge',
            input: { amount: 6, coins: [1, 3, 4] }
        }
    ],
    [AlgorithmType.MATRIX_CHAIN]: [
        {
            name: 'Chain of 4',
            description: 'Small chain example',
            icon: 'classic',
            input: { dimensions: [10, 20, 30, 40, 30] }
        },
        {
            name: 'Optimal Split',
            description: 'Shows diverse split points',
            icon: 'optimal',
            input: { dimensions: [40, 20, 30, 10, 30] }
        }
    ],
    [AlgorithmType.LIS]: [
        {
            name: 'Random',
            description: 'Classic random sequence',
            icon: 'classic',
            input: { sequence: [10, 22, 9, 33, 21, 50, 41, 60, 80] }
        },
        {
            name: 'Wiggle',
            description: 'Up and down sequence',
            icon: 'edge',
            input: { sequence: [1, 10, 2, 9, 3, 8, 4, 7] }
        }
    ],
    [AlgorithmType.HUFFMAN]: [
        {
            name: 'Standard Text',
            description: 'English letter frequencies',
            icon: 'classic',
            input: { text: 'this is an example for huffman encoding' }
        },
        {
            name: 'Repeated Chars',
            description: 'Skewed distribution',
            icon: 'edge',
            input: { text: 'aaaaabbbbcccdde' }
        }
    ],
    [AlgorithmType.ROD_CUTTING]: [
        {
            name: 'Standard Prices',
            description: 'Basic price table',
            icon: 'classic',
            input: { length: 8, prices: [1, 5, 8, 9, 10, 17, 17, 20] }
        }
    ]
};

// Aliases
presets[AlgorithmType.PRIMS] = presets[AlgorithmType.DIJKSTRA];
presets[AlgorithmType.KRUSKALS] = presets[AlgorithmType.DIJKSTRA];
presets[AlgorithmType.COIN_CHANGE_GREEDY] = presets[AlgorithmType.COIN_CHANGE_DP];

interface VisualizerInputPresetsProps {
    algorithmType: AlgorithmType | null;
    onSelect: (input: any) => void;
}

const VisualizerInputPresets: React.FC<VisualizerInputPresetsProps> = ({ algorithmType, onSelect }) => {
    if (!algorithmType || !presets[algorithmType]) return null;

    const availablePresets = presets[algorithmType];

    const getIcon = (icon: PresetData['icon']) => {
        switch (icon) {
            case 'classic': return <BookOpen className="text-blue-400" size={14} />;
            case 'edge': return <AlertCircle className="text-orange-400" size={14} />;
            case 'optimal': return <Award className="text-emerald-400" size={14} />;
            case 'complex': return <Zap className="text-purple-400" size={14} />;

        }
    };

    return (
        <div className="space-y-2 mt-4">
            <label className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Load Preset</label>
            <div className="grid grid-cols-1 gap-2">
                {availablePresets.map((preset, idx) => (
                    <button
                        key={idx}
                        onClick={() => onSelect(preset.input)}
                        className="flex items-start gap-3 p-2 bg-slate-900/50 hover:bg-slate-800 border border-slate-800 hover:border-indigo-500/50 rounded-lg transition-all group text-left"
                    >
                        <div className="mt-0.5">{getIcon(preset.icon)}</div>
                        <div>
                            <div className="text-sm font-medium text-slate-300 group-hover:text-white transition-colors">
                                {preset.name}
                            </div>
                            <div className="text-xs text-slate-500 group-hover:text-slate-400">
                                {preset.description}
                            </div>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default VisualizerInputPresets;
