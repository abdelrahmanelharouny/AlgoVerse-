import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Zap, Target, BarChart3, HelpCircle, ChevronDown, Play, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AlgorithmData {
    id: string;
    name: string;
    category: string;
    timeComplexity: string;
    spaceComplexity: string;
    greedyWorks: boolean;
    bestCase: string;
    avgCase: string;
    worstCase: string;
    description: string;
}

const algorithms: AlgorithmData[] = [
    { id: 'dijkstra', name: "Dijkstra's Algorithm", category: 'Graph', timeComplexity: 'O((V+E) log V)', spaceComplexity: 'O(V)', greedyWorks: true, bestCase: 'O(V)', avgCase: 'O((V+E) log V)', worstCase: 'O(V²)', description: 'Shortest path with non-negative weights' },
    { id: 'prims', name: "Prim's MST", category: 'Graph', timeComplexity: 'O(E log V)', spaceComplexity: 'O(V)', greedyWorks: true, bestCase: 'O(V)', avgCase: 'O(E log V)', worstCase: 'O(V²)', description: 'Minimum Spanning Tree' },
    { id: 'kruskals', name: "Kruskal's MST", category: 'Graph', timeComplexity: 'O(E log E)', spaceComplexity: 'O(V)', greedyWorks: true, bestCase: 'O(E)', avgCase: 'O(E log E)', worstCase: 'O(E log E)', description: 'MST using Union-Find' },
    { id: '0-1-knapsack', name: '0/1 Knapsack', category: 'DP', timeComplexity: 'O(n × W)', spaceComplexity: 'O(n × W)', greedyWorks: false, bestCase: 'O(n × W)', avgCase: 'O(n × W)', worstCase: 'O(n × W)', description: 'Item selection with weight constraint' },
    { id: 'fractional-knapsack', name: 'Fractional Knapsack', category: 'Greedy', timeComplexity: 'O(n log n)', spaceComplexity: 'O(1)', greedyWorks: true, bestCase: 'O(n)', avgCase: 'O(n log n)', worstCase: 'O(n log n)', description: 'Item selection, fractional allowed' },
    { id: 'lcs', name: 'Longest Common Subsequence', category: 'DP', timeComplexity: 'O(m × n)', spaceComplexity: 'O(m × n)', greedyWorks: false, bestCase: 'O(min(m,n))', avgCase: 'O(m × n)', worstCase: 'O(m × n)', description: 'Find LCS of two strings' },
    { id: 'coin-change', name: 'Coin Change', category: 'DP', timeComplexity: 'O(n × amount)', spaceComplexity: 'O(amount)', greedyWorks: false, bestCase: 'O(amount)', avgCase: 'O(n × amount)', worstCase: 'O(n × amount)', description: 'Min coins to make amount' },
    { id: 'edit-distance', name: 'Edit Distance', category: 'DP', timeComplexity: 'O(m × n)', spaceComplexity: 'O(m × n)', greedyWorks: false, bestCase: 'O(min(m,n))', avgCase: 'O(m × n)', worstCase: 'O(m × n)', description: 'Min edits to transform string' },
    { id: 'lis', name: 'Longest Increasing Subsequence', category: 'DP', timeComplexity: 'O(n log n)', spaceComplexity: 'O(n)', greedyWorks: false, bestCase: 'O(n)', avgCase: 'O(n log n)', worstCase: 'O(n²)', description: 'Longest increasing subsequence' },
    { id: 'activity-selection', name: 'Activity Selection', category: 'Greedy', timeComplexity: 'O(n log n)', spaceComplexity: 'O(1)', greedyWorks: true, bestCase: 'O(n)', avgCase: 'O(n log n)', worstCase: 'O(n log n)', description: 'Max non-overlapping activities' },
    { id: 'huffman', name: 'Huffman Coding', category: 'Greedy', timeComplexity: 'O(n log n)', spaceComplexity: 'O(n)', greedyWorks: true, bestCase: 'O(n)', avgCase: 'O(n log n)', worstCase: 'O(n log n)', description: 'Optimal prefix codes' },
    { id: 'matrix-chain', name: 'Matrix Chain Multiplication', category: 'DP', timeComplexity: 'O(n³)', spaceComplexity: 'O(n²)', greedyWorks: false, bestCase: 'O(n²)', avgCase: 'O(n³)', worstCase: 'O(n³)', description: 'Optimal matrix multiplication order' },
];

// Decision tree questions
const decisionTree = [
    {
        id: 'start', question: 'What type of problem are you solving?', options: [
            { label: 'Finding shortest path in graph', next: 'graph-shortest' },
            { label: 'Optimization with constraints', next: 'optimization' },
            { label: 'String matching/comparison', next: 'strings' },
            { label: 'Scheduling/selection', next: 'scheduling' },
        ]
    },
    {
        id: 'graph-shortest', question: 'Are all edge weights non-negative?', options: [
            { label: 'Yes', next: null, result: 'dijkstra' },
            { label: 'No (has negative weights)', next: null, result: 'bellman-ford' },
        ]
    },
    {
        id: 'optimization', question: 'Can you take fractional parts of items?', options: [
            { label: 'Yes (e.g., can take half of item)', next: null, result: 'fractional-knapsack' },
            { label: 'No (must take whole items)', next: null, result: '0-1-knapsack' },
        ]
    },
    {
        id: 'strings', question: 'What do you need to find?', options: [
            { label: 'Longest common subsequence', next: null, result: 'lcs' },
            { label: 'Min edits to transform', next: null, result: 'edit-distance' },
        ]
    },
    {
        id: 'scheduling', question: 'Do activities have weights/values?', options: [
            { label: 'No, just maximize count', next: null, result: 'activity-selection' },
            { label: 'Yes, maximize total value', next: null, result: 'weighted-interval' },
        ]
    },
];

const Analysis = () => {
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [compareAlgos, setCompareAlgos] = useState<[string, string]>(['dijkstra', 'prims']);
    const [showCheatSheet, setShowCheatSheet] = useState(false);
    const [decisionPath, setDecisionPath] = useState<string[]>(['start']);
    const [decisionResult, setDecisionResult] = useState<string | null>(null);

    const categories = ['all', ...new Set(algorithms.map(a => a.category))];

    const filteredAlgorithms = useMemo(() => {
        if (selectedCategory === 'all') return algorithms;
        return algorithms.filter(a => a.category === selectedCategory);
    }, [selectedCategory]);

    const algo1 = algorithms.find(a => a.id === compareAlgos[0]);
    const algo2 = algorithms.find(a => a.id === compareAlgos[1]);

    const currentDecisionNode = decisionTree.find(n => n.id === decisionPath[decisionPath.length - 1]);

    const handleDecisionChoice = (option: { next: string | null; result?: string }) => {
        if (option.result) {
            setDecisionResult(option.result);
        } else if (option.next) {
            setDecisionPath([...decisionPath, option.next]);
        }
    };

    const resetDecision = () => {
        setDecisionPath(['start']);
        setDecisionResult(null);
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-12">
            {/* Header */}
            <motion.div className="mb-12" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <h1 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">Algorithm Analysis & Comparison</h1>
                <p className="text-xl text-slate-400">Deep dive into complexity, trade-offs, and when to use each approach</p>
            </motion.div>

            {/* Quick Decision Tool */}
            <motion.div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 border border-purple-500/30 rounded-2xl p-6 mb-12" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <div className="flex items-center gap-3 mb-4">
                    <HelpCircle className="text-purple-400" size={24} />
                    <h2 className="text-2xl font-bold">Which Algorithm Should I Use?</h2>
                </div>

                {!decisionResult ? (
                    <div className="space-y-4">
                        <p className="text-slate-300">{currentDecisionNode?.question}</p>
                        <div className="grid sm:grid-cols-2 gap-3">
                            {currentDecisionNode?.options.map((option, idx) => (
                                <button key={idx} onClick={() => handleDecisionChoice(option)} className="p-4 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700 hover:border-purple-500 rounded-lg text-left transition-all">
                                    <span className="text-white">{option.label}</span>
                                </button>
                            ))}
                        </div>
                        {decisionPath.length > 1 && (
                            <button onClick={() => setDecisionPath(decisionPath.slice(0, -1))} className="text-sm text-slate-400 hover:text-white">← Go back</button>
                        )}
                    </div>
                ) : (
                    <div className="bg-slate-800/50 rounded-lg p-6">
                        <p className="text-emerald-400 text-lg font-semibold mb-2">✅ Recommended: {algorithms.find(a => a.id === decisionResult)?.name || decisionResult}</p>
                        <p className="text-slate-300 mb-4">{algorithms.find(a => a.id === decisionResult)?.description}</p>
                        <div className="flex gap-3">
                            <Link to={`/visualizer/${decisionResult}`}>
                                <button className="px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg font-semibold flex items-center gap-2">
                                    <Play size={16} /> Visualize
                                </button>
                            </Link>
                            <button onClick={resetDecision} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg">Try Again</button>
                        </div>
                    </div>
                )}
            </motion.div>

            {/* Algorithm Comparison */}
            <div className="mb-12">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                    <BarChart3 className="text-indigo-400" />
                    Compare Algorithms
                </h2>

                <div className="grid md:grid-cols-2 gap-4 mb-6">
                    <select value={compareAlgos[0]} onChange={(e) => setCompareAlgos([e.target.value, compareAlgos[1]])} className="bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-lg focus:border-indigo-500 outline-none">
                        {algorithms.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                    </select>
                    <select value={compareAlgos[1]} onChange={(e) => setCompareAlgos([compareAlgos[0], e.target.value])} className="bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-lg focus:border-indigo-500 outline-none">
                        {algorithms.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                    </select>
                </div>

                {algo1 && algo2 && (
                    <div className="grid lg:grid-cols-2 gap-8">
                        {[algo1, algo2].map((algo, idx) => (
                            <motion.div key={algo.id} initial={{ opacity: 0, x: idx === 0 ? -20 : 20 }} animate={{ opacity: 1, x: 0 }} className={`bg-slate-900 border-2 ${idx === 0 ? 'border-emerald-500/30' : 'border-indigo-500/30'} rounded-xl p-6`}>
                                <div className="flex items-center gap-3 mb-6">
                                    <div className={`w-12 h-12 ${idx === 0 ? 'bg-emerald-600/20' : 'bg-indigo-600/20'} rounded-lg flex items-center justify-center`}>
                                        {idx === 0 ? <Zap className="text-emerald-400" size={24} /> : <Target className="text-indigo-400" size={24} />}
                                    </div>
                                    <div>
                                        <h3 className={`text-2xl font-bold ${idx === 0 ? 'text-emerald-400' : 'text-indigo-400'}`}>{algo.name}</h3>
                                        <p className="text-slate-400 text-sm">{algo.category} • {algo.greedyWorks ? 'Greedy' : 'DP'}</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-slate-950 rounded-lg p-4">
                                            <div className="text-sm text-slate-400 mb-1">Time Complexity</div>
                                            <div className="font-mono text-lg text-white">{algo.timeComplexity}</div>
                                        </div>
                                        <div className="bg-slate-950 rounded-lg p-4">
                                            <div className="text-sm text-slate-400 mb-1">Space Complexity</div>
                                            <div className="font-mono text-lg text-white">{algo.spaceComplexity}</div>
                                        </div>
                                    </div>

                                    <div className="bg-slate-950 rounded-lg p-4">
                                        <div className="text-sm text-slate-400 mb-2">Case Analysis</div>
                                        <div className="grid grid-cols-3 gap-2 text-sm">
                                            <div><span className="text-emerald-400">Best:</span> <span className="font-mono">{algo.bestCase}</span></div>
                                            <div><span className="text-yellow-400">Avg:</span> <span className="font-mono">{algo.avgCase}</span></div>
                                            <div><span className="text-red-400">Worst:</span> <span className="font-mono">{algo.worstCase}</span></div>
                                        </div>
                                    </div>

                                    <p className="text-slate-300 text-sm">{algo.description}</p>

                                    <Link to={`/visualizer/${algo.id}`}>
                                        <button className={`w-full py-3 ${idx === 0 ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-indigo-600 hover:bg-indigo-500'} rounded-lg font-semibold flex items-center justify-center gap-2`}>
                                            <Play size={18} /> Visualize
                                        </button>
                                    </Link>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* Big-O Cheat Sheet */}
            <motion.div className="mb-12" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <button onClick={() => setShowCheatSheet(!showCheatSheet)} className="w-full flex items-center justify-between p-4 bg-slate-900 border border-slate-800 rounded-xl hover:border-slate-700 transition-colors">
                    <div className="flex items-center gap-3">
                        <BookOpen className="text-yellow-400" size={24} />
                        <span className="text-xl font-bold">Big-O Cheat Sheet</span>
                    </div>
                    <ChevronDown className={`text-slate-400 transition-transform ${showCheatSheet ? 'rotate-180' : ''}`} size={24} />
                </button>

                <AnimatePresence>
                    {showCheatSheet && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                            <div className="mt-4 bg-slate-900 border border-slate-800 rounded-xl p-6">
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {categories.map(cat => (
                                        <button key={cat} onClick={() => setSelectedCategory(cat)} className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${selectedCategory === cat ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>
                                            {cat === 'all' ? 'All' : cat}
                                        </button>
                                    ))}
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b border-slate-700">
                                                <th className="text-left py-3 px-4 text-slate-400">Algorithm</th>
                                                <th className="text-left py-3 px-4 text-slate-400">Category</th>
                                                <th className="text-left py-3 px-4 text-slate-400">Time</th>
                                                <th className="text-left py-3 px-4 text-slate-400">Space</th>
                                                <th className="text-left py-3 px-4 text-slate-400">Greedy?</th>
                                                <th className="text-left py-3 px-4 text-slate-400">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredAlgorithms.map(algo => (
                                                <tr key={algo.id} className="border-b border-slate-800 hover:bg-slate-800/50">
                                                    <td className="py-3 px-4 font-semibold text-white">{algo.name}</td>
                                                    <td className="py-3 px-4"><span className="px-2 py-1 bg-purple-900/30 text-purple-300 rounded text-xs">{algo.category}</span></td>
                                                    <td className="py-3 px-4 font-mono text-emerald-400">{algo.timeComplexity}</td>
                                                    <td className="py-3 px-4 font-mono text-blue-400">{algo.spaceComplexity}</td>
                                                    <td className="py-3 px-4">{algo.greedyWorks ? <span className="text-emerald-400">✓ Yes</span> : <span className="text-red-400">✗ No</span>}</td>
                                                    <td className="py-3 px-4"><Link to={`/visualizer/${algo.id}`} className="text-indigo-400 hover:underline">View →</Link></td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>

            {/* Key Takeaways */}
            <div className="grid md:grid-cols-3 gap-6">
                {[
                    { title: "Use Greedy When:", color: "emerald", items: ["Problem has greedy-choice property", "Optimal substructure exists", "Speed is critical", "O(n log n) is acceptable"] },
                    { title: "Use DP When:", color: "indigo", items: ["Overlapping subproblems exist", "Optimal solution required", "Greedy fails on test cases", "Can trade space for correctness"] },
                    { title: "Trade-offs:", color: "purple", items: ["Greedy: Fast but risky", "DP: Optimal but expensive", "Know your problem's structure", "Test with edge cases"] }
                ].map((section, idx) => (
                    <motion.div key={section.title} className="bg-slate-900 border border-slate-800 rounded-xl p-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + idx * 0.1 }}>
                        <h4 className={`font-semibold text-lg mb-3 text-${section.color}-400`}>{section.title}</h4>
                        <ul className="space-y-2 text-slate-300 text-sm">
                            {section.items.map((item, i) => (
                                <li key={i} className="flex items-start gap-2">
                                    <ArrowRight className={`text-${section.color}-400 flex-shrink-0 mt-1`} size={16} />
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default Analysis;
