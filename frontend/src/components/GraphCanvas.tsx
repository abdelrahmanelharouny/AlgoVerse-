import React, { useEffect, useMemo, useRef, useState } from 'react';

interface GraphStepData {
    current_node?: string;
    checking_neighbor?: string;
    start_node?: string;
    visited?: string[];
    distances?: Record<string, number | null>;
    mst_edges?: Array<{ u: string; v: string; weight?: number }>;
    path_edges?: Array<{ u: string; v: string }>;
}

interface GraphCanvasProps {
    graph: Record<string, Record<string, number>>;
    currentStepData?: GraphStepData;
    visitedNodes?: string[];
    startNode?: string;
    directed?: boolean;
    accumulatedMstEdges?: Array<{ u: string; v: string; weight?: number }>;
    accumulatedPathEdges?: Array<{ u: string; v: string; weight?: number }>;
    distanceLabels?: Record<string, number | null>;
}

interface Position { x: number; y: number; }

const edgeKey = (from: string, to: string) =>
    [from, to].sort((left, right) => left.localeCompare(right)).join('\u0000');

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
    const radius = Math.max(64, Math.min(width, height) * (nodes.length > 12 ? .39 : .34));
    nodes.forEach((node, index) => {
        const angle = (2 * Math.PI * index) / nodes.length - Math.PI / 2;
        positions[node] = {
            x: centerX + radius * Math.cos(angle),
            y: centerY + radius * Math.sin(angle)
        };
    });

    // Stable, bounded relaxation: layout work happens only when the graph or viewport changes.
    if (nodes.length <= 42) {
        for (let iteration = 0; iteration < 18; iteration++) {
            const forces: Record<string, Position> = Object.fromEntries(
                nodes.map(node => [node, { x: 0, y: 0 }])
            );
            for (let left = 0; left < nodes.length; left++) {
                for (let right = left + 1; right < nodes.length; right++) {
                    const a = nodes[left];
                    const b = nodes[right];
                    const dx = positions[b].x - positions[a].x;
                    const dy = positions[b].y - positions[a].y;
                    const distance = Math.max(1, Math.hypot(dx, dy));
                    const force = Math.min(4, 720 / (distance * distance));
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
                    forces[node].x += dx * .0015;
                    forces[node].y += dy * .0015;
                });
            });
            const cooling = .55 * (1 - iteration / 24);
            nodes.forEach(node => {
                positions[node].x = Math.max(36, Math.min(width - 36, positions[node].x + forces[node].x * cooling));
                positions[node].y = Math.max(36, Math.min(height - 36, positions[node].y + forces[node].y * cooling));
            });
        }
    }
    return positions;
};

const GraphCanvas: React.FC<GraphCanvasProps> = ({
    graph,
    currentStepData,
    visitedNodes = [],
    startNode,
    directed = false,
    accumulatedMstEdges = [],
    accumulatedPathEdges = [],
    distanceLabels = {}
}) => {
    const hostRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [width, setWidth] = useState(800);

    useEffect(() => {
        const host = hostRef.current;
        if (!host) return;
        const updateWidth = () => {
            const measured = Math.floor(host.getBoundingClientRect().width);
            const nextWidth = Math.max(280, measured || 800);
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

    const height = Math.max(280, Math.min(540, Math.round(width * .58)));
    const nodePositions = useMemo(
        () => calculateLayout(graph, width, height),
        [graph, width, height]
    );
    const mstEdges = currentStepData?.mst_edges ?? accumulatedMstEdges;
    const pathEdges = currentStepData?.path_edges ?? accumulatedPathEdges;
    const distances = currentStepData?.distances ?? distanceLabels;
    const mstEdgeKeys = useMemo(() => new Set(mstEdges.map(edge => edgeKey(edge.u, edge.v))), [mstEdges]);
    const pathEdgeKeys = useMemo(() => new Set(pathEdges.map(edge => edgeKey(edge.u, edge.v))), [pathEdges]);
    const edgeCount = useMemo(() => directed
        ? Object.values(graph).reduce((total, neighbors) => total + Object.keys(neighbors).length, 0)
        : new Set(Object.entries(graph).flatMap(([from, neighbors]) =>
            Object.keys(neighbors).map(to => edgeKey(from, to))
        )).size, [graph, directed]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const dpr = Math.max(1, Math.min(window.devicePixelRatio || 1, 2));
        canvas.width = Math.round(width * dpr);
        canvas.height = Math.round(height * dpr);
        canvas.style.width = '100%';
        canvas.style.height = 'auto';
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, width, height);
        ctx.fillStyle = '#0d1510';
        ctx.fillRect(0, 0, width, height);

        const activeFrom = currentStepData?.current_node;
        const activeTo = currentStepData?.checking_neighbor;
        const visited = new Set<string>([
            ...visitedNodes,
            ...(currentStepData?.visited ?? [])
        ]);
        const drawnEdges = new Set<string>();
        const nodeCount = Object.keys(graph).length;
        const nodeRadius = nodeCount > 22 ? 16 : nodeCount > 14 ? 19 : width < 460 ? 21 : 25;
        const edgeFontSize = nodeCount > 18 ? 10 : 11;

        Object.entries(graph).forEach(([from, neighbors]) => {
            const start = nodePositions[from];
            if (!start) return;
            Object.entries(neighbors).forEach(([to, weight]) => {
                const end = nodePositions[to];
                if (!end) return;
                const key = edgeKey(from, to);
                if (!directed && drawnEdges.has(key)) return;
                drawnEdges.add(key);

                const isMst = mstEdgeKeys.has(key);
                const isPath = pathEdgeKeys.has(key);
                const isActive = activeFrom === from && activeTo === to;
                const hasReverseEdge = directed && Object.prototype.hasOwnProperty.call(graph[to] ?? {}, from);

                let controlX = (start.x + end.x) / 2;
                let controlY = (start.y + end.y) / 2;
                if (hasReverseEdge) {
                    const forward = from.localeCompare(to) < 0;
                    const canonicalStart = forward ? start : end;
                    const canonicalEnd = forward ? end : start;
                    const canonicalDx = canonicalEnd.x - canonicalStart.x;
                    const canonicalDy = canonicalEnd.y - canonicalStart.y;
                    const canonicalLength = Math.max(1, Math.hypot(canonicalDx, canonicalDy));
                    const offset = (forward ? 1 : -1) * Math.min(27, Math.max(13, canonicalLength * .13));
                    controlX += (-canonicalDy / canonicalLength) * offset;
                    controlY += (canonicalDx / canonicalLength) * offset;
                }

                const edgeColor = isMst ? '#d6f56a' : isPath ? '#83cbd8' : isActive ? '#ff8063' : '#53665a';
                ctx.beginPath();
                ctx.moveTo(start.x, start.y);
                if (hasReverseEdge) ctx.quadraticCurveTo(controlX, controlY, end.x, end.y);
                else ctx.lineTo(end.x, end.y);
                ctx.strokeStyle = edgeColor;
                ctx.lineWidth = isMst || isPath ? 3.5 : isActive ? 3 : 1.7;
                ctx.globalAlpha = isMst || isPath || isActive ? 1 : .78;
                ctx.stroke();
                ctx.globalAlpha = 1;

                if (directed) {
                    const tangentX = end.x - (hasReverseEdge ? controlX : start.x);
                    const tangentY = end.y - (hasReverseEdge ? controlY : start.y);
                    const angle = Math.atan2(tangentY, tangentX);
                    const tipX = end.x - Math.cos(angle) * (nodeRadius + 3);
                    const tipY = end.y - Math.sin(angle) * (nodeRadius + 3);
                    const wing = 7;
                    ctx.beginPath();
                    ctx.moveTo(tipX, tipY);
                    ctx.lineTo(tipX - Math.cos(angle - Math.PI / 6) * wing, tipY - Math.sin(angle - Math.PI / 6) * wing);
                    ctx.lineTo(tipX - Math.cos(angle + Math.PI / 6) * wing, tipY - Math.sin(angle + Math.PI / 6) * wing);
                    ctx.closePath();
                    ctx.fillStyle = edgeColor;
                    ctx.fill();
                }

                const midX = hasReverseEdge ? .25 * start.x + .5 * controlX + .25 * end.x : (start.x + end.x) / 2;
                const midY = hasReverseEdge ? .25 * start.y + .5 * controlY + .25 * end.y : (start.y + end.y) / 2;
                ctx.fillStyle = '#111b15';
                ctx.beginPath();
                ctx.arc(midX, midY, 12, 0, Math.PI * 2);
                ctx.fill();
                ctx.strokeStyle = '#405247';
                ctx.lineWidth = 1;
                ctx.stroke();
                ctx.fillStyle = isMst ? '#d6f56a' : '#d6e0d6';
                ctx.font = '650 ' + edgeFontSize + 'px Inter, sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(String(weight), midX, midY);
            });
        });

        const visibleStartNode = currentStepData?.start_node ?? startNode;
        Object.entries(nodePositions).forEach(([node, position]) => {
            const isCurrent = currentStepData?.current_node === node;
            const isChecking = currentStepData?.checking_neighbor === node;
            const isStart = visibleStartNode === node;
            const isVisited = visited.has(node);

            ctx.beginPath();
            ctx.arc(position.x, position.y, nodeRadius, 0, Math.PI * 2);
            ctx.fillStyle = isCurrent ? '#ff8063'
                : isChecking ? '#f6c56e'
                    : isStart ? '#d6f56a'
                        : isVisited ? '#245f59' : '#25352b';
            ctx.fill();
            ctx.strokeStyle = isCurrent ? '#ffc0b1' : isChecking ? '#ffe0a0' : isStart ? '#efffb2' : isVisited ? '#83cbd8' : '#617467';
            ctx.lineWidth = 2;
            ctx.stroke();

            ctx.fillStyle = isStart ? '#19210f' : '#f1f4e9';
            ctx.font = '700 ' + (node.length > 2 ? Math.max(8, 12 - node.length * .45) : 13) + 'px Inter, sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(node, position.x, position.y, nodeRadius * 1.65);

            if (Object.prototype.hasOwnProperty.call(distances, node)) {
                const distance = distances[node];
                const label = distance === null || !Number.isFinite(distance) ? '∞' : String(distance);
                ctx.fillStyle = '#a7b4a8';
                ctx.font = '10px ui-monospace, monospace';
                ctx.fillText('d=' + label, position.x, position.y + nodeRadius + 12);
            }
        });

        if (nodeCount === 0) {
            ctx.fillStyle = '#99a99c';
            ctx.font = '13px Inter, sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('Add graph nodes and edges to begin', width / 2, height / 2);
        }
    }, [graph, nodePositions, currentStepData, visitedNodes, width, height, directed, startNode, mstEdgeKeys, pathEdgeKeys, distances]);

    return (
        <div ref={hostRef} className="relative w-full min-w-0 overflow-hidden rounded-xl border border-[#33453a] bg-[#0d1510]">
            <canvas
                ref={canvasRef}
                className="block w-full"
                role="img"
                aria-label={'Graph visualization with ' + Object.keys(graph).length + ' nodes and ' + edgeCount + ' ' + (directed ? 'directed edges' : 'edges') + '. Active algorithm states are highlighted.'}
            />
            <div className="absolute bottom-3 left-3 flex flex-wrap gap-x-3 gap-y-1.5 rounded-md border border-[#35483b] bg-[#101a14]/95 px-3 py-2 text-[9px] text-[#c0cbbf] backdrop-blur-sm">
                <span className="inline-flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-[#d6f56a]" />Start</span>
                <span className="inline-flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-[#ff8063]" />Current</span>
                <span className="inline-flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-[#83cbd8]" />Visited</span>
                <span className="inline-flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-[#f6c56e]" />Checking</span>
                {directed
                    ? <span className="inline-flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-[#83cbd8]" />Shortest-path tree</span>
                    : <span className="inline-flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-[#d6f56a] ring-1 ring-[#d6f56a]/40" />Chosen edge</span>}
            </div>
            <div className="absolute right-3 top-3 rounded-md border border-[#35483b] bg-[#101a14]/95 px-3 py-1.5 font-mono text-[9px] text-[#aab8ac] backdrop-blur-sm">
                {Object.keys(graph).length} nodes / {edgeCount} edges
            </div>
        </div>
    );
};

export default GraphCanvas;