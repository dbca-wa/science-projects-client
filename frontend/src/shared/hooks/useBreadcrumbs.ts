import { useLocation, useParams } from "react-router";
import { ALL_FLATTENED_ROUTES, type RouteConfig } from "@/app/router/routes.config";
import type { BreadcrumbItem } from "@/shared/components/navigation/Breadcrumb";

/**
 * Hook to generate breadcrumbs from route configuration
 * 
 * @param overrideItems - Optional manual breadcrumb items to override automatic generation
 * @returns Breadcrumb items array
 */
export const useBreadcrumbs = (overrideItems?: BreadcrumbItem[]): BreadcrumbItem[] => {
  const location = useLocation();
  const params = useParams();

  // If override items are provided, use them
  if (overrideItems) {
    return overrideItems;
  }

  // Find current route config
  const currentRoute = findMatchingRoute(location.pathname);
  
  // If no route found or breadcrumbs disabled, return empty
  if (!currentRoute || currentRoute.showBreadcrumb === false) {
    return [];
  }

  // Build breadcrumb trail intelligently
  return buildBreadcrumbTrail(location.pathname, currentRoute, params);
};

/**
 * Build intelligent breadcrumb trail based on URL structure and route config
 */
function buildBreadcrumbTrail(pathname: string, currentRoute: RouteConfig, params: Record<string, string | undefined>): BreadcrumbItem[] {
  const breadcrumbs: BreadcrumbItem[] = [];
  
  // Handle specific patterns for better UX
  
  // Pattern: /users/:id/details -> Users > [User Name]
  if (pathname.match(/^\/users\/\d+\/details$/)) {
    breadcrumbs.push(
      { title: "Users", link: "/users" },
      { title: "User" } // Will be enhanced by page if needed
    );
    return breadcrumbs;
  }
  
  // Pattern: /users/:id/edit -> Users > [User Name] > Edit
  if (pathname.match(/^\/users\/\d+\/edit$/)) {
    breadcrumbs.push(
      { title: "Users", link: "/users" },
      { title: "User", link: `/users/${params.id}/details` }, // Link to details page, not sheet
      { title: "Edit" }
    );
    return breadcrumbs;
  }
  
  // Pattern: /projects/:id/edit -> Projects > [Project Name] > Edit
  if (pathname.match(/^\/projects\/\d+\/edit$/)) {
    breadcrumbs.push(
      { title: "Projects", link: "/projects" },
      { title: "Project", link: `/projects/${params.id}` },
      { title: "Edit" }
    );
    return breadcrumbs;
  }
  
  // Pattern: /projects/:id/* -> Projects > [Project Name] > [Tab]
  if (pathname.match(/^\/projects\/\d+\//)) {
    const tabName = getProjectTabName(pathname);
    breadcrumbs.push(
      { title: "Projects", link: "/projects" },
      { title: "Project", link: `/projects/${params.id}` },
      { title: tabName }
    );
    return breadcrumbs;
  }
  
  // Pattern: /users/me/* -> My Profile > [Section]
  if (pathname.startsWith('/users/me/')) {
    const section = pathname.split('/').pop();
    const sectionTitle = section === 'profile' ? 'Edit Profile' : 
                        section === 'caretaker' ? 'Caretaker Mode' :
                        section === 'staff-profile' ? 'Public Profile' : 'Section';
    breadcrumbs.push(
      { title: "My Profile", link: "/users/me" },
      { title: sectionTitle }
    );
    return breadcrumbs;
  }
  
  // Fallback: Use breadcrumbParent if specified
  if (currentRoute.breadcrumbParent) {
    const parentRoute = ALL_FLATTENED_ROUTES.find(r => r.path === currentRoute.breadcrumbParent);
    if (parentRoute) {
      breadcrumbs.push({
        title: parentRoute.name,
        link: parentRoute.path
      });
    }
  }

  // Add current page (no link for current page)
  breadcrumbs.push({
    title: currentRoute.name
  });

  return breadcrumbs;
}

/**
 * Get project tab name from pathname
 */
function getProjectTabName(pathname: string): string {
  if (pathname.includes('/overview')) return 'Overview';
  if (pathname.includes('/concept')) return 'Concept Plan';
  if (pathname.includes('/project')) return 'Project Plan';
  if (pathname.includes('/progress')) return 'Progress Reports';
  if (pathname.includes('/student')) return 'Student Reports';
  if (pathname.includes('/closure')) return 'Project Closure';
  return 'Project';
}

/**
 * Find the best matching route for the current path
 * Handles dynamic routes like /users/:id
 */
function findMatchingRoute(pathname: string): RouteConfig | undefined {
  // First try exact match
  let route = ALL_FLATTENED_ROUTES.find(r => r.path === pathname);
  if (route) return route;

  // Then try dynamic route matching
  for (const routeConfig of ALL_FLATTENED_ROUTES) {
    if (routeConfig.path.includes(':')) {
      const routePattern = routeConfig.path.replace(/:[^/]+/g, '[^/]+');
      const regex = new RegExp(`^${routePattern}$`);
      if (regex.test(pathname)) {
        return routeConfig;
      }
    }
  }

  return undefined;
}