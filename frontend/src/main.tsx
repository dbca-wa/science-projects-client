import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./shared/styles/index.css";
import { Button } from "./shared/components/ui/button";

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<p className="text-red-500">Hello</p>
		<Button className="cursor-pointer" variant={"destructive"}>
			Testing
		</Button>
	</StrictMode>
);
