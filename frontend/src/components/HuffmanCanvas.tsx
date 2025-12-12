
import React, { useEffect, useRef } from 'react';

interface HuffmanCanvasProps {
    currentStepData: any;
    allSteps: any[]; // To reconstruct state if needed, but currentStepData might be enough if we track state in Visualizer
    stepIndex: number;
}

// Simple Node Interface for visualization
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

const HuffmanCanvas: React.FC<HuffmanCanvasProps> = ({ currentStepData, stepIndex, allSteps }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // We need to maintain the state of the "Forest" across renders if we want smooth transitions
    // OR we can re-calculate the forest layout based on the current step.
    // Given the step-based architecture, re-calculating or using a persistent ref for the layout state is best.

    // Let's rely on the fact that we can rebuild the tree structure from the steps up to current index.
    // Ideally, Visualizer.tsx should pass us the "current forest state", but currently it passes generic `dpData` etc.
    // For Huffman, `dpData` isn't very useful. We might need to handle the state reconstruction here or in a helper.

    // Quick Hack: For this implementation, let's effectively "replay" to build the visual graph inside the effect. 
    // This is fast enough for N < 100.

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Basic Setup
        const width = canvas.width;
        const height = canvas.height;
        ctx.clearRect(0, 0, width, height);

        // --- 1. Reconstruct Forest State ---
        // We look at `currentStepData` and potentially prev steps if needed. 
        // Actually, without the full history passed down or a "State" object, it's hard.
        // BUT, `Visualizer.tsx` calls `computeStateForIndex` which is generic. 
        // We might need to accept `currentStepData` which holds the *action*, 
        // but we implicitly need the *accumulated* state.

        // Since `Visualizer.tsx` is generic, it doesn't know how to accumulate Huffman Trees.
        // We will assume `currentStepData` might contain enough info, or we have to rely on `allSteps` (passed in props).
        // Let's add `allSteps` to props in the file creation above. (I did).

        // Let's Rebuild the Graph State from Step 0 to stepIndex
        // Nodes map: id -> VisNode
        // Active Forest: list of node IDs that are roots

        let nodes: Record<string, VisNode> = {};
        let rootIds: (string | number)[] = [];
        // let codes: Record<string, string> = {}; // Unused

        // We need access to the steps. 
        // NOTE: The `allSteps` prop is not yet passed from Visualizer. We need to ensure we add it there.
        // PRO TIP: I will access it via a custom prop I'll add to Visualizer.tsx logic later.

        // MOCK RECONSTRUCTION LOGIC (to be replaced by actual props if I can't get them)
        // Wait, I can't easily change the signature of Visualizer's sub-components in a generic way without casting.
        // Let's assume for now, I will modify Visualizer to pass `steps={result.steps}` to this component.

        // Actually, let's look at `currentStepData`.
        // INIT: {"nodes": [{"id":..., "char": "A", "freq": 5}, ...]} -> Sets initial roots
        // HIGHLIGHT: {"left_id": ..., "right_id": ...} -> Just visual highlight
        // UPDATE: {"new_node_id": ..., "left_child_id": ..., "right_child_id": ...} -> Merge Update

        // So we can rebuild easily.
        // Use the allSteps prop that is passed from Visualizer
        const steps = allSteps || [];

        // -----------------------------------------------------------------------
        // STATE REBUILDER
        // -----------------------------------------------------------------------
        if (!steps || steps.length === 0) return;

        for (let k = 0; k <= stepIndex; k++) {
            const step = steps[k];
            if (!step) continue;

            if (step.type === 'init' && step.data.nodes) {
                // Reset
                nodes = {};
                rootIds = [];
                step.data.nodes.forEach((n: any) => {
                    nodes[n.id] = {
                        id: n.id,
                        char: n.char,
                        freq: n.freq,
                        x: 0,
                        y: 0,
                        isLeaf: true
                    };
                    rootIds.push(n.id);
                });
            } else if (step.type === 'update' && step.data.new_node_id) {
                const { new_node_id, freq, left_child_id, right_child_id } = step.data;

                // Create new internal node
                nodes[new_node_id] = {
                    id: new_node_id,
                    char: null,
                    freq: freq,
                    x: 0,
                    y: 0,
                    leftId: left_child_id,
                    rightId: right_child_id,
                    isLeaf: false
                };

                // Remove children from roots, add new node to roots
                rootIds = rootIds.filter(id => id !== left_child_id && id !== right_child_id);
                rootIds.push(new_node_id);

                // Update parent pointers
                if (nodes[left_child_id]) nodes[left_child_id].parentId = new_node_id;
                if (nodes[right_child_id]) nodes[right_child_id].parentId = new_node_id;
            } else if (step.type === 'solution' && step.data.codes) {
                // codes = step.data.codes; // Unused for now
            }
        }

        // -----------------------------------------------------------------------
        // LAYOUT CALCULATION
        // -----------------------------------------------------------------------
        // We have a set of `rootIds`. Each is a tree.
        // We need to layout these trees side-by-side.
        // Inside each tree, we use a recursive layout.

        const NODE_RADIUS = 20;
        const Y_SPACING = 60;

        // Helper to calculate subtree width
        const getTreeWidth = (nodeId: string | number): number => {
            const node = nodes[nodeId];
            if (!node) return 0;
            if (node.isLeaf) return NODE_RADIUS * 2 + 10;
            const leftW = node.leftId ? getTreeWidth(node.leftId) : 0;
            const rightW = node.rightId ? getTreeWidth(node.rightId) : 0;
            return leftW + rightW + 20; // Gap
        };

        // Position assignment recursive
        const assignPositions = (nodeId: string | number, x: number, y: number) => {
            const node = nodes[nodeId];
            if (!node) return;
            node.x = x;
            node.y = y;

            if (node.leftId && node.rightId) {
                const leftW = getTreeWidth(node.leftId);
                const rightW = getTreeWidth(node.rightId);
                const totalW = leftW + rightW;

                // We center the children around the parent ? No, parent centered above children.
                // Left child requires `leftW` space, Right child requires `rightW`.
                // Total span is `leftW + rightW`.
                // Parent is at `x`.
                // Left Child Center should be to the left.



                // Better approach: calculate exact boundaries
                // Let's just create a simplified visual: 
                // Parent X is average of children X (bottom-up), or 
                // Children X are offset from Parent X (top-down).
                // Top-down is easier if we know widths.

                // Simple binary tree layout: 
                // Offset reduces by level: 200, 100, 50...
                // But we have forests not a single tree.
                // Let's use the width approach.
                // Left Start = x - totalW/2. 
                // Left Child X = Left Start + leftW/2
                // Right Start = Left Start + leftW
                // Right Child X = Right Start + rightW/2

                const startX = x - totalW / 2;
                assignPositions(node.leftId, startX + leftW / 2, y + Y_SPACING);
                assignPositions(node.rightId, startX + leftW + rightW / 2, y + Y_SPACING);
            }
        };

        // Layout the ROOTS
        // We place roots side by side at the "bottom" or "top"?
        // Huffman builds bottom-up. But we usually visualize tree root at top.
        // During construction, we have multiple trees.
        // Let's iterate roots and place them.

        let currentX_Offset = 50;
        const BASE_Y = 100;

        // Sort roots by frequency so visuals match logic (visual greedy pick)
        // actually existing roots track their frequency.
        // But the layout might jump around if we strictly follow ID order. 
        // Let's trust `rootIds` order which is roughly insertion order.

        rootIds.forEach(rid => {
            const w = getTreeWidth(rid);
            const centerX = currentX_Offset + w / 2;
            assignPositions(rid, centerX, BASE_Y);
            currentX_Offset += w + 40; // Spacing between trees
        });

        // -----------------------------------------------------------------------
        // DRAWING ENACTMENT
        // -----------------------------------------------------------------------

        // Draw Edges
        Object.values(nodes).forEach(node => {
            if (node.leftId) {
                const child = nodes[node.leftId];
                if (child) {
                    ctx.beginPath();
                    ctx.moveTo(node.x, node.y + NODE_RADIUS);
                    ctx.lineTo(child.x, child.y - NODE_RADIUS);
                    ctx.strokeStyle = '#64748b';
                    ctx.lineWidth = 2;
                    ctx.stroke();

                    // Edge Label (0)
                    ctx.fillStyle = '#94a3b8';
                    ctx.font = '10px Inter';
                    ctx.fillText('0', (node.x + child.x) / 2 - 10, (node.y + child.y) / 2);
                }
            }
            if (node.rightId) {
                const child = nodes[node.rightId];
                if (child) {
                    ctx.beginPath();
                    ctx.moveTo(node.x, node.y + NODE_RADIUS);
                    ctx.lineTo(child.x, child.y - NODE_RADIUS);
                    ctx.strokeStyle = '#64748b';
                    ctx.lineWidth = 2;
                    ctx.stroke();
                    // Edge Label (1)
                    ctx.fillStyle = '#94a3b8';
                    ctx.font = '10px Inter';
                    ctx.fillText('1', (node.x + child.x) / 2 + 5, (node.y + child.y) / 2);
                }
            }
        });

        // Draw Nodes
        Object.values(nodes).forEach(node => {
            ctx.beginPath();
            ctx.arc(node.x, node.y, NODE_RADIUS, 0, Math.PI * 2);

            // Fill Style
            let fill = 'rgba(30, 41, 59, 1)'; // slate-800
            let stroke = '#475569';

            // HIGHLIGHT LOGIC
            // If this node is being selected (highlight step)
            if (currentStepData && (currentStepData.left_id === node.id || currentStepData.right_id === node.id)) {
                fill = 'rgba(234, 179, 8, 0.2)'; // amber-500/20
                stroke = '#eab308';
            }
            // If this node is the newly merged one
            if (currentStepData && currentStepData.new_node_id === node.id) {
                fill = 'rgba(16, 185, 129, 0.2)'; // emerald-500/20
                stroke = '#10b981';
            }

            ctx.fillStyle = fill;
            ctx.strokeStyle = stroke;
            ctx.fill();
            ctx.stroke();

            // Text
            ctx.fillStyle = '#fff';
            ctx.font = '12px Inter';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            if (node.char) {
                ctx.fillText(`${node.char}:${node.freq}`, node.x, node.y);
            } else {
                ctx.fillStyle = '#94a3b8';
                ctx.fillText(`${node.freq}`, node.x, node.y);
            }
        });

    }, [stepIndex, currentStepData, allSteps]); // Use allSteps prop

    return (
        <canvas
            ref={canvasRef}
            width={800}
            height={500}
            className="w-full h-full"
        />
    );
};

export default HuffmanCanvas;
