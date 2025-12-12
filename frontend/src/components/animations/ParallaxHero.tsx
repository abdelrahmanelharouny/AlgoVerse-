import React, { type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { useParallax } from '../../hooks/useParallax';

interface ParallaxHeroProps {
    children: ReactNode;
    className?: string;
}

const ParallaxHero: React.FC<ParallaxHeroProps> = ({ children, className = '' }) => {
    const { getParallaxStyle, getScrollParallax } = useParallax();

    return (
        <div className={`relative overflow-hidden ${className}`}>
            {/* Animated Background Layers */}
            <div className="absolute inset-0">
                {/* Layer 1: Base gradient with scroll parallax */}
                <motion.div
                    className="absolute inset-0 bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900"
                    style={getScrollParallax(0.3)}
                />

                {/* Layer 2: Moving gradient orbs with mouse parallax */}
                <motion.div
                    className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl"
                    style={getParallaxStyle(1)}
                />
                <motion.div
                    className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl"
                    style={getParallaxStyle(1.5)}
                />

                {/* Layer 3: Grid pattern  */}
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItMnptMCAwdjJoLTJ2LTJ6bTAgMHYyaDJ2LTJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-20" />

                {/* Layer 4: Radial gradient overlay */}
                <div className="absolute inset-0 bg-gradient-radial from-transparent via-slate-950/50 to-slate-950" />
            </div>

            {/* Content */}
            <div className="relative z-10">
                {children}
            </div>
        </div>
    );
};

export default ParallaxHero;
