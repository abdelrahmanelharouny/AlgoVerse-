import { Link } from 'react-router-dom';
import { Play, Zap, Code2 } from 'lucide-react';
import { motion } from 'framer-motion';
import ProgressTracker from '../components/ProgressTracker';

const Home = () => {
    // ... algorithms logic ...

    // ... later in JSX ...
    // <Play size={20} className="fill-current" /> -> commented out
    // <Zap size={20} /> -> commented out
    // <Play size={14} /> -> commented out
    // <Code2 size={20} /> -> commented out

    const algorithms = [
        {
            name: 'Knapsack Problem',
            slug: 'knapsack',
            description: 'Classic optimization problem comparing DP vs Greedy approaches.',
            difficulty: 'Medium',
            tags: ['DP', 'Greedy'],
            color: 'from-blue-500 to-indigo-600'
        },
        {
            name: 'Coin Change',
            slug: 'coin-change',
            description: 'Find minimum coins needed. See where greedy strategies fail.',
            difficulty: 'Easy',
            tags: ['DP', 'Greedy'],
            color: 'from-emerald-500 to-teal-600'
        },
        {
            name: 'Interval Scheduling',
            slug: 'interval-scheduling',
            description: 'Maximize non-overlapping intervals. A reliable Greedy application.',
            difficulty: 'Easy',
            tags: ['Greedy'],
            color: 'from-purple-500 to-pink-600'
        },
        {
            name: 'Matrix Chain Multiplication',
            slug: 'matrix-chain',
            description: 'Optimize order of matrix multiplications using Dynamic Programming.',
            difficulty: 'Hard',
            tags: ['DP'],
            color: 'from-rose-500 to-red-600'
        },
        {
            name: 'Huffman Coding',
            slug: 'huffman-coding',
            description: 'Optimal prefix codes for data compression. Builds a binary tree.',
            difficulty: 'Medium',
            tags: ['Greedy', 'Tree'],
            color: 'from-amber-500 to-orange-600'
        },
        {
            name: 'Longest Common Subsequence',
            slug: 'longest-common-subsequence',
            description: 'Find the longest subsequence common to two sequences.',
            difficulty: 'Medium',
            tags: ['DP', 'String'],
            color: 'from-cyan-500 to-blue-600'
        },
        {
            name: "Dijkstra's Algorithm",
            slug: 'dijkstra',
            description: 'Find the shortest path in a graph using a priority queue.',
            difficulty: 'Hard',
            tags: ['Greedy', 'Graph'],
            color: 'from-violet-500 to-purple-600'
        },
        {
            name: "Prim's Algorithm",
            slug: 'prims',
            description: 'Find the Minimum Spanning Tree (MST) by growing from a start node.',
            difficulty: 'Hard',
            tags: ['Greedy', 'Graph'],
            color: 'from-pink-500 to-rose-600'
        },
        {
            name: "Kruskal's Algorithm",
            slug: 'kruskals',
            description: 'Find the MST by sorting edges and using a Union-Find data structure.',
            difficulty: 'Medium',
            tags: ['Greedy', 'Graph'],
            color: 'from-orange-500 to-amber-600'
        }
    ];

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500/30">
            {/* Navbar / Header */}
            {/* Navbar removed to use StickyHeader from Layout */}

            {/* Hero Section */}
            <div className="relative overflow-hidden pt-20 pb-32">
                {/* Background Particles/Grid */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
                <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-indigo-500 opacity-20 blur-[100px]"></div>

                <div className="relative max-w-5xl mx-auto px-4 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <span className="inline-block px-4 py-1.5 rounded-full border border-slate-700 bg-slate-900/50 text-indigo-400 text-sm font-medium mb-6">
                            v2.0 Now Released 🚀
                        </span>
                        <h1 className="text-5xl md:text-7xl font-bold mb-8 tracking-tight">
                            Master Complexity <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
                                One Step at a Time
                            </span>
                        </h1>
                        <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
                            Visualizing the elegance of algorithms. From Greedy strategies to Dynamic Programming, understand the 'why' behind the code.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <a href="#algorithms">
                                <button className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold transition-all shadow-[0_0_20px_-5px_rgba(99,102,241,0.5)] flex items-center justify-center gap-2 group">
                                    <Play size={20} className="fill-current" />
                                    Start Visualizing
                                </button>
                            </a>
                            <Link to="/challenge">
                                <button className="px-8 py-4 bg-slate-900 border border-slate-700 hover:border-slate-600 text-slate-300 hover:text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2">
                                    <Zap size={20} />
                                    Take a Challenge
                                </button>
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Algorithms Grid */}
            <div id="algorithms" className="max-w-7xl mx-auto px-4 py-24">
                <div className="flex items-center justify-between mb-12">
                    <div>
                        <h2 className="text-3xl font-bold mb-4">Algorithm Laboratory</h2>
                        <p className="text-slate-400">Select an algorithm to visualize its execution.</p>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {algorithms.map((algo, index) => (
                        <motion.div
                            key={algo.slug}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.4, delay: index * 0.1 }}
                        >
                            <Link to={`/visualizer/${algo.slug}`} className="block h-full">
                                <div className="group h-full bg-slate-900/50 hover:bg-slate-800/80 border border-slate-800 hover:border-indigo-500/50 rounded-2xl p-6 transition-all duration-300 relative overflow-hidden">
                                    {/* Hover Glow */}
                                    <div className={`absolute inset-0 bg-gradient-to-br ${algo.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}></div>

                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex flex-wrap gap-2">
                                            {algo.tags.map(tag => (
                                                <span key={tag} className="px-2 py-1 rounded text-xs font-medium bg-slate-800 border border-slate-700 text-slate-300 group-hover:border-slate-600">{tag}</span>
                                            ))}
                                        </div>
                                        <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${algo.color}`}></div>
                                    </div>

                                    <h3 className="text-xl font-bold mb-2 group-hover:text-indigo-400 transition-colors">{algo.name}</h3>
                                    <p className="text-slate-400 text-sm mb-6 line-clamp-2">{algo.description}</p>

                                    <div className="flex items-center justify-between mt-auto">
                                        <span className={`text-xs font-semibold ${algo.difficulty === 'Easy' ? 'text-emerald-400' :
                                            algo.difficulty === 'Medium' ? 'text-amber-400' :
                                                'text-rose-400'
                                            }`}>
                                            {algo.difficulty}
                                        </span>
                                        <span className="text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-[-10px] group-hover:translate-x-0 flex items-center gap-1 text-sm font-medium">
                                            View <Play size={14} />
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Progress Tracker Section */}
            <div className="max-w-5xl mx-auto px-4 pb-24">
                <div className="mb-8">
                    <h2 className="text-3xl font-bold mb-2">Your Learning Journey</h2>
                    <p className="text-slate-400">Track your progress and master each algorithm.</p>
                </div>
                <ProgressTracker />
            </div>

            {/* Footer */}
            <footer className="border-t border-slate-800 bg-slate-950 py-12">
                <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-2 opacity-50">
                        <Code2 size={20} />
                        <span className="font-bold">AlgoVerse</span>
                    </div>
                    <p className="text-slate-500 text-sm">
                        &copy; {new Date().getFullYear()} AlgoVerse. Built for educational purposes.
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default Home;
