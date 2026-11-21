import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import type { GreedyDecision } from '../types';

type GreedyViewMode = 'knapsack' | 'fractional' | 'coins';

interface GreedyChainCanvasProps {
    decisions: GreedyDecision[];
    currentIndex: number;
    mode?: GreedyViewMode;
    amount?: number;
}

const animateCanvasUpdate = (canvas: HTMLCanvasElement) => {
    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
    if (!reduceMotion && typeof canvas.animate === 'function') {
        canvas.animate([{ opacity: 0.76 }, { opacity: 1 }], { duration: 140, easing: 'ease-out' });
    }
};

const CARD_WIDTH = 184;
const CARD_HEIGHT = 132;
const CARD_SPACING = 30;
const ARROW_LENGTH = 22;

const GreedyChainCanvas: React.FC<GreedyChainCanvasProps> = ({
    decisions,
    currentIndex,
    mode = 'knapsack',
    amount = 0
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const totalWidth = Math.max(
            320,
            decisions.length * CARD_WIDTH + Math.max(0, decisions.length - 1) * (ARROW_LENGTH + CARD_SPACING) + 40
        );
        const height = CARD_HEIGHT + 78;
        const dpr = Math.max(1, Math.min(window.devicePixelRatio || 1, 2));

        canvas.width = Math.round(totalWidth * dpr);
        canvas.height = Math.round(height * dpr);
        canvas.style.width = totalWidth + 'px';
        canvas.style.height = height + 'px';
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, totalWidth, height);
        ctx.fillStyle = '#101c2d';
        ctx.fillRect(0, 0, totalWidth, height);

        const drawRoundedRect = (x: number, y: number, width: number, boxHeight: number, radius: number) => {
            ctx.beginPath();
            ctx.moveTo(x + radius, y);
            ctx.lineTo(x + width - radius, y);
            ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
            ctx.lineTo(x + width, y + boxHeight - radius);
            ctx.quadraticCurveTo(x + width, y + boxHeight, x + width - radius, y + boxHeight);
            ctx.lineTo(x + radius, y + boxHeight);
            ctx.quadraticCurveTo(x, y + boxHeight, x, y + boxHeight - radius);
            ctx.lineTo(x, y + radius);
            ctx.quadraticCurveTo(x, y, x + radius, y);
            ctx.closePath();
        };

        let xOffset = 20;
        decisions.forEach((decision, index) => {
            const isActive = index === currentIndex;
            const isPast = index < currentIndex;
            const x = xOffset;
            const y = 35;
            const accepted = decision.picked;
            const statusColor = accepted ? '#d5ef79' : '#ed6247';

            ctx.fillStyle = isPast
                ? (accepted ? '#2a4439' : '#4b302f')
                : isActive
                    ? (accepted ? '#344d36' : '#593631')
                    : '#22324a';
            ctx.strokeStyle = isActive ? statusColor : isPast ? (accepted ? '#9fbd72' : '#b77769') : '#53677f';
            ctx.lineWidth = isActive ? 2.5 : 1.1;
            drawRoundedRect(x, y, CARD_WIDTH, CARD_HEIGHT, 10);
            ctx.fill();
            ctx.stroke();

            const itemLabel = mode === 'coins'
                ? 'Coin ' + String(decision.itemId)
                : 'Item ' + String(decision.itemId);
            ctx.textAlign = 'left';
            ctx.textBaseline = 'top';
            ctx.fillStyle = '#f1f5f8';
            ctx.font = '700 14px Inter, sans-serif';
            ctx.fillText(itemLabel, x + 12, y + 12, 105);

            ctx.fillStyle = accepted ? 'rgba(213, 239, 121, .14)' : 'rgba(237, 98, 71, .15)';
            ctx.fillRect(x + CARD_WIDTH - 72, y + 10, 60, 20);
            ctx.fillStyle = accepted ? '#d6f56a' : '#ff9b84';
            ctx.font = '700 9px Inter, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(accepted ? 'PICK' : 'REJECT', x + CARD_WIDTH - 42, y + 16);

            ctx.textAlign = 'left';
            ctx.fillStyle = '#a9b8c9';
            ctx.font = '11px ui-monospace, monospace';

            if (mode === 'coins') {
                const coin = Number(decision.itemId);
                const count = decision.count ?? 0;
                const remaining = decision.remaining ?? Math.max(0, amount - (decision.cumulativeWeight ?? 0));
                ctx.fillText('Quantity       × ' + count, x + 12, y + 44);
                ctx.fillText('Amount covered ' + (decision.cumulativeWeight ?? 0), x + 12, y + 64);
                ctx.fillText('Coins used     ' + (decision.currentTotal ?? 0), x + 12, y + 84);
                ctx.fillStyle = '#d5ef79';
                ctx.font = '700 11px ui-monospace, monospace';
                ctx.fillText('Remaining      ' + remaining, x + 12, y + 107);
                if (Number.isFinite(coin) && coin > amount) {
                    ctx.fillStyle = '#ff9b84';
                    ctx.font = '9px Inter, sans-serif';
                    ctx.fillText('Denomination exceeds target', x + 12, y + 121, CARD_WIDTH - 24);
                }
            } else if (mode === 'fractional') {
                const fraction = decision.fraction ?? 0;
                ctx.fillText('Fraction      ' + (fraction * 100).toFixed(1) + '%', x + 12, y + 44);
                ctx.fillText('Weight taken  ' + decision.weight.toFixed(2), x + 12, y + 64);
                ctx.fillText('Value gained  ' + decision.value.toFixed(2), x + 12, y + 84);
                ctx.fillText('Density       ' + (Number.isFinite(decision.ratio) ? decision.ratio.toFixed(2) : '∞'), x + 12, y + 104);
                ctx.fillStyle = '#d5ef79';
                ctx.font = '700 10px ui-monospace, monospace';
                ctx.fillText('Total value   ' + decision.currentTotal.toFixed(2), x + 12, y + 121, CARD_WIDTH - 24);
            } else {
                ctx.fillText('Weight   ' + decision.weight, x + 12, y + 45);
                ctx.fillText('Value     ' + decision.value, x + 12, y + 66);
                ctx.fillText('Ratio     ' + (Number.isFinite(decision.ratio) ? decision.ratio.toFixed(2) : '∞'), x + 12, y + 87);
                ctx.fillStyle = '#d5ef79';
                ctx.font = '700 10px ui-monospace, monospace';
                ctx.fillText('Total value  ' + decision.currentTotal, x + 12, y + 111, CARD_WIDTH - 24);
            }

            if (index < decisions.length - 1) {
                const arrowX = xOffset + CARD_WIDTH + 5;
                const arrowY = y + CARD_HEIGHT / 2;
                ctx.strokeStyle = isPast ? '#a9b8c9' : '#53677f';
                ctx.fillStyle = isPast ? '#a9b8c9' : '#53677f';
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
        animateCanvasUpdate(canvas);
    }, [decisions, currentIndex, mode, amount]);

    if (decisions.length === 0) {
        return (
            <motion.div
                className="grid min-h-[210px] w-full place-items-center rounded-xl border border-dashed border-[#405247] bg-[#0d1510] p-6 text-center"
                initial={false}
                animate={{ opacity: 1 }}
            >
                <div>
                    <p className="text-sm font-semibold text-[#dce5da]">No decisions yet</p>
                    <p className="mt-2 text-xs text-[#87958a]">
                        Play the trace to see {mode === 'coins' ? 'coin selections' : 'accepted and rejected candidates'} appear here.
                    </p>
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div
            className="av-visual-canvas max-w-full overflow-x-auto rounded-xl border border-[#344b67] bg-[#101c2d] p-3"
            initial={false}
            animate={{ opacity: 1 }}
            transition={{ duration: .18 }}
        >
            <canvas
                ref={canvasRef}
                className="mx-auto block"
                role="img"
                aria-label={mode === 'coins'
                    ? 'Greedy coin change decisions with denomination counts, amount covered, and remaining amount.'
                    : mode === 'fractional'
                        ? 'Fractional knapsack decisions with portions, weight taken, value gained, and density.'
                        : 'Greedy item decisions showing accepted and rejected items with weight, value, and density.'}
            />
        </motion.div>
    );
};

export default GreedyChainCanvas;