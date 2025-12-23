// The base page that simply handles scrolling to the top of the page and setting the layout

import { EditorProvider } from "@/shared/providers/EditorProvider";
import { useLayoutSwitcher } from "@/shared/hooks/useLayout";
import { useScrollToTop } from "@/shared/hooks/useScrollToTop";
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
