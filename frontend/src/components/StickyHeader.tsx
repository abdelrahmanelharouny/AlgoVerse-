import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowUpRight, BarChart3, BookOpen, Code2, FlaskConical, Menu, Trophy, X } from 'lucide-react';

const navItems = [
    { to: '/problems', label: 'Algorithm library', icon: BookOpen },
    { to: '/playground', label: 'Compare', icon: FlaskConical },
    { to: '/analysis', label: 'Analysis', icon: BarChart3 },
    { to: '/challenge', label: 'Challenges', icon: Trophy },
    { to: '/case-studies', label: 'Case studies', icon: Code2 }
];

const StickyHeader: React.FC = () => {
    const [scrolled, setScrolled] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const location = useLocation();

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 12);
        handleScroll();
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        setMenuOpen(false);
    }, [location.pathname]);

    useEffect(() => {
        if (!menuOpen) return;
        const closeOnEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') setMenuOpen(false);
        };
        window.addEventListener('keydown', closeOnEscape);
        return () => window.removeEventListener('keydown', closeOnEscape);
    }, [menuOpen]);

    const isCurrent = (path: string) => {
        if (path === '/problems') return location.pathname === '/problems' || location.pathname.startsWith('/visualizer/');
        return location.pathname === path || location.pathname.startsWith(path + '/');
    };

    return (
        <header className="av-site-header" data-scrolled={scrolled}>
            <div className="av-site-header__inner">
                <Link to="/" className="av-brand" aria-label="AlgoVerse home">
                    <span className="av-brand__mark" aria-hidden="true">AV</span>
                    <span>
                        <span className="av-brand__word">AlgoVerse</span>
                        <span className="av-brand__descriptor">Algorithm field lab</span>
                    </span>
                </Link>

                <nav className="av-nav" aria-label="Main navigation">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const active = isCurrent(item.to);
                        return (
                            <Link
                                key={item.to}
                                to={item.to}
                                className="av-nav__link"
                                aria-current={active ? 'page' : undefined}
                            >
                                <Icon size={14} strokeWidth={1.8} />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                <Link className="av-header__action" to="/visualizer/knapsack">
                    Open the lab <ArrowUpRight size={14} />
                </Link>

                <button
                    type="button"
                    className="av-mobile-toggle"
                    onClick={() => setMenuOpen(open => !open)}
                    aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
                    aria-expanded={menuOpen}
                    aria-controls="av-mobile-navigation"
                >
                    {menuOpen ? <X size={19} /> : <Menu size={19} />}
                </button>
            </div>

            {menuOpen && (
                <nav id="av-mobile-navigation" className="av-mobile-nav" aria-label="Mobile navigation">
                    <Link to="/" aria-current={location.pathname === '/' ? 'page' : undefined}>Home</Link>
                    {navItems.map(item => (
                        <Link
                            key={item.to}
                            to={item.to}
                            aria-current={isCurrent(item.to) ? 'page' : undefined}
                        >
                            {item.label}
                        </Link>
                    ))}
                    <Link to="/visualizer/knapsack" aria-current={location.pathname.startsWith('/visualizer/') ? 'page' : undefined}>
                        Open the visualizer
                    </Link>
                </nav>
            )}
        </header>
    );
};

export default StickyHeader;