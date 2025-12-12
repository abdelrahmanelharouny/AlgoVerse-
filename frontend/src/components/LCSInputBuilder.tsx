import { useState } from 'react';
import { Type, ArrowRight, Sparkles } from 'lucide-react';

interface LCSInputBuilderProps {
    onInputChange: (text1: string, text2: string) => void;
}

const presets = [
    { name: 'Git Diff', text1: 'ABCDFGH', text2: 'ACDGH', description: 'Version control comparison' },
    { name: 'DNA Sequence', text1: 'AGGTAB', text2: 'GXTXAYB', description: 'Classic bioinformatics example' },
    { name: 'Spell Check', text1: 'algorithm', text2: 'altruistic', description: 'Find common letters' },
    { name: 'Short', text1: 'ABC', text2: 'AC', description: 'Simple example' },
];

const LCSInputBuilder = ({ onInputChange }: LCSInputBuilderProps) => {
    const [text1, setText1] = useState('AGGTAB');
    const [text2, setText2] = useState('GXTXAYB');

    const handleText1Change = (value: string) => {
        setText1(value.toUpperCase());
        onInputChange(value.toUpperCase(), text2);
    };

    const handleText2Change = (value: string) => {
        setText2(value.toUpperCase());
        onInputChange(text1, value.toUpperCase());
    };

    const loadPreset = (preset: typeof presets[0]) => {
        setText1(preset.text1);
        setText2(preset.text2);
        onInputChange(preset.text1, preset.text2);
    };

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-cyan-600/20 rounded-lg flex items-center justify-center">
                    <Type className="text-cyan-400" size={20} />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-white">LCS Input Builder</h3>
                    <p className="text-sm text-slate-400">Enter two strings to compare</p>
                </div>
            </div>

            {/* Presets */}
            <div className="mb-6">
                <label className="text-sm text-slate-400 mb-2 block">Quick Presets</label>
                <div className="flex flex-wrap gap-2">
                    {presets.map(preset => (
                        <button
                            key={preset.name}
                            onClick={() => loadPreset(preset)}
                            className="px-3 py-1.5 bg-slate-800 hover:bg-cyan-600/20 hover:text-cyan-400 border border-slate-700 hover:border-cyan-500/50 rounded-lg text-sm transition-all"
                            title={preset.description}
                        >
                            <Sparkles size={12} className="inline mr-1" />
                            {preset.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* String 1 */}
            <div className="mb-4">
                <label className="text-sm text-slate-400 mb-2 block">String 1</label>
                <input
                    type="text"
                    value={text1}
                    onChange={(e) => handleText1Change(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono text-lg focus:border-cyan-500 outline-none"
                    placeholder="Enter first string..."
                />
                <div className="text-xs text-slate-500 mt-1">Length: {text1.length}</div>
            </div>

            {/* String 2 */}
            <div className="mb-6">
                <label className="text-sm text-slate-400 mb-2 block">String 2</label>
                <input
                    type="text"
                    value={text2}
                    onChange={(e) => handleText2Change(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono text-lg focus:border-cyan-500 outline-none"
                    placeholder="Enter second string..."
                />
                <div className="text-xs text-slate-500 mt-1">Length: {text2.length}</div>
            </div>

            {/* Preview */}
            <div className="bg-slate-950 rounded-lg p-4">
                <div className="text-sm text-slate-400 mb-2">Comparison Preview</div>
                <div className="flex items-center gap-3">
                    <div className="font-mono text-cyan-400 text-lg tracking-wider">{text1 || '---'}</div>
                    <ArrowRight className="text-slate-500" size={20} />
                    <div className="font-mono text-purple-400 text-lg tracking-wider">{text2 || '---'}</div>
                </div>
                <div className="text-xs text-slate-500 mt-2">
                    DP Table Size: {text1.length + 1} × {text2.length + 1} = {(text1.length + 1) * (text2.length + 1)} cells
                </div>
            </div>
        </div>
    );
};

export default LCSInputBuilder;
