import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
    MapPin, FileArchive, GitBranch, Calendar,
    Wallet, ArrowRight, Building2, TrendingUp,
    Cpu, Code, Truck, ShoppingCart, Heart, Brain,
    Gamepad2, Music, Plane, Factory, Shield, Users,
    Zap, Award, BookOpen, Target, X
} from 'lucide-react';

interface CaseStudy {
    id: string;
    title: string;
    industry: string;
    algorithm: string;
    algorithmPath: string;
    icon: any;
    color: string;
    scenario: string;
    realWorldExample: string;
    problem: string;
    solution: string;
    impact: string;
    metrics: {
        naive: string;
        optimized: string;
        savings: string;
    };
    stats?: {
        value: string;
        label: string;
    };
}

const caseStudies: CaseStudy[] = [
    // TRANSPORTATION & LOGISTICS
    {
        id: 'navigation',
        title: 'GPS Navigation & Routing',
        industry: 'Transportation',
        algorithm: "Dijkstra's Algorithm",
        algorithmPath: 'dijkstra',
        icon: MapPin,
        color: 'from-blue-500 to-cyan-500',
        scenario: "You're building a navigation app that needs to find the shortest path between locations in a city with millions of intersections.",
        realWorldExample: 'Google Maps, Waze, Apple Maps',
        problem: 'Finding the optimal route among billions of possible paths in real-time, considering traffic, road closures, and distance.',
        solution: "Dijkstra's algorithm efficiently computes shortest paths by exploring nodes in order of their distance from the start, guaranteeing optimal results.",
        impact: 'Saves millions of hours of driving time daily worldwide.',
        metrics: { naive: 'O(V!) brute force', optimized: 'O((V + E) log V)', savings: '99.9999% faster' },
        stats: { value: '1B+', label: 'Daily route queries' }
    },
    {
        id: 'delivery',
        title: 'Amazon Delivery Routes',
        industry: 'Logistics',
        algorithm: 'Traveling Salesman (DP)',
        algorithmPath: 'tsp-dp',
        icon: Truck,
        color: 'from-orange-500 to-yellow-500',
        scenario: 'Amazon delivery drivers must visit 150+ stops daily. Finding the optimal order minimizes fuel costs and delivery time.',
        realWorldExample: 'Amazon Logistics, UPS ORION, FedEx',
        problem: 'With 150 stops, there are 150! possible routes - more than 10^260 combinations.',
        solution: 'DP with bitmasks + heuristics finds near-optimal solutions for vehicle routing in seconds.',
        impact: 'UPS saved $400M annually by avoiding 100M miles of driving.',
        metrics: { naive: 'O(n!) factorial', optimized: 'O(n² × 2^n) DP', savings: '$400M+ annually' },
        stats: { value: '100M', label: 'Miles saved per year' }
    },

    // FINANCE & TRADING
    {
        id: 'portfolio',
        title: 'Investment Portfolio Optimization',
        industry: 'Finance',
        algorithm: '0/1 Knapsack Problem',
        algorithmPath: '0-1-knapsack',
        icon: TrendingUp,
        color: 'from-emerald-500 to-green-500',
        scenario: 'A hedge fund manager needs to select stocks for a portfolio with a fixed budget to maximize returns.',
        realWorldExample: 'BlackRock, Fidelity, Goldman Sachs',
        problem: 'With 1000 potential investments, there are 2^1000 possible portfolios - more than atoms in the universe.',
        solution: 'The Knapsack algorithm finds the optimal selection in polynomial time by building up solutions from smaller subproblems.',
        impact: 'Enables automated high-frequency trading decisions.',
        metrics: { naive: 'O(2^n) exponential', optimized: 'O(n × W) pseudo-polynomial', savings: 'Makes impossible possible' },
        stats: { value: '$10T+', label: 'Assets under algorithmic management' }
    },
    {
        id: 'fraud',
        title: 'Credit Card Fraud Detection',
        industry: 'Finance',
        algorithm: 'Longest Increasing Subsequence',
        algorithmPath: 'lis',
        icon: Shield,
        color: 'from-red-500 to-orange-500',
        scenario: 'Banks analyze transaction patterns to detect anomalies indicating fraudulent card usage.',
        realWorldExample: 'Visa, Mastercard, PayPal',
        problem: 'Millions of transactions per second must be analyzed for suspicious spending patterns.',
        solution: 'LIS helps identify whether spending patterns follow expected growth trajectories or show sudden anomalous spikes.',
        impact: 'Prevents $30B+ in fraud losses annually.',
        metrics: { naive: 'O(2^n) check all', optimized: 'O(n log n) binary search', savings: 'Millisecond detection' },
        stats: { value: '$30B', label: 'Fraud prevented annually' }
    },

    // TECHNOLOGY
    {
        id: 'compression',
        title: 'File Compression (ZIP/RAR)',
        industry: 'Data Storage',
        algorithm: 'Huffman Coding',
        algorithmPath: 'huffman',
        icon: FileArchive,
        color: 'from-purple-500 to-pink-500',
        scenario: 'You need to compress large files for storage or transmission, minimizing size while preserving all data.',
        realWorldExample: 'ZIP, GZIP, PNG, JPEG, MP3',
        problem: 'Fixed-length encoding wastes space: common characters like "e" take as much space as rare ones like "z".',
        solution: 'Huffman coding assigns shorter codes to frequent characters and longer codes to rare ones, achieving optimal prefix-free encoding.',
        impact: 'Reduces global data storage needs by 40-60%.',
        metrics: { naive: 'Fixed 8-bits per char', optimized: 'Variable: 2-15 bits', savings: '40-60% reduction' },
        stats: { value: '40%', label: 'Average compression ratio' }
    },
    {
        id: 'version-control',
        title: 'Git Diff Algorithm',
        industry: 'Software Development',
        algorithm: 'Longest Common Subsequence',
        algorithmPath: 'lcs',
        icon: GitBranch,
        color: 'from-slate-600 to-slate-800',
        scenario: 'When you commit code, Git needs to determine what lines changed between the old and new versions.',
        realWorldExample: 'Git, GitHub, GitLab, Bitbucket',
        problem: 'Comparing two 1000-line files has trillions of possible alignments to consider.',
        solution: 'LCS finds the longest sequence of lines common to both files, then shows additions/deletions around those common lines.',
        impact: 'Powers version control for 100M+ developers.',
        metrics: { naive: 'O(2^n) exponential', optimized: 'O(m × n) polynomial', savings: 'Real-time diffs' },
        stats: { value: '100M+', label: 'Developers using Git daily' }
    },
    {
        id: 'spell-check',
        title: 'Spell Checker & Auto-Correct',
        industry: 'Software & Mobile',
        algorithm: 'Edit Distance',
        algorithmPath: 'edit-distance',
        icon: Code,
        color: 'from-rose-500 to-pink-500',
        scenario: 'When you type "teh" your phone suggests "the". How does it know which words are "close" to your input?',
        realWorldExample: 'iOS Keyboard, Android Gboard, Microsoft Word',
        problem: 'Dictionary has 200,000 words. Finding "closest" words requires comparing against all of them.',
        solution: 'Edit Distance calculates minimum insertions/deletions/substitutions to transform one word to another.',
        impact: 'Improves typing speed by 30% on mobile devices.',
        metrics: { naive: 'Character-by-character', optimized: 'O(m × n) DP', savings: 'Real-time suggestions' },
        stats: { value: '5B+', label: 'Autocorrects per day' }
    },

    // BUSINESS OPERATIONS
    {
        id: 'scheduling',
        title: 'Meeting Room Booking',
        industry: 'Business Operations',
        algorithm: 'Interval Scheduling',
        algorithmPath: 'activity-selection',
        icon: Calendar,
        color: 'from-yellow-500 to-amber-500',
        scenario: 'An office has limited meeting rooms and many overlapping meeting requests. How do you maximize room utilization?',
        realWorldExample: 'Google Calendar, Microsoft Outlook, Calendly',
        problem: 'With n meetings with different start/end times, finding the maximum non-overlapping set is complex.',
        solution: 'The greedy algorithm sorts by end time and selects non-overlapping meetings, guaranteeing optimal count.',
        impact: 'Increases meeting room utilization by 40%.',
        metrics: { naive: 'O(2^n) all subsets', optimized: 'O(n log n) greedy', savings: '100% optimal' },
        stats: { value: '40%', label: 'Improved utilization' }
    },
    {
        id: 'workforce',
        title: 'Employee Task Assignment',
        industry: 'Human Resources',
        algorithm: 'Assignment Problem (Bitmask DP)',
        algorithmPath: 'assignment-bitmask',
        icon: Users,
        color: 'from-cyan-500 to-blue-500',
        scenario: 'A company needs to assign 20 employees to 20 projects, each with different skill compatibility scores.',
        realWorldExample: 'Workday, SAP SuccessFactors, Oracle HCM',
        problem: 'With n workers and n jobs, there are n! possible assignments to evaluate.',
        solution: 'Hungarian algorithm or Bitmask DP finds optimal assignment in polynomial time.',
        impact: 'Increases workforce productivity by 25%.',
        metrics: { naive: 'O(n!) factorial', optimized: 'O(n² × 2^n) DP', savings: 'Optimal matching' },
        stats: { value: '25%', label: 'Productivity increase' }
    },

    // BANKING & RETAIL
    {
        id: 'atm',
        title: 'ATM Cash Dispensing',
        industry: 'Banking',
        algorithm: 'Coin Change Problem',
        algorithmPath: 'coin-change',
        icon: Wallet,
        color: 'from-teal-500 to-cyan-500',
        scenario: 'ATM needs to dispense $347 using minimum number of bills: $100, $50, $20, $10, $5, $1.',
        realWorldExample: 'ATM machines, Vending machines, Self-checkout',
        problem: 'Different bill combinations can sum to the same amount. Finding minimum bills requires careful selection.',
        solution: 'Dynamic programming builds up optimal solutions for each amount from $1 to target.',
        impact: 'Minimizes cash handling and ATM maintenance costs.',
        metrics: { naive: 'O(amount^denominations)', optimized: 'O(amount × denominations)', savings: 'Optimal change' },
        stats: { value: '500K+', label: 'ATMs worldwide' }
    },
    {
        id: 'pricing',
        title: 'Dynamic Pricing & Revenue',
        industry: 'E-commerce',
        algorithm: 'Rod Cutting Problem',
        algorithmPath: 'rod-cutting',
        icon: ShoppingCart,
        color: 'from-violet-500 to-purple-500',
        scenario: 'An airline selling 200 seats must decide how many to sell at $100, $200, $500 to maximize revenue.',
        realWorldExample: 'Amazon, Uber, Airlines',
        problem: 'Different price points have different demand curves. Finding optimal allocation is complex.',
        solution: 'Rod Cutting DP finds optimal way to "cut" inventory into price segments.',
        impact: 'Airlines increase revenue by 5-10% with dynamic pricing.',
        metrics: { naive: 'O(2^n) all prices', optimized: 'O(n²) DP', savings: '5-10% revenue boost' },
        stats: { value: '10%', label: 'Revenue increase' }
    },

    // TELECOMMUNICATIONS
    {
        id: 'network',
        title: 'Network Infrastructure Planning',
        industry: 'Telecommunications',
        algorithm: "Minimum Spanning Tree (Prim's)",
        algorithmPath: 'prims',
        icon: Cpu,
        color: 'from-indigo-500 to-violet-500',
        scenario: 'A telecom company needs to connect 50 cities with fiber optic cables. How do you minimize total cable length?',
        realWorldExample: 'AT&T, Verizon, Internet backbone',
        problem: 'With 50 cities, there are 50^48 possible spanning trees to consider.',
        solution: "Prim's algorithm greedily adds the cheapest edge that expands the connected component.",
        impact: 'Saves billions in infrastructure costs.',
        metrics: { naive: 'All spanning trees', optimized: 'O(E log V)', savings: 'Billions saved' },
        stats: { value: '$50B', label: 'Annual telecom capex' }
    },

    // HEALTHCARE
    {
        id: 'dna',
        title: 'DNA Sequence Alignment',
        industry: 'Healthcare',
        algorithm: 'Edit Distance / LCS',
        algorithmPath: 'lcs',
        icon: Heart,
        color: 'from-red-400 to-pink-500',
        scenario: 'Scientists comparing human and chimpanzee genomes (3 billion base pairs each) to find genetic differences.',
        realWorldExample: 'Human Genome Project, 23andMe, Ancestry',
        problem: 'Aligning two 3-billion character strings would take centuries with brute force.',
        solution: 'LCS and Edit Distance with space optimization enable practical genome comparison.',
        impact: 'Enabled completion of the Human Genome Project.',
        metrics: { naive: 'O(2^n) exponential', optimized: 'O(m × n) with O(n) space', savings: 'Made genomics possible' },
        stats: { value: '3B', label: 'Base pairs in human genome' }
    },

    // GAMING & ENTERTAINMENT
    {
        id: 'games',
        title: 'Game AI Pathfinding',
        industry: 'Gaming',
        algorithm: "Dijkstra / A* (extends Dijkstra)",
        algorithmPath: 'dijkstra',
        icon: Gamepad2,
        color: 'from-green-500 to-emerald-500',
        scenario: 'NPCs in games like Starcraft need to navigate complex terrain while avoiding obstacles.',
        realWorldExample: 'Starcraft, Age of Empires, The Sims',
        problem: 'Real-time games need pathfinding for hundreds of units simultaneously.',
        solution: "Dijkstra with A* heuristics enables efficient pathfinding in large game maps.",
        impact: 'Enables responsive AI in modern games.',
        metrics: { naive: 'O(V²) basic', optimized: 'O(E log V) with A*', savings: '60 FPS maintained' },
        stats: { value: '3B', label: 'Gamers worldwide' }
    },
    {
        id: 'streaming',
        title: 'Video Streaming Quality',
        industry: 'Entertainment',
        algorithm: 'Weighted Interval Scheduling',
        algorithmPath: 'weighted-interval',
        icon: Music,
        color: 'from-pink-500 to-rose-500',
        scenario: 'Netflix CDN must decide which video chunks to cache at each edge server to minimize buffering.',
        realWorldExample: 'Netflix, YouTube, Twitch',
        problem: 'Limited cache space, different video popularities, varying file sizes.',
        solution: 'Weighted Interval Scheduling optimizes cache allocation based on access patterns.',
        impact: 'Reduces video buffering by 40%.',
        metrics: { naive: 'O(2^n) all subsets', optimized: 'O(n log n) DP', savings: '40% less buffering' },
        stats: { value: '15%', label: 'of global internet is Netflix' }
    },

    // TRAVEL & AVIATION
    {
        id: 'flights',
        title: 'Flight Route Optimization',
        industry: 'Aviation',
        algorithm: "Kruskal's MST",
        algorithmPath: 'kruskals',
        icon: Plane,
        color: 'from-sky-500 to-blue-500',
        scenario: 'An airline designing a hub-and-spoke network to connect 100 cities with fewest total flight miles.',
        realWorldExample: 'Delta, United, Emirates',
        problem: 'Minimizing total network distance while ensuring connectivity.',
        solution: "Kruskal's algorithm builds MST by adding edges in order of weight.",
        impact: 'Reduces fuel costs by 15%.',
        metrics: { naive: 'Check all trees', optimized: 'O(E log V)', savings: '15% fuel savings' },
        stats: { value: '$180B', label: 'Annual airline fuel cost' }
    },

    // EDUCATION & AI
    {
        id: 'search',
        title: 'Database Query Optimization',
        industry: 'Technology',
        algorithm: 'Optimal Binary Search Tree',
        algorithmPath: 'optimal-bst',
        icon: Brain,
        color: 'from-amber-500 to-orange-500',
        scenario: 'A database with millions of records must optimize search tree structure based on query frequency.',
        realWorldExample: 'PostgreSQL, MySQL, Oracle',
        problem: 'Some keys are searched more frequently than others. Balanced trees may not be optimal.',
        solution: 'Optimal BST places frequently-searched keys closer to root, minimizing average search time.',
        impact: 'Reduces database query latency by 30%.',
        metrics: { naive: 'O(n!) all trees', optimized: 'O(n³) DP', savings: '30% faster queries' },
        stats: { value: '30%', label: 'Query speed improvement' }
    },

    // SOCIAL NETWORKS
    {
        id: 'social',
        title: 'Social Network Friend Suggestions',
        industry: 'Social Media',
        algorithm: 'Graph BFS/Shortest Path',
        algorithmPath: 'dijkstra',
        icon: Users,
        color: 'from-blue-600 to-indigo-500',
        scenario: 'Facebook needs to suggest friends-of-friends to 3 billion users in real-time.',
        realWorldExample: 'Facebook, LinkedIn, Twitter',
        problem: 'With billions of users and hundreds of connections each, finding mutual friends is complex.',
        solution: 'BFS explores graph layers efficiently, finding friends within 2-3 hops instantly.',
        impact: 'Drives 50%+ of new connections on social platforms.',
        metrics: { naive: 'O(V²) all pairs', optimized: 'O(V + E) BFS', savings: 'Real-time suggestions' },
        stats: { value: '3B', label: 'Facebook users' }
    },

    // ENERGY
    {
        id: 'power',
        title: 'Electric Power Grid Design',
        industry: 'Energy',
        algorithm: "Minimum Spanning Tree (Kruskal's)",
        algorithmPath: 'kruskals',
        icon: Zap,
        color: 'from-yellow-500 to-amber-500',
        scenario: 'A utility company designing power lines to connect solar farms, substations, and cities.',
        realWorldExample: 'National Grid, Duke Energy, PG&E',
        problem: 'Minimizing total wire length while ensuring every location has power.',
        solution: "Kruskal's MST finds minimum cost connection using Union-Find data structure.",
        impact: 'Saves $100M+ per major grid expansion project.',
        metrics: { naive: 'O(E × V)', optimized: 'O(E log E)', savings: '$100M per project' },
        stats: { value: '$2T', label: 'Global grid investment needed' }
    },

    // NLP
    {
        id: 'spell',
        title: 'Spell Check & Auto-Correct',
        industry: 'Software',
        algorithm: 'Edit Distance (Levenshtein)',
        algorithmPath: 'edit-distance',
        icon: Code,
        color: 'from-teal-500 to-cyan-500',
        scenario: 'Your phone keyboard suggests corrections for misspelled words in milliseconds.',
        realWorldExample: 'Microsoft Word, Grammarly, iPhone Keyboard',
        problem: 'Comparing a typo against 200,000 dictionary words seems expensive.',
        solution: 'Edit Distance with pruning finds closest matches efficiently.',
        impact: 'Powers autocorrect for 5+ billion smartphone users.',
        metrics: { naive: 'O(m × n) per word', optimized: 'O(k) with BK-trees', savings: 'Instant corrections' },
        stats: { value: '5B+', label: 'Smartphone users' }
    },

    // MANUFACTURING
    {
        id: 'assembly',
        title: 'Car Assembly Line Optimization',
        industry: 'Manufacturing',
        algorithm: 'Job Scheduling / Activity Selection',
        algorithmPath: 'activity-selection',
        icon: Factory,
        color: 'from-gray-500 to-zinc-600',
        scenario: 'Toyota needs to schedule 1000+ tasks on an assembly line to minimize total production time.',
        realWorldExample: 'Toyota, Tesla, General Motors',
        problem: 'Tasks have dependencies, different durations, and limited stations.',
        solution: 'Greedy scheduling with topological sort optimizes task ordering.',
        impact: 'Reduces production time by 20%, saving billions.',
        metrics: { naive: 'O(n!) orderings', optimized: 'O(n log n) greedy', savings: '20% faster production' },
        stats: { value: '90M', label: 'Cars produced annually' }
    },

    // CRYPTOCURRENCY
    {
        id: 'crypto',
        title: 'Crypto Transaction Verification',
        industry: 'Blockchain',
        algorithm: 'Huffman Encoding (Merkle Trees)',
        algorithmPath: 'huffman',
        icon: Wallet,
        color: 'from-yellow-600 to-orange-500',
        scenario: 'Bitcoin nodes verify transactions using compact proofs instead of full blocks.',
        realWorldExample: 'Bitcoin, Ethereum, Solana',
        problem: 'Full transaction history is 500+ GB. Lite wallets need verification without downloading everything.',
        solution: 'Merkle trees (related to Huffman) enable efficient proof of transaction inclusion.',
        impact: 'Enables mobile crypto wallets.',
        metrics: { naive: 'Download 500GB', optimized: 'O(log n) proof', savings: 'Mobile-friendly' },
        stats: { value: '$1.7T', label: 'Crypto market cap' }
    },

    // ROBOTICS
    {
        id: 'robots',
        title: 'Warehouse Robot Coordination',
        industry: 'Logistics',
        algorithm: 'Multi-Agent Pathfinding (Dijkstra)',
        algorithmPath: 'dijkstra',
        icon: Truck,
        color: 'from-slate-500 to-gray-600',
        scenario: 'Amazon warehouses have 200,000+ robots that must navigate without colliding.',
        realWorldExample: 'Amazon Robotics, Kiva Systems',
        problem: 'Thousands of robots, millions of packages, real-time coordination.',
        solution: 'Modified Dijkstra with time-space reservations avoids collisions.',
        impact: 'Processes 10M+ packages daily per warehouse.',
        metrics: { naive: 'O(k × V²) k robots', optimized: 'O(k × V log V)', savings: '3x faster fulfillment' },
        stats: { value: '200K', label: 'Robots in Amazon warehouses' }
    },

    // MUSIC
    {
        id: 'playlist',
        title: 'Playlist Generation & Ordering',
        industry: 'Music',
        algorithm: 'Longest Increasing Subsequence',
        algorithmPath: 'lis',
        icon: Music,
        color: 'from-green-600 to-emerald-500',
        scenario: 'Spotify creates playlists that smoothly transition between songs by tempo and mood.',
        realWorldExample: 'Spotify, Apple Music, Pandora',
        problem: 'Given 100 songs, find the best ordering for smooth BPM transitions.',
        solution: 'LIS finds longest smoothly increasing/decreasing tempo sequences.',
        impact: 'Increases listening session length by 25%.',
        metrics: { naive: 'O(n!) permutations', optimized: 'O(n log n) LIS', savings: '25% longer sessions' },
        stats: { value: '500M', label: 'Spotify users' }
    },

    // SPORTS
    {
        id: 'sports',
        title: 'Sports League Scheduling',
        industry: 'Sports',
        algorithm: 'Interval Scheduling / Assignment',
        algorithmPath: 'activity-selection',
        icon: Award,
        color: 'from-red-600 to-rose-500',
        scenario: 'The NFL schedules 272 games across 18 weeks with venue, TV, and travel constraints.',
        realWorldExample: 'NFL, NBA, Premier League',
        problem: 'Thousands of constraints: stadiums, broadcast slots, travel fairness.',
        solution: 'Activity Selection with constraint propagation finds feasible schedules.',
        impact: 'Creates multi-billion dollar broadcast schedules.',
        metrics: { naive: 'Check all permutations', optimized: 'O(n log n) greedy', savings: 'Feasible schedules' },
        stats: { value: '$18B', label: 'NFL annual revenue' }
    }
];

// Statistics for the hero section
const globalStats = [
    { value: '$2.1T', label: 'Economic impact of algorithms', icon: TrendingUp },
    { value: '10B+', label: 'Algorithm executions per day', icon: Zap },
    { value: '100M+', label: 'Developers using these algorithms', icon: Users },
    { value: '50+', label: 'Industries transformed', icon: Factory }
];

const CaseStudies = () => {
    const [selectedCase, setSelectedCase] = useState<CaseStudy | null>(null);
    const [filter, setFilter] = useState<string>('all');
    const [searchTerm, setSearchTerm] = useState('');

    const industries = ['all', ...new Set(caseStudies.map(c => c.industry))];

    const filteredCases = caseStudies.filter(c => {
        const matchesFilter = filter === 'all' || c.industry === filter;
        const matchesSearch = searchTerm === '' ||
            c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.algorithm.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.industry.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    return (
        <div className="min-h-screen bg-slate-950 pt-20">
            {/* Hero Section */}
            <div className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-transparent to-blue-900/20" />
                <div className="max-w-7xl mx-auto px-4 py-16 relative">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center mb-12"
                    >
                        <span className="inline-block px-4 py-1 bg-purple-500/20 text-purple-400 rounded-full text-sm font-semibold mb-4">
                            🌍 Real-World Impact
                        </span>
                        <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-red-400">
                            Where Algorithms Meet Reality
                        </h1>
                        <p className="text-xl text-slate-400 max-w-3xl mx-auto mb-8">
                            Discover how the algorithms you're learning power trillion-dollar companies and touch billions of lives every day. These aren't just academic exercises—they're the backbone of modern technology.
                        </p>
                    </motion.div>

                    {/* Global Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
                        {globalStats.map((stat, index) => (
                            <motion.div
                                key={stat.label}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 text-center"
                            >
                                <stat.icon className="mx-auto mb-2 text-purple-400" size={24} />
                                <div className="text-2xl md:text-3xl font-bold text-white">{stat.value}</div>
                                <div className="text-xs text-slate-500">{stat.label}</div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 pb-16">
                {/* Search & Filter */}
                <div className="flex flex-col md:flex-row gap-4 mb-8">
                    <input
                        type="text"
                        placeholder="Search case studies..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="flex-1 px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500"
                    />
                    <div className="flex flex-wrap gap-2">
                        {industries.map(industry => (
                            <button
                                key={industry}
                                onClick={() => setFilter(industry)}
                                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${filter === industry
                                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30'
                                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                                    }`}
                            >
                                {industry === 'all' ? 'All' : industry}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Results Count */}
                <div className="text-slate-400 text-sm mb-6">
                    Showing {filteredCases.length} of {caseStudies.length} case studies
                </div>

                {/* Case Study Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredCases.map((study, index) => (
                        <motion.div
                            key={study.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: Math.min(index * 0.05, 0.5) }}
                            className="group cursor-pointer"
                            onClick={() => setSelectedCase(study)}
                        >
                            <div className="relative bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-slate-700 transition-all hover:shadow-xl hover:shadow-purple-500/10 h-full flex flex-col">
                                {/* Stats Badge */}
                                {study.stats && (
                                    <div className="absolute top-4 right-4 bg-slate-800 px-2 py-1 rounded text-xs">
                                        <span className="font-bold text-purple-400">{study.stats.value}</span>
                                        <span className="text-slate-500 ml-1">{study.stats.label}</span>
                                    </div>
                                )}

                                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${study.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                                    <study.icon className="text-white" size={24} />
                                </div>

                                <span className="text-xs text-slate-500 uppercase tracking-wider mb-2">
                                    {study.industry}
                                </span>

                                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-purple-400 transition-colors">
                                    {study.title}
                                </h3>

                                <p className="text-sm text-slate-400 mb-4 flex-1 line-clamp-3">
                                    {study.scenario}
                                </p>

                                <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                                    <span className="text-sm font-semibold text-purple-400">
                                        {study.algorithm}
                                    </span>
                                    <ArrowRight className="text-slate-600 group-hover:text-purple-400 group-hover:translate-x-1 transition-all" size={18} />
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Empty State */}
                {filteredCases.length === 0 && (
                    <div className="text-center py-16">
                        <Target className="mx-auto text-slate-600 mb-4" size={48} />
                        <h3 className="text-xl font-bold text-slate-400 mb-2">No matching case studies</h3>
                        <p className="text-slate-500">Try adjusting your search or filter.</p>
                    </div>
                )}

                {/* Learning Section */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="mt-16 bg-gradient-to-r from-purple-900/30 to-pink-900/30 border border-purple-500/30 rounded-2xl p-8"
                >
                    <div className="flex items-center gap-4 mb-4">
                        <BookOpen className="text-purple-400" size={32} />
                        <h2 className="text-2xl font-bold text-white">Ready to Learn?</h2>
                    </div>
                    <p className="text-slate-300 mb-6">
                        Click any case study to see the problem in detail, then use our interactive visualizer to understand exactly how the algorithm solves it step by step.
                    </p>
                    <div className="flex flex-wrap gap-4">
                        <Link
                            to="/problems"
                            className="px-6 py-3 bg-purple-600 hover:bg-purple-500 rounded-lg font-semibold text-white transition-colors"
                        >
                            Browse All Algorithms →
                        </Link>
                        <Link
                            to="/playground"
                            className="px-6 py-3 bg-slate-800 hover:bg-slate-700 rounded-lg font-semibold text-slate-300 transition-colors"
                        >
                            Try in Playground
                        </Link>
                    </div>
                </motion.div>
            </div>

            {/* Detail Modal */}
            <AnimatePresence>
                {selectedCase && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setSelectedCase(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="bg-slate-900 border border-slate-700 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
                            onClick={e => e.stopPropagation()}
                        >
                            {/* Header */}
                            <div className={`relative p-8 bg-gradient-to-br ${selectedCase.color} rounded-t-2xl`}>
                                <button
                                    onClick={() => setSelectedCase(null)}
                                    className="absolute top-4 right-4 p-2 bg-black/20 rounded-full hover:bg-black/40 transition-colors"
                                >
                                    <X className="text-white" size={20} />
                                </button>
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
                                        <selectedCase.icon className="text-white" size={32} />
                                    </div>
                                    <div>
                                        <span className="text-sm text-white/70 uppercase tracking-wider">
                                            {selectedCase.industry}
                                        </span>
                                        <h2 className="text-2xl font-bold text-white">
                                            {selectedCase.title}
                                        </h2>
                                    </div>
                                </div>
                                {selectedCase.stats && (
                                    <div className="mt-4 inline-flex items-center gap-2 bg-white/20 backdrop-blur px-4 py-2 rounded-lg">
                                        <Award className="text-yellow-300" size={16} />
                                        <span className="text-white font-bold">{selectedCase.stats.value}</span>
                                        <span className="text-white/70">{selectedCase.stats.label}</span>
                                    </div>
                                )}
                            </div>

                            {/* Content */}
                            <div className="p-8 space-y-6">
                                <div>
                                    <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                                        <Target size={18} className="text-blue-400" /> The Scenario
                                    </h3>
                                    <p className="text-slate-400">{selectedCase.scenario}</p>
                                </div>

                                <div className="flex items-center gap-2 p-4 bg-slate-800/50 rounded-lg">
                                    <Building2 className="text-slate-500" size={20} />
                                    <span className="text-sm text-slate-400">Used by: </span>
                                    <span className="text-sm text-white font-semibold">{selectedCase.realWorldExample}</span>
                                </div>

                                <div>
                                    <h3 className="text-lg font-semibold text-red-400 mb-2">❌ The Problem</h3>
                                    <p className="text-slate-400">{selectedCase.problem}</p>
                                </div>

                                <div>
                                    <h3 className="text-lg font-semibold text-emerald-400 mb-2">✅ The Solution: {selectedCase.algorithm}</h3>
                                    <p className="text-slate-400">{selectedCase.solution}</p>
                                </div>

                                <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-lg p-4">
                                    <h3 className="text-lg font-semibold text-purple-400 mb-2">💡 Real-World Impact</h3>
                                    <p className="text-white">{selectedCase.impact}</p>
                                </div>

                                <div className="grid grid-cols-3 gap-4">
                                    <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                                        <span className="text-xs text-red-400 uppercase tracking-wider">Naive Approach</span>
                                        <p className="text-sm text-white mt-1 font-mono">{selectedCase.metrics.naive}</p>
                                    </div>
                                    <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-4">
                                        <span className="text-xs text-emerald-400 uppercase tracking-wider">Optimized</span>
                                        <p className="text-sm text-white mt-1 font-mono">{selectedCase.metrics.optimized}</p>
                                    </div>
                                    <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
                                        <span className="text-xs text-purple-400 uppercase tracking-wider">Impact</span>
                                        <p className="text-sm text-white mt-1 font-semibold">{selectedCase.metrics.savings}</p>
                                    </div>
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <Link
                                        to={`/visualizer/${selectedCase.algorithmPath}`}
                                        className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-lg font-semibold text-white text-center transition-colors"
                                        onClick={() => setSelectedCase(null)}
                                    >
                                        🎯 See Visualization
                                    </Link>
                                    <button
                                        onClick={() => setSelectedCase(null)}
                                        className="px-6 py-3 bg-slate-800 hover:bg-slate-700 rounded-lg font-semibold text-slate-300 transition-colors"
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default CaseStudies;
