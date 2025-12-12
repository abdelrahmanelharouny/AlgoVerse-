import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home as HomeIcon, LayoutDashboard, Play, BarChart2, Sparkles, Trophy, Briefcase } from 'lucide-react';

const StickyHeader: React.FC = () => {
    const [scrolled, setScrolled] = useState(false);
    const location = useLocation();

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navItems = [
        { to: '/', icon: HomeIcon, label: 'Home' },
        { to: '/problems', icon: LayoutDashboard, label: 'Problems' },
        { to: '/visualizer/knapsack', icon: Play, label: 'Visualizer' },
        { to: '/analysis', icon: BarChart2, label: 'Analysis' },
        { to: '/playground', icon: Sparkles, label: 'Playground' },
        { to: '/challenge', icon: Trophy, label: 'Challenge' },
        { to: '/case-studies', icon: Briefcase, label: 'Case Studies' }
    ];

    return (
        <motion.nav
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
                ? 'glass-card shadow-lg shadow-black/20'
                : 'bg-transparent'
                }`}
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.3 }}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2 group">
                        <motion.div
                            className={`w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg transition-shadow duration-300 ${scrolled ? 'shadow-indigo-500/20' : 'shadow-indigo-500/50'
                                }`}
                            whileHover={{ scale: 1.1, rotate: 5 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <span className="font-bold text-white">AV</span>
                        </motion.div>
                        <span
                            className={`font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r transition-opacity duration-300 ${scrolled
                                ? 'from-white to-slate-300 opacity-100'
                                : 'from-white to-slate-400 opacity-90'
                                }`}
                        >
                            AlgoVerse
                        </span>
                    </Link>

                    {/* Navigation */}
                    <div className="hidden md:flex items-center space-x-1">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = location.pathname === item.to ||
                                (item.to.includes('visualizer') && location.pathname.includes('visualizer'));

                            return (
                                <Link
                                    key={item.to}
                                    to={item.to}
                                    className="relative"
                                >
                                    <motion.div
                                        className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive
                                            ? 'text-white bg-slate-800'
                                            : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                                            }`}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        <Icon size={18} />
                                        <span>{item.label}</span>

                                        {/* Active indicator with neon glow */}
                                        {isActive && (
                                            <motion.div
                                                className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-500 to-purple-500"
                                                layoutId="activeNav"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                style={{
                                                    boxShadow: '0 0 8px rgba(99, 102, 241, 0.6)'
                                                }}
                                            />
                                        )}
                                    </motion.div>
                                </Link>
                            );
                        })}
                    </div>

                    {/* Mobile menu button (placeholder) */}
                    <button className="md:hidden p-2 text-slate-300 hover:text-white">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                </div>
            </div>
        </motion.nav>
    );
};

export default StickyHeader;
