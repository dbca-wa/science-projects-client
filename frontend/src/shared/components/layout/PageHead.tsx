import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router";
import { ALL_ROUTES } from "@/app/router/routes.config";
// TEMPORARILY DISABLED - depends on moved staff profile types
// import type { StaffUserData } from "@/features/users/types/staff-profile.types";

interface PageHeadProps {
	title?: string; // Allow manual override
	description?: string; // Allow manual override
	keywords?: string; // Allow manual override
	isStandalone?: boolean;
	isStaffProfile?: boolean;
	staffUserData?: any; // Temporarily using any until staff profile types are re-integrated
}

export const PageHead = ({
	// overrides
	title,
	description,
	keywords,
	// other
	isStaffProfile,
	isStandalone,
	staffUserData,
}: PageHeadProps) => {
	const location = useLocation();

	// Find route config for current page if title not provided
	const route = ALL_ROUTES.find((r) => r.path === location.pathname);
	const pageTitle = title || route?.name || "Loading..."; // Use optional chaining

	// Keywords
	const defaultKeywords =
		"Science Profiles, Science, Project, Management, System, SPMS, Profiles, DBCA, Department of Biodiversity, Conservation and Attractions";

	// Url
	const defaultPublicUrl = "https://science-profiles.dbca.wa.gov.au/";

	// Image
	const imageString = "/dbca.jpg";
	const imageStringAbsolute = `${defaultPublicUrl}dbca.jpg`;

	// Description
	const defaultDescription =
		"Science Project Management System | DBCA | Department of Biodiversity, Conservation and Attractions | Western Australia";
	const defaultPublicProfileDescription =
		"Science Staff | DBCA | Department of Biodiversity, Conservation and Attractions | Western Australia";

	// Functions
	const getDescription = () => {
		const baseDescription =
			pageTitle === "Staff Profile"
				? defaultPublicProfileDescription
				: defaultDescription;

		return description ? `${description}` : baseDescription;
	};

	const formatTitle = (rawTitle: string | undefined) => {
		if (!rawTitle) return "Loading...";
		const formattedTitle = isStandalone ? rawTitle : `SPMS | ${rawTitle}`;
		return formattedTitle.substring(0, 60);
	};

	const getRobotsContent = (path: string) => {
		if (path.startsWith("/staff")) {
			return "index, follow";
		}
		return "noindex, nofollow";
	};

	const getSitemapStructuredData = () => {
		return {
			"@context": "https://schema.org",
			"@type": "CollectionPage",
			"@id": "https://science-profiles.dbca.wa.gov.au/staff",
			name: "Staff Directory",
			description: "Browse all science staff profiles",
			isPartOf: {
				"@type": "WebSite",
				"@id": "https://science-profiles.dbca.wa.gov.au/#website",
			},
		};
	};

	const getStructuredData = () => {
		if (isStaffProfile && staffUserData) {
			// Profile page structured data
			return {
				"@context": "https://schema.org",
				"@type": "Person",
				name: staffUserData.name,
				jobTitle: staffUserData.position,
				description: staffUserData.about,
				keywords: staffUserData.keywords,
				worksFor: {
					"@type": "Organization",
					name: "Department of Biodiversity, Conservation and Attractions",
					url: "https://www.dbca.wa.gov.au/",
					"@id": "https://www.dbca.wa.gov.au/",
				},
				url: currentUrl,
				isPartOf: {
					"@type": "WebSite",
					name: "Science Staff Profiles",
					url: "https://science-profiles.dbca.wa.gov.au/",
					"@id": "https://science-profiles.dbca.wa.gov.au/#website",
				},
			};
		}

		// Main website structured data
		return {
			"@context": "https://schema.org",
			"@type": "WebSite",
			"@id": "https://science-profiles.dbca.wa.gov.au/#website",
			name: "Science Staff Profiles",
			url: "https://science-profiles.dbca.wa.gov.au/",
			potentialAction: {
				"@type": "SearchAction",
				target: {
					"@type": "EntryPoint",
					urlTemplate:
						"https://science-profiles.dbca.wa.gov.au/staff/{user_id}",
				},
			},
			mainEntityOfPage: getSitemapStructuredData(),
		};
	};

	// Final values
	const currentUrl = location.pathname || defaultPublicUrl;
	const finalDescription = getDescription();
	const finalTitle = formatTitle(pageTitle);
	const finalKeywords = keywords
		? `${defaultKeywords}, ${keywords}`
		: defaultKeywords;

	return (
		<Helmet key={location.pathname}>
			{/* JSON-LD */}
			<script type="application/ld+json">
				{JSON.stringify(getStructuredData())}
			</script>

			<title>{finalTitle}</title>
			<link rel="icon" type="image/jpg" href={imageString} />
			<link
				rel="alternate"
				type="application/json"
				href="https://science-profiles.dbca.wa.gov.au/staff"
				title="Staff Directory"
			/>
			<meta name="description" content={finalDescription} />
			<meta name="keywords" content={finalKeywords} />
			<meta httpEquiv="Cache-Control" content="max-age=3600" />
			<meta httpEquiv="Content-Language" content="en" />
			<meta
				name="sitemap"
				content="https://science-profiles.dbca.wa.gov.au/staff"
			/>

			{/* Open Graph / Facebook */}
			<meta property="og:type" content="website" />
			<meta property="og:url" content={currentUrl} />
			<meta property="og:title" content={finalTitle} />
			<meta property="og:description" content={finalDescription} />
			<meta property="og:image" content={imageStringAbsolute} />
			{/* Twitter */}
			<meta property="twitter:card" content="summary_large_image" />
			<meta property="twitter:url" content={currentUrl} />
			<meta property="twitter:title" content={finalTitle} />
			<meta property="twitter:description" content={finalDescription} />
			<meta property="twitter:image" content={imageStringAbsolute} />
			{/* Additional SEO tags */}
			<link rel="canonical" href={currentUrl} />
			<meta
				name="robots"
				content={getRobotsContent(window.location.pathname)}
			/>
			<meta
				name="googlebot"
				content={getRobotsContent(window.location.pathname)}
			/>
			<meta
				name="googlebot-news"
				content={getRobotsContent(window.location.pathname)}
			/>
			<meta
				name="slurp"
				content={getRobotsContent(window.location.pathname)}
			/>
			<meta
				name="bingbot"
				content={getRobotsContent(window.location.pathname)}
			/>
			<meta
				name="viewport"
				content="width=device-width, initial-scale=1"
			/>
			<meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
			<meta
				name="viewport"
				content="width=device-width, initial-scale=1"
			/>
			<meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
			<html lang="en" />
		</Helmet>
	);
};
