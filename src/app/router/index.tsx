import { Suspense, createElement } from "react";
import { Navigate, type RouteObject, createBrowserRouter } from "react-router-dom";

// Route Configuration
import { ROUTES_CONFIG, ROUTE_REDIRECTS, type RouteConfig } from "@/app/config/routes.config";

// Layouts, Guards & Boundaries
import { ErrorHandler } from "@/shared/components/layout/base/ErrorHandler";
import { Root } from "@/shared/components/layout/base/Root";
import ErrorPage from "@/shared/components/layout/base/ErrorPage";
import { ScienceStaffLayout } from "@/features/staff-profiles/components/layout/ScienceStaffLayout";
import { AdminOnlyPage } from "@/shared/components/layout/wrappers/AdminOnlyPage";
import { ContentWrapper } from "@/shared/components/layout/wrappers/ContentWrapper";
import { LayoutCheckWrapper } from "@/shared/components/layout/wrappers/LayoutCheckWrapper";
import { ProtectedPage } from "@/shared/components/layout/wrappers/ProtectedPage";
import { LoadingFallback } from "@/shared/components/layout/LoadingFallback";

/**
 * Wrap a route element with appropriate wrappers based on configuration
 */
const wrapRouteElement = (
  route: RouteConfig
): JSX.Element => {
  const Component = route.component;
  const props = route.componentProps || {};
  const wrapper = route.wrapper;
  const requiresAuth = route.requiresAuth ?? true;
  
  let element = (
    <Suspense fallback={<LoadingFallback />}>
      {createElement(Component, props)}
    </Suspense>
  );

  // Handle staff profile wrapper (special case - different layout)
  if (wrapper === "staffProfile") {
    return (
      <ScienceStaffLayout>
        <Suspense fallback={<LoadingFallback />}>
          {createElement(Component, props)}
        </Suspense>
      </ScienceStaffLayout>
    );
  }

  // Apply specific wrapper
  if (wrapper === "admin") {
    element = <AdminOnlyPage>{element}</AdminOnlyPage>;
  } else if (wrapper === "layoutCheck") {
    element = <LayoutCheckWrapper>{element}</LayoutCheckWrapper>;
  }

  // Wrap with ContentWrapper for authenticated routes
  if (requiresAuth) {
    element = <ContentWrapper>{element}</ContentWrapper>;
  }

  return element;
};

/**
 * Generate route objects from configuration
 */
const generateRoutes = (): RouteObject[] => {
  const routes: RouteObject[] = [];

  // Login route (no auth required)
  const loginRoute = ROUTES_CONFIG.find((r) => r.path === "/login");
  if (loginRoute) {
    routes.push({
      path: loginRoute.path,
      element: wrapRouteElement(loginRoute),
    });
  }

  // Projects map route (special case - outside main layout)
  const projectsMapRoute = ROUTES_CONFIG.find(
    (r) => r.path === "/projects"
  )?.children?.find((c) => c.path === "/projects/map");
  if (projectsMapRoute) {
    routes.push({
      path: projectsMapRoute.path,
      element: wrapRouteElement(projectsMapRoute),
    });
  }

  // Staff profile routes (public, special layout)
  const staffRoutes = ROUTES_CONFIG.filter(
    (r) => r.path.startsWith("/staff")
  );
  staffRoutes.forEach((route) => {
    routes.push({
      path: route.path,
      element: wrapRouteElement(route),
      errorElement: <ErrorPage />,
    });
  });

  // Main protected routes
  const protectedChildren: RouteObject[] = [];

  ROUTES_CONFIG.forEach((route) => {
    // Skip routes already handled
    if (
      route.path === "/login" ||
      route.path.startsWith("/staff") ||
      route.path === "/projects/map"
    ) {
      return;
    }

    // Add main route
    if (route.requiresAuth !== false) {
      protectedChildren.push({
        path: route.path === "/" ? "" : route.path.substring(1), // Remove leading slash for children
        element: wrapRouteElement(route),
      });

      // Add child routes
      if (route.children) {
        route.children.forEach((child) => {
          // Skip projects/map as it's already handled
          if (child.path === "/projects/map") return;

          protectedChildren.push({
            path: child.path.substring(1), // Remove leading slash
            element: wrapRouteElement(child),
          });
        });
      }
    }
  });

  // Add redirects
  ROUTE_REDIRECTS.forEach((redirect) => {
    protectedChildren.push({
      path: redirect.from.substring(1), // Remove leading slash
      element: <Navigate to={redirect.to} replace />,
    });
  });

  // Main protected route with Root layout
  routes.push({
    path: "/",
    element: (
      <ProtectedPage>
        <Root />
      </ProtectedPage>
    ),
    errorElement: <ErrorHandler />,
    children: protectedChildren,
  });

  return routes;
};

/**
 * Create and export the router
 */
export const router = createBrowserRouter(generateRoutes());
