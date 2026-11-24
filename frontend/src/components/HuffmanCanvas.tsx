import React, { useEffect, useRef, useState } from 'react';
import type { Step } from '../types';

interface HuffmanNodeInput {
    id: string | number;
    char: string | null;
    freq: number;
}

interface HuffmanStepData {
    nodes?: HuffmanNodeInput[];
    left_id?: string | number;
    right_id?: string | number;
    new_node_id?: string | number;
    freq?: number;
    left_child_id?: string | number;
    right_child_id?: string | number;
    codes?: Record<string, string>;
}

interface HuffmanCanvasProps {
    currentStepData: HuffmanStepData;
    allSteps: Step[];
    stepIndex: number;
}

interface VisNode {
    id: string | number;
    char: string | null;
    freq: number;
    x: number;
    y: number;
    leftId?: string | number;
    rightId?: string | number;
    parentId?: string | number;
    isLeaf: boolean;
}

const NODE_RADIUS = 19;
const X_GAP = 28;
const TREE_GAP = 34;
const Y_SPACING = 66;
const TOP_PADDING = 54;

const animateCanvasUpdate = (canvas: HTMLCanvasElement) => {
    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
    if (!reduceMotion && typeof canvas.animate === 'function') {
        canvas.animate([{ opacity: 0.72 }, { opacity: 1 }], { duration: 150, easing: 'ease-out' });
    }
};

const HuffmanCanvas: React.FC<HuffmanCanvasProps> = ({ currentStepData, stepIndex, allSteps }) => {
    const hostRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [viewportWidth, setViewportWidth] = useState(800);

    useEffect(() => {
        const host = hostRef.current;
        if (!host) return;
        const updateWidth = () => {
            const measured = Math.floor(host.getBoundingClientRect().width);
            const next = Math.max(280, measured || 800);
            setViewportWidth(current => current === next ? current : next);
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

    useEffect(() => {
        const host = hostRef.current;
        const canvas = canvasRef.current;
        if (!host || !canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const nodes: Record<string, VisNode> = Object.create(null) as Record<string, VisNode>;
        let rootIds: Array<string | number> = [];

        if (stepIndex >= 0) {
            for (let index = 0; index <= stepIndex; index++) {
                const step = allSteps[index];
                if (!step) continue;
                const data = (step.data ?? {}) as HuffmanStepData;

                if (step.type === 'init' && Array.isArray(data.nodes)) {
                    Object.keys(nodes).forEach(key => delete nodes[key]);
                    rootIds = [];
                    data.nodes.forEach(node => {
                        const key = String(node.id);
                        nodes[key] = {
                            id: node.id,
                            char: node.char,
                            freq: Number.isFinite(node.freq) ? node.freq : 0,
                            x: 0,
                            y: 0,
                            isLeaf: true
                        };
                        rootIds.push(node.id);
                    });
                } else if (step.type === 'update' && data.new_node_id !== undefined) {
                    const newKey = String(data.new_node_id);
                    nodes[newKey] = {
                        id: data.new_node_id,
                        char: null,
                        freq: Number.isFinite(data.freq) ? Number(data.freq) : 0,
                        x: 0,
                        y: 0,
                        leftId: data.left_child_id,
                        rightId: data.right_child_id,
                        isLeaf: false
                    };
                    rootIds = rootIds.filter(id =>
                        String(id) !== String(data.left_child_id)
                        && String(id) !== String(data.right_child_id)
                    );
                    rootIds.push(data.new_node_id);

                    if (data.left_child_id !== undefined && nodes[String(data.left_child_id)]) {
                        nodes[String(data.left_child_id)].parentId = data.new_node_id;
                    }
                    if (data.right_child_id !== undefined && nodes[String(data.right_child_id)]) {
                        nodes[String(data.right_child_id)].parentId = data.new_node_id;
                    }
                }
            }
        }

        if (rootIds.length === 0) {
            canvas.width = Math.max(280, viewportWidth);
            canvas.height = 210;
            canvas.style.width = canvas.width + 'px';
            canvas.style.height = canvas.height + 'px';
            const dpr = Math.max(1, Math.min(window.devicePixelRatio || 1, 2));
            canvas.width = Math.round(canvas.width * dpr);
            canvas.height = Math.round(canvas.height * dpr);
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            ctx.fillStyle = '#101c2d';
            ctx.fillRect(0, 0, canvas.width / dpr, canvas.height / dpr);
            ctx.fillStyle = '#a1b0a3';
            ctx.font = '13px Inter, sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('Play the trace to build the Huffman forest', canvas.width / dpr / 2, 105);
            return;
        }

        const widthCache = new Map<string, number>();
        const measuring = new Set<string>();

        const treeWidth = (id: string | number): number => {
            const key = String(id);
            const cached = widthCache.get(key);
            if (cached !== undefined) return cached;
            const node = nodes[key];
            if (!node) return NODE_RADIUS * 2 + 12;
            if (node.isLeaf || measuring.has(key)) return NODE_RADIUS * 2 + 14;
            measuring.add(key);
            const left = node.leftId !== undefined ? treeWidth(node.leftId) : 0;
            const right = node.rightId !== undefined ? treeWidth(node.rightId) : 0;
            measuring.delete(key);
            const width = Math.max(NODE_RADIUS * 2 + 14, left + right + X_GAP);
            widthCache.set(key, width);
            return width;
        };

        const treeDepth = (id: string | number, ancestry = new Set<string>()): number => {
            const key = String(id);
            const node = nodes[key];
            if (!node || node.isLeaf || ancestry.has(key)) return 1;
            const next = new Set(ancestry);
            next.add(key);
            const left = node.leftId !== undefined ? treeDepth(node.leftId, next) : 0;
            const right = node.rightId !== undefined ? treeDepth(node.rightId, next) : 0;
            return 1 + Math.max(left, right);
        };

        const forestWidth = rootIds.reduce<number>((sum, id) => sum + treeWidth(id), 0)
            + Math.max(0, rootIds.length - 1) * TREE_GAP;
        const canvasWidth = Math.max(viewportWidth - 24, forestWidth + 48, 280);
        const forestHeight = Math.max(1, ...rootIds.map(id => treeDepth(id)));
        const canvasHeight = Math.max(230, TOP_PADDING + (forestHeight - 1) * Y_SPACING + NODE_RADIUS * 2 + 46);
        const dpr = Math.max(1, Math.min(window.devicePixelRatio || 1, 2));

        canvas.width = Math.round(canvasWidth * dpr);
        canvas.height = Math.round(canvasHeight * dpr);
        canvas.style.width = canvasWidth + 'px';
        canvas.style.height = canvasHeight + 'px';
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        ctx.fillStyle = '#101c2d';
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);

        const offsetX = Math.max(24, (canvasWidth - forestWidth) / 2);
        const positioned = new Set<string>();
        const assign = (id: string | number, x: number, y: number, ancestry = new Set<string>()) => {
            const key = String(id);
            const node = nodes[key];
            if (!node || ancestry.has(key)) return;
            node.x = x;
            node.y = y;
            positioned.add(key);
            if (node.leftId === undefined || node.rightId === undefined) return;
            const leftWidth = treeWidth(node.leftId);
            const rightWidth = treeWidth(node.rightId);
            const span = leftWidth + rightWidth + X_GAP;
            const leftCenter = x - span / 2 + leftWidth / 2;
            const rightCenter = x - span / 2 + leftWidth + X_GAP + rightWidth / 2;
            const next = new Set(ancestry);
            next.add(key);
            assign(node.leftId, leftCenter, y + Y_SPACING, next);
            assign(node.rightId, rightCenter, y + Y_SPACING, next);
        };

        let rootCursor = offsetX;
        rootIds.forEach(id => {
            const width = treeWidth(id);
            assign(id, rootCursor + width / 2, TOP_PADDING);
            rootCursor += width + TREE_GAP;
        });

        // Draw connections before nodes so every node remains legible.
        Object.values(nodes).forEach(node => {
            if (!positioned.has(String(node.id))) return;
            const drawChild = (childId: string | number | undefined, bit: string, side: number) => {
                if (childId === undefined) return;
                const child = nodes[String(childId)];
                if (!child || !positioned.has(String(child.id))) return;
                ctx.beginPath();
                ctx.moveTo(node.x, node.y + NODE_RADIUS - 2);
                ctx.lineTo(child.x, child.y - NODE_RADIUS + 2);
                ctx.strokeStyle = '#53677f';
                ctx.lineWidth = 1.7;
                ctx.stroke();
                ctx.fillStyle = '#a9b8c9';
                ctx.font = '10px ui-monospace, monospace';
                ctx.textAlign = 'center';
                ctx.fillText(bit, (node.x + child.x) / 2 + side, (node.y + child.y) / 2);
            };
            drawChild(node.leftId, '0', -8);
            drawChild(node.rightId, '1', 8);
        });

        Object.values(nodes).forEach(node => {
            if (!positioned.has(String(node.id))) return;
            const selectedLeft = currentStepData?.left_id ?? currentStepData?.left_child_id;
            const selectedRight = currentStepData?.right_id ?? currentStepData?.right_child_id;
            const isSelected = [selectedLeft, selectedRight].some(
                selectedId => selectedId !== undefined && String(selectedId) === String(node.id)
            );
            const isMerged = currentStepData?.new_node_id !== undefined
                && String(currentStepData.new_node_id) === String(node.id);
            ctx.beginPath();
            ctx.arc(node.x, node.y, NODE_RADIUS, 0, Math.PI * 2);
            ctx.fillStyle = isMerged ? '#314c2f' : isSelected ? '#68402f' : node.isLeaf ? '#243d5a' : '#22324a';
            ctx.strokeStyle = isMerged ? '#d5ef79' : isSelected ? '#ffb66f' : node.isLeaf ? '#78b8ff' : '#607895';
            ctx.lineWidth = isMerged || isSelected ? 2.6 : 1.6;
            ctx.fill();
            ctx.stroke();

            const symbol = node.char === ' ' ? '␠' : node.char;
            ctx.fillStyle = '#f1f5f8';
            ctx.font = '700 11px Inter, sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(symbol || 'Σ', node.x, node.y, NODE_RADIUS * 1.65);
            ctx.fillStyle = '#a9b8c9';
            ctx.font = '9px ui-monospace, monospace';
            ctx.fillText(String(node.freq), node.x, node.y + NODE_RADIUS + 12);
        });
        animateCanvasUpdate(canvas);
    }, [stepIndex, currentStepData, allSteps, viewportWidth]);

    const codes = currentStepData?.codes;
    const codeEntries = codes ? Object.entries(codes) : [];

    return (
        <div ref={hostRef} className="av-visual-canvas max-h-[68vh] max-w-full overflow-auto rounded-xl border border-[#344b67] bg-[#101c2d] p-3">
            <canvas
                ref={canvasRef}
                className="mx-auto block"
                role="img"
                aria-label="Huffman coding forest. Selected nodes and newly merged parent nodes are highlighted."
            />
            {codeEntries.length > 0 && (
                <div className="sticky bottom-0 mt-2 flex flex-wrap gap-2 border-t border-[#34463a] bg-[#101a14]/95 pt-3">
                    {codeEntries.map(([character, code]) => (
                        <span key={character} className="rounded-md border border-[#3a4d3e] bg-[#1a2920] px-2 py-1 font-mono text-[10px] text-[#d8e2d6]">
                            <strong className="mr-1 text-[#d6f56a]">{character === ' ' ? '␠' : character}</strong>{code}
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
};

export default HuffmanCanvas;