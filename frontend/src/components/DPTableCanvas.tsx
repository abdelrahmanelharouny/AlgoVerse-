import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface DPTableCanvasProps {
    data: number[][];
    currentStepData?: any;
    highlightedCell?: { row: number; col: number } | null;
    rowLabels?: string[];
    colLabels?: string[];
}

const CELL_SIZE = 58;
const HEADER_HEIGHT = 44;
const HEADER_WIDTH = 68;
const PADDING = 20;

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
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const rows = Array.isArray(data) ? data.length : 0;
        const cols = rows > 0 ? Math.max(0, ...data.map(row => row.length)) : 0;
        const width = Math.max(220, cols * CELL_SIZE + HEADER_WIDTH + PADDING * 2);
        const height = Math.max(110, rows * CELL_SIZE + HEADER_HEIGHT + PADDING * 2);
        const dpr = Math.max(1, Math.min(window.devicePixelRatio || 1, 3));

        canvas.width = Math.round(width * dpr);
        canvas.height = Math.round(height * dpr);
        canvas.style.width = width + 'px';
        canvas.style.height = height + 'px';
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, width, height);

        ctx.fillStyle = '#020617';
        ctx.fillRect(0, 0, width, height);

        if (rows === 0 || cols === 0) {
            ctx.fillStyle = '#94a3b8';
            ctx.font = '14px Inter, sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('Run the algorithm to build its DP state', width / 2, height / 2);
            return;
        }

        const originX = PADDING + HEADER_WIDTH;
        const originY = PADDING + HEADER_HEIGHT;
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
        ctx.font = '12px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#94a3b8';
        for (let col = 0; col < cols; col++) {
            const label = colLabels?.[col] ?? String(col);
            ctx.fillText(label, originX + col * CELL_SIZE + CELL_SIZE / 2, PADDING + HEADER_HEIGHT / 2);
        }
        for (let row = 0; row < rows; row++) {
            const label = rowLabels?.[row] ?? String(row);
            ctx.fillText(label, PADDING + HEADER_WIDTH / 2, originY + row * CELL_SIZE + CELL_SIZE / 2);
        }

        // Dependency cells are outlined before the active cell is rendered.
        for (const cell of dependencies) {
            if (cell.row < 0 || cell.row >= rows || cell.col < 0 || cell.col >= cols) continue;
            const x = originX + cell.col * CELL_SIZE;
            const y = originY + cell.row * CELL_SIZE;
            ctx.fillStyle = 'rgba(14, 165, 233, 0.10)';
            ctx.fillRect(x + 3, y + 3, CELL_SIZE - 6, CELL_SIZE - 6);
            ctx.strokeStyle = '#0ea5e9';
            ctx.lineWidth = 2;
            ctx.setLineDash([4, 3]);
            ctx.strokeRect(x + 3, y + 3, CELL_SIZE - 6, CELL_SIZE - 6);
            ctx.setLineDash([]);
        }

        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const x = originX + col * CELL_SIZE;
                const y = originY + row * CELL_SIZE;
                const value = data[row]?.[col] ?? 0;
                const isActive = active?.row === row && active?.col === col;

                ctx.fillStyle = isActive
                    ? 'rgba(99, 102, 241, 0.32)'
                    : value !== 0 ? '#1e293b' : '#0b1220';
                ctx.fillRect(x + 2, y + 2, CELL_SIZE - 4, CELL_SIZE - 4);
                ctx.strokeStyle = isActive ? '#a5b4fc' : '#293548';
                ctx.lineWidth = isActive ? 2.5 : 1;
                ctx.strokeRect(x + 2, y + 2, CELL_SIZE - 4, CELL_SIZE - 4);

                ctx.fillStyle = isActive ? '#ffffff' : value !== 0 ? '#e2e8f0' : '#64748b';
                ctx.font = isActive ? 'bold 17px Inter, sans-serif' : '15px Inter, sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(String(value), x + CELL_SIZE / 2, y + CELL_SIZE / 2);
            }
        }

        // Draw a compact legend only when dependency information exists.
        if (dependencies.length > 0) {
            ctx.fillStyle = '#38bdf8';
            ctx.fillRect(PADDING, height - 12, 9, 9);
            ctx.fillStyle = '#94a3b8';
            ctx.font = '10px Inter, sans-serif';
            ctx.textAlign = 'left';
            ctx.fillText('Dependency cells', PADDING + 14, height - 7);
        }
    }, [data, highlightedCell, rowLabels, colLabels, currentStepData]);

    return (
        <motion.div
            className="max-w-full overflow-auto bg-slate-950 rounded-xl p-4 border border-slate-800"
            initial={{ opacity: 0, scale: 0.985 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.18 }}
        >
            <canvas
                ref={canvasRef}
                className="mx-auto block"
                role="img"
                aria-label="Dynamic programming table. The active cell and its dependencies are highlighted."
                style={{ imageRendering: 'crisp-edges' }}
            />
        </motion.div>
    );
};

export default DPTableCanvas;
