// Providers
import { RouterProvider } from "react-router";
import "./shared/styles/main.css";
import { StoreProvider } from "./app/stores/root.store";
import { HelmetProvider } from "react-helmet-async";
import { QueryClientProvider } from "@tanstack/react-query";
import { rootStore } from "./app/stores/store-context";

// Configs
import { router } from "./app/router";
import { queryClient } from "./shared/lib/query-client";

// Services
import {
	getAllBranches,
	getAllBusinessAreas,
} from "./shared/services/org.service";

// Components
import ErrorBoundary from "./shared/components/errors/ErrorBoundary";

// Other
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Toaster } from "sonner";
import { createRoot } from "react-dom/client";

// Initialise auth store and prefetch common data before rendering
const initialiseApp = async () => {
	await rootStore.authStore.initialise();
	await rootStore.userSearchStore.initialise();

	// Only prefetch data if user is authenticated
	// This prevents 403 errors on app load when not logged in
	if (rootStore.authStore.isAuthenticated) {
		// Prefetch branches and business areas for instant availability
		// Wait for both to complete before rendering to prevent race conditions
		await Promise.all([
			queryClient.prefetchQuery({
				queryKey: ["branches"],
				queryFn: getAllBranches,
				staleTime: 10 * 60_000,
			}),
			queryClient.prefetchQuery({
				queryKey: ["businessAreas"],
				queryFn: getAllBusinessAreas,
				staleTime: 30 * 60_000,
			}),
		]);
	}

	createRoot(document.getElementById("root")!).render(
		<ErrorBoundary>
			<StoreProvider>
				<QueryClientProvider client={queryClient}>
					<HelmetProvider>
						<RouterProvider router={router} />
						<Toaster position="top-right" richColors />
						{import.meta.env.DEV && <ReactQueryDevtools />}
					</HelmetProvider>
				</QueryClientProvider>
			</StoreProvider>
		</ErrorBoundary>
	);
};

initialiseApp();
