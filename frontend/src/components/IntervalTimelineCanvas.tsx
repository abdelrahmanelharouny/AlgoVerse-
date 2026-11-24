import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import type { GreedyDecision, Interval } from '../types';

interface IntervalTimelineCanvasProps {
    intervals: Interval[];
    decisions: GreedyDecision[];
    activeIntervalId?: string | number;
}

const animateCanvasUpdate = (canvas: HTMLCanvasElement) => {
    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
    if (!reduceMotion && typeof canvas.animate === 'function') {
        canvas.animate([{ opacity: 0.76 }, { opacity: 1 }], { duration: 140, easing: 'ease-out' });
    }
};

const IntervalTimelineCanvas: React.FC<IntervalTimelineCanvasProps> = ({
    intervals,
    decisions,
    activeIntervalId
}) => {
    const hostRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [hostWidth, setHostWidth] = useState(720);

    const orderedIntervals = useMemo(
        () => [...intervals].sort((left, right) =>
            left.end - right.end || left.start - right.start || String(left.id).localeCompare(String(right.id))
        ),
        [intervals]
    );

    useEffect(() => {
        const host = hostRef.current;
        if (!host) return;
        const update = () => {
            const width = Math.floor(host.getBoundingClientRect().width);
            const next = Math.max(300, width || 720);
            setHostWidth(previous => previous === next ? previous : next);
        };
        update();
        if (typeof ResizeObserver !== 'undefined') {
            const observer = new ResizeObserver(update);
            observer.observe(host);
            return () => observer.disconnect();
        }
        window.addEventListener('resize', update);
        return () => window.removeEventListener('resize', update);
    }, []);

    const statusById = useMemo(() => {
        const status = new Map<string, boolean>();
        decisions.forEach(decision => status.set(String(decision.itemId), decision.picked));
        return status;
    }, [decisions]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const leftPadding = 62;
        const rightPadding = 24;
        const topPadding = 38;
        const rowHeight = 48;
        const width = Math.max(hostWidth - 26, leftPadding + rightPadding + 260);
        const height = Math.max(190, topPadding + orderedIntervals.length * rowHeight + 48);
        const dpr = Math.max(1, Math.min(window.devicePixelRatio || 1, 2));

        canvas.width = Math.round(width * dpr);
        canvas.height = Math.round(height * dpr);
        canvas.style.width = width + 'px';
        canvas.style.height = height + 'px';
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, width, height);
        ctx.fillStyle = '#101c2d';
        ctx.fillRect(0, 0, width, height);

        if (orderedIntervals.length === 0) {
            ctx.fillStyle = '#a2b0a4';
            ctx.font = '13px Inter, sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('Add intervals to build a schedule', width / 2, height / 2);
            return;
        }

        const minTime = Math.min(0, ...orderedIntervals.map(interval => interval.start));
        const maxTime = Math.max(...orderedIntervals.map(interval => interval.end));
        const span = Math.max(1, maxTime - minTime);
        const axisWidth = width - leftPadding - rightPadding;
        const xFor = (value: number) => leftPadding + ((value - minTime) / span) * axisWidth;

        ctx.strokeStyle = '#53677f';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(leftPadding, topPadding - 12);
        ctx.lineTo(width - rightPadding, topPadding - 12);
        ctx.stroke();

        const tickCount = Math.min(8, Math.max(2, Math.ceil(span)));
        ctx.font = '9px ui-monospace, monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        for (let tick = 0; tick <= tickCount; tick++) {
            const value = minTime + span * tick / tickCount;
            const x = xFor(value);
            ctx.strokeStyle = '#344b67';
            ctx.beginPath();
            ctx.moveTo(x, topPadding - 16);
            ctx.lineTo(x, height - 34);
            ctx.stroke();
            ctx.fillStyle = '#a9b8c9';
            ctx.fillText(Number(value.toFixed(2)).toString(), x, 8);
        }

        const blockHeight = 24;
        orderedIntervals.forEach((interval, index) => {
            const y = topPadding + index * rowHeight;
            const key = String(interval.id);
            const state = statusById.get(key);
            const isActive = String(activeIntervalId) === key && activeIntervalId !== undefined;
            const isSelected = state === true;
            const isRejected = state === false;
            const x1 = xFor(interval.start);
            const x2 = xFor(interval.end);
            const rectWidth = Math.max(5, x2 - x1);

            ctx.fillStyle = '#b7c5d4';
            ctx.font = '10px ui-monospace, monospace';
            ctx.textAlign = 'right';
            ctx.textBaseline = 'middle';
            ctx.fillText(String(interval.id), leftPadding - 12, y + blockHeight / 2);

            ctx.strokeStyle = '#344b67';
            ctx.beginPath();
            ctx.moveTo(leftPadding, y + blockHeight / 2);
            ctx.lineTo(width - rightPadding, y + blockHeight / 2);
            ctx.stroke();

            ctx.fillStyle = isSelected ? 'rgba(213, 239, 121, .22)'
                : isRejected ? 'rgba(237, 98, 71, .16)'
                    : isActive ? 'rgba(242, 183, 92, .18)' : '#1b2920';
            ctx.strokeStyle = isActive ? '#f2b75c'
                : isSelected ? '#d5ef79'
                    : isRejected ? '#ed765f' : '#53677f';
            ctx.lineWidth = isActive ? 2.8 : isSelected ? 2 : 1.2;
            ctx.beginPath();
            ctx.rect(x1, y, rectWidth, blockHeight);
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = isSelected ? '#e7f8ad' : isRejected ? '#ffad9d' : isActive ? '#ffe0a0' : '#c6d2df';
            ctx.font = '10px ui-monospace, monospace';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            if (rectWidth > 34) ctx.fillText(String(interval.start) + '–' + String(interval.end), x1 + rectWidth / 2, y + blockHeight / 2);
        });

        ctx.fillStyle = '#d5ef79';
        ctx.fillRect(leftPadding, height - 19, 8, 8);
        ctx.fillStyle = '#a9b8c9';
        ctx.font = '9px Inter, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText('Selected', leftPadding + 13, height - 12);
        ctx.fillStyle = '#ed6247';
        ctx.fillRect(leftPadding + 76, height - 19, 8, 8);
        ctx.fillStyle = '#a9b8c9';
        ctx.fillText('Rejected', leftPadding + 89, height - 12);
        ctx.fillStyle = '#ffbd63';
        ctx.fillRect(leftPadding + 155, height - 19, 8, 8);
        ctx.fillStyle = '#a9b8c9';
        ctx.fillText('Current', leftPadding + 168, height - 12);
        animateCanvasUpdate(canvas);
    }, [orderedIntervals, statusById, activeIntervalId, hostWidth]);

    return (
        <motion.div
            ref={hostRef}
            className="av-visual-canvas max-h-[68vh] max-w-full overflow-auto rounded-xl border border-[#344b67] bg-[#101c2d] p-3"
            initial={false}
            animate={{ opacity: 1 }}
        >
            <canvas
                ref={canvasRef}
                className="block"
                role="img"
                aria-label="Interval scheduling timeline. Intervals are ordered by finish time and marked selected, rejected, or currently under consideration."
            />
        </motion.div>
    );
};

export default IntervalTimelineCanvas;