// The base page that simply handles scrolling to the top of the page and setting the layout

import { EditorProvider } from "@/lib/hooks/helper/EditorBlockerContext";
import { useScrollToTop } from "@/lib/hooks/helper/useScrollToTop";
import { ModernLayout } from "./modern/ModernLayout";
import { TraditionalLayout } from "./traditional/TraditionalLayout";
import { observer } from "mobx-react-lite";
import { useStore } from "@/app/stores/useStore";

export const Root = observer(() => {
	useScrollToTop();

	const { uiStore } = useStore();

	//   const { layout } = useLayoutSwitcher();

	// const {layout} =

	return (
		<EditorProvider>
			{/* <ProtectedPage> */}
			{uiStore.layout === "modern" ? (
				<ModernLayout />
			) : (
				<TraditionalLayout />
			)}
			{/* </ProtectedPage> */}
		</EditorProvider>
	);
});
