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

const edgeKey = (from: string, to: string, directed = false) =>
    directed ? from + '\u0000' + to
        : [from, to].sort((left, right) => left.localeCompare(right)).join('\u0000');

const animateCanvasUpdate = (canvas: HTMLCanvasElement) => {
    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
    if (!reduceMotion && typeof canvas.animate === 'function') {
        canvas.animate([{ opacity: 0.72 }, { opacity: 1 }], { duration: 150, easing: 'ease-out' });
    }
};

const calculateLayout = (
    graph: Record<string, Record<string, number>>,
    width: number,
    height: number
): Record<string, Position> => {
    const nodes = Object.keys(graph);
    const positions: Record<string, Position> = {};
    if (nodes.length === 0) return positions;

    const compact = width < 460;
    const nodeRadius = nodes.length > 34 ? 11 : nodes.length > 22 ? 13 : nodes.length > 14 ? 16 : compact ? 20 : 24;
    const maxRadius = Math.max(34, Math.min(width, height) / 2 - nodeRadius - 18);
    const spacing = nodeRadius * 2 + (nodes.length > 22 ? 8 : 18);

    if (nodes.length <= 8) {
        const radius = maxRadius * 0.82;
        nodes.forEach((node, index) => {
            const angle = (2 * Math.PI * index) / nodes.length - Math.PI / 2;
            positions[node] = { x: width / 2 + radius * Math.cos(angle), y: height / 2 + radius * Math.sin(angle) };
        });
        return positions;
    }

    // Concentric rings maintain separation on narrow screens and dense graphs.
    const rings = [0.28, 0.52, 0.76, 0.98].map(fraction => {
        const radius = maxRadius * fraction;
        const capacity = Math.max(1, Math.floor((2 * Math.PI * radius) / spacing));
        return { radius, capacity };
    });

    let cursor = 0;
    for (const ring of rings) {
        if (cursor >= nodes.length) break;
        const count = Math.min(nodes.length - cursor, ring.capacity);
        for (let index = 0; index < count; index++) {
            const node = nodes[cursor + index];
            const angle = (2 * Math.PI * index) / count - Math.PI / 2 + (cursor % 2 ? Math.PI / count : 0);
            positions[node] = { x: width / 2 + ring.radius * Math.cos(angle), y: height / 2 + ring.radius * Math.sin(angle) };
        }
        cursor += count;
    }

    if (cursor < nodes.length) {
        const remaining = nodes.length - cursor;
        for (let index = 0; index < remaining; index++) {
            const node = nodes[cursor + index];
            const angle = (2 * Math.PI * index) / remaining - Math.PI / 2;
            positions[node] = { x: width / 2 + maxRadius * Math.cos(angle), y: height / 2 + maxRadius * Math.sin(angle) };
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
    const pathEdgeKeys = useMemo(() => new Set(pathEdges.map(edge => edgeKey(edge.u, edge.v, directed))), [pathEdges, directed]);
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
        ctx.fillStyle = '#101c2d';
        ctx.fillRect(0, 0, width, height);

        const activeFrom = currentStepData?.current_node;
        const activeTo = currentStepData?.checking_neighbor;
        const visited = new Set<string>([
            ...visitedNodes,
            ...(currentStepData?.visited ?? [])
        ]);
        const drawnEdges = new Set<string>();
        const nodeCount = Object.keys(graph).length;
        const nodeRadius = nodeCount > 34 ? 11 : nodeCount > 22 ? 13 : nodeCount > 14 ? 16 : width < 460 ? 20 : 24;
        const edgeFontSize = nodeCount > 18 ? 10 : 11;

        Object.entries(graph).forEach(([from, neighbors]) => {
            const start = nodePositions[from];
            if (!start) return;
            Object.entries(neighbors).forEach(([to, weight]) => {
                const end = nodePositions[to];
                if (!end) return;
                const key = edgeKey(from, to, directed);
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

                const edgeColor = isMst ? '#d5ef79' : isPath ? '#78b8ff' : isActive ? '#ed765f' : '#53677f';
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
                ctx.fillStyle = '#142238';
                ctx.beginPath();
                ctx.arc(midX, midY, 12, 0, Math.PI * 2);
                ctx.fill();
                ctx.strokeStyle = '#425873';
                ctx.lineWidth = 1;
                ctx.stroke();
                ctx.fillStyle = isMst ? '#d5ef79' : '#dce6f0';
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
            ctx.fillStyle = isCurrent ? '#ed6247'
                : isChecking ? '#f2b75c'
                    : isStart ? '#d5ef79'
                        : isVisited ? '#326ca2' : '#263a55';
            ctx.fill();
            ctx.strokeStyle = isCurrent ? '#ffb7a8' : isChecking ? '#ffe0a0' : isStart ? '#efffb2' : isVisited ? '#8bc7ff' : '#536b87';
            ctx.lineWidth = 2;
            ctx.stroke();

            ctx.fillStyle = isStart ? '#18230f' : '#f1f5f8';
            ctx.font = '700 ' + (node.length > 2 ? Math.max(8, 12 - node.length * .45) : 13) + 'px Inter, sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(node, position.x, position.y, nodeRadius * 1.65);

            if (Object.prototype.hasOwnProperty.call(distances, node)) {
                const distance = distances[node];
                const label = distance === null || !Number.isFinite(distance) ? '∞' : String(distance);
                ctx.fillStyle = '#a9b8c9';
                ctx.font = '10px ui-monospace, monospace';
                ctx.fillText('d=' + label, position.x, position.y + nodeRadius + 12);
            }
        });

        if (nodeCount === 0) {
            ctx.fillStyle = '#b7c5d4';
            ctx.font = '13px Inter, sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('Add graph nodes and edges to begin', width / 2, height / 2);
        }
        animateCanvasUpdate(canvas);
    }, [graph, nodePositions, currentStepData, visitedNodes, width, height, directed, startNode, mstEdgeKeys, pathEdgeKeys, distances]);

    return (
        <div ref={hostRef} className="av-visual-canvas relative w-full min-w-0 overflow-hidden rounded-xl border border-[#344b67] bg-[#101c2d]">
            <canvas
                ref={canvasRef}
                className="block w-full"
                role="img"
                aria-label={'Graph visualization with ' + Object.keys(graph).length + ' nodes and ' + edgeCount + ' ' + (directed ? 'directed edges' : 'edges') + '. Active algorithm states are highlighted.'}
            />
            <div className="absolute bottom-3 left-3 flex flex-wrap gap-x-3 gap-y-1.5 rounded-md border border-[#344b67] bg-[#17263a]/95 px-3 py-2 text-[9px] text-[#c6d2df] backdrop-blur-sm">
                <span className="inline-flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-[#d6f56a]" />Start</span>
                <span className="inline-flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-[#ff8063]" />Current</span>
                <span className="inline-flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-[#83cbd8]" />Visited</span>
                <span className="inline-flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-[#f6c56e]" />Checking</span>
                {directed
                    ? <span className="inline-flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-[#83cbd8]" />Shortest-path tree</span>
                    : <span className="inline-flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-[#d6f56a] ring-1 ring-[#d6f56a]/40" />Chosen edge</span>}
            </div>
            <div className="absolute right-3 top-3 rounded-md border border-[#344b67] bg-[#17263a]/95 px-3 py-1.5 font-mono text-[9px] text-[#b7c5d4] backdrop-blur-sm">
                {Object.keys(graph).length} nodes / {edgeCount} edges
            </div>
        </div>
    );
};

export default GraphCanvas;