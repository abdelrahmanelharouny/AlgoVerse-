import { Component } from 'react';
import type { ReactNode, ErrorInfo } from 'react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Error caught by boundary:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-8">
                    <div className="max-w-2xl w-full bg-slate-900 border border-red-500/30 rounded-xl p-8">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center">
                                <span className="text-2xl">⚠️</span>
                            </div>
                            <h2 className="text-2xl font-bold text-red-400">Something Went Wrong</h2>
                        </div>
                        <div className="bg-slate-950 rounded-lg p-4 mb-4">
                            <pre className="text-sm text-red-300 overflow-auto">
                                {this.state.error?.message || 'Unknown error'}
                            </pre>
                        </div>
                        <div className="text-slate-400 text-sm">
                            <p>Check the browser console for more details.</p>
                            <button
                                onClick={() => window.location.reload()}
                                className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors"
                            >
                                Reload Page
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
