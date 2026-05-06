/**
 * Footer component
 * Footer for the application layout
 *
 * Features:
 * - SPMS version and copyright information
 * - Environment label (production/staging/development) derived at runtime
 * - Link to GitHub repository
 * - Dark background styling
 * - Centered content
 */

const getEnvironmentLabel = (): string => {
	if (typeof window === "undefined") return "development";
	const host = window.location.hostname;
	if (host.includes("localhost") || host.includes("127.0.0.1"))
		return "development";
	if (host.includes("-test.")) return "staging";
	return "production";
};

export const Footer = () => {
	const currentYear = new Date().getFullYear();
	const VERSION = import.meta.env.VITE_VERSION || "dev";
	const ENV_LABEL = getEnvironmentLabel();

	return (
		<footer className="flex justify-center bottom-0 w-full text-white/60 bg-gray-900 py-4 select-none">
			<div className="text-xs text-center cursor-pointer">
				<a
					href="https://github.com/dbca-wa/science-projects"
					target="_blank"
					rel="noopener noreferrer"
					className="text-white/80 hover:text-white transition-colors"
				>
					SPMS {VERSION}
				</a>{" "}
				<span className="text-white/40">({ENV_LABEL})</span>{" "}
				<span>© 2012-{currentYear} DBCA. All rights reserved.</span>
			</div>
		</footer>
	);
};
