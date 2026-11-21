import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { type GreedyDecision } from '../types';

interface GreedyChainCanvasProps {
    decisions: GreedyDecision[];
    currentIndex: number;
}

const CARD_WIDTH = 180;
const CARD_HEIGHT = 120;
const CARD_SPACING = 34;
const ARROW_LENGTH = 26;

const GreedyChainCanvas: React.FC<GreedyChainCanvasProps> = ({ decisions, currentIndex }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const totalWidth = Math.max(
            300,
            decisions.length * CARD_WIDTH + Math.max(0, decisions.length - 1) * (ARROW_LENGTH + CARD_SPACING) + 40
        );
        const height = CARD_HEIGHT + 74;
        const dpr = Math.max(1, Math.min(window.devicePixelRatio || 1, 2));

        canvas.width = Math.round(totalWidth * dpr);
        canvas.height = Math.round(height * dpr);
        canvas.style.width = totalWidth + 'px';
        canvas.style.height = height + 'px';
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        ctx.fillStyle = '#0d1510';
        ctx.fillRect(0, 0, totalWidth, height);

        let xOffset = 20;
        decisions.forEach((decision, index) => {
            const isActive = index === currentIndex;
            const isPast = index < currentIndex;
            const x = xOffset;
            const y = 34;
            const picked = decision.picked;

            ctx.fillStyle = isPast
                ? (picked ? '#244d35' : '#542d29')
                : isActive
                    ? (picked ? '#314d2c' : '#60352d')
                    : '#1a2920';
            ctx.strokeStyle = isActive
                ? (picked ? '#d6f56a' : '#ff8063')
                : isPast
                    ? (picked ? '#83bd81' : '#d98773')
                    : '#46594b';
            ctx.lineWidth = isActive ? 2.5 : 1.1;

            const radius = 10;
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

            ctx.textAlign = 'left';
            ctx.textBaseline = 'top';
            ctx.fillStyle = '#eef2e8';
            ctx.font = '700 14px Inter, sans-serif';
            ctx.fillText('Item ' + decision.itemId, x + 12, y + 12, 98);

            ctx.fillStyle = picked ? 'rgba(214, 245, 106, .14)' : 'rgba(255, 128, 99, .14)';
            ctx.fillRect(x + CARD_WIDTH - 68, y + 10, 56, 20);
            ctx.fillStyle = picked ? '#d6f56a' : '#ff9b84';
            ctx.font = '700 9px Inter, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(picked ? 'PICK' : 'REJECT', x + CARD_WIDTH - 40, y + 16);

            ctx.textAlign = 'left';
            ctx.fillStyle = '#aab8ac';
            ctx.font = '11px ui-monospace, monospace';
            ctx.fillText('Weight   ' + decision.weight, x + 12, y + 43);
            ctx.fillText('Value     ' + decision.value, x + 12, y + 62);
            ctx.fillText('Ratio     ' + (Number.isFinite(decision.ratio) ? decision.ratio.toFixed(2) : '—'), x + 12, y + 81);
            ctx.fillStyle = '#75867a';
            ctx.font = '9px Inter, sans-serif';
            ctx.fillText('Cumulative value  ' + decision.currentTotal, x + 12, y + 103, CARD_WIDTH - 24);

            if (index < decisions.length - 1) {
                const arrowX = xOffset + CARD_WIDTH + 7;
                const arrowY = y + CARD_HEIGHT / 2;
                ctx.strokeStyle = isPast ? '#829585' : '#405247';
                ctx.fillStyle = isPast ? '#829585' : '#405247';
                ctx.lineWidth = 1.6;
                ctx.beginPath();
                ctx.moveTo(arrowX, arrowY);
                ctx.lineTo(arrowX + ARROW_LENGTH, arrowY);
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(arrowX + ARROW_LENGTH, arrowY);
                ctx.lineTo(arrowX + ARROW_LENGTH - 7, arrowY - 4);
                ctx.lineTo(arrowX + ARROW_LENGTH - 7, arrowY + 4);
                ctx.closePath();
                ctx.fill();
            }

            xOffset += CARD_WIDTH + ARROW_LENGTH + CARD_SPACING;
        });
    }, [decisions, currentIndex]);

    if (decisions.length === 0) {
        return (
            <motion.div
                className="grid min-h-[210px] w-full place-items-center rounded-xl border border-dashed border-[#405247] bg-[#0d1510] p-6 text-center"
                initial={false}
                animate={{ opacity: 1 }}
            >
                <div>
                    <p className="text-sm font-semibold text-[#dce5da]">No decisions yet</p>
                    <p className="mt-2 text-xs text-[#87958a]">Play the trace to see accepted and rejected candidates appear here.</p>
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div
            className="max-w-full overflow-x-auto rounded-xl border border-[#33453a] bg-[#0d1510] p-3"
            initial={false}
            animate={{ opacity: 1 }}
        >
            <canvas
                ref={canvasRef}
                className="mx-auto block"
                role="img"
                aria-label={'Greedy decision chain with ' + decisions.length + ' decisions. Current decision is ' + (currentIndex + 1) + '.'}
            />
        </motion.div>
    );
};

export default GreedyChainCanvas;