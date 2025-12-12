import { Link } from 'react-router-dom';
import { Play, Zap, BarChart3, Code2 } from 'lucide-react';

const Home = () => {
    const algorithms = [
        {
            name: 'Knapsack Problem',
            slug: 'knapsack',
            description: 'Classic optimization problem comparing DP vs Greedy approaches',
            difficulty: 'Medium'
        },
        {
            name: 'Coin Change',
            slug: 'coin-change',
            description: 'Minimum coins needed - shows when greedy fails',
            difficulty: 'Easy'
        },
        {
            name: 'Interval Scheduling',
            slug: 'interval-scheduling',
            description: 'Maximum non-overlapping intervals - greedy is optimal!',
            difficulty: 'Easy'
        }
    ];

    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 py-20 px-4">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItMnptMCAwdjJoLTJ2LTJ6bTAgMHYyaDJ2LTJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-20"></div>

                <div className="relative max-w-4xl mx-auto text-center">
                    <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
                        Algorithm Visualizer
                    </h1>
                    <p className="text-xl md:text-2xl text-slate-300 mb-8">
                        Interactive step-by-step visualization of <span className="text-emerald-400 font-semibold">Greedy Algorithms</span> vs <span className="text-indigo-400 font-semibold">Dynamic Programming</span>
                    </p>
                    <div className="flex flex-wrap gap-4 justify-center">
                        <Link
                            to="/problems"
                            className="group px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl font-semibold text-white shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all hover:scale-105 flex items-center gap-2"
                        >
                            <Play size={20} />
                            <span>Explore Algorithms</span>
                        </Link>
                        <Link
                            to="/analysis"
                            className="px-8 py-4 bg-slate-800 border-2 border-slate-700 rounded-xl font-semibold text-white hover:border-indigo-500 transition-all hover:scale-105 flex items-center gap-2"
                        >
                            <BarChart3 size={20} />
                            <span>View Analysis</span>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Features Grid */}
            <div className="max-w-6xl mx-auto px-4 py-16">
                <div className="grid md:grid-cols-3 gap-8 mb-16">
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-indigo-500/50 transition-colors">
                        <div className="w-12 h-12 bg-indigo-600/20 rounded-lg flex items-center justify-center mb-4">
                            <Play className="text-indigo-400" size={24} />
                        </div>
                        <h3 className="text-xl font-bold mb-2">Step-by-Step Animation</h3>
                        <p className="text-slate-400">
                            Watch algorithms execute in real-time with detailed step descriptions and highlighted state changes
                        </p>
                    </div>

                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-emerald-500/50 transition-colors">
                        <div className="w-12 h-12 bg-emerald-600/20 rounded-lg flex items-center justify-center mb-4">
                            <Zap className="text-emerald-400" size={24} />
                        </div>
                        <h3 className="text-xl font-bold mb-2">Performance Metrics</h3>
                        <p className="text-slate-400">
                            Compare time/space complexity, execution time, and step counts between approaches
                        </p>
                    </div>

                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-purple-500/50 transition-colors">
                        <div className="w-12 h-12 bg-purple-600/20 rounded-lg flex items-center justify-center mb-4">
                            <Code2 className="text-purple-400" size={24} />
                        </div>
                        <h3 className="text-xl font-bold mb-2">Educational Focus</h3>
                        <p className="text-slate-400">
                            Learn when to use greedy vs DP with examples showing both correct and incorrect greedy solutions
                        </p>
                    </div>
                </div>

                {/* Algorithms List */}
                <div className="mb-8">
                    <h2 className="text-3xl font-bold mb-6">Available Algorithms</h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {algorithms.map((algo) => (
                            <Link
                                key={algo.slug}
                                to={`/visualizer/${algo.slug}`}
                                className="group bg-slate-900 border-2 border-slate-800 rounded-xl p-6 hover:border-indigo-500 transition-all hover:scale-[1.02]"
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <h3 className="text-xl font-bold group-hover:text-indigo-400 transition-colors">
                                        {algo.name}
                                    </h3>
                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${algo.difficulty === 'Easy' ? 'bg-emerald-900/30 text-emerald-400' :
                                            algo.difficulty === 'Medium' ? 'bg-yellow-900/30 text-yellow-400' :
                                                'bg-red-900/30 text-red-400'
                                        }`}>
                                        {algo.difficulty}
                                    </span>
                                </div>
                                <p className="text-slate-400 mb-4">{algo.description}</p>
                                <div className="flex items-center gap-2 text-indigo-400 font-semibold">
                                    <span>Visualize</span>
                                    <Play size={16} className="group-hover:translate-x-1 transition-transform" />
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;
