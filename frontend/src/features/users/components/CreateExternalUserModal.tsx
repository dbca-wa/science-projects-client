import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/shared/components/ui/dialog";
import { UserPlus } from "lucide-react";
import { ExternalUserForm } from "./ExternalUserForm";
import type { IUserData } from "@/shared/types/user.types";

interface CreateExternalUserModalProps {
	isOpen: boolean;
	onClose: () => void;
	onUserCreated: (user: IUserData) => void;
}

/**
 * Modal wrapper for ExternalUserForm.
 *
 * Used when creating external users inline (e.g. from the team member
 * combobox in the project wizard) without navigating to a separate page.
 */
export const CreateExternalUserModal = ({
	isOpen,
	onClose,
	onUserCreated,
}: CreateExternalUserModalProps) => {
	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<div className="flex items-center gap-3">
						<div className="flex size-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-950/40">
							<UserPlus className="size-5 text-green-600 dark:text-green-400" />
						</div>
						<div>
							<DialogTitle className="text-lg">Add External User</DialogTitle>
							<DialogDescription className="mt-0.5">
								Create a new external user to add to the project team
							</DialogDescription>
						</div>
					</div>
				</DialogHeader>

				<ExternalUserForm
					onSuccess={(user) => {
						onUserCreated(user);
						onClose();
					}}
					onCancel={onClose}
				/>
			</DialogContent>
		</Dialog>
	);
};
