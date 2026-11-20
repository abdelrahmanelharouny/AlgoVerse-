import React, { useEffect, useMemo, useRef, useState } from 'react';

interface GraphCanvasProps {
    graph: Record<string, Record<string, number>>;
    currentStepData?: any;
    visitedNodes?: string[];
}

interface Position { x: number; y: number; }

const calculateLayout = (
    graph: Record<string, Record<string, number>>,
    width: number,
    height: number
): Record<string, Position> => {
    const nodes = Object.keys(graph);
    const positions: Record<string, Position> = {};
    if (nodes.length === 0) return positions;

    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.max(70, Math.min(width, height) * 0.34);
    nodes.forEach((node, index) => {
        const angle = (2 * Math.PI * index) / nodes.length - Math.PI / 2;
        positions[node] = {
            x: centerX + radius * Math.cos(angle),
            y: centerY + radius * Math.sin(angle)
        };
    });

    // A few deterministic relaxation passes reduce overlaps without an expensive
    // force simulation running on every animation frame.
    for (let iteration = 0; iteration < 24; iteration++) {
        const forces: Record<string, Position> = Object.fromEntries(
            nodes.map(node => [node, { x: 0, y: 0 }])
        );
        for (let left = 0; left < nodes.length; left++) {
            for (let right = left + 1; right < nodes.length; right++) {
                const a = nodes[left], b = nodes[right];
                const dx = positions[b].x - positions[a].x;
                const dy = positions[b].y - positions[a].y;
                const distance = Math.max(1, Math.hypot(dx, dy));
                const force = Math.min(5, 900 / (distance * distance));
                forces[a].x -= (dx / distance) * force;
                forces[a].y -= (dy / distance) * force;
                forces[b].x += (dx / distance) * force;
                forces[b].y += (dy / distance) * force;
            }
        }
        nodes.forEach(node => {
            Object.keys(graph[node] ?? {}).forEach(neighbor => {
                if (!positions[neighbor]) return;
                const dx = positions[neighbor].x - positions[node].x;
                const dy = positions[neighbor].y - positions[node].y;
                forces[node].x += dx * 0.002;
                forces[node].y += dy * 0.002;
            });
        });
        const cooling = 0.65 * (1 - iteration / 30);
        nodes.forEach(node => {
            positions[node].x = Math.max(42, Math.min(width - 42, positions[node].x + forces[node].x * cooling));
            positions[node].y = Math.max(42, Math.min(height - 42, positions[node].y + forces[node].y * cooling));
        });
    }
    return positions;
};

const GraphCanvas: React.FC<GraphCanvasProps> = ({
    graph,
    currentStepData,
    visitedNodes = []
}) => {
    const hostRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [width, setWidth] = useState(800);

    useEffect(() => {
        const host = hostRef.current;
        if (!host) return;
        const updateWidth = () => {
            const nextWidth = Math.max(320, Math.floor(host.getBoundingClientRect().width));
            setWidth(current => current === nextWidth ? current : nextWidth);
        };
        updateWidth();

        if (typeof ResizeObserver !== 'undefined') {
            const observer = new ResizeObserver(updateWidth);
            observer.observe(host);
            return () => observer.disconnect();
        }

        window.addEventListener('resize', updateWidth);
        return () => window.removeEventListener('resize', updateWidth);
    }, []);

    const height = Math.max(300, Math.min(560, Math.round(width * 0.58)));
    const nodePositions = useMemo(
        () => calculateLayout(graph, width, height),
        [graph, width, height]
    );

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const dpr = Math.max(1, Math.min(window.devicePixelRatio || 1, 3));
        canvas.width = Math.round(width * dpr);
        canvas.height = Math.round(height * dpr);
        canvas.style.width = '100%';
        canvas.style.height = 'auto';
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        ctx.fillStyle = '#020617';
        ctx.fillRect(0, 0, width, height);

        const activeFrom = currentStepData?.current_node;
        const activeTo = currentStepData?.checking_neighbor;
        const mstEdges = (currentStepData?.mst_edges ?? []) as Array<{ u: string; v: string; weight?: number }>;
        const pathEdges = (currentStepData?.path_edges ?? []) as Array<{ u: string; v: string }>;
        const visited = new Set<string>([
            ...visitedNodes,
            ...(Array.isArray(currentStepData?.visited) ? currentStepData.visited : [])
        ]);
        const drawnEdges = new Set<string>();

        Object.entries(graph).forEach(([from, neighbors]) => {
            const start = nodePositions[from];
            if (!start) return;
            Object.entries(neighbors).forEach(([to, weight]) => {
                const end = nodePositions[to];
                if (!end) return;
                const key = [from, to].sort().join('::');
                if (drawnEdges.has(key)) return;
                drawnEdges.add(key);

                const isMst = mstEdges.some(edge =>
                    (edge.u === from && edge.v === to) || (edge.u === to && edge.v === from)
                );
                const isPath = pathEdges.some(edge =>
                    (edge.u === from && edge.v === to) || (edge.u === to && edge.v === from)
                );
                const isActive = activeFrom === from && activeTo === to;

                ctx.beginPath();
                ctx.moveTo(start.x, start.y);
                ctx.lineTo(end.x, end.y);
                ctx.strokeStyle = isMst ? '#22c55e' : isPath ? '#38bdf8' : isActive ? '#f59e0b' : '#475569';
                ctx.lineWidth = isMst || isPath ? 4 : isActive ? 3.5 : 2;
                ctx.stroke();

                const midX = (start.x + end.x) / 2;
                const midY = (start.y + end.y) / 2;
                ctx.fillStyle = '#0f172a';
                ctx.beginPath();
                ctx.arc(midX, midY, 14, 0, Math.PI * 2);
                ctx.fill();
                ctx.strokeStyle = '#334155';
                ctx.lineWidth = 1;
                ctx.stroke();
                ctx.fillStyle = isMst ? '#86efac' : '#cbd5e1';
                ctx.font = '600 12px Inter, sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(String(weight), midX, midY);
            });
        });

        const startNode = currentStepData?.start_node;
        Object.entries(nodePositions).forEach(([node, position]) => {
            const isCurrent = currentStepData?.current_node === node;
            const isChecking = currentStepData?.checking_neighbor === node;
            const isStart = startNode === node;
            const isVisited = visited.has(node);
            const radius = width < 460 ? 21 : 26;

            ctx.beginPath();
            ctx.arc(position.x, position.y, radius, 0, Math.PI * 2);
            ctx.fillStyle = isCurrent ? '#7c3aed'
                : isChecking ? '#d97706'
                    : isStart ? '#2563eb'
                        : isVisited ? '#15803d' : '#334155';
            ctx.fill();
            ctx.strokeStyle = isCurrent ? '#c4b5fd' : isChecking ? '#fcd34d' : '#64748b';
            ctx.lineWidth = 2.5;
            ctx.stroke();

            ctx.fillStyle = '#ffffff';
            ctx.font = '700 14px Inter, sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(node, position.x, position.y);

            const distances = currentStepData?.distances;
            if (distances && Object.prototype.hasOwnProperty.call(distances, node)) {
                const distance = distances[node];
                const label = distance === null || distance === Infinity || distance >= 9999 ? '∞' : String(distance);
                ctx.fillStyle = '#cbd5e1';
                ctx.font = '11px Inter, sans-serif';
                ctx.fillText('d=' + label, position.x, position.y + radius + 13);
            }
        });

        if (Object.keys(graph).length === 0) {
            ctx.fillStyle = '#94a3b8';
            ctx.font = '14px Inter, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('Add graph nodes and edges to begin', width / 2, height / 2);
        }
    }, [graph, nodePositions, currentStepData, visitedNodes, width, height]);

    return (
        <div ref={hostRef} className="relative w-full min-w-0 rounded-xl border border-slate-800 bg-slate-950 overflow-hidden">
            <canvas
                ref={canvasRef}
                className="block w-full"
                role="img"
                aria-label="Interactive graph algorithm visualization showing nodes, weighted edges, and visited states."
            />
            <div className="absolute bottom-3 left-3 flex flex-wrap gap-3 rounded-lg bg-slate-900/90 px-3 py-2 text-[11px] text-slate-300 backdrop-blur">
                <span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-full bg-blue-500" />Start</span>
                <span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-full bg-violet-500" />Current</span>
                <span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-full bg-green-600" />Visited</span>
                <span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-full bg-amber-500" />Checking</span>
            </div>
            <div className="absolute right-3 top-3 rounded-lg bg-slate-900/90 px-3 py-1.5 text-xs text-slate-400 backdrop-blur">
                {Object.keys(graph).length} nodes · {new Set(Object.entries(graph).flatMap(([from, neighbors]) =>
                    Object.keys(neighbors).map(to => [from, to].sort().join('::'))
                )).size} edges
            </div>
        </div>
    );
};

export default GraphCanvas;
