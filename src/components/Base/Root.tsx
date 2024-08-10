// The base page that simply handles scrolling to the top of the page and setting the layout

import { useScrollToTop } from "../../lib/hooks/helper/useScrollToTop";
import { TraditionalLayout } from "./TraditionalLayout";
import { ModernLayout } from "./ModernLayout";
import { useLayoutSwitcher } from "../../lib/hooks/helper/LayoutSwitcherContext";
import { ProtectedPage } from "../Wrappers/ProtectedPage";
import { EditorProvider } from "@/lib/hooks/helper/EditorBlockerContext";

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
