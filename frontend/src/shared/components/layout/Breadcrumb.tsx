/**
 * Breadcrumb Component
 *
 * Automatically renders breadcrumbs based on route configuration.
 * Reads from routes.config.ts to determine:
 * - Whether to show breadcrumb (showBreadcrumb)
 * - Parent route for "Back to" button (breadcrumbParent)
 */

import { useLocation, useNavigate } from "react-router";
import { Button } from "@/shared/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { ALL_ROUTES } from "@/app/router/routes.config";

export const Breadcrumb = () => {
	const location = useLocation();
	const navigate = useNavigate();

	// Find current route config
	const currentRoute = ALL_ROUTES.find((r) => r.path === location.pathname);

	// Don't show breadcrumb if not configured or explicitly disabled
	if (!currentRoute?.showBreadcrumb) {
		return null;
	}

	// Find parent route if specified
	const parentRoute = currentRoute.breadcrumbParent
		? ALL_ROUTES.find((r) => r.path === currentRoute.breadcrumbParent)
		: null;

	const handleBack = () => {
		if (currentRoute.breadcrumbParent) {
			navigate(currentRoute.breadcrumbParent);
		} else {
			navigate(-1); // Fallback to browser back
		}
	};

	return (
		<div className="mb-6">
			<Button variant="ghost" size="sm" onClick={handleBack}>
				<ArrowLeft className="size-4 mr-2" />
				{parentRoute ? `Back to ${parentRoute.name}` : "Back"}
			</Button>
		</div>
	);
};
