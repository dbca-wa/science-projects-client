import { Loader2 } from "lucide-react";

/**
 * RouteLoader Component
 * 
 * Loading fallback for lazy-loaded routes with Suspense.
 * Shows a centered spinner with a loading message.
 */
export const RouteLoader = () => {
	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
			<div className="text-center">
				<Loader2 className="mx-auto h-12 w-12 animate-spin text-blue-600 mb-4" />
				<p className="text-muted-foreground text-lg">Loading...</p>
			</div>
		</div>
	);
};
