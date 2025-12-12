import { useCallback } from 'react';

const useSound = () => {
    // In a real app, we would load actual audio files. 
    // For now, we'll use a simple Web Audio API synth for "beeps" and "boops" 
    // to avoid needing external assets.

    const playTone = useCallback((frequency: number, type: OscillatorType, duration: number) => {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContext) return;

        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.frequency.value = frequency;
        osc.type = type;

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start();

        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + duration);

        osc.stop(ctx.currentTime + duration);
    }, []);

    const playClick = () => playTone(600, 'sine', 0.1);
    const playSuccess = () => {
        playTone(600, 'sine', 0.1);
        setTimeout(() => playTone(800, 'sine', 0.2), 100);
    };
    const playError = () => {
        playTone(300, 'sawtooth', 0.2);
        setTimeout(() => playTone(200, 'sawtooth', 0.2), 150);
    };
    const playStep = () => playTone(400, 'sine', 0.05);

    return {
        playClick,
        playSuccess,
        playError,
        playStep,
        playComplete: playSuccess, // Alias
        playPerfect: playSuccess   // Alias
    };
};

export default useSound;
