import { type ReactNode } from "react";
import { observer } from "mobx-react-lite";
import { useUIStore } from "@/app/stores/useStore";
import { cn } from "@/shared/lib/utils";

interface ContentWrapperProps {
	children: ReactNode;
}

/**
 * Provides consistent page padding and height between two layouts.
 */
export const ContentWrapper = observer(({ children }: ContentWrapperProps) => {
	const uiStore = useUIStore();

	const isTraditional = uiStore.layout === "traditional";

	return (
		<div
			className={cn(
				"py-4 flex-1 min-h-[70vh] h-full dark:text-gray-400",
				isTraditional ? "px-0" : "px-9"
			)}
		>
			<div className={"pb-4 h-full"}>{children}</div>
		</div>
	);
});

ContentWrapper.displayName = "ContentWrapper";
