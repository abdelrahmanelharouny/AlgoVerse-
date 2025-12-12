import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, RefreshCw, Coins } from 'lucide-react';

interface CoinChangeInputBuilderProps {
    onInputChange: (coins: number[], amount: number) => void;
}

const CoinChangeInputBuilder: React.FC<CoinChangeInputBuilderProps> = ({ onInputChange }) => {
    const [amount, setAmount] = useState(30);
    const [coins, setCoins] = useState<number[]>([1, 2, 5]);

    useEffect(() => {
        onInputChange(coins, amount);
    }, [coins, amount, onInputChange]);

    const addCoin = () => {
        const newCoin = Math.max(...coins, 0) + 1;
        setCoins([...coins, newCoin].sort((a, b) => a - b));
    };

    const removeCoin = (index: number) => {
        setCoins(coins.filter((_, i) => i !== index));
    };

    const updateCoin = (index: number, value: number) => {
        const newCoins = [...coins];
        newCoins[index] = Math.max(1, value);
        setCoins(newCoins.sort((a, b) => a - b));
    };

    const generateRandom = () => {
        const newAmount = Math.floor(Math.random() * 50) + 10;
        const numCoins = Math.floor(Math.random() * 4) + 2; // 2 to 5 coins
        const newCoins = Array.from({ length: numCoins }, () => Math.floor(Math.random() * 10) + 1);
        // Ensure 1 is always present for guaranteed solution (optional, but good for demos)
        if (!newCoins.includes(1)) newCoins.push(1);

        setAmount(newAmount);
        setCoins([...new Set(newCoins)].sort((a, b) => a - b));
    };

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Coins className="text-yellow-500" />
                    Coin Configuration
                </h2>
                <button
                    onClick={generateRandom}
                    className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
                    title="Randomize"
                >
                    <RefreshCw size={18} />
                </button>
            </div>

            {/* Target Amount Slider */}
            <div className="space-y-3">
                <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Target Amount</span>
                    <span className="text-white font-mono">{amount}</span>
                </div>
                <input
                    type="range"
                    min="1"
                    max="100"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-yellow-500"
                />
            </div>

            {/* Coins List */}
            <div className="space-y-4">
                <div className="flex items-center justify-between text-sm text-slate-400">
                    <span>Denominations</span>
                    <span>{coins.length} coins</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <AnimatePresence mode="popLayout">
                        {coins.map((coin, index) => (
                            <motion.div
                                key={`${index}-${coin}`}
                                layout
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                className="bg-slate-800/50 border border-slate-700 rounded-lg p-3 flex items-center gap-3 group"
                            >
                                <div className="w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center text-yellow-500 font-bold text-sm">
                                    {coin}
                                </div>
                                <input
                                    type="number"
                                    value={coin}
                                    onChange={(e) => updateCoin(index, Number(e.target.value))}
                                    className="w-full bg-transparent border-none focus:ring-0 text-white font-mono text-sm p-0"
                                    min="1"
                                />
                                <button
                                    onClick={() => removeCoin(index)}
                                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/20 hover:text-red-400 rounded transition-all"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    <motion.button
                        layout
                        onClick={addCoin}
                        className="border-2 border-dashed border-slate-700 hover:border-slate-600 rounded-lg p-3 flex items-center justify-center text-slate-500 hover:text-slate-300 transition-colors"
                    >
                        <Plus size={20} />
                    </motion.button>
                </div>
            </div>
        </div>
    );
};

export default CoinChangeInputBuilder;
