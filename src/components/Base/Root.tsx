// The base page that simply handles scrolling to the top of the page and setting the layout

import { useScrollToTop } from "../../lib/hooks/useScrollToTop";
import { TraditionalLayout } from "./TraditionalLayout";
import { ModernLayout } from "./ModernLayout";
import { useLayoutSwitcher } from "../../lib/hooks/LayoutSwitcherContext";


export const Root = () => {
    const { layout } = useLayoutSwitcher();
    useScrollToTop();
    return (
        <>
            {layout === 'modern' ? <ModernLayout /> : <TraditionalLayout />}
        </>
    )
}