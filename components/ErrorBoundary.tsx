import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    declare props: Readonly<Props>;
    public state: State = {
        hasError: false,
        error: null
    };

    constructor(props: Props) {
        super(props);
    }

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="fixed bottom-4 right-4 z-50 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg shadow-xl max-w-sm">
                    <h3 className="font-bold">Widget Error</h3>
                    <p className="text-sm mt-1">{this.state.error?.message}</p>
                </div>
            );
        }

        const { children } = this.props;
        return children;
    }
}
