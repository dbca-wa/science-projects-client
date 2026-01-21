import { observer } from "mobx-react-lite";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toggleStaffProfileVisibility } from "../../services/user.service";
import { authKeys } from "@/features/auth/hooks/useAuth";
import type { IUserMe } from "@/shared/types/user.types";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";

interface ToggleStaffProfileVisibilityModalProps {
	isOpen: boolean;
	onClose: () => void;
	user: IUserMe;
	onSuccess: () => void;
}

export const ToggleStaffProfileVisibilityModal = observer(
	({
		isOpen,
		onClose,
		user,
		onSuccess,
	}: ToggleStaffProfileVisibilityModalProps) => {
		const queryClient = useQueryClient();

		const toggleMutation = useMutation({
			mutationFn: () =>
				toggleStaffProfileVisibility(user.staff_profile_id!),
			onSuccess: async () => {
				// Reset queries to force immediate refetch (ignores staleTime)
				await queryClient.resetQueries({
					queryKey: authKeys.user(),
					exact: true,
				});

				const newStatus = !user.staff_profile_hidden;
				toast.success(
					`Staff profile ${newStatus ? "hidden" : "visible"} successfully`,
				);
				onSuccess();
				onClose();
			},
			onError: (error: Error) => {
				const message = error.message || "Failed to toggle staff profile visibility";
				toast.error(message);
			},
		});

		const handleToggle = () => {
			toggleMutation.mutate();
		};

		const isHidden = user.staff_profile_hidden;

		return (
			<Dialog open={isOpen} onOpenChange={onClose}>
				<DialogContent className="sm:max-w-[500px]">
					<DialogHeader>
						<DialogTitle>
							{isHidden ? "Show" : "Hide"} Staff Profile
						</DialogTitle>
						<DialogDescription>
							{isHidden
								? "Make your staff profile visible to the public"
								: "Hide your staff profile from public view"}
						</DialogDescription>
					</DialogHeader>

					<div className="space-y-4">
						{/* Current Status */}
						<Alert>
							<AlertCircle className="size-4" />
							<AlertDescription>
								<div className="flex items-center gap-2">
									<span className="font-medium">
										Current Status:
									</span>
									{isHidden ? (
										<span className="flex items-center gap-1 text-orange-600">
											<EyeOff className="size-4" />
											Hidden
										</span>
									) : (
										<span className="flex items-center gap-1 text-green-600">
											<Eye className="size-4" />
											Visible
										</span>
									)}
								</div>
							</AlertDescription>
						</Alert>

						{/* Explanation */}
						<div className="text-sm text-muted-foreground">
							{isHidden ? (
								<p>
									Showing your staff profile will make it
									visible on the public staff directory and
									accessible via direct link.
								</p>
							) : (
								<p>
									Hiding your staff profile will remove it
									from the public staff directory. It will no
									longer be accessible to external users.
								</p>
							)}
						</div>
					</div>

					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							onClick={onClose}
							disabled={toggleMutation.isPending}
						>
							Cancel
						</Button>
						<Button
							type="button"
							onClick={handleToggle}
							disabled={toggleMutation.isPending}
							variant={isHidden ? "default" : "destructive"}
						>
							{toggleMutation.isPending && (
								<Loader2 className="mr-2 size-4 animate-spin" />
							)}
							{isHidden ? (
								<>
									<Eye className="mr-2 size-4" />
									Show Profile
								</>
							) : (
								<>
									<EyeOff className="mr-2 size-4" />
									Hide Profile
								</>
							)}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		);
	},
);
