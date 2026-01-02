import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router";
import "./shared/styles/index.css";
import { StoreProvider } from "./app/stores/root.store";
import { router } from "./app/router";

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<StoreProvider>
			<RouterProvider router={router} />
		</StoreProvider>
	</StrictMode>
);
