import React, { useRef, useEffect, useMemo, useState } from 'react';

interface GraphCanvasProps {
    graph: Record<string, Record<string, number>>;
    currentStepData?: any;
    visitedNodes?: string[];
}

// Force-directed layout simulation
const calculateLayout = (graph: Record<string, Record<string, number>>, width: number, height: number) => {
    const nodes = Object.keys(graph);
    if (nodes.length === 0) return {};

    // Initialize positions in a circle
    const positions: Record<string, { x: number; y: number }> = {};
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) * 0.35;

    nodes.forEach((node, i) => {
        const angle = (2 * Math.PI * i) / nodes.length - Math.PI / 2;
        positions[node] = {
            x: centerX + radius * Math.cos(angle),
            y: centerY + radius * Math.sin(angle)
        };
    });

    // Simple force-directed relaxation (few iterations)
    const iterations = 50;
    const repulsion = 5000;
    const attraction = 0.05;

    for (let iter = 0; iter < iterations; iter++) {
        const forces: Record<string, { fx: number; fy: number }> = {};
        nodes.forEach(n => forces[n] = { fx: 0, fy: 0 });

        // Repulsion between all nodes
        for (let i = 0; i < nodes.length; i++) {
            for (let j = i + 1; j < nodes.length; j++) {
                const n1 = nodes[i], n2 = nodes[j];
                const dx = positions[n2].x - positions[n1].x;
                const dy = positions[n2].y - positions[n1].y;
                const dist = Math.sqrt(dx * dx + dy * dy) || 1;
                const force = repulsion / (dist * dist);
                const fx = (dx / dist) * force;
                const fy = (dy / dist) * force;
                forces[n1].fx -= fx;
                forces[n1].fy -= fy;
                forces[n2].fx += fx;
                forces[n2].fy += fy;
            }
        }

        // Attraction along edges
        nodes.forEach(n1 => {
            Object.keys(graph[n1] || {}).forEach(n2 => {
                if (positions[n2]) {
                    const dx = positions[n2].x - positions[n1].x;
                    const dy = positions[n2].y - positions[n1].y;
                    const dist = Math.sqrt(dx * dx + dy * dy) || 1;
                    const force = dist * attraction;
                    forces[n1].fx += (dx / dist) * force;
                    forces[n1].fy += (dy / dist) * force;
                }
            });
        });

        // Apply forces with damping
        const damping = 0.8 - (iter / iterations) * 0.5;
        nodes.forEach(n => {
            positions[n].x += forces[n].fx * damping;
            positions[n].y += forces[n].fy * damping;
            // Keep in bounds
            positions[n].x = Math.max(60, Math.min(width - 60, positions[n].x));
            positions[n].y = Math.max(60, Math.min(height - 60, positions[n].y));
        });
    }

    return positions;
};

const GraphCanvas: React.FC<GraphCanvasProps> = ({ graph, currentStepData, visitedNodes = [] }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [dimensions] = useState({ width: 800, height: 450 });

    // Calculate layout once per graph change
    const nodePositions = useMemo(() => {
        return calculateLayout(graph, dimensions.width, dimensions.height);
    }, [graph, dimensions]);

    // Get edge states
    const getEdgeState = (from: string, to: string) => {
        const isActiveEdge = currentStepData?.checking_neighbor === to && currentStepData?.current_node === from;
        const isMSTEdge = (currentStepData?.mst_edges || []).some((e: any) =>
            (e.u === from && e.v === to) || (e.u === to && e.v === from)
        );
        const isPathEdge = currentStepData?.path?.includes(from) && currentStepData?.path?.includes(to);
        return { isActiveEdge, isMSTEdge, isPathEdge };
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const width = dimensions.width;
        const height = dimensions.height;
        const dpr = window.devicePixelRatio || 1;

        canvas.width = width * dpr;
        canvas.height = height * dpr;
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
        ctx.scale(dpr, dpr);

        // Background
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, width, height);

        // Draw edges first (so nodes are on top)
        const drawnEdges = new Set<string>();

        Object.entries(graph).forEach(([from, neighbors]) => {
            const startPos = nodePositions[from];
            if (!startPos) return;

            Object.entries(neighbors).forEach(([to, weight]) => {
                const endPos = nodePositions[to];
                if (!endPos) return;

                // Avoid drawing same edge twice for undirected
                const edgeKey = [from, to].sort().join('-');
                if (drawnEdges.has(edgeKey)) return;
                drawnEdges.add(edgeKey);

                const { isActiveEdge, isMSTEdge } = getEdgeState(from, to);

                // Draw edge
                ctx.beginPath();
                ctx.moveTo(startPos.x, startPos.y);
                ctx.lineTo(endPos.x, endPos.y);

                if (isMSTEdge) {
                    ctx.strokeStyle = '#22c55e'; // green
                    ctx.lineWidth = 4;
                } else if (isActiveEdge) {
                    ctx.strokeStyle = '#f59e0b'; // amber
                    ctx.lineWidth = 3;
                } else {
                    ctx.strokeStyle = '#475569'; // slate-600
                    ctx.lineWidth = 2;
                }
                ctx.stroke();

                // Draw weight label
                const midX = (startPos.x + endPos.x) / 2;
                const midY = (startPos.y + endPos.y) / 2;

                // Background for weight
                ctx.fillStyle = '#1e293b';
                ctx.beginPath();
                ctx.arc(midX, midY, 14, 0, 2 * Math.PI);
                ctx.fill();

                // Weight text
                ctx.fillStyle = isMSTEdge ? '#22c55e' : isActiveEdge ? '#f59e0b' : '#94a3b8';
                ctx.font = 'bold 12px Inter, sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(weight?.toString() || '', midX, midY);
            });
        });

        // Draw nodes
        Object.entries(nodePositions).forEach(([node, pos]) => {
            const isVisited = visitedNodes.includes(node) || currentStepData?.visited?.includes(node);
            const isCurrent = currentStepData?.current_node === node;
            const isStart = currentStepData?.start_node === node;
            const isNeighbor = currentStepData?.checking_neighbor === node;

            // Node circle
            ctx.beginPath();
            ctx.arc(pos.x, pos.y, 28, 0, 2 * Math.PI);

            if (isCurrent) {
                ctx.fillStyle = '#8b5cf6'; // purple
            } else if (isNeighbor) {
                ctx.fillStyle = '#f59e0b'; // amber
            } else if (isStart) {
                ctx.fillStyle = '#3b82f6'; // blue
            } else if (isVisited) {
                ctx.fillStyle = '#22c55e'; // green
            } else {
                ctx.fillStyle = '#334155'; // slate-700
            }
            ctx.fill();

            // Border
            ctx.strokeStyle = isCurrent ? '#a78bfa' : isNeighbor ? '#fbbf24' : '#64748b';
            ctx.lineWidth = 3;
            ctx.stroke();

            // Node label
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 16px Inter, sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(node, pos.x, pos.y);

            // Distance label (for Dijkstra)
            if (currentStepData?.distances && currentStepData.distances[node] !== undefined) {
                const dist = currentStepData.distances[node];
                const distText = dist >= 9999 ? '∞' : dist.toString();
                ctx.fillStyle = '#94a3b8';
                ctx.font = '11px Inter, sans-serif';
                ctx.fillText(`d=${distText}`, pos.x, pos.y + 40);
            }
        });

    }, [graph, nodePositions, currentStepData, visitedNodes, dimensions]);

    return (
        <div className="relative w-full h-full bg-slate-950 rounded-xl overflow-hidden">
            <canvas
                ref={canvasRef}
                className="w-full h-full"
                style={{ maxHeight: '450px' }}
            />

            {/* Legend */}
            <div className="absolute bottom-3 left-3 bg-slate-900/80 backdrop-blur rounded-lg p-2 text-xs flex gap-3">
                <span className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded-full bg-blue-500"></span> Start
                </span>
                <span className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded-full bg-purple-500"></span> Current
                </span>
                <span className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded-full bg-green-500"></span> Visited
                </span>
                <span className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded-full bg-amber-500"></span> Checking
                </span>
            </div>

            {/* Edge count */}
            <div className="absolute top-3 right-3 bg-slate-900/80 backdrop-blur rounded-lg px-2 py-1 text-xs text-slate-400">
                {Object.keys(graph).length} nodes
            </div>
        </div>
    );
};

export default GraphCanvas;
