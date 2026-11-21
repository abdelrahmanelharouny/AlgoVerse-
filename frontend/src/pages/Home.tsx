import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    ArrowDownRight, ArrowUpRight, Binary, Braces, CalendarClock,
    Coins, GitBranch, Network, Play, Route, Sigma, Trophy, Waypoints
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import ProgressTracker from '../components/ProgressTracker';

type Algorithm = {
    name: string;
    slug: string;
    description: string;
    tags: string[];
    icon: LucideIcon;
    accent: string;
};

const algorithms: Algorithm[] = [
    { name: '0/1 Knapsack', slug: 'knapsack', description: 'Build an optimal selection under a fixed capacity. Compare the recurrence with a greedy shortcut.', tags: ['DP', 'Greedy'], icon: Binary, accent: '#d6f56a' },
    { name: 'Coin Change', slug: 'coin-change', description: 'Find the fewest coins and inspect the cases where a local choice misses the optimum.', tags: ['DP', 'Greedy'], icon: Coins, accent: '#83cbd8' },
    { name: 'Interval Scheduling', slug: 'interval-scheduling', description: 'Select compatible activities and see why earliest-finish-time is the key rule.', tags: ['Greedy'], icon: CalendarClock, accent: '#ff8063' },
    { name: 'Matrix Chain', slug: 'matrix-chain', description: 'Choose the multiplication order that minimizes scalar operations.', tags: ['DP'], icon: Sigma, accent: '#d6f56a' },
    { name: 'Huffman Coding', slug: 'huffman', description: 'Build a prefix-code tree by repeatedly joining the least frequent nodes.', tags: ['Greedy', 'Trees'], icon: GitBranch, accent: '#83cbd8' },
    { name: 'Longest Common Subsequence', slug: 'lcs', description: 'Trace the table that reveals the longest sequence shared by two strings.', tags: ['DP', 'Strings'], icon: Braces, accent: '#ff8063' },
    { name: 'Dijkstra', slug: 'dijkstra', description: 'Follow frontier updates and shortest-path decisions through a weighted graph.', tags: ['Greedy', 'Graph'], icon: Route, accent: '#83cbd8' },
    { name: 'Prim', slug: 'prims', description: 'Grow a minimum spanning tree one safe connecting edge at a time.', tags: ['Greedy', 'Graph'], icon: Network, accent: '#d6f56a' },
    { name: 'Kruskal', slug: 'kruskals', description: 'Sort edges, reject cycles, and assemble a minimum spanning forest.', tags: ['Greedy', 'Graph'], icon: Waypoints, accent: '#ff8063' }
];

const filters = ['All', 'DP', 'Greedy', 'Graph', 'Strings'] as const;

const Home: React.FC = () => {
    const [activeFilter, setActiveFilter] = useState<(typeof filters)[number]>('All');
    const visibleAlgorithms = useMemo(
        () => activeFilter === 'All'
            ? algorithms
            : algorithms.filter(algorithm => algorithm.tags.includes(activeFilter)),
        [activeFilter]
    );

    return (
        <div className="av-home">
            <section className="av-home__hero">
                <div className="av-home__copy">
                    <p className="av-eyebrow">A visual field guide to algorithms</p>
                    <h1 className="av-home__title">
                        Don’t just run<br />
                        algorithms.<br />
                        <em>See how they think.</em>
                    </h1>
                    <p className="av-home__lead">
                        Step through real executions, inspect the state behind every decision, and connect the idea to the code that makes it work.
                    </p>
                    <div className="av-home__actions">
                        <Link to="/visualizer/knapsack" className="av-button av-button--lime">
                            <Play size={15} fill="currentColor" /> Start exploring <ArrowUpRight size={15} />
                        </Link>
                        <Link to="/challenge" className="av-button av-button--quiet">
                            <Trophy size={15} /> Try a challenge
                        </Link>
                    </div>
                </div>

                <motion.div
                    className="av-hero-visual"
                    initial={{ opacity: 0, y: 18, rotate: 2.5 }}
                    animate={{ opacity: 1, y: 0, rotate: 1.2 }}
                    transition={{ duration: .55, ease: [0.2, 0.7, 0.2, 1] }}
                >
                    <div className="av-hero-visual__top">
                        <span>Trace / shortest path</span>
                        <span className="av-hero-visual__status">Live specimen</span>
                    </div>
                    <svg className="av-hero-visual__diagram" viewBox="0 0 520 285" role="img" aria-label="A weighted graph with a highlighted shortest path">
                        <defs>
                            <pattern id="av-hero-dots" width="18" height="18" patternUnits="userSpaceOnUse">
                                <circle cx="1" cy="1" r="1" fill="#758878" opacity=".22" />
                            </pattern>
                        </defs>
                        <rect width="520" height="285" fill="url(#av-hero-dots)" />
                        <g fill="none" stroke="#506357" strokeWidth="2">
                            <path d="M84 141 L205 68 L333 112 L441 53" />
                            <path d="M84 141 L195 226 L333 112 L430 224" />
                            <path d="M205 68 L195 226" />
                            <path d="M333 112 L430 224" />
                        </g>
                        <g fill="none" stroke="#d6f56a" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                            <path className="av-path-trace" d="M84 141 L205 68 L333 112 L430 224" />
                        </g>
                        <g fontFamily="ui-monospace, monospace" fontSize="11" fill="#9daa9e">
                            <text x="136" y="91">4</text><text x="264" y="78">2</text><text x="384" y="76">7</text>
                            <text x="132" y="200">8</text><text x="266" y="183">3</text><text x="384" y="178">5</text>
                        </g>
                        <g>
                            <circle cx="84" cy="141" r="22" fill="#d6f56a" />
                            <circle cx="205" cy="68" r="20" fill="#1d2c22" stroke="#d6f56a" strokeWidth="2.5" />
                            <circle cx="195" cy="226" r="20" fill="#1d2c22" stroke="#52665a" strokeWidth="2" />
                            <circle cx="333" cy="112" r="22" fill="#1d2c22" stroke="#d6f56a" strokeWidth="2.5" />
                            <circle cx="441" cy="53" r="20" fill="#1d2c22" stroke="#52665a" strokeWidth="2" />
                            <circle cx="430" cy="224" r="22" fill="#1d2c22" stroke="#d6f56a" strokeWidth="2.5" />
                            <circle className="av-node-pulse" cx="333" cy="112" r="30" fill="none" stroke="#d6f56a" opacity=".25" />
                        </g>
                        <g fontFamily="ui-monospace, monospace" fontSize="13" fontWeight="700" textAnchor="middle" dominantBaseline="middle">
                            <text x="84" y="141" fill="#17200c">A</text>
                            <text x="205" y="68" fill="#edf0e7">B</text>
                            <text x="195" y="226" fill="#edf0e7">C</text>
                            <text x="333" y="112" fill="#edf0e7">D</text>
                            <text x="441" y="53" fill="#edf0e7">E</text>
                            <text x="430" y="224" fill="#edf0e7">F</text>
                        </g>
                        <g fontFamily="ui-monospace, monospace" fontSize="9" fill="#d6f56a">
                            <text x="58" y="181">START</text>
                            <text x="390" y="263">PATH COST / 9</text>
                        </g>
                    </svg>
                    <div className="av-hero-visual__caption">
                        <div>
                            <strong>One decision at a time.</strong>
                            <span>Watch the frontier change as the shortest path emerges.</span>
                        </div>
                        <span className="av-hero-visual__step">STEP 04 / 12</span>
                    </div>
                </motion.div>
            </section>

            <section className="av-home__principles" aria-label="How AlgoVerse helps you learn">
                <div className="av-principle">
                    <span className="av-principle__number">01</span>
                    <div><strong>See the state</strong><span>Tables, graphs, trees, and decisions.</span></div>
                </div>
                <div className="av-principle">
                    <span className="av-principle__number">02</span>
                    <div><strong>Understand the why</strong><span>Context for every step in the trace.</span></div>
                </div>
                <div className="av-principle">
                    <span className="av-principle__number">03</span>
                    <div><strong>Connect it to code</strong><span>Implementation and metrics beside the run.</span></div>
                </div>
            </section>

            <section className="av-section" id="algorithms">
                <div className="av-section__heading">
                    <div>
                        <p className="av-eyebrow">The algorithm index / 09 studies</p>
                        <h2>Pick a problem.<br />Follow its logic.</h2>
                    </div>
                    <p>
                        Start with a guided example, change the input, then move through the execution at your own pace.
                    </p>
                </div>

                <div className="av-filter-row" role="group" aria-label="Filter algorithms by topic">
                    {filters.map(filter => (
                        <button
                            key={filter}
                            type="button"
                            className="av-filter"
                            aria-pressed={activeFilter === filter}
                            onClick={() => setActiveFilter(filter)}
                        >
                            {filter === 'All' ? 'All studies' : filter}
                        </button>
                    ))}
                </div>

                <motion.div className="av-algorithm-grid" layout>
                    {visibleAlgorithms.map((algorithm, index) => {
                        const Icon = algorithm.icon;
                        return (
                            <motion.div
                                key={algorithm.slug}
                                layout
                                initial={{ opacity: 0, y: 14 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: .24, delay: index * .025 }}
                            >
                                <Link
                                    to={'/visualizer/' + algorithm.slug}
                                    className="av-algorithm-card"
                                    style={{ ['--card-accent' as string]: algorithm.accent } as React.CSSProperties}
                                >
                                    <div className="av-algorithm-card__meta">
                                        <span className="av-algorithm-card__index">STUDY / {String(algorithms.indexOf(algorithm) + 1).padStart(2, '0')}</span>
                                        <span className="av-algorithm-card__symbol"><Icon size={17} strokeWidth={1.7} /></span>
                                    </div>
                                    <h3>{algorithm.name}</h3>
                                    <p>{algorithm.description}</p>
                                    <div className="av-algorithm-card__bottom">
                                        <span className="av-algorithm-card__tags">
                                            {algorithm.tags.map(tag => <span className="av-algorithm-card__tag" key={tag}>{tag}</span>)}
                                        </span>
                                        <span className="av-algorithm-card__open">Explore <ArrowUpRight size={13} /></span>
                                    </div>
                                </Link>
                            </motion.div>
                        );
                    })}
                    {visibleAlgorithms.length === 0 && <div className="av-home__empty">No studies match this topic yet.</div>}
                </motion.div>
            </section>

            <section className="av-progress-section">
                <div className="av-progress-section__heading">
                    <p className="av-eyebrow">Your workspace</p>
                    <h2>Keep building intuition.</h2>
                    <p>Pick up where you left off and keep a record of the ideas you have explored.</p>
                </div>
                <ProgressTracker />
            </section>

            <footer className="av-home__footer">
                <strong>AlgoVerse <span aria-hidden="true">/</span> Algorithm field lab</strong>
                <span>Built to make the invisible steps visible.</span>
                <Link to="/problems">Browse the library <ArrowDownRight size={13} /></Link>
            </footer>
        </div>
    );
};

export default Home;