import { Link } from "react-router";
import { cn } from "@/shared/lib/utils";

export interface BreadcrumbItem {
  title: string;
  link?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

/**
 * Breadcrumb component
 * Displays hierarchical navigation path
 */
export const Breadcrumb = ({ items, className }: BreadcrumbProps) => {
  return (
    <nav
      aria-label="Breadcrumb"
      className={cn(
        "flex items-center text-sm mb-6 px-4 py-2 rounded-md bg-gray-100 dark:bg-gray-700",
        className
      )}
    >
      {/* Home link */}
      <Link
        to="/"
        className="text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 transition-colors"
        aria-label="Home"
      >
        Home
      </Link>

      {/* Breadcrumb items */}
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <div key={index} className="flex items-center">
            {/* Separator */}
            <span className="mx-2 text-gray-700 dark:text-gray-400">/</span>

            {/* Item */}
            {isLast || !item.link ? (
              <span className="text-gray-700 dark:text-gray-300">
                {item.title}
              </span>
            ) : (
              <Link
                to={item.link}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 transition-colors"
              >
                {item.title}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
};
