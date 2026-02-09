import { cn } from "@/shared/lib/utils";
import { useNavigationHandler } from "@/shared/hooks/useNavigationHandler";

export interface BreadcrumbItem {
  title: string;
  link?: string;
}

interface BreadcrumbProps {
  items?: BreadcrumbItem[];
  className?: string;
}

/**
 * Enhanced breadcrumb link component with Ctrl+Click support
 */
const BreadcrumbLink = ({ to, children, ...props }: { to: string; children: React.ReactNode; className?: string }) => {
  const handleClick = useNavigationHandler(to);

  return (
    <a
      href={to}
      onClick={handleClick}
      className={cn("no-underline", props.className)}
    >
      {children}
    </a>
  );
};

/**
 * Breadcrumb component
 * Displays hierarchical navigation path
 */
export const Breadcrumb = ({ items = [], className }: BreadcrumbProps) => {
  return (
    <nav
      aria-label="Breadcrumb"
      className={cn(
        "flex items-center text-sm mb-6 px-4 py-2 rounded-md bg-gray-100 dark:bg-gray-700 min-w-0",
        className
      )}
    >
      {/* Home link */}
      <BreadcrumbLink
        to="/"
        className="text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 transition-colors flex-shrink-0"
      >
        Home
      </BreadcrumbLink>

      {/* Breadcrumb items */}
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <div key={index} className={cn(
            "flex items-center",
            isLast ? "min-w-0 flex-1" : "flex-shrink-0"
          )}>
            {/* Separator */}
            <span className="mx-2 text-gray-700 dark:text-gray-400 flex-shrink-0">/</span>

            {/* Item */}
            {isLast || !item.link ? (
              <span className={cn(
                "text-gray-700 dark:text-gray-300",
                isLast && "truncate min-w-0"
              )}>
                {item.title}
              </span>
            ) : (
              <BreadcrumbLink
                to={item.link}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 transition-colors flex-shrink-0"
              >
                {item.title}
              </BreadcrumbLink>
            )}
          </div>
        );
      })}
    </nav>
  );
};