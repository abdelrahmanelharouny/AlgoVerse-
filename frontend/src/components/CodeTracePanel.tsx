import { motion } from 'framer-motion';
import { Code, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface CodeTracePanelProps {
    code: string;
    language: string;
    highlightedLine?: number;
    title?: string;
}

const CodeTracePanel: React.FC<CodeTracePanelProps> = ({
    code,
    language = 'python',
    highlightedLine,
    title = 'Algorithm Code'
}) => {
    const [isCollapsed, setIsCollapsed] = useState(false);

    const customStyle = {
        ...vscDarkPlus,
        'pre[class*="language-"]': {
            ...vscDarkPlus['pre[class*="language-"]'],
            margin: 0,
            padding: '1rem',
            background: 'transparent'
        },
        'code[class*="language-"]': {
            ...vscDarkPlus['code[class*="language-"]'],
            background: 'transparent'
        }
    };

    const lineProps = (lineNumber: number) => {
        const style: React.CSSProperties = {
            display: 'block',
            padding: '0.25rem 1rem',
            margin: '0 -1rem'
        };

        if (lineNumber === highlightedLine) {
            style.backgroundColor = 'rgba(251, 191, 36, 0.1)';
            style.borderLeft = '3px solid #FBBF24';
            style.paddingLeft = 'calc(1rem - 3px)';
        }

        return { style };
    };

    return (
        <motion.div
            className="bg-slate-900 border border-slate-700 rounded-xl overflow-hidden shadow-lg"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
        >
            {/* Header */}
            <div
                className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950 cursor-pointer hover:bg-slate-900 transition-colors"
                onClick={() => setIsCollapsed(!isCollapsed)}
            >
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                        <Code className="text-blue-400" size={20} />
                    </div>
                    <div>
                        <h3 className="font-bold text-white">{title}</h3>
                        {highlightedLine && (
                            <p className="text-xs text-slate-400">
                                Executing line {highlightedLine}
                            </p>
                        )}
                    </div>
                </div>
                <motion.div
                    animate={{ rotate: isCollapsed ? 0 : 180 }}
                    transition={{ duration: 0.2 }}
                >
                    {isCollapsed ? (
                        <ChevronDown className="text-slate-400" size={20} />
                    ) : (
                        <ChevronUp className="text-slate-400" size={20} />
                    )}
                </motion.div>
            </div>

            {/* Code Content */}
            <AnimatePresence>
                {!isCollapsed && (
                    <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: 'auto' }}
                        exit={{ height: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="relative">
                            {highlightedLine && (
                                <div className="absolute top-0 left-0 right-0 px-4 py-2 bg-yellow-500/10 border-b border-yellow-500/20">
                                    <p className="text-xs text-yellow-400 font-semibold">
                                        ▶ Currently executing this block
                                    </p>
                                </div>
                            )}
                            <div className={highlightedLine ? 'mt-10' : ''}>
                                <SyntaxHighlighter
                                    language={language}
                                    style={customStyle}
                                    showLineNumbers
                                    wrapLines
                                    lineProps={lineProps}
                                >
                                    {code}
                                </SyntaxHighlighter>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

// Import missing AnimatePresence
import { AnimatePresence } from 'framer-motion';

export default CodeTracePanel;
