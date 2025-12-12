import React, { useRef, useEffect } from 'react';

interface DPTableProps {
    data: number[][];
    rows: number;
    cols: number;
    rowLabels?: string[];
    colLabels?: string[];
    highlights?: { r: number; c: number; color: string }[];
    activeCell?: { r: number; c: number };
}

const CELL_WIDTH = 60;
const CELL_HEIGHT = 40;
const HEADER_WIDTH = 80;
const HEADER_HEIGHT = 40;

const DPTable: React.FC<DPTableProps> = ({
    data,
    rows,
    cols,
    rowLabels = [],
    colLabels = [],
    highlights = [],
    activeCell
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Handle high DPI displays
        const dpr = window.devicePixelRatio || 1;
        const width = HEADER_WIDTH + cols * CELL_WIDTH;
        const height = HEADER_HEIGHT + rows * CELL_HEIGHT;

        canvas.width = width * dpr;
        canvas.height = height * dpr;
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
        ctx.scale(dpr, dpr);

        // Clear canvas
        ctx.clearRect(0, 0, width, height);
        ctx.font = '14px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Draw Headers
        ctx.fillStyle = '#1e293b'; // slate-800
        ctx.fillRect(0, 0, width, HEADER_HEIGHT);
        ctx.fillRect(0, 0, HEADER_WIDTH, height);

        ctx.fillStyle = '#94a3b8'; // slate-400

        // Column Labels
        colLabels.forEach((label, i) => {
            ctx.fillText(label, HEADER_WIDTH + i * CELL_WIDTH + CELL_WIDTH / 2, HEADER_HEIGHT / 2);
        });

        // Row Labels
        rowLabels.forEach((label, i) => {
            ctx.fillText(label, HEADER_WIDTH / 2, HEADER_HEIGHT + i * CELL_HEIGHT + CELL_HEIGHT / 2);
        });

        // Draw Grid and Data
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const x = HEADER_WIDTH + c * CELL_WIDTH;
                const y = HEADER_HEIGHT + r * CELL_HEIGHT;

                // Background
                let bgColor = '#0f172a'; // slate-950

                // Highlight logic
                const highlight = highlights.find(h => h.r === r && h.c === c);
                if (highlight) {
                    bgColor = highlight.color;
                }

                if (activeCell && activeCell.r === r && activeCell.c === c) {
                    bgColor = '#4f46e5'; // indigo-600
                }

                ctx.fillStyle = bgColor;
                ctx.fillRect(x, y, CELL_WIDTH, CELL_HEIGHT);

                // Border
                ctx.strokeStyle = '#334155'; // slate-700
                ctx.strokeRect(x, y, CELL_WIDTH, CELL_HEIGHT);

                // Text
                ctx.fillStyle = '#f8fafc'; // slate-50
                const value = data[r] && data[r][c] !== undefined ? data[r][c] : '';
                ctx.fillText(String(value), x + CELL_WIDTH / 2, y + CELL_HEIGHT / 2);
            }
        }

    }, [data, rows, cols, rowLabels, colLabels, highlights, activeCell]);

    return (
        <div className="overflow-auto border border-slate-700 rounded-lg shadow-xl bg-slate-950">
            <canvas ref={canvasRef} />
        </div>
    );
};

export default DPTable;
