import React, { useState } from 'react';
import { Type } from 'lucide-react';
import { motion } from 'framer-motion';

interface HuffmanInputBuilderProps {
    onInputChange: (text: string) => void;
}

export const HuffmanInputBuilder: React.FC<HuffmanInputBuilderProps> = ({ onInputChange }) => {
    const [text, setText] = useState("MISSISSIPPI RIVER");
    const [error, setError] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const val = e.target.value;
        if (val.length > 200) {
            setError("Text is too long for visualization (max 200 chars).");
        } else {
            setError(null);
        }
        setText(val);
        onInputChange(val);
    };

    return (
        <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                        <Type size={18} className="text-indigo-400" />
                        Input Text
                    </h3>
                    <span className="text-xs text-slate-500">
                        {text.length} / 200
                    </span>
                </div>

                <textarea
                    value={text}
                    onChange={handleChange}
                    className="w-full h-32 bg-slate-950 border border-slate-700 rounded-lg p-3 text-slate-100 focus:outline-none focus:border-indigo-500 transition-colors resize-none"
                    placeholder="Enter text to compress..."
                    spellCheck={false}
                />

                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-2 text-sm text-red-400"
                    >
                        {error}
                    </motion.div>
                )}

                <div className="mt-4 flex gap-2">
                    <button
                        onClick={() => { setText("MISSISSIPPI RIVER"); onInputChange("MISSISSIPPI RIVER"); }}
                        className="px-3 py-1 bg-slate-800 hover:bg-slate-700 rounded text-xs text-slate-300 transition-colors"
                    >
                        Example 1 (Mississippi)
                    </button>
                    <button
                        onClick={() => { setText("THE QUICK BROWN FOX"); onInputChange("THE QUICK BROWN FOX"); }}
                        className="px-3 py-1 bg-slate-800 hover:bg-slate-700 rounded text-xs text-slate-300 transition-colors"
                    >
                        Example 2 (Pangram)
                    </button>
                </div>
            </div>

            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
                <h4 className="text-sm font-semibold text-slate-400 mb-2">Character Frequency Review</h4>
                <div className="flex flex-wrap gap-2">
                    {text.split('').reduce((acc, char) => {
                        acc[char] = (acc[char] || 0) + 1;
                        return acc;
                    }, {} as Record<string, number>) // Basic reduce to check counts
                        && Object.entries(text.split('').reduce((acc, char) => {
                            acc[char] = (acc[char] || 0) + 1;
                            return acc;
                        }, {} as Record<string, number>)).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([char, count]) => (
                            <div key={char} className="px-2 py-1 bg-slate-800 rounded text-xs text-slate-300 border border-slate-700">
                                <span className="font-mono bg-slate-950 px-1 rounded mr-1">
                                    {char === ' ' ? '␣' : char}
                                </span>
                                <span className="text-indigo-400 font-bold">{count}</span>
                            </div>
                        ))}
                    {Object.keys(text.split('').reduce((acc, char) => { acc[char] = (acc[char] || 0) + 1; return acc; }, {} as any)).length > 10 && (
                        <span className="text-xs text-slate-500 self-center">...</span>
                    )}
                </div>
            </div>
        </div>
    );
};

export default HuffmanInputBuilder;
