// The base page that handles scrolling to the top and setting the layout

import { ModernLayout } from "./modern/ModernLayout";
// TEMPORARILY DISABLED - TraditionalLayout moved to to_be_implemented
// import { TraditionalLayout } from "./traditional/TraditionalLayout";
import { observer } from "mobx-react-lite";
// import { useUIStore } from "@/app/stores/useStore"; // Not needed for baseline
import { useScrollToTop } from "@/shared/hooks/ui/useScrollToTop";
import { NavigationBlocker } from "./NavigationBlocker";

export const Root = observer(() => {
	useScrollToTop();
	// const uiStore = useUIStore(); // Not needed for baseline - only modern layout supported

	return (
		<>
			{/* Navigation blocker for unsaved editor changes */}
			<NavigationBlocker />

			{/* Render layout based on user preference */}
			{/* For baseline, only modern layout is supported */}
			<ModernLayout />
		</>
	);
});

Root.displayName = "Root";
