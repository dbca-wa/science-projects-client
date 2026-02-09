import React from "react";
import { Button } from "@/shared/components/ui/button";

interface MapErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface MapErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error?: Error; resetError: () => void }>;
}

/**
 * MapErrorBoundary component
 * 
 * Error boundary specifically designed for map components.
 * Catches JavaScript errors in the map component tree and displays
 * a user-friendly fallback UI.
 * 
 * Features:
 * - Catches and handles map-related errors
 * - Provides user-friendly error messages
 * - Offers retry functionality
 * - Logs errors for debugging
 * - Custom fallback component support
 */
export class MapErrorBoundary extends React.Component<
  MapErrorBoundaryProps,
  MapErrorBoundaryState
> {
  constructor(props: MapErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): MapErrorBoundaryState {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error for debugging
    console.error("Map Error Boundary caught an error:", error, errorInfo);
    
    // You could also log to an error reporting service here
    // errorReportingService.captureException(error, { extra: errorInfo });
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return (
          <FallbackComponent 
            error={this.state.error} 
            resetError={this.resetError} 
          />
        );
      }

      // Default fallback UI
      return (
        <div className="flex-1 flex items-center justify-center bg-muted">
          <div className="text-center space-y-4 max-w-md p-6">
            <div className="text-6xl">🗺️</div>
            <div className="text-lg font-medium text-red-600">
              Map Error
            </div>
            <div className="text-sm text-muted-foreground">
              Something went wrong while loading the map. This might be due to a 
              browser compatibility issue or a temporary problem.
            </div>
            <div className="space-y-2">
              <Button 
                onClick={this.resetError}
                variant="outline"
                className="mr-2"
              >
                Try Again
              </Button>
              <Button 
                onClick={() => window.location.reload()}
                variant="default"
              >
                Refresh Page
              </Button>
            </div>
            {this.state.error && (
              <details className="text-left mt-4">
                <summary className="text-xs text-muted-foreground cursor-pointer">
                  Technical Details
                </summary>
                <pre className="text-xs text-muted-foreground mt-2 p-2 bg-muted rounded overflow-auto">
                  {this.state.error.message}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Default fallback component for map errors
 */
export const MapErrorFallback: React.FC<{ 
  error?: Error; 
  resetError: () => void 
}> = ({ error, resetError }) => (
  <div className="flex-1 flex items-center justify-center bg-muted">
    <div className="text-center space-y-4 max-w-md p-6">
      <div className="text-6xl">🗺️</div>
      <div className="text-lg font-medium text-red-600">
        Map Unavailable
      </div>
      <div className="text-sm text-muted-foreground">
        The map component encountered an error and couldn't load properly. 
        Please try refreshing the page or contact support if the problem persists.
      </div>
      <div className="space-y-2">
        <Button 
          onClick={resetError}
          variant="outline"
          className="mr-2"
        >
          Retry
        </Button>
        <Button 
          onClick={() => window.location.reload()}
          variant="default"
        >
          Refresh Page
        </Button>
      </div>
      {error && (
        <details className="text-left mt-4">
          <summary className="text-xs text-muted-foreground cursor-pointer">
            Error Details
          </summary>
          <pre className="text-xs text-muted-foreground mt-2 p-2 bg-muted rounded overflow-auto max-h-32">
            {error.stack || error.message}
          </pre>
        </details>
      )}
    </div>
  </div>
);