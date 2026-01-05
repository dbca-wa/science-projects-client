// Providers
import { RouterProvider } from "react-router";
import "./shared/styles/index.css";
import { StoreProvider } from "./app/stores/root.store";
import { HelmetProvider } from "react-helmet-async";
import { QueryClientProvider } from "@tanstack/react-query";

// Configs
import { router } from "./app/router";
import { queryClient } from "./shared/lib/query-client";

// Other
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Toaster } from "sonner";
import { createRoot } from "react-dom/client";

createRoot(document.getElementById("root")!).render(
	<StoreProvider>
		<QueryClientProvider client={queryClient}>
			<HelmetProvider>
				<RouterProvider router={router} />
				<Toaster position="top-right" richColors />
				<ReactQueryDevtools />
			</HelmetProvider>
		</QueryClientProvider>
	</StoreProvider>
);
