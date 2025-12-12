import React from 'react';
import { Clock, HardDrive, Info, Lightbulb } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AlgorithmInfoPanelProps {
    algorithmName: string;
    algorithmId: string;
    currentStep?: {
        type: string;
        description: string;
        data?: any;
    };
    stepIndex: number;
    totalSteps: number;
}

// Algorithm metadata
const algorithmInfo: Record<string, {
    description: string;
    timeComplexity: string;
    spaceComplexity: string;
    keyInsight: string;
    type: 'greedy' | 'dp' | 'graph';
}> = {
    'dijkstra': {
        description: "Finds shortest paths from a source vertex to all other vertices in a weighted graph.",
        timeComplexity: 'O((V + E) log V)',
        spaceComplexity: 'O(V)',
        keyInsight: 'Always process the minimum distance vertex first - greedy choice leads to optimal solution.',
        type: 'graph'
    },
    'prims': {
        description: "Builds a Minimum Spanning Tree by greedily adding the cheapest edge that expands the tree.",
        timeComplexity: 'O(E log V)',
        spaceComplexity: 'O(V)',
        keyInsight: 'Grow the tree by always picking the minimum weight edge connecting tree to non-tree vertices.',
        type: 'graph'
    },
    'kruskals': {
        description: "Builds MST by sorting all edges and adding them if they don't create a cycle (using Union-Find).",
        timeComplexity: 'O(E log E)',
        spaceComplexity: 'O(V)',
        keyInsight: 'Union-Find enables O(α(n)) near-constant time cycle detection.',
        type: 'graph'
    },
    '0-1-knapsack': {
        description: "Select items to maximize value while staying within weight capacity. Each item is all-or-nothing.",
        timeComplexity: 'O(n × W)',
        spaceComplexity: 'O(n × W)',
        keyInsight: 'DP table cell [i][w] = max value using first i items with capacity w.',
        type: 'dp'
    },
    'lcs': {
        description: "Find the longest subsequence common to two sequences (order matters, not contiguous).",
        timeComplexity: 'O(m × n)',
        spaceComplexity: 'O(m × n)',
        keyInsight: 'If characters match, extend diagonal; otherwise take max of left or top.',
        type: 'dp'
    },
    'coin-change': {
        description: "Find minimum number of coins needed to make a target amount.",
        timeComplexity: 'O(n × amount)',
        spaceComplexity: 'O(amount)',
        keyInsight: 'For each amount, try all coin denominations and take minimum.',
        type: 'dp'
    },
    'matrix-chain': {
        description: "Find optimal parenthesization of matrix chain to minimize scalar multiplications.",
        timeComplexity: 'O(n³)',
        spaceComplexity: 'O(n²)',
        keyInsight: 'Try all split points k between i and j; optimal substructure enables DP.',
        type: 'dp'
    },
    'edit-distance': {
        description: "Minimum operations (insert, delete, replace) to transform one string into another.",
        timeComplexity: 'O(m × n)',
        spaceComplexity: 'O(m × n)',
        keyInsight: 'Each cell represents cost to transform prefixes - consider all 3 operations.',
        type: 'dp'
    },
    'activity-selection': {
        description: "Select maximum number of non-overlapping activities/intervals.",
        timeComplexity: 'O(n log n)',
        spaceComplexity: 'O(1)',
        keyInsight: 'Greedy works! Always pick activity that ends earliest - leaves most room for others.',
        type: 'greedy'
    },
    'huffman': {
        description: "Build optimal prefix-free codes for data compression based on character frequencies.",
        timeComplexity: 'O(n log n)',
        spaceComplexity: 'O(n)',
        keyInsight: 'Always combine two lowest frequency nodes - builds optimal tree bottom-up.',
        type: 'greedy'
    },
    'lis': {
        description: "Find longest subsequence where elements are in strictly increasing order.",
        timeComplexity: 'O(n log n)',
        spaceComplexity: 'O(n)',
        keyInsight: 'Binary search to find position for each element in auxiliary array.',
        type: 'dp'
    },
    'rod-cutting': {
        description: "Cut a rod into pieces to maximize total value based on piece prices.",
        timeComplexity: 'O(n²)',
        spaceComplexity: 'O(n)',
        keyInsight: 'Similar to unbounded knapsack - try all first cuts and recurse.',
        type: 'dp'
    }
};

const AlgorithmInfoPanel: React.FC<AlgorithmInfoPanelProps> = ({
    algorithmName,
    algorithmId,
    currentStep,
    stepIndex,
    totalSteps
}) => {
    const info = algorithmInfo[algorithmId] || {
        description: 'Algorithm visualization',
        timeComplexity: 'N/A',
        spaceComplexity: 'N/A',
        keyInsight: 'Watch the step-by-step execution.',
        type: 'dp' as const
    };

    const typeColors = {
        greedy: 'from-emerald-500 to-green-500',
        dp: 'from-indigo-500 to-purple-500',
        graph: 'from-blue-500 to-cyan-500'
    };

    return (
        <div className="space-y-4">
            {/* Algorithm Header */}
            <div className="bg-slate-900 rounded-xl p-4 border border-slate-800">
                <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-0.5 text-xs font-semibold rounded bg-gradient-to-r ${typeColors[info.type]} text-white`}>
                        {info.type.toUpperCase()}
                    </span>
                </div>
                <h3 className="text-lg font-bold text-white mb-2 capitalize">{algorithmName.replace(/-/g, ' ')}</h3>
                <p className="text-sm text-slate-400">{info.description}</p>
            </div>

            {/* Complexity Badges */}
            <div className="grid grid-cols-2 gap-2">
                <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
                        <Clock size={12} /> Time
                    </div>
                    <div className="font-mono text-sm text-emerald-400">{info.timeComplexity}</div>
                </div>
                <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
                        <HardDrive size={12} /> Space
                    </div>
                    <div className="font-mono text-sm text-blue-400">{info.spaceComplexity}</div>
                </div>
            </div>

            {/* Key Insight */}
            <div className="bg-gradient-to-r from-yellow-900/20 to-orange-900/20 border border-yellow-500/30 rounded-lg p-3">
                <div className="flex items-center gap-2 text-xs text-yellow-400 mb-1">
                    <Lightbulb size={12} /> Key Insight
                </div>
                <p className="text-sm text-yellow-100">{info.keyInsight}</p>
            </div>

            {/* Current Step Description */}
            <AnimatePresence mode="wait">
                {currentStep && (
                    <motion.div
                        key={stepIndex}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="bg-slate-900 border border-slate-800 rounded-lg p-3"
                    >
                        <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
                            <Info size={12} />
                            Current Step ({stepIndex + 1}/{totalSteps})
                        </div>
                        <p className="text-sm text-white">{currentStep.description}</p>

                        {/* Step type indicator */}
                        <div className="mt-2 flex items-center gap-2">
                            <span className={`px-2 py-0.5 text-xs rounded ${currentStep.type === 'INIT' ? 'bg-blue-500/20 text-blue-400' :
                                currentStep.type === 'UPDATE' ? 'bg-emerald-500/20 text-emerald-400' :
                                    currentStep.type === 'PICK' ? 'bg-green-500/20 text-green-400' :
                                        currentStep.type === 'REJECT' ? 'bg-red-500/20 text-red-400' :
                                            currentStep.type === 'HIGHLIGHT' ? 'bg-yellow-500/20 text-yellow-400' :
                                                'bg-slate-500/20 text-slate-400'
                                }`}>
                                {currentStep.type}
                            </span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AlgorithmInfoPanel;
