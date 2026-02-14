import * as Sentry from "@sentry/react";
import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
	children: ReactNode;
	fallback?: ReactNode;
}

interface State {
	hasError: boolean;
	error: Error | null;
}

/**
 * Error Boundary component that catches React errors and reports them to Sentry
 *
 * This component should wrap the entire application to catch all unhandled errors.
 * It provides a fallback UI when an error occurs and automatically reports the error to Sentry.
 */
export class ErrorBoundary extends Component<Props, State> {
	constructor(props: Props) {
		super(props);
		this.state = { hasError: false, error: null };
	}

	static getDerivedStateFromError(error: Error): State {
		// Update state so the next render will show the fallback UI
		return { hasError: true, error };
	}

	componentDidCatch(error: Error, errorInfo: ErrorInfo) {
		// Capture error with Sentry
		Sentry.captureException(error, {
			contexts: {
				react: {
					componentStack: errorInfo.componentStack,
				},
			},
		});

		// Log to console in development
		if (import.meta.env.DEV) {
			console.error("Error caught by ErrorBoundary:", error, errorInfo);
		}
	}

	render() {
		if (this.state.hasError) {
			// Use custom fallback if provided, otherwise use default
			return (
				this.props.fallback || (
					<div className="flex min-h-screen items-center justify-center bg-background">
						<div className="text-center space-y-4 p-8">
							<h1 className="text-2xl font-bold text-foreground">
								Something went wrong
							</h1>
							<p className="text-muted-foreground max-w-md">
								We've been notified and are working on a fix. Please try
								reloading the page.
							</p>
							<button
								onClick={() => window.location.reload()}
								className="mt-4 rounded-md bg-primary px-6 py-2 text-primary-foreground hover:bg-primary/90 transition-colors"
							>
								Reload Page
							</button>
						</div>
					</div>
				)
			);
		}

		return this.props.children;
	}
}
