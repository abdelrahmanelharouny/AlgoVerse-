import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    Target, Search, Filter, Activity, Brain, Trophy,
    CheckCircle2, Clock, Bookmark, BookmarkCheck, Grid3X3, List,
    TrendingUp, Sparkles, ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { problems, type Problem } from '../data/problems';

const PROGRESS_KEY = 'algoverse_progress';
const BOOKMARKS_KEY = 'algoverse_bookmarks';

const getCompletedAlgorithms = (): Set<string> => {
    try {
        const saved = localStorage.getItem(PROGRESS_KEY);
        if (saved) {
            const parsed = JSON.parse(saved);
            return new Set(parsed.filter((a: any) => a.completed).map((a: any) => a.id));
        }
    } catch { /* empty */ }
    return new Set();
};

const getBookmarks = (): Set<string> => {
    try {
        const saved = localStorage.getItem(BOOKMARKS_KEY);
        if (saved) return new Set(JSON.parse(saved));
    } catch { /* empty */ }
    return new Set();
};

const complexityData: Record<string, { time: string; space: string; estimate: string }> = {
    'activity-selection': { time: 'O(n log n)', space: 'O(1)', estimate: '5 min' },
    'fractional-knapsack': { time: 'O(n log n)', space: 'O(1)', estimate: '5 min' },
    'coin-change-min': { time: 'O(n × amount)', space: 'O(amount)', estimate: '10 min' },
    'rod-cutting': { time: 'O(n²)', space: 'O(n)', estimate: '10 min' },
    'lcs': { time: 'O(m × n)', space: 'O(m × n)', estimate: '15 min' },
    '0-1-knapsack': { time: 'O(n × W)', space: 'O(n × W)', estimate: '15 min' },
    'job-sequencing': { time: 'O(n²)', space: 'O(n)', estimate: '10 min' },
    'matrix-chain': { time: 'O(n³)', space: 'O(n²)', estimate: '20 min' },
    'lis': { time: 'O(n²)', space: 'O(n)', estimate: '10 min' },
    'edit-distance': { time: 'O(m × n)', space: 'O(m × n)', estimate: '15 min' },
    'interval-scheduling': { time: 'O(n log n)', space: 'O(1)', estimate: '5 min' },
    'tsp-dp': { time: 'O(n² × 2ⁿ)', space: 'O(n × 2ⁿ)', estimate: '30 min' },
    'weighted-interval': { time: 'O(n log n)', space: 'O(n)', estimate: '15 min' },
    'optimal-bst': { time: 'O(n³)', space: 'O(n²)', estimate: '25 min' },
    'assignment-bitmask': { time: 'O(n² × 2ⁿ)', space: 'O(2ⁿ)', estimate: '30 min' },
    'tree-dp-independent': { time: 'O(n)', space: 'O(n)', estimate: '20 min' },
};

const Problems = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [greedyFilter, setGreedyFilter] = useState<string>('all');
    const [categoryFilter, setCategoryFilter] = useState<string>('all');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [sortBy, setSortBy] = useState<string>('difficulty');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [showFilters, setShowFilters] = useState(false);

    const [completed, setCompleted] = useState<Set<string>>(new Set());
    const [bookmarks, setBookmarks] = useState<Set<string>>(new Set());

    useEffect(() => {
        setCompleted(getCompletedAlgorithms());
        setBookmarks(getBookmarks());
    }, []);

    const toggleBookmark = (id: string) => {
        setBookmarks(prev => {
            const newBookmarks = new Set(prev);
            if (newBookmarks.has(id)) {
                newBookmarks.delete(id);
            } else {
                newBookmarks.add(id);
            }
            localStorage.setItem(BOOKMARKS_KEY, JSON.stringify([...newBookmarks]));
            return newBookmarks;
        });
    };

    const categories = useMemo(() => ['all', ...new Set(problems.map(p => p.category))], []);

    const filteredProblems = useMemo(() => {
        let result = problems.filter(problem => {
            const matchesSearch = problem.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                problem.description.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesGreedy = greedyFilter === 'all' ||
                (greedyFilter === 'works' && problem.greedyWorks) ||
                (greedyFilter === 'fails' && !problem.greedyWorks);
            const matchesCategory = categoryFilter === 'all' || problem.category === categoryFilter;
            const matchesStatus = statusFilter === 'all' ||
                (statusFilter === 'completed' && completed.has(problem.id)) ||
                (statusFilter === 'not-started' && !completed.has(problem.id)) ||
                (statusFilter === 'bookmarked' && bookmarks.has(problem.id));
            return matchesSearch && matchesGreedy && matchesCategory && matchesStatus;
        });

        result.sort((a, b) => {
            if (sortBy === 'name') return a.name.localeCompare(b.name);
            if (sortBy === 'difficulty') {
                const order = { Easy: 0, Medium: 1, Hard: 2 };
                return order[a.difficulty] - order[b.difficulty];
            }
            if (sortBy === 'category') return a.category.localeCompare(b.category);
            return 0;
        });

        return result;
    }, [searchQuery, greedyFilter, categoryFilter, statusFilter, sortBy, completed, bookmarks]);

    const groupedProblems = {
        Easy: filteredProblems.filter(p => p.difficulty === 'Easy'),
        Medium: filteredProblems.filter(p => p.difficulty === 'Medium'),
        Hard: filteredProblems.filter(p => p.difficulty === 'Hard'),
    };

    const progressStats = {
        total: problems.length,
        completed: completed.size,
        percentage: Math.round((completed.size / problems.length) * 100)
    };

    const ProblemCard = ({ problem }: { problem: Problem }) => {
        const isCompleted = completed.has(problem.id);
        const isBookmarked = bookmarks.has(problem.id);
        const complexity = complexityData[problem.id] || { time: 'O(?)', space: 'O(?)', estimate: '10 min' };

        return (
            <motion.div
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`bg-slate-900/50 border border-slate-800 hover:border-indigo-500/50 rounded-xl p-6 relative group overflow-hidden transition-all ${isCompleted ? 'border-l-4 border-l-emerald-500' : ''}`}
            >
                <div className="absolute top-4 right-4 flex items-center gap-2">
                    {isCompleted && <CheckCircle2 className="text-emerald-400" size={16} />}
                    <button onClick={(e) => { e.preventDefault(); toggleBookmark(problem.id); }} className="hover:bg-slate-700 rounded p-1">
                        {isBookmarked ? <BookmarkCheck className="text-yellow-400" size={16} /> : <Bookmark className="text-slate-500" size={16} />}
                    </button>
                    {problem.greedyWorks ? <Target className="text-emerald-500" size={16} /> : <Brain className="text-indigo-500" size={16} />}
                </div>

                <div className="mb-4 pr-20">
                    <h3 className="text-xl font-bold mb-2 group-hover:text-indigo-400 transition-colors">{problem.name}</h3>
                    <p className="text-slate-400 text-sm line-clamp-2">{problem.description}</p>
                </div>

                <div className="flex flex-wrap gap-2 mb-3 text-xs">
                    <span className="px-2 py-1 bg-slate-800 rounded text-slate-400 font-mono">⏱️ {complexity.time}</span>
                    <span className="px-2 py-1 bg-slate-800 rounded text-slate-400 font-mono">💾 {complexity.space}</span>
                    <span className="px-2 py-1 bg-slate-800 rounded text-slate-400 flex items-center gap-1"><Clock size={12} /> {complexity.estimate}</span>
                </div>

                <div className="mb-4 bg-slate-950/50 rounded-lg p-3 text-xs font-mono text-slate-400">
                    <div className="truncate"><span className="text-indigo-400">In:</span> {problem.exampleInput}</div>
                    <div className="truncate"><span className="text-emerald-400">Out:</span> {problem.exampleOutput}</div>
                </div>

                <div className="flex flex-wrap gap-2 mb-6">
                    <span className="text-xs px-2 py-1 rounded bg-purple-900/30 text-purple-300 border border-purple-500/30">{problem.category}</span>
                    {problem.concepts.slice(0, 2).map(c => <span key={c} className="text-xs px-2 py-1 rounded bg-slate-800 text-slate-300">{c}</span>)}
                </div>

                <div className="flex gap-2">
                    <Link to={`/visualizer/${problem.id}`} className="flex-1">
                        <button className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-sm font-semibold flex items-center justify-center gap-2">
                            <Activity size={16} /> Visualize
                        </button>
                    </Link>
                    {problem.greedyWorks && (
                        <Link to={`/visualizer/${problem.id}?method=greedy`} className="flex-1">
                            <button className="w-full py-2 bg-slate-800 hover:bg-emerald-600/20 border border-slate-700 rounded-lg text-sm font-semibold">Compare</button>
                        </Link>
                    )}
                </div>
            </motion.div>
        );
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 text-center">
                <h1 className="text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">Algorithm Library</h1>
                <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-6">A collection of {problems.length} classic algorithms, categorized by difficulty.</p>

                <div className="max-w-md mx-auto mb-4">
                    <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-slate-400">Your Progress</span>
                        <span className="text-indigo-400 font-semibold">{progressStats.completed}/{progressStats.total}</span>
                    </div>
                    <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
                        <motion.div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500" initial={{ width: 0 }} animate={{ width: `${progressStats.percentage}%` }} />
                    </div>
                </div>
            </motion.div>

            <div className="sticky top-20 z-40 bg-slate-950/90 backdrop-blur-md py-4 mb-8 border-b border-white/5">
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                        <div className="relative w-full md:w-96">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input type="text" placeholder="Search algorithms..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-lg focus:border-indigo-500 outline-none" />
                        </div>

                        <div className="flex items-center gap-2">
                            <button onClick={() => setShowFilters(!showFilters)} className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${showFilters ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-900 border-slate-800 text-slate-400'}`}>
                                <Filter size={16} /> Filters <ChevronDown size={14} className={showFilters ? 'rotate-180' : ''} />
                            </button>
                            <div className="flex bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
                                <button onClick={() => setViewMode('grid')} className={`p-2 ${viewMode === 'grid' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}><Grid3X3 size={18} /></button>
                                <button onClick={() => setViewMode('list')} className={`p-2 ${viewMode === 'list' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}><List size={18} /></button>
                            </div>
                        </div>
                    </div>

                    <AnimatePresence>
                        {showFilters && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="grid grid-cols-2 md:grid-cols-4 gap-4 overflow-hidden">
                                <div>
                                    <label className="text-xs text-slate-500 mb-1 block">Category</label>
                                    <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500">
                                        {categories.map(cat => <option key={cat} value={cat}>{cat === 'all' ? 'All Categories' : cat}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs text-slate-500 mb-1 block">Approach</label>
                                    <select value={greedyFilter} onChange={(e) => setGreedyFilter(e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500">
                                        <option value="all">All Approaches</option>
                                        <option value="works">Greedy Works</option>
                                        <option value="fails">DP Required</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs text-slate-500 mb-1 block">Status</label>
                                    <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500">
                                        <option value="all">All</option>
                                        <option value="completed">Completed</option>
                                        <option value="not-started">Not Started</option>
                                        <option value="bookmarked">Bookmarked</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs text-slate-500 mb-1 block">Sort By</label>
                                    <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500">
                                        <option value="difficulty">Difficulty</option>
                                        <option value="name">Name (A-Z)</option>
                                        <option value="category">Category</option>
                                    </select>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-4 text-center">
                    <Sparkles className="mx-auto text-indigo-400 mb-2" size={20} />
                    <div className="text-2xl font-bold text-white">{filteredProblems.length}</div>
                    <div className="text-xs text-slate-500">Showing</div>
                </div>
                <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-4 text-center">
                    <CheckCircle2 className="mx-auto text-emerald-400 mb-2" size={20} />
                    <div className="text-2xl font-bold text-white">{progressStats.completed}</div>
                    <div className="text-xs text-slate-500">Completed</div>
                </div>
                <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-4 text-center">
                    <BookmarkCheck className="mx-auto text-yellow-400 mb-2" size={20} />
                    <div className="text-2xl font-bold text-white">{bookmarks.size}</div>
                    <div className="text-xs text-slate-500">Bookmarked</div>
                </div>
                <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-4 text-center">
                    <TrendingUp className="mx-auto text-purple-400 mb-2" size={20} />
                    <div className="text-2xl font-bold text-white">{progressStats.percentage}%</div>
                    <div className="text-xs text-slate-500">Progress</div>
                </div>
            </div>

            <div className="space-y-4">
                {viewMode === 'grid' ? (
                    <>
                        {groupedProblems.Easy.length > 0 && (
                            <section>
                                <div className="flex items-center gap-3 mb-6 mt-8 border-b border-slate-800 pb-4">
                                    <Activity className="text-emerald-400" size={24} />
                                    <h2 className="text-2xl font-bold">Easy ({groupedProblems.Easy.length})</h2>
                                </div>
                                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">{groupedProblems.Easy.map(p => <ProblemCard key={p.id} problem={p} />)}</div>
                            </section>
                        )}
                        {groupedProblems.Medium.length > 0 && (
                            <section>
                                <div className="flex items-center gap-3 mb-6 mt-8 border-b border-slate-800 pb-4">
                                    <Brain className="text-yellow-400" size={24} />
                                    <h2 className="text-2xl font-bold">Medium ({groupedProblems.Medium.length})</h2>
                                </div>
                                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">{groupedProblems.Medium.map(p => <ProblemCard key={p.id} problem={p} />)}</div>
                            </section>
                        )}
                        {groupedProblems.Hard.length > 0 && (
                            <section>
                                <div className="flex items-center gap-3 mb-6 mt-8 border-b border-slate-800 pb-4">
                                    <Trophy className="text-red-400" size={24} />
                                    <h2 className="text-2xl font-bold">Hard ({groupedProblems.Hard.length})</h2>
                                </div>
                                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">{groupedProblems.Hard.map(p => <ProblemCard key={p.id} problem={p} />)}</div>
                            </section>
                        )}
                    </>
                ) : (
                    <div className="space-y-3">
                        {filteredProblems.map(p => (
                            <div key={p.id} className={`bg-slate-900/50 border border-slate-800 rounded-lg p-4 flex items-center gap-4 ${completed.has(p.id) ? 'border-l-4 border-l-emerald-500' : ''}`}>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="font-bold text-white">{p.name}</h3>
                                        {completed.has(p.id) && <CheckCircle2 className="text-emerald-400" size={14} />}
                                        <span className={`text-xs px-2 py-0.5 rounded ${p.difficulty === 'Easy' ? 'bg-emerald-500/20 text-emerald-400' : p.difficulty === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'}`}>{p.difficulty}</span>
                                    </div>
                                    <p className="text-slate-400 text-sm truncate">{p.description}</p>
                                </div>
                                <Link to={`/visualizer/${p.id}`}><button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-sm font-semibold">Visualize</button></Link>
                            </div>
                        ))}
                    </div>
                )}

                {filteredProblems.length === 0 && (
                    <div className="text-center py-20">
                        <p className="text-slate-500">No algorithms found matching your criteria.</p>
                        <button onClick={() => { setSearchQuery(''); setGreedyFilter('all'); setCategoryFilter('all'); setStatusFilter('all'); }} className="mt-4 text-indigo-400 hover:underline">Clear all filters</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Problems;
