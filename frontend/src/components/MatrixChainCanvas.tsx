import React, { useEffect, useRef } from 'react';

interface MatrixChainCanvasProps {
    dimensions: number[];
    currentStepData: any; // Data from the current step (i, j, value, etc.)
    dpTable: number[][]; // Partial DP table
}

const MatrixChainCanvas: React.FC<MatrixChainCanvasProps> = ({
    dimensions,
    currentStepData,
    dpTable
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Clear
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (!dimensions || dimensions.length === 0) return;

        const n = dimensions.length - 1; // Number of matrices

        // --- 1. Draw Matrices Chain Conceptually ---
        const startX = 50;
        const startY = 50;
        const spacing = 15;
        let currentX = startX;

        // Dynamic scaling
        const maxDim = Math.max(...dimensions);
        const scale = 60 / maxDim; // Normalize height to max 60px

        // Draw the sequence A1...An
        for (let i = 1; i <= n; i++) {
            const rows = dimensions[i - 1];
            const cols = dimensions[i];

            const w = Math.max(30, cols * scale);
            const h = Math.max(30, rows * scale);

            // Draw box
            ctx.fillStyle = 'rgba(99, 102, 241, 0.2)'; // indigo-500/20
            ctx.strokeStyle = '#6366f1'; // indigo-500

            // Highlight if part of current calculation
            // If step is considering A[i]...A[j], highlight matrices in that range
            if (currentStepData &&
                currentStepData.i <= i && currentStepData.j >= i) {
                ctx.fillStyle = 'rgba(16, 185, 129, 0.3)'; // emerald-500/30
                ctx.strokeStyle = '#10b981';

                // If this specific matrix is left of split or right of split
                if (currentStepData.split) {
                    if (i <= currentStepData.split) {
                        // Left component
                        ctx.fillStyle = 'rgba(245, 158, 11, 0.3)'; // amber
                    } else {
                        // Right component
                        ctx.fillStyle = 'rgba(59, 130, 246, 0.3)'; // blue
                    }
                }
            }

            // Use fillRect and strokeRect instead of roundRect for compatibility
            ctx.fillRect(currentX, startY + (80 - h) / 2, w, h);
            ctx.strokeRect(currentX, startY + (80 - h) / 2, w, h);

            // Label
            ctx.fillStyle = '#fff';
            ctx.font = '12px Inter';
            ctx.textAlign = 'center';
            ctx.fillText(`A${i}`, currentX + w / 2, startY + (80 - h) / 2 + h / 2 + 4);

            // Dimensions Text
            ctx.fillStyle = '#94a3b8'; // slate-400
            ctx.font = '10px Inter';
            ctx.fillText(`${rows}x${cols}`, currentX + w / 2, startY + (80 - h) / 2 + h + 15);

            // Multiply symbol
            if (i < n) {
                ctx.fillStyle = '#64748b';
                ctx.fillText('×', currentX + w + spacing / 2, startY + 40);
            }

            currentX += w + spacing;
        }

        // --- 2. Draw Brackets / Parenthesization (if split info exists) ---
        if (currentStepData && currentStepData.split) {
            // Visualizing the split at k
            // Draw bracket under A[i]...A[k]
            // Draw bracket under A[k+1]...A[j]
        }


        // --- 3. Draw DP Table (Bottom Half) ---
        const tableStartX = 50;
        const tableStartY = 180;
        const cellSize = 40;

        for (let r = 1; r <= n; r++) { // rows (i)
            for (let c = 1; c <= n; c++) { // cols (j)
                // Only upper triangle matters (i <= j)
                if (r > c) continue;

                const x = tableStartX + (c - 1) * cellSize;
                const y = tableStartY + (r - 1) * cellSize;

                // Base style
                ctx.fillStyle = 'rgba(30, 41, 59, 0.5)'; // slate-800/50
                ctx.strokeStyle = 'rgba(148, 163, 184, 0.1)';

                // Highlight active cell (being computed)
                if (currentStepData && currentStepData.i === r && currentStepData.j === c) {
                    ctx.fillStyle = 'rgba(99, 102, 241, 0.4)'; // indigo highlight
                    ctx.strokeStyle = '#6366f1';
                }
                // Highlight dependencies (i..k and k+1..j)
                else if (currentStepData && currentStepData.split) {
                    const k = currentStepData.split;
                    if ((r === currentStepData.i && c === k) || (r === k + 1 && c === currentStepData.j)) {
                        ctx.fillStyle = 'rgba(16, 185, 129, 0.2)'; // dependency green
                    }
                }

                ctx.fillRect(x, y, cellSize, cellSize);
                ctx.strokeRect(x, y, cellSize, cellSize);

                // Value
                const val = dpTable[r] && dpTable[r][c];
                if (val !== undefined && val !== 0 && val < Number.MAX_SAFE_INTEGER) {
                    ctx.fillStyle = '#e2e8f0';
                    ctx.font = '12px Inter';
                    ctx.textAlign = 'center';
                    ctx.fillText(val.toString(), x + cellSize / 2, y + cellSize / 2 + 4);
                } else if (r === c) {
                    ctx.fillStyle = '#64748b'; // 0 diagonal
                    ctx.fillText("0", x + cellSize / 2, y + cellSize / 2 + 4);
                }
            }
        }

    }, [dimensions, currentStepData, dpTable]);

    return (
        <canvas
            ref={canvasRef}
            width={800}
            height={500}
            className="w-full h-full"
        />
    );
};

export default MatrixChainCanvas;
