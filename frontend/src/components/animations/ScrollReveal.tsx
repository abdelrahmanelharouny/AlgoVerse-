import React, { type ReactNode } from 'react';
import { motion, type Variants } from 'framer-motion';
import { useScrollReveal } from '../../hooks/useScrollReveal';

interface ScrollRevealProps {
    children: ReactNode;
    delay?: number;
    direction?: 'up' | 'down' | 'left' | 'right' | 'fade';
    className?: string;
}

const ScrollReveal: React.FC<ScrollRevealProps> = ({
    children,
    delay = 0,
    direction = 'up',
    className = ''
}) => {
    const { ref, isVisible } = useScrollReveal({ threshold: 0.1, triggerOnce: true });

    const getVariants = (): Variants => {
        const distance = 40;

        const directions = {
            up: { y: distance, x: 0 },
            down: { y: -distance, x: 0 },
            left: { x: distance, y: 0 },
            right: { x: -distance, y: 0 },
            fade: { y: 0, x: 0 }
        };

        return {
            hidden: {
                opacity: 0,
                ...directions[direction]
            },
            visible: {
                opacity: 1,
                x: 0,
                y: 0,
                transition: {
                    duration: 0.6,
                    delay,
                    ease: [0.25, 0.4, 0.25, 1]
                }
            }
        };
    };

    return (
        <motion.div
            ref={ref as any}
            initial="hidden"
            animate={isVisible ? 'visible' : 'hidden'}
            variants={getVariants()}
            className={className}
        >
            {children}
        </motion.div>
    );
};

export default ScrollReveal;
