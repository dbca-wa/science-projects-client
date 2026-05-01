import { DollarSign, Building2 } from "lucide-react";
import type { IExternalProjectDetails } from "@/shared/types/project.types";

interface ExternalProjectSectionsProps {
	externalDetails: IExternalProjectDetails;
}

export function ExternalProjectSections({
	externalDetails,
}: ExternalProjectSectionsProps) {
	return (
		<>
			{/* Collaborators Section */}
			{externalDetails.collaboration_with && (
				<div className="pb-3">
					<div className="flex items-center gap-2 mb-1">
						<Building2 className="h-5 w-5 text-muted-foreground" />
						<p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
							Collaborators
						</p>
					</div>
					<p className="text-base text-gray-600 dark:text-gray-400">
						{externalDetails.collaboration_with}
					</p>
				</div>
			)}

			{/* Budget Section */}
			{externalDetails.budget && (
				<div className="pb-3">
					<div className="flex items-center gap-2 mb-1">
						<DollarSign className="h-5 w-5 text-muted-foreground" />
						<p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
							Budget
						</p>
					</div>
					<p className="text-base text-gray-600 dark:text-gray-400">
						{externalDetails.budget}
					</p>
				</div>
			)}
		</>
	);
}
