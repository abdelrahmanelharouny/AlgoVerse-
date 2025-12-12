import { useEffect, useState } from 'react';

interface ParallaxState {
    mouseX: number;
    mouseY: number;
    scrollY: number;
}

export const useParallax = () => {
    const [state, setState] = useState<ParallaxState>({
        mouseX: 0,
        mouseY: 0,
        scrollY: 0
    });

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            const x = (e.clientX / window.innerWidth - 0.5) * 2;
            const y = (e.clientY / window.innerHeight - 0.5) * 2;

            setState(prev => ({
                ...prev,
                mouseX: x,
                mouseY: y
            }));
        };

        const handleScroll = () => {
            setState(prev => ({
                ...prev,
                scrollY: window.scrollY
            }));
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('scroll', handleScroll, { passive: true });

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    const getParallaxStyle = (depth: number = 1) => ({
        transform: `translate(${state.mouseX * depth * 20}px, ${state.mouseY * depth * 20}px)`
    });

    const getScrollParallax = (speed: number = 0.5) => ({
        transform: `translateY(${state.scrollY * speed}px)`
    });

    return {
        mouseX: state.mouseX,
        mouseY: state.mouseY,
        scrollY: state.scrollY,
        getParallaxStyle,
        getScrollParallax
    };
};
