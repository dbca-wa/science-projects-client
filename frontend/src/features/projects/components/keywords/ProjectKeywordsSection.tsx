import { useState } from "react";
import { ClickToEditBadge } from "@/shared/components/ClickToEditBadge";
import { ProjectKeywords } from "./ProjectKeywords";
import { KeywordsEditModal } from "./KeywordsEditModal";

interface ProjectKeywordsSectionProps {
	projectId: number;
	keywords: string | null | undefined;
	canEdit: boolean;
}

/**
 * ProjectKeywordsSection component
 *
 * Self-contained section for displaying and editing project keywords.
 * Manages its own modal state and edit interactions.
 */
export function ProjectKeywordsSection({
	projectId,
	keywords,
	canEdit,
}: ProjectKeywordsSectionProps) {
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [isHovered, setIsHovered] = useState(false);

	return (
		<>
			{/* Keywords display section */}
			<div
				className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm overflow-hidden ${
					canEdit
						? "cursor-pointer transition-all hover:border-blue-300 dark:hover:border-blue-600"
						: ""
				}`}
				onClick={canEdit ? () => setIsModalOpen(true) : undefined}
				onMouseEnter={() => canEdit && setIsHovered(true)}
				onMouseLeave={() => canEdit && setIsHovered(false)}
				onKeyDown={(e) => {
					if (canEdit && (e.key === "Enter" || e.key === " ")) {
						e.preventDefault();
						setIsModalOpen(true);
					}
				}}
				tabIndex={canEdit ? 0 : undefined}
				role={canEdit ? "button" : undefined}
				aria-label={canEdit ? "Click to edit keywords" : undefined}
			>
				{/* Header section with label and click-to-edit badge */}
				<div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
					<span className="text-xl font-semibold">Keywords</span>
					{canEdit && <ClickToEditBadge isVisible={isHovered} />}
				</div>

				{/* Content section with padding matching RTE */}
				<div className={`px-6 py-5 ${canEdit ? "cursor-pointer" : ""}`}>
					<ProjectKeywords keywords={keywords} />
				</div>
			</div>

			{/* Keywords Edit Modal */}
			<KeywordsEditModal
				open={isModalOpen}
				onOpenChange={setIsModalOpen}
				projectId={projectId}
				initialKeywords={keywords}
			/>
		</>
	);
}
