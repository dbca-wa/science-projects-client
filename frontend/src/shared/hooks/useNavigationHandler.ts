import { useNavigate } from "react-router";
import { hasModifierKey } from "@/shared/utils/navigation.utils";

/**
 * Custom hook for handling navigation with Ctrl+Click support
 * 
 * Returns a click handler that:
 * - Allows browser to handle Ctrl+Click naturally (opens new tab)
 * - Uses React Router for standard clicks
 * 
 * @param targetPath - The path to navigate to
 * @param onStandardNavigation - Optional callback for standard clicks
 * @returns Click handler function
 */
export const useNavigationHandler = (
  targetPath: string,
  onStandardNavigation?: () => void
) => {
  const navigate = useNavigate();

  return (event: React.MouseEvent) => {
    // For targetPath, let the browser handle Ctrl+Click naturally
    if (!hasModifierKey(event.nativeEvent)) {
      // Only prevent default for standard clicks to use React Router
      event.preventDefault();
      if (onStandardNavigation) {
        onStandardNavigation();
      } else {
        navigate(targetPath);
      }
    }
    // For Ctrl+Click, let the browser handle it naturally via href
  };
};