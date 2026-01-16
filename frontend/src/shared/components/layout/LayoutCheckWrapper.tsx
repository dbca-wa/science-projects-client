import { type ReactNode, useState } from "react";
import { useUIStore } from "@/app/stores/useStore";

interface LayoutCheckWrapperProps {
	children: ReactNode;
	/** Render this when layout !== "modern" (optional) */
	fallback?: ReactNode;
}

/**
 * Renders children only when the "modern" layout is active.
 * Captures layout state on mount to prevent re-renders during navigation.
 */
export const LayoutCheckWrapper = ({ children, fallback = null }: LayoutCheckWrapperProps) => {
	const uiStore = useUIStore();
	
	// Capture layout once on mount
	const [isModern] = useState(() => uiStore.layout === "modern");
	
	return <>{isModern ? children : fallback}</>;
};

LayoutCheckWrapper.displayName = "LayoutCheckWrapper";