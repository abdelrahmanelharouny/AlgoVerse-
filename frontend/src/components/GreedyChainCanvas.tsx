import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { type GreedyDecision } from '../types';

interface GreedyChainCanvasProps {
    decisions: GreedyDecision[];
    currentIndex: number;
}

const GreedyChainCanvas: React.FC<GreedyChainCanvasProps> = ({
    decisions,
    currentIndex
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationRef = useRef<number | null>(null);

    const CARD_WIDTH = 180;
    const CARD_HEIGHT = 120;
    const CARD_SPACING = 40;
    const ARROW_LENGTH = 30;

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const totalWidth = decisions.length * (CARD_WIDTH + ARROW_LENGTH + CARD_SPACING) + 40;
        const height = CARD_HEIGHT + 80;

        canvas.width = totalWidth * window.devicePixelRatio;
        canvas.height = height * window.devicePixelRatio;
        canvas.style.width = `${totalWidth}px`;
        canvas.style.height = `${height}px`;

        ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

        const draw = () => {
            // Clear
            ctx.fillStyle = '#0f172a';
            ctx.fillRect(0, 0, totalWidth, height);

            let xOffset = 20;

            decisions.forEach((decision, index) => {
                const isActive = index === currentIndex;
                const isPast = index < currentIndex;
                const isFuture = index > currentIndex;

                // Card background
                const x = xOffset;
                const y = 40;

                // Glow effect for active card
                if (isActive) {
                    const gradient = ctx.createRadialGradient(
                        x + CARD_WIDTH / 2, y + CARD_HEIGHT / 2, 0,
                        x + CARD_WIDTH / 2, y + CARD_HEIGHT / 2, CARD_WIDTH / 1.5
                    );
                    gradient.addColorStop(0, decision.picked ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)');
                    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
                    ctx.fillStyle = gradient;
                    ctx.fillRect(x - 10, y - 10, CARD_WIDTH + 20, CARD_HEIGHT + 20);
                }

                // Card border and background
                ctx.fillStyle = isPast
                    ? (decision.picked ? '#064e3b' : '#450a0a')
                    : isActive
                        ? (decision.picked ? '#065f46' : '#7f1d1d')
                        : '#1e293b';

                ctx.strokeStyle = isPast
                    ? (decision.picked ? '#10b981' : '#ef4444')
                    : isActive
                        ? (decision.picked ? '#34d399' : '#f87171')
                        : '#475569';

                ctx.lineWidth = isActive ? 3 : 1;

                // Rounded rectangle
                const radius = 12;
                ctx.beginPath();
                ctx.moveTo(x + radius, y);
                ctx.lineTo(x + CARD_WIDTH - radius, y);
                ctx.quadraticCurveTo(x + CARD_WIDTH, y, x + CARD_WIDTH, y + radius);
                ctx.lineTo(x + CARD_WIDTH, y + CARD_HEIGHT - radius);
                ctx.quadraticCurveTo(x + CARD_WIDTH, y + CARD_HEIGHT, x + CARD_WIDTH - radius, y + CARD_HEIGHT);
                ctx.lineTo(x + radius, y + CARD_HEIGHT);
                ctx.quadraticCurveTo(x, y + CARD_HEIGHT, x, y + CARD_HEIGHT - radius);
                ctx.lineTo(x, y + radius);
                ctx.quadraticCurveTo(x, y, x + radius, y);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();

                // Card content
                ctx.textAlign = 'left';
                ctx.textBaseline = 'top';

                // Item ID
                ctx.fillStyle = isActive ? '#ffffff' : '#e2e8f0';
                ctx.font = 'bold 16px Inter';
                ctx.fillText(`Item ${decision.itemId}`, x + 12, y + 12);

                // Status badge
                const badgeY = y + 12;
                const badgeX = x + CARD_WIDTH - 70;
                ctx.fillStyle = decision.picked
                    ? 'rgba(16, 185, 129, 0.3)'
                    : 'rgba(239, 68, 68, 0.3)';
                ctx.fillRect(badgeX, badgeY, 58, 22);

                ctx.fillStyle = decision.picked ? '#10b981' : '#ef4444';
                ctx.font = 'bold 11px Inter';
                ctx.textAlign = 'center';
                ctx.fillText(
                    decision.picked ? 'PICK' : 'REJECT',
                    badgeX + 29,
                    badgeY + 6
                );

                // Details
                ctx.fillStyle = isFuture ? '#64748b' : '#94a3b8';
                ctx.font = '13px Inter';
                ctx.textAlign = 'left';

                ctx.fillText(`Weight: ${decision.weight}`, x + 12, y + 44);
                ctx.fillText(`Value: ${decision.value}`, x + 12, y + 64);
                ctx.fillText(`Ratio: ${decision.ratio.toFixed(2)}`, x + 12, y + 84);

                // Arrow to next card
                if (index < decisions.length - 1) {
                    const arrowX = xOffset + CARD_WIDTH + 10;
                    const arrowY = y + CARD_HEIGHT / 2;

                    ctx.strokeStyle = isPast ? '#64748b' : '#334155';
                    ctx.fillStyle = isPast ? '#64748b' : '#334155';
                    ctx.lineWidth = 2;

                    // Arrow line
                    ctx.beginPath();
                    ctx.moveTo(arrowX, arrowY);
                    ctx.lineTo(arrowX + ARROW_LENGTH, arrowY);
                    ctx.stroke();

                    // Arrow head
                    ctx.beginPath();
                    ctx.moveTo(arrowX + ARROW_LENGTH, arrowY);
                    ctx.lineTo(arrowX + ARROW_LENGTH - 8, arrowY - 6);
                    ctx.lineTo(arrowX + ARROW_LENGTH - 8, arrowY + 6);
                    ctx.closePath();
                    ctx.fill();
                }

                xOffset += CARD_WIDTH + ARROW_LENGTH + CARD_SPACING;
            });
        };

        const animate = () => {
            draw();
            animationRef.current = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [decisions, currentIndex]);

    return (
        <motion.div
            className="overflow-x-auto bg-slate-950 rounded-xl p-4 border border-slate-800"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
        >
            <canvas
                ref={canvasRef}
                className="mx-auto"
                style={{ imageRendering: 'crisp-edges' }}
            />
        </motion.div>
    );
};

export default GreedyChainCanvas;
