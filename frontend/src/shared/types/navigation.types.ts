/**
 * TypeScript type definitions for navigation events and handlers
 */

// Navigation event types
export interface NavigationMouseEvent extends MouseEvent {
	ctrlKey: boolean;
	metaKey: boolean;
}

export interface NavigationKeyboardEvent extends KeyboardEvent {
	ctrlKey: boolean;
	metaKey: boolean;
}

// Navigation handler types
export type NavigationEventHandler = (event: NavigationMouseEvent) => void;
export type KeyboardNavigationHandler = (
	event: NavigationKeyboardEvent
) => void;

// Component prop types
export interface NavigationProps {
	targetPath: string;
	onStandardNavigation?: () => void;
	children: React.ReactNode;
	className?: string;
}

// Enhanced component props
export interface EnhancedDashboardActionCardProps {
	targetPath?: string;
	onClick?: () => void;
	onCtrlClick?: () => void;
}

export interface EnhancedNavLinkProps {
	to: string;
	children: React.ReactNode;
	className?: string | ((props: { isActive: boolean }) => string);
	end?: boolean;
}

// Hook options and return types
export interface UseNavigationOptions {
	targetPath: string;
	onStandardNavigation?: () => void;
}

export interface NavigationHandlers {
	onClick: (event: React.MouseEvent) => void;
	onKeyDown?: (event: React.KeyboardEvent) => void;
}
