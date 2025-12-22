/**
 * Loading fallback component for lazy-loaded routes
 * Displays a spinner while the route component is being loaded
 */
export const LoadingFallback = () => {
  return (
    <div className="flex items-center justify-center min-h-screen w-full">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-blue-500"></div>
        <p className="text-lg text-gray-600">
          Loading...
        </p>
      </div>
    </div>
  );
};
