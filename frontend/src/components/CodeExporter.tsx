import { useState } from 'react';
import { motion } from 'framer-motion';
import { Code, Copy, Download, Check } from 'lucide-react';
import type { KnapsackInput, CoinChangeInput, IntervalSchedulingInput } from '../types';

interface CodeExporterProps {
    algorithmType: 'knapsack' | 'coin-change' | 'interval-scheduling';
    variant: 'dp' | 'greedy';
    inputData: KnapsackInput | CoinChangeInput | IntervalSchedulingInput;
}

type CodeLanguage = 'python' | 'javascript';
type CodeTemplate = Partial<Record<CodeExporterProps['variant'], Partial<Record<CodeLanguage, string>>>>;

const CODE_TEMPLATES: Partial<Record<CodeExporterProps['algorithmType'], CodeTemplate>> = {
    knapsack: {
        dp: {
            python: `def knapsack_dp(items, capacity):
    """
    Dynamic Programming solution for 0/1 Knapsack
    Time: O(n * capacity), Space: O(n * capacity)
    """
    n = len(items)
    dp = [[0] * (capacity + 1) for _ in range(n + 1)]
    
    for i in range(1, n + 1):
        for w in range(capacity + 1):
            if items[i-1]['weight'] <= w:
                dp[i][w] = max(
                    dp[i-1][w],
                    dp[i-1][w - items[i-1]['weight']] + items[i-1]['value']
                )
            else:
                dp[i][w] = dp[i-1][w]
    
    return dp[n][capacity]

# Your input:
items = {{ITEMS}}
capacity = {{CAPACITY}}

result = knapsack_dp(items, capacity)
print(f"Maximum value: {result}")`,
            javascript: `function knapsackDP(items, capacity) {
    // Dynamic Programming solution for 0/1 Knapsack
    // Time: O(n * capacity), Space: O(n * capacity)
    const n = items.length;
    const dp = Array(n + 1).fill(0).map(() => Array(capacity + 1).fill(0));
    
    for (let i = 1; i <= n; i++) {
        for (let w = 0; w <= capacity; w++) {
            if (items[i-1].weight <= w) {
                dp[i][w] = Math.max(
                    dp[i-1][w],
                    dp[i-1][w - items[i-1].weight] + items[i-1].value
                );
            } else {
                dp[i][w] = dp[i-1][w];
            }
        }
    }
    
    return dp[n][capacity];
}

// Your input:
const items = {{ITEMS}};
const capacity = {{CAPACITY}};

const result = knapsackDP(items, capacity);
console.log(\`Maximum value: \${result}\`);`
        },
        greedy: {
            python: `def knapsack_greedy(items, capacity):
    """
    Greedy solution for Fractional Knapsack
    Time: O(n log n), Space: O(n)
    """
    # Calculate value-to-weight ratio safely; positive zero-weight items come first.
    items_with_ratio = [
        {
            **item,
            'ratio': (
                float('inf') if item['weight'] == 0 and item['value'] > 0
                else (item['value'] / item['weight'] if item['weight'] > 0 else float('-inf'))
            )
        }
        for item in items
    ]

    # Sort by ratio (descending)
    items_with_ratio.sort(key=lambda x: x['ratio'], reverse=True)

    total_value = 0
    remaining_capacity = capacity

    for item in items_with_ratio:
        if item['value'] <= 0:
            continue

        # A positive-value zero-weight item can always be taken completely.
        if item['weight'] == 0:
            total_value += item['value']
            continue

        fraction = min(1.0, remaining_capacity / item['weight'])
        if fraction <= 0:
            break

        total_value += item['value'] * fraction
        remaining_capacity = max(0.0, remaining_capacity - item['weight'] * fraction)
        if fraction < 1.0:
            break
    
    return total_value

# Your input:
items = {{ITEMS}}
capacity = {{CAPACITY}}

result = knapsack_greedy(items, capacity)
print(f"Greedy value: {result:.2f}")`,
            javascript: `function knapsackGreedy(items, capacity) {
    // Greedy solution for Fractional Knapsack
    // Time: O(n log n), Space: O(n)
    
    // Calculate value-to-weight ratio without dividing by zero.
    const itemsWithRatio = items.map(item => ({
        ...item,
        ratio: item.weight === 0
            ? (item.value > 0 ? Number.POSITIVE_INFINITY : Number.NEGATIVE_INFINITY)
            : item.value / item.weight
    }));

    // Sort by ratio (descending)
    itemsWithRatio.sort((a, b) => b.ratio - a.ratio);

    let totalValue = 0;
    let remainingCapacity = capacity;

    for (const item of itemsWithRatio) {
        if (item.value <= 0) continue;

        // A positive-value zero-weight item can always be taken completely.
        if (item.weight === 0) {
            totalValue += item.value;
            continue;
        }

        const fraction = Math.min(1, remainingCapacity / item.weight);
        if (fraction <= 0) break;

        totalValue += item.value * fraction;
        remainingCapacity = Math.max(0, remainingCapacity - item.weight * fraction);
        if (fraction < 1) break;
    }
    
    return totalValue;
}

// Your input:
const items = {{ITEMS}};
const capacity = {{CAPACITY}};

const result = knapsackGreedy(items, capacity);
console.log(\`Greedy value: \${result.toFixed(2)}\`);`
        }
    }
    // Add more templates for coin-change and interval-scheduling as needed
};

const CodeExporter: React.FC<CodeExporterProps> = ({ algorithmType, variant, inputData }) => {
    const [language, setLanguage] = useState<'python' | 'javascript'>('python');
    const [copied, setCopied] = useState(false);

    const getTemplate = (): string => {
        const template = CODE_TEMPLATES[algorithmType]?.[variant]?.[language];
        if (!template) return '// Template not available';

        // Replace placeholders with actual data
        let code = template;

        if (algorithmType === 'knapsack' && inputData) {
            const knapsackInput = inputData as KnapsackInput;
            code = code.replace('{{ITEMS}}', JSON.stringify(knapsackInput.items, null, 2));
            code = code.replace('{{CAPACITY}}', knapsackInput.capacity.toString());
        }

        return code;
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(getTemplate());
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDownload = () => {
        const code = getTemplate();
        const extension = language === 'python' ? 'py' : 'js';
        const filename = `${algorithmType}_${variant}.${extension}`;

        const blob = new Blob([code], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <motion.div
            className="bg-slate-900 border border-slate-700 rounded-xl overflow-hidden shadow-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
        >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                        <Code className="text-green-400" size={20} />
                    </div>
                    <div>
                        <h3 className="font-bold text-white">Export Code</h3>
                        <p className="text-xs text-slate-400">Copy or download working code</p>
                    </div>
                </div>

                {/* Language Toggle */}
                <div className="flex gap-2">
                    <button
                        onClick={() => setLanguage('python')}
                        className={`px-3 py-1 rounded text-sm font-semibold transition-colors ${language === 'python'
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                            }`}
                    >
                        Python
                    </button>
                    <button
                        onClick={() => setLanguage('javascript')}
                        className={`px-3 py-1 rounded text-sm font-semibold transition-colors ${language === 'javascript'
                            ? 'bg-yellow-600 text-white'
                            : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                            }`}
                    >
                        JavaScript
                    </button>
                </div>
            </div>

            {/* Code Preview */}
            <div className="p-4 bg-slate-950">
                <pre className="text-sm text-slate-300 font-mono overflow-x-auto">
                    <code>{getTemplate()}</code>
                </pre>
            </div>

            {/* Actions */}
            <div className="flex gap-2 p-4 border-t border-slate-800">
                <button
                    onClick={handleCopy}
                    className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                    {copied ? <Check size={18} /> : <Copy size={18} />}
                    {copied ? 'Copied!' : 'Copy to Clipboard'}
                </button>
                <button
                    onClick={handleDownload}
                    className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                    <Download size={18} />
                    Download File
                </button>
            </div>
        </motion.div>
    );
};

export default CodeExporter;
