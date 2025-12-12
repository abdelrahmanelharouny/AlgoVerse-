import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

interface DPTableCanvasProps {
    data: number[][]; // The 2D DP table
    currentStepData?: any; // To highlight active cells or calculations
    highlightedCell?: { row: number; col: number } | null;
    rowLabels?: string[]; // Optional labels for rows
    colLabels?: string[]; // Optional labels for columns
}

const DPTableCanvas: React.FC<DPTableCanvasProps> = ({
    data,
    currentStepData,
    highlightedCell,
    rowLabels,
    colLabels
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationRef = useRef<number | null>(null);

    const CELL_SIZE = 60;

    const HEADER_HEIGHT = 40;
    const HEADER_WIDTH = 60;

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Handle empty or invalid data
        if (!data || !Array.isArray(data) || data.length === 0) {
            return;
        }

        const rows = data.length;
        const cols = data[0]?.length || 0;

        // Set canvas size
        const width = cols * CELL_SIZE + HEADER_WIDTH + 40;
        const height = rows * CELL_SIZE + HEADER_HEIGHT + 40;

        canvas.width = width * window.devicePixelRatio;
        canvas.height = height * window.devicePixelRatio;
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;

        ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

        const draw = () => {
            // Clear canvas
            ctx.fillStyle = '#0f172a'; // slate-900
            ctx.fillRect(0, 0, width, height);

            // Draw Column Indices/Labels
            ctx.fillStyle = '#94a3b8'; // slate-400
            ctx.font = '12px Inter';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            const startX = HEADER_WIDTH;
            const startY = HEADER_HEIGHT;
            const cellSize = CELL_SIZE;

            for (let j = 0; j < cols; j++) {
                const label = colLabels ? colLabels[j] : j.toString();
                const x = startX + j * cellSize + cellSize / 2;
                ctx.fillText(label, x, startY - 10);
            }

            // Draw Row Indices/Labels
            for (let i = 0; i < rows; i++) {
                const label = rowLabels ? rowLabels[i] : i.toString();
                const y = startY + i * cellSize + cellSize / 2;
                ctx.fillText(label, startX - 15, y);
            }

            // Draw cells
            for (let row = 0; row < rows; row++) {
                for (let col = 0; col < cols; col++) {
                    const x = HEADER_WIDTH + col * CELL_SIZE;
                    const y = HEADER_HEIGHT + row * CELL_SIZE;
                    const value = data[row][col];

                    const isHighlighted = highlightedCell?.row === row && highlightedCell?.col === col;
                    // Also check for step data highlights from LCS/others
                    const isStepHighlight = currentStepData?.cell
                        ? (currentStepData.cell.r === row && currentStepData.cell.c === col)
                        : false;

                    const isCompareHighlight = currentStepData?.active_cell
                        ? (currentStepData.active_cell.r === row && currentStepData.active_cell.c === col)
                        : false;

                    const effectiveHighlight = isHighlighted || isStepHighlight || isCompareHighlight;

                    // Draw cell background
                    if (effectiveHighlight) {
                        // Highlighted cell - animated glow
                        const gradient = ctx.createRadialGradient(
                            x + CELL_SIZE / 2, y + CELL_SIZE / 2, 0,
                            x + CELL_SIZE / 2, y + CELL_SIZE / 2, CELL_SIZE / 1.5
                        );
                        gradient.addColorStop(0, 'rgba(99, 102, 241, 0.3)');
                        gradient.addColorStop(1, 'rgba(99, 102, 241, 0.1)');
                        ctx.fillStyle = gradient;
                        ctx.fillRect(x + 2, y + 2, CELL_SIZE - 4, CELL_SIZE - 4);

                        // Border
                        ctx.strokeStyle = '#6366f1'; // indigo-500
                        ctx.lineWidth = 3;
                    } else if (value > 0) {
                        // Filled cell
                        ctx.fillStyle = '#1e293b'; // slate-800
                        ctx.fillRect(x + 2, y + 2, CELL_SIZE - 4, CELL_SIZE - 4);

                        // Border
                        ctx.strokeStyle = '#334155'; // slate-700
                        ctx.lineWidth = 1;
                    } else {
                        // Empty cell
                        ctx.fillStyle = '#0f172a'; // slate-900
                        ctx.fillRect(x + 2, y + 2, CELL_SIZE - 4, CELL_SIZE - 4);

                        // Border
                        ctx.strokeStyle = '#1e293b'; // slate-800
                        ctx.lineWidth = 1;
                    }

                    // Draw cell border
                    ctx.strokeRect(x + 2, y + 2, CELL_SIZE - 4, CELL_SIZE - 4);

                    // Draw value
                    if (value !== undefined && value !== null) {
                        ctx.fillStyle = effectiveHighlight ? '#ffffff' : value > 0 ? '#e2e8f0' : '#64748b';
                        ctx.font = effectiveHighlight ? 'bold 18px Inter' : '16px Inter';
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'middle';
                        ctx.fillText(
                            value.toString(),
                            x + CELL_SIZE / 2,
                            y + CELL_SIZE / 2
                        );
                    }
                }
            }
        };

        // Animation loop for smooth updates
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
    }, [data, highlightedCell, rowLabels, colLabels, currentStepData]);

    return (
        <motion.div
            className="overflow-auto bg-slate-950 rounded-xl p-4 border border-slate-800"
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

export default DPTableCanvas;
