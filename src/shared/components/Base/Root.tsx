// The base page that simply handles scrolling to the top of the page and setting the layout

import { EditorProvider } from "@/shared/hooks/helper/EditorBlockerContext";
import { useLayoutSwitcher } from "@/shared/hooks/helper/LayoutSwitcherContext";
import { useScrollToTop } from "@/shared/hooks/helper/useScrollToTop";
import { ModernLayout } from "./ModernLayout";
import { TraditionalLayout } from "./TraditionalLayout";

export const Root = () => {
  const { layout } = useLayoutSwitcher();
  useScrollToTop();
  return (
    <EditorProvider>
      {/* <ProtectedPage> */}
      {layout === "modern" ? <ModernLayout /> : <TraditionalLayout />}
      {/* </ProtectedPage> */}
    </EditorProvider>
  );
};
