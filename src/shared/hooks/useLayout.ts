import { observer } from "mobx-react-lite";
import { useUIStore } from "@/app/providers/store.provider";
import type { Layout } from "@/app/stores/ui.store";

interface ILayoutHook {
  layout: Layout;
  switchLayout: () => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

/**
 * Hook to access layout functionality using MobX UIStore
 * Provides the same interface as the previous LayoutSwitcherContext for easy migration
 */
export const useLayout = (): ILayoutHook => {
  const uiStore = useUIStore();

  return {
    layout: uiStore.layout,
    switchLayout: uiStore.switchLayout,
    loading: uiStore.layoutLoading,
    setLoading: uiStore.setLayoutLoading,
  };
};

// Export an observer-wrapped version for components that need reactive updates
export const useLayoutObserver = observer(useLayout);

// Export the hook with the same name as the context hook for easy migration
export const useLayoutSwitcher = useLayout;