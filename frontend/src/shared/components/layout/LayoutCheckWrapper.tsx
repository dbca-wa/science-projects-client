// components/Wrappers/LayoutCheckWrapper.tsx
import { type ReactNode } from "react";
import { observer } from "mobx-react-lite";
import { useUIStore } from "@/app/stores/useStore";

interface LayoutCheckWrapperProps {
	children: ReactNode;
	/** Render this when layout !== "modern" (optional) */
	fallback?: ReactNode;
}

/**
 * Renders children only when the "modern" layout is active.
 * Observes uiStore.layout via MobX.
 */
export const LayoutCheckWrapper = observer(
	({ children, fallback = null }: LayoutCheckWrapperProps) => {
		const uiStore = useUIStore();
		const isModern = uiStore.layout === "modern";
		return <>{isModern ? children : fallback}</>;
	}
);

LayoutCheckWrapper.displayName = "LayoutCheckWrapper";
