// The base page that handles scrolling to the top

import { AppLayout } from "./AppLayout";
import { useScrollToTop } from "@/shared/hooks/ui/useScrollToTop";
import { UserDataLoader } from "@/app/components/UserDataLoader";

/**
 * Root component
 * Base layout component that renders the main application layout
 *
 * Features:
 * - Loads user data at app level via UserDataLoader
 * - Renders AppLayout for all pages (NavigationBlocker is rendered inside AppLayout)
 */
export function Root() {
	useScrollToTop();

	return (
		<UserDataLoader>
			<AppLayout />
		</UserDataLoader>
	);
}

Root.displayName = "Root";
