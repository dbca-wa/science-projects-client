// The base page that handles scrolling to the top

import { AppLayout } from "./AppLayout";
import { PageHead } from "./PageHead";
import { useScrollToTop } from "@/shared/hooks/ui/useScrollToTop";
import { NavigationBlocker } from "./NavigationBlocker";
import { UserDataLoader } from "@/app/components/UserDataLoader";

/**
 * Root component
 * Base layout component that renders the main application layout
 * 
 * Features:
 * - Loads user data at app level via UserDataLoader
 * - Renders AppLayout for all pages
 * - Includes NavigationBlocker for unsaved changes
 */
export function Root() {
  useScrollToTop();

  return (
    <UserDataLoader>
      {/* Default PageHead - pages can override with their own PageHead */}
      <PageHead />
      
      {/* Navigation blocker for unsaved editor changes */}
      <NavigationBlocker />

      {/* Render application layout */}
      <AppLayout />
    </UserDataLoader>
  );
}

Root.displayName = "Root";
