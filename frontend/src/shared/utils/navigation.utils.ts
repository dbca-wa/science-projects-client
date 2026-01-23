/**
 * Navigation utilities for handling ctrl/cmd+click to open in new tab
 */

/**
 * Handle navigation with support for opening in new tab
 * @param event - Mouse event from click
 * @param path - Path to navigate to
 * @param navigate - React Router navigate function
 * 
 * @example
 * ```tsx
 * <button onClick={(e) => handleNavigation(e, '/users', navigate)}>
 *   Users
 * </button>
 * ```
 */
export const handleNavigation = (
  event: React.MouseEvent,
  path: string,
  navigate: (path: string) => void
): void => {
  // Check if ctrl/cmd key is pressed or middle mouse button
  if (event.ctrlKey || event.metaKey || event.button === 1) {
    // Open in new tab
    window.open(path, "_blank");
  } else if (event.button === 0) {
    // Normal left click - use React Router navigation
    event.preventDefault();
    navigate(path);
  }
};

/**
 * Get props for a clickable element that supports ctrl/cmd+click
 * @param path - Path to navigate to
 * @param navigate - React Router navigate function
 * @returns Props object with onClick and onAuxClick handlers
 * 
 * @example
 * ```tsx
 * <div {...getNavigationProps('/users', navigate)}>
 *   Users
 * </div>
 * ```
 */
export const getNavigationProps = (
  path: string,
  navigate: (path: string) => void
) => ({
  onClick: (e: React.MouseEvent) => handleNavigation(e, path, navigate),
  onAuxClick: (e: React.MouseEvent) => {
    // Handle middle mouse button click
    if (e.button === 1) {
      e.preventDefault();
      window.open(path, "_blank");
    }
  },
  style: { cursor: "pointer" },
});
