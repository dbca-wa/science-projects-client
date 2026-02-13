import React from "react";
import ErrorScreen from "./ErrorScreen";

interface Props {
	children: React.ReactNode;
	isSuperuser?: boolean;
}

interface State {
	hasError: boolean;
	error: Error | null;
}

class ErrorBoundary extends React.Component<Props, State> {
	constructor(props: Props) {
		super(props);
		this.state = { hasError: false, error: null };
	}

	static getDerivedStateFromError(error: Error): State {
		return { hasError: true, error };
	}

	componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
		// Hook: send to telemetry here
		console.error("Error caught by boundary:", error, errorInfo);
	}

	render() {
		if (this.state.hasError) {
			return (
				<ErrorScreen
					code={500}
					message="An unexpected error occurred"
					error={this.state.error}
					showDetails={this.props.isSuperuser}
					onReload={() => window.location.reload()}
					onHome={() => (window.location.href = "/")}
				/>
			);
		}
		return this.props.children;
	}
}

export default ErrorBoundary;
