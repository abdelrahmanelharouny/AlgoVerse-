import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Code2, Github, Heart, Sparkles, Zap, Trophy } from 'lucide-react';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    const footerSections = [
        {
            title: 'Algorithms',
            links: [
                { to: '/visualizer/knapsack', label: 'Knapsack Problem' },
                { to: '/visualizer/coin-change', label: 'Coin Change' },
                { to: '/visualizer/interval-scheduling', label: 'Interval Scheduling' }
            ]
        },
        {
            title: 'Features',
            links: [
                { to: '/playground', label: 'Playground' },
                { to: '/challenge', label: 'Challenge Mode' },
                { to: '/analysis', label: 'Analysis' }
            ]
        },
        {
            title: 'Resources',
            links: [
                { to: '/problems', label: 'All Problems' },
                { to: '/sandbox', label: 'Sandbox' },
                { to: '/v3-demo', label: 'v3.0 Demo' }
            ]
        }
    ];

    return (
        <footer className="relative mt-24 border-t border-white/10 glass-card">
            {/* Glow line at top */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-50"></div>

            <div className="max-w-7xl mx-auto px-4 py-12">
                <div className="grid md:grid-cols-4 gap-8">
                    {/* Brand Section */}
                    <div>
                        <motion.div
                            className="flex items-center gap-3 mb-4"
                            whileHover={{ scale: 1.05 }}
                        >
                            <div className="relative">
                                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 blur-lg opacity-50"></div>
                                <Code2 className="relative text-indigo-400" size={32} />
                            </div>
                            <span className="font-bold text-xl text-white">AlgoViz</span>
                        </motion.div>
                        <p className="text-slate-400 text-sm leading-relaxed mb-4">
                            Master algorithms through interactive visualization. Built for students, educators, and developers.
                        </p>
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                            <span>Made with</span>
                            <Heart size={14} className="text-red-400 fill-red-400 animate-pulse" />
                            <span>and React</span>
                        </div>
                    </div>

                    {/* Footer Links */}
                    {footerSections.map((section, index) => (
                        <div key={index}>
                            <h4 className="font-bold text-white mb-4 flex items-center gap-2">
                                {section.title}
                                <span className="text-indigo-400">
                                    {index === 0 && <Zap size={16} />}
                                    {index === 1 && <Trophy size={16} />}
                                    {index === 2 && <Sparkles size={16} />}
                                </span>
                            </h4>
                            <ul className="space-y-2">
                                {section.links.map((link, linkIndex) => (
                                    <li key={linkIndex}>
                                        <Link
                                            to={link.to}
                                            className="text-slate-400 hover:text-white text-sm transition-colors inline-flex items-center gap-2 group"
                                        >
                                            <span className="group-hover:translate-x-1 transition-transform">
                                                {link.label}
                                            </span>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Bottom Bar */}
                <div className="mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="text-sm text-slate-400 text-center md:text-left">
                        © {currentYear} Algorithm Visualizer. All rights reserved.
                    </div>

                    {/* Social Links */}
                    <div className="flex items-center gap-4">
                        <motion.a
                            href="https://github.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-10 h-10 glass-card-hover rounded-lg flex items-center justify-center group"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <Github size={20} className="text-slate-400 group-hover:text-white transition-colors" />
                        </motion.a>
                        <motion.div
                            className="px-4 py-2 glass-card rounded-full text-sm font-semibold text-indigo-400 flex items-center gap-2"
                            whileHover={{ scale: 1.05 }}
                        >
                            <Sparkles size={14} />
                            <span>v3.0</span>
                        </motion.div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
