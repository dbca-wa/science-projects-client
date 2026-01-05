import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router";
import "./shared/styles/index.css";
import { StoreProvider } from "./app/stores/root.store";
import { router } from "./app/router";
import { HelmetProvider } from "react-helmet-async";

createRoot(document.getElementById("root")!).render(
	<StoreProvider>
		<HelmetProvider>
			<RouterProvider router={router} />
		</HelmetProvider>
	</StoreProvider>
);
