import { type ReactNode } from "react";

interface ContentWrapperProps {
	children: ReactNode;
}

/**
 * ContentWrapper - Structural wrapper for page content
 * Padding is handled by layout components (ModernPageWrapper, TraditionalLayout)
 * This component only provides structural styling
 */
export function ContentWrapper({ children }: ContentWrapperProps) {
	return (
		<div className="flex-1 min-h-[70vh] h-full dark:text-gray-400">
			<div className="pb-4 h-full">{children}</div>
		</div>
	);
}

ContentWrapper.displayName = "ContentWrapper";