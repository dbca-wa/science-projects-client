/**
 * Navigation Components
 * 
 * Centralized exports for all navigation-related components
 * that support Ctrl+Click functionality.
 */

export { NavigationButton } from "./NavigationButton";
export { NavigationDropdownMenuItem } from "./NavigationDropdownMenuItem";
export { Breadcrumb } from "./Breadcrumb";
export { AutoBreadcrumb } from "./AutoBreadcrumb";

// Re-export the navigation hook for convenience
export { useNavigationHandler } from "../../hooks/useNavigationHandler";