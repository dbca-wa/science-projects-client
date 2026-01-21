// The base page that handles scrolling to the top and setting the layout

import { ModernLayout } from "./modern/ModernLayout";
import { TraditionalLayout } from "./traditional/TraditionalLayout";
import { PageHead } from "./PageHead";
import { observer } from "mobx-react-lite";
import { useUIStore } from "@/app/stores/store-context";
import { useScrollToTop } from "@/shared/hooks/ui/useScrollToTop";
import { NavigationBlocker } from "./NavigationBlocker";
import { UserDataLoader } from "@/app/components/UserDataLoader";

/**
 * LayoutSwitcher - Isolated observer component that only reacts to layout changes
 */
const LayoutSwitcher = observer(() => {
  const uiStore = useUIStore();
  return uiStore.layout === "modern" ? <ModernLayout /> : <TraditionalLayout />;
});

LayoutSwitcher.displayName = "LayoutSwitcher";

/**
 * Root component
 * Base layout component that handles layout switching
 * 
 * NOT wrapped with observer to prevent cascading re-renders
 * Only LayoutSwitcher child is observer for layout reactivity
 * 
 * Features:
 * - Loads user data at app level via UserDataLoader
 * - Conditionally renders ModernLayout or TraditionalLayout
 * - Based on uiStore.layout preference
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

      {/* Render layout based on user preference */}
      <LayoutSwitcher />
    </UserDataLoader>
  );
}

Root.displayName = "Root";
