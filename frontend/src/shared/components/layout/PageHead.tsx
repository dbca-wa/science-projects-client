import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router";
import { ROUTES_CONFIG } from "@/config/routes.config";

interface PageHeadProps {
	title?: string;
	description?: string;
}

export const PageHead = ({ title, description }: PageHeadProps) => {
	const location = useLocation();

	// Find route config for current page if title not provided
	const route = ROUTES_CONFIG.find((r) => r.path === location.pathname);
	const pageTitle = title || route?.name || "Reaction Clicker";
	const appName = "Reaction Clicker";
	const fullTitle =
		pageTitle === appName ? appName : `${pageTitle} | ${appName}`;

	return (
		<Helmet key={location.pathname}>
			<title>{fullTitle}</title>
			{description && <meta name="description" content={description} />}
		</Helmet>
	);
};
