import { ExternalLink } from "lucide-react";
import { formatProjectTag } from "@/shared/utils/project-tag.utils";
import type { IProjectData } from "@/shared/types/project.types";
import { LINK_COLOR } from "@/shared/constants/colors";

interface DatasetReviewLinkProps {
	project: IProjectData;
	className?: string;
}

/**
 * DatasetReviewLink component
 *
 * Displays external link to the data catalogue filtered by project tag.
 * Opens in new tab with proper security attributes (noopener, noreferrer).
 * Includes external link icon and screen reader text for accessibility.
 *
 * URL format: https://data.bio.wa.gov.au/dataset/?tags={project_tag}
 */
export function DatasetReviewLink({
	project,
	className,
}: DatasetReviewLinkProps) {
	const projectTag = formatProjectTag(project);
	const datasetUrl = `https://data.bio.wa.gov.au/dataset/?tags=${projectTag}`;

	return (
		<a
			href={datasetUrl}
			target="_blank"
			rel="noopener noreferrer"
			className={className}
		>
			<span
				className="flex items-center gap-2 text-lg font-semibold hover:underline"
				style={{ color: LINK_COLOR }}
			>
				{/* Try to show full text, but truncate with ellipsis if it would wrap */}
				<span className="line-clamp-1">
					Review datasets tagged with {projectTag}
				</span>
				<ExternalLink className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
				<span className="sr-only">(opens in new tab)</span>
			</span>
		</a>
	);
}
