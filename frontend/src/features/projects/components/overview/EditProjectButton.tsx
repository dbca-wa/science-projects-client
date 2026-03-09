import { Edit } from "lucide-react";
import { useNavigate } from "react-router";
import { Button } from "@/shared/components/ui/button";
import type { IProjectData } from "@/shared/types/project.types";
import type { IUserMe } from "@/shared/types/user.types";
import { canEditProject } from "@/features/projects/utils/permissions";

interface EditProjectButtonProps {
	project: IProjectData;
	currentUser: IUserMe | null;
}

export function EditProjectButton({
	project,
	currentUser,
}: EditProjectButtonProps) {
	const navigate = useNavigate();

	// Check if user can manage project
	const hasManagePermission = canEditProject(currentUser, project);

	// Don't render if user doesn't have permission
	if (!hasManagePermission) {
		return null;
	}

	// Handle edit navigation
	const handleEdit = () => {
		navigate(`/projects/${project.id}/edit`);
	};

	return (
		<Button variant="outline" onClick={handleEdit}>
			<Edit className="mr-2 h-4 w-4" />
			<span>Edit</span>
		</Button>
	);
}
