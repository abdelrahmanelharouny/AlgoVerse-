import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface DPTableStepData {
    cell?: unknown;
    active_cell?: unknown;
    i?: number;
    j?: number;
    highlight_prev?: unknown;
}

interface DPTableCanvasProps {
    data: number[][];
    currentStepData?: DPTableStepData;
    highlightedCell?: { row: number; col: number } | null;
    rowLabels?: string[];
    colLabels?: string[];
}

const PADDING = 16;

const animateCanvasUpdate = (canvas: HTMLCanvasElement) => {
    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
    if (!reduceMotion && typeof canvas.animate === 'function') {
        canvas.animate([{ opacity: 0.76 }, { opacity: 1 }], { duration: 130, easing: 'ease-out' });
    }
};

const readCell = (value: unknown): { row: number; col: number } | null => {
    if (!value || typeof value !== 'object') return null;
    const cell = value as Record<string, unknown>;
    const row = typeof cell.r === 'number' ? cell.r : typeof cell.row === 'number' ? cell.row : null;
    const col = typeof cell.c === 'number' ? cell.c : typeof cell.col === 'number' ? cell.col : null;
    return row !== null && col !== null ? { row, col } : null;
};

/**
 * Static-on-update Canvas renderer. The previous implementation ran a permanent
 * requestAnimationFrame loop even while the table was idle, wasting CPU/GPU.
 */
const DPTableCanvas: React.FC<DPTableCanvasProps> = ({
    data,
    currentStepData,
    highlightedCell,
    rowLabels,
    colLabels
}) => {
    const hostRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const activeCell = highlightedCell
        ?? readCell(currentStepData?.cell)
        ?? readCell(currentStepData?.active_cell)
        ?? (typeof currentStepData?.i === 'number' && typeof currentStepData?.j === 'number'
            ? { row: currentStepData.i, col: currentStepData.j }
            : null);

    useEffect(() => {
        const host = hostRef.current;
        const canvas = canvasRef.current;
        if (!host || !canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const rows = Array.isArray(data) ? data.length : 0;
        const cols = rows > 0 ? Math.max(0, ...data.map(row => row.length)) : 0;
        const density = Math.max(rows, cols);
        const cellSize = density > 400 ? 10 : density > 200 ? 12 : density > 100 ? 16 : density > 50 ? 22 : 58;
        const headerHeight = Math.max(28, Math.round(cellSize * 1.4));
        const headerWidth = Math.max(40, Math.round(cellSize * 1.5));
        const width = Math.max(220, cols * cellSize + headerWidth + PADDING * 2);
        const height = Math.max(110, rows * cellSize + headerHeight + PADDING * 2);
        const dpr = density > 100 ? 1 : Math.max(1, Math.min(window.devicePixelRatio || 1, 2));

        canvas.width = Math.round(width * dpr);
        canvas.height = Math.round(height * dpr);
        canvas.style.width = width + 'px';
        canvas.style.height = height + 'px';
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, width, height);

        ctx.fillStyle = '#101c2d';
        ctx.fillRect(0, 0, width, height);

        if (rows === 0 || cols === 0) {
            ctx.fillStyle = '#b7c5d4';
            ctx.font = '14px Inter, sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('Run the algorithm to build its DP state', width / 2, height / 2);
            return;
        }

        const originX = PADDING + headerWidth;
        const originY = PADDING + headerHeight;
        const active = highlightedCell
            ?? readCell(currentStepData?.cell)
            ?? readCell(currentStepData?.active_cell)
            ?? (typeof currentStepData?.i === 'number' && typeof currentStepData?.j === 'number'
                ? { row: currentStepData.i, col: currentStepData.j } : null);

        const previous = currentStepData?.highlight_prev;
        const dependencies = Array.isArray(previous)
            ? previous.map(readCell).filter((cell): cell is { row: number; col: number } => cell !== null)
            : [readCell(previous)].filter((cell): cell is { row: number; col: number } => cell !== null);

        // Column and row headings.
        ctx.font = Math.max(8, Math.min(12, cellSize * 0.48)) + 'px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#a9b8c9';
        for (let col = 0; col < cols; col++) {
            const label = colLabels?.[col] ?? String(col);
            ctx.fillText(label, originX + col * cellSize + cellSize / 2, PADDING + headerHeight / 2);
        }
        for (let row = 0; row < rows; row++) {
            const label = rowLabels?.[row] ?? String(row);
            ctx.fillText(label, PADDING + headerWidth / 2, originY + row * cellSize + cellSize / 2);
        }

        // Dependency cells are outlined before the active cell is rendered.
        for (const cell of dependencies) {
            if (cell.row < 0 || cell.row >= rows || cell.col < 0 || cell.col >= cols) continue;
            const x = originX + cell.col * cellSize;
            const y = originY + cell.row * cellSize;
            ctx.fillStyle = 'rgba(120, 184, 255, 0.14)';
            ctx.fillRect(x + 3, y + 3, cellSize - 6, cellSize - 6);
            ctx.strokeStyle = '#78b8ff';
            ctx.lineWidth = 2;
            ctx.setLineDash([4, 3]);
            ctx.strokeRect(x + 3, y + 3, cellSize - 6, cellSize - 6);
            ctx.setLineDash([]);
        }

        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const x = originX + col * cellSize;
                const y = originY + row * cellSize;
                const value = data[row]?.[col] ?? 0;
                const isActive = active?.row === row && active?.col === col;

                ctx.fillStyle = isActive
                    ? 'rgba(213, 239, 121, 0.25)'
                    : value !== 0 ? '#20344f' : '#17263a';
                ctx.fillRect(x + 2, y + 2, cellSize - 4, cellSize - 4);
                ctx.strokeStyle = isActive ? '#d5ef79' : '#344b67';
                ctx.lineWidth = isActive ? 2.5 : 1;
                ctx.strokeRect(x + 2, y + 2, cellSize - 4, cellSize - 4);

                ctx.fillStyle = isActive ? '#f2ffd0' : value !== 0 ? '#e2eaf2' : '#8fa2b8';
                ctx.font = isActive ? 'bold ' + Math.max(8, Math.round(cellSize * 0.34)) + 'px Inter, sans-serif' : Math.max(8, Math.round(cellSize * 0.3)) + 'px Inter, sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(String(value), x + cellSize / 2, y + cellSize / 2);
            }
        }

        // Keep the active cell in view while stepping through large tables.
        if (active && active.row >= 0 && active.row < rows && active.col >= 0 && active.col < cols) {
            const cellLeft = originX + active.col * cellSize;
            const cellTop = originY + active.row * cellSize;
            if (cellLeft < host.scrollLeft || cellLeft + cellSize > host.scrollLeft + host.clientWidth) {
                host.scrollLeft = Math.max(0, cellLeft - host.clientWidth / 2);
            }
            if (cellTop < host.scrollTop || cellTop + cellSize > host.scrollTop + host.clientHeight) {
                host.scrollTop = Math.max(0, cellTop - host.clientHeight / 2);
            }
        }

        // Draw a compact legend only when dependency information exists.
        if (dependencies.length > 0) {
            ctx.fillStyle = '#83cbd8';
            ctx.fillRect(PADDING, height - 12, 9, 9);
            ctx.fillStyle = '#a9b8c9';
            ctx.font = '9px Inter, sans-serif';
            ctx.textAlign = 'left';
            ctx.fillText('Dependency cells', PADDING + 14, height - 7);
        }
        animateCanvasUpdate(canvas);
    }, [data, highlightedCell, rowLabels, colLabels, currentStepData]);

    return (
        <motion.div
            ref={hostRef}
            className="av-visual-canvas max-h-[68vh] max-w-full overflow-auto rounded-xl border border-[#344b67] bg-[#101c2d] p-3"
            initial={{ opacity: 0, scale: 0.985 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.18 }}
        >
            <canvas
                ref={canvasRef}
                className="mx-auto block"
                role="img"
                aria-label={"Dynamic programming table with " + data.length + " rows. The active cell and its dependencies are highlighted."}
                style={{ imageRendering: 'crisp-edges' }}
            />
        </motion.div>
    );
};

export default DPTableCanvas;
