import { Building, GraduationCap } from "lucide-react";
import type { IStudentProjectDetails } from "@/shared/types/project.types";
import { STUDY_LEVEL_LABELS } from "@/features/projects/constants/studyLevels";

interface StudentProjectSectionsProps {
	studentDetails: IStudentProjectDetails;
}

export function StudentProjectSections({
	studentDetails,
}: StudentProjectSectionsProps) {
	const studyLevelLabel = studentDetails.level
		? STUDY_LEVEL_LABELS[studentDetails.level] || studentDetails.level
		: null;

	// Debug logging
	console.log("=== StudentProjectSections Debug ===");
	console.log("Student details:", studentDetails);
	console.log("Organisation:", studentDetails.organisation);
	console.log("Level:", studentDetails.level);
	console.log("Study level label:", studyLevelLabel);
	console.log("Has organisation?", !!studentDetails.organisation);
	console.log("Has level?", !!studyLevelLabel);
	console.log("====================================");

	return (
		<>
			{/* Organisation Section */}
			{studentDetails.organisation && (
				<div className="pb-3">
					<div className="flex items-center gap-2 mb-1">
						<Building className="h-5 w-5 text-muted-foreground" />
						<p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
							Organisation
						</p>
					</div>
					<p className="text-base text-gray-600 dark:text-gray-400">
						{studentDetails.organisation}
					</p>
				</div>
			)}

			{/* Study Level Section */}
			{studyLevelLabel && (
				<div className="pb-3">
					<div className="flex items-center gap-2 mb-1">
						<GraduationCap className="h-5 w-5 text-muted-foreground" />
						<p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
							Study Level
						</p>
					</div>
					<p className="text-base text-gray-600 dark:text-gray-400">
						{studyLevelLabel}
					</p>
				</div>
			)}
		</>
	);
}
