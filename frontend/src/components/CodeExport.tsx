import React, { useState } from 'react';
import { Copy, Check, Code } from 'lucide-react';

interface CodeExportProps {
    algorithm: string;
}

const CodeExport: React.FC<CodeExportProps> = ({ algorithm }) => {
    const [language, setLanguage] = useState<'python' | 'cpp' | 'java'>('python');
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        const code = codeTemplates[algorithm]?.[language] || "Code not available yet.";
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col h-full max-h-[500px]">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-900/50">
                <div className="flex items-center gap-2 text-indigo-400 font-semibold">
                    <Code size={18} />
                    <span>Implementation Code</span>
                </div>
                <div className="flex gap-2">
                    {(['python', 'cpp', 'java'] as const).map((lang) => (
                        <button
                            key={lang}
                            onClick={() => setLanguage(lang)}
                            className={`px-3 py-1 rounded text-xs font-medium transition-colors ${language === lang
                                    ? 'bg-indigo-600 text-white'
                                    : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                                }`}
                        >
                            {lang.toUpperCase()}
                        </button>
                    ))}
                </div>
            </div>

            <div className="relative flex-1 overflow-auto bg-slate-950 p-4 font-mono text-sm">
                <button
                    onClick={handleCopy}
                    className="absolute top-4 right-4 p-2 bg-slate-800 rounded-md hover:bg-slate-700 transition-colors text-slate-400 hover:text-white"
                    title="Copy to clipboard"
                >
                    {copied ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
                </button>
                <pre className="text-slate-300 leading-relaxed whitespace-pre-wrap">
                    {codeTemplates[algorithm]?.[language] || "// Implementation coming soon..."}
                </pre>
            </div>
        </div>
    );
};

const codeTemplates: Record<string, Record<string, string>> = {
    'knapsack': {
        python: `def solve_knapsack(capacity, items):
    n = len(items)
    dp = [[0] * (capacity + 1) for _ in range(n + 1)]
    
    for i in range(1, n + 1):
        w, v = items[i-1].weight, items[i-1].value
        for c in range(capacity + 1):
            if w <= c:
                dp[i][c] = max(dp[i-1][c], v + dp[i-1][c-w])
            else:
                dp[i][c] = dp[i-1][c]
                
    return dp[n][capacity]`,
        cpp: `int solveHook(int capacity, vector<Item>& items) {
    int n = items.size();
    vector<vector<int>> dp(n + 1, vector<int>(capacity + 1, 0));

    for (int i = 1; i <= n; i++) {
        for (int c = 0; c <= capacity; c++) {
            if (items[i-1].weight <= c) {
                dp[i][c] = max(dp[i-1][c], items[i-1].value + dp[i-1][c - items[i-1].weight]);
            } else {
                dp[i][c] = dp[i-1][c];
            }
        }
    }
    return dp[n][capacity];
}`,
        java: `public int solveKnapsack(int capacity, Item[] items) {
    int n = items.length;
    int[][] dp = new int[n + 1][capacity + 1];

    for (int i = 1; i <= n; i++) {
        for (int c = 0; c <= capacity; c++) {
            if (items[i-1].weight <= c) {
                dp[i][c] = Math.max(dp[i-1][c], items[i-1].value + dp[i-1][c - items[i-1].weight]);
            } else {
                dp[i][c] = dp[i-1][c];
            }
        }
    }
    return dp[n][capacity];
}`
    },
    'lcs': {
        python: `def solve_lcs(s1, s2):
    m, n = len(s1), len(s2)
    dp = [[0] * (n + 1) for _ in range(m + 1)]
    
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if s1[i-1] == s2[j-1]:
                dp[i][j] = 1 + dp[i-1][j-1]
            else:
                dp[i][j] = max(dp[i-1][j], dp[i][j-1])
                
    return dp[m][n]`,
        cpp: `int solveLCS(string s1, string s2) {
    int m = s1.length(), n = s2.length();
    vector<vector<int>> dp(m + 1, vector<int>(n + 1, 0));
    
    for (int i = 1; i <= m; i++) {
        for (int j = 1; j <= n; j++) {
            if (s1[i-1] == s2[j-1])
                dp[i][j] = 1 + dp[i-1][j-1];
            else
                dp[i][j] = max(dp[i-1][j], dp[i][j-1]);
        }
    }
    return dp[m][n];
}`
    },
    'dijkstra': {
        python: `import heapq

def dijkstra(graph, start):
    distances = {node: float('inf') for node in graph}
    distances[start] = 0
    pq = [(0, start)]
    
    while pq:
        d, u = heapq.heappop(pq)
        
        if d > distances[u]:
            continue
            
        for v, weight in graph[u].items():
            if distances[u] + weight < distances[v]:
                distances[v] = distances[u] + weight
                heapq.heappush(pq, (distances[v], v))
                
    return distances`
    }
};

export default CodeExport;
