import { useEffect } from 'react';

interface UseKeyboardShortcutsProps {
    onPlayPause?: () => void;
    onNext?: () => void;
    onPrev?: () => void;
    onReset?: () => void;
    enabled?: boolean;
}

export const useKeyboardShortcuts = ({
    onPlayPause,
    onNext,
    onPrev,
    onReset,
    enabled = true
}: UseKeyboardShortcutsProps) => {
    useEffect(() => {
        if (!enabled) return;

        const handleKeyPress = (e: KeyboardEvent) => {
            // Ignore if user is typing in an input
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
                return;
            }

            switch (e.key.toLowerCase()) {
                case ' ':
                case 'k':
                    e.preventDefault();
                    onPlayPause?.();
                    break;
                case 'arrowright':
                case 'l':
                    e.preventDefault();
                    onNext?.();
                    break;
                case 'arrowleft':
                case 'j':
                    e.preventDefault();
                    onPrev?.();
                    break;
                case 'r':
                    e.preventDefault();
                    onReset?.();
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [onPlayPause, onNext, onPrev, onReset, enabled]);
};
