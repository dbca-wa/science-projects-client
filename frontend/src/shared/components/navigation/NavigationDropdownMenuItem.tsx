import { forwardRef } from "react";
import { DropdownMenuItem } from "@/shared/components/ui/dropdown-menu";
import { useNavigationHandler } from "@/shared/hooks/useNavigationHandler";
import type { ComponentProps } from "react";

interface NavigationDropdownMenuItemProps extends Omit<ComponentProps<typeof DropdownMenuItem>, 'onClick' | 'asChild'> {
  targetPath: string;
  onClick?: () => void;
  children: React.ReactNode;
}

/**
 * NavigationDropdownMenuItem - Enhanced dropdown menu item with Ctrl+Click support
 * 
 * Uses <a> tag with href to enable natural browser Ctrl+Click behavior
 * while intercepting standard clicks for React Router navigation.
 */
export const NavigationDropdownMenuItem = forwardRef<HTMLDivElement, NavigationDropdownMenuItemProps>(
  ({ targetPath, onClick: onStandardNavigation, children, className, ...props }, ref) => {
    const handleClick = useNavigationHandler(targetPath, onStandardNavigation);

    return (
      <DropdownMenuItem ref={ref} className={className} {...props}>
        <a
          href={targetPath}
          onClick={handleClick}
          className="flex items-center w-full no-underline"
        >
          {children}
        </a>
      </DropdownMenuItem>
    );
  }
);

NavigationDropdownMenuItem.displayName = "NavigationDropdownMenuItem";