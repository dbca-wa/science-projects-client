// The base page that simply handles scrolling to the top of the page and setting the layout

import { useScrollToTop } from "../../lib/hooks/helper/useScrollToTop";
import { TraditionalLayout } from "./TraditionalLayout";
import { ModernLayout } from "./ModernLayout";
import { useLayoutSwitcher } from "../../lib/hooks/helper/LayoutSwitcherContext";
import { ProtectedPage } from "../Wrappers/ProtectedPage";

export const Root = () => {
  const { layout } = useLayoutSwitcher();
  useScrollToTop();
  return (
    <>
      {/* <ProtectedPage> */}
      {layout === "modern" ? <ModernLayout /> : <TraditionalLayout />}
      {/* </ProtectedPage> */}
    </>
  );
};
