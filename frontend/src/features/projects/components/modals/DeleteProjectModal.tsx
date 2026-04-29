import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { useDeleteProject } from "../../hooks/useDeleteProject";

interface DeleteProjectModalProps {
	isOpen: boolean;
	onClose: () => void;
	projectId: number;
}

export function DeleteProjectModal({
	isOpen,
	onClose,
	projectId,
}: DeleteProjectModalProps) {
	const deleteMutation = useDeleteProject();

	const handleDelete = async () => {
		try {
			await deleteMutation.mutateAsync(projectId);
			onClose();
		} catch (error) {
			console.error("[DeleteProjectModal] Delete failed:", error);
			// Error is handled by the mutation's onError
		}
	};

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="sm:max-w-[500px]">
				<DialogHeader>
					<DialogTitle>Delete Project?</DialogTitle>
					<DialogDescription>
						Are you sure you want to delete this project? There's no turning
						back.
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-4">
					<ul className="ml-6 list-disc space-y-2 text-sm">
						<li>The Project team and area will be cleared</li>
						<li>The project photo will be deleted</li>
						<li>Any related comments will be deleted</li>
						<li>All related documents will be deleted</li>
					</ul>

					<p className="text-center text-sm font-bold text-red-600 underline">
						This is permanent.
					</p>

					<p className="text-center text-sm font-semibold text-blue-600">
						If instead you wish to create a project closure, please press cancel
						and select 'Create Closure' from the menu.
					</p>
				</div>

				<DialogFooter className="gap-2">
					<Button type="button" variant="outline" onClick={onClose}>
						Cancel
					</Button>
					<Button
						onClick={handleDelete}
						disabled={deleteMutation.isPending}
						variant="destructive"
					>
						{deleteMutation.isPending ? "Deleting..." : "Delete"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
