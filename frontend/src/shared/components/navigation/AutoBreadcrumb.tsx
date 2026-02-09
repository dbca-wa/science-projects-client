import { Breadcrumb, type BreadcrumbItem } from "./Breadcrumb";
import { useBreadcrumbs } from "@/shared/hooks/useBreadcrumbs";

interface AutoBreadcrumbProps {
  /**
   * Optional override items - if provided, these will be used instead of auto-generated ones
   */
  overrideItems?: BreadcrumbItem[];
  
  className?: string;
}

/**
 * AutoBreadcrumb - Automatically generates breadcrumbs from route config
 * 
 * Features:
 * - Automatic breadcrumb generation from route configuration
 * - Optional manual override for custom breadcrumbs (useful for dynamic content)
 * - Respects showBreadcrumb and breadcrumbParent route config
 */
export const AutoBreadcrumb = ({ overrideItems, className }: AutoBreadcrumbProps) => {
  const breadcrumbItems = useBreadcrumbs(overrideItems);

  // Don't render if no breadcrumbs
  if (breadcrumbItems.length === 0) {
    return null;
  }

  return <Breadcrumb items={breadcrumbItems} className={className} />;
};