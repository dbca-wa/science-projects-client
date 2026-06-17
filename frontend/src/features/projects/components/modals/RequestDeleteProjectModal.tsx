import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Label } from "@/shared/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/shared/components/ui/select";
import { useRequestDeleteProject } from "../../hooks/useRequestDeleteProject";

const requestDeleteSchema = z.object({
	reason: z.enum(["duplicate", "mistake", "other"], {
		message: "Please select a deletion reason",
	}),
});

type RequestDeleteFormData = z.infer<typeof requestDeleteSchema>;

interface RequestDeleteProjectModalProps {
	isOpen: boolean;
	onClose: () => void;
	projectId: number;
}

export const RequestDeleteProjectModal = ({
	isOpen,
	onClose,
	projectId,
}: RequestDeleteProjectModalProps) => {
	const {
		handleSubmit,
		setValue,
		control,
		formState: { errors },
	} = useForm<RequestDeleteFormData>({
		resolver: zodResolver(requestDeleteSchema),
		defaultValues: { reason: undefined },
	});

	const reason = useWatch({ control, name: "reason" });

	const requestDeleteMutation = useRequestDeleteProject();

	const onSubmit = async (data: RequestDeleteFormData) => {
		try {
			await requestDeleteMutation.mutateAsync({
				projectId,
				reason: data.reason,
			});
			onClose();
		} catch (error) {
			console.error("[RequestDeleteProjectModal] Request failed:", error);
		}
	};

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="sm:max-w-[500px]">
				<DialogHeader>
					<DialogTitle>Request Deletion?</DialogTitle>
					<DialogDescription>
						Are you sure you want to delete this project? There's no turning
						back.
					</DialogDescription>
				</DialogHeader>

				<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
					<ul className="ml-6 list-disc space-y-2 text-sm">
						<li>The Project team and area will be cleared</li>
						<li>The project photo will be deleted</li>
						<li>Any related comments will be deleted</li>
						<li>All related documents will be deleted</li>
					</ul>

					<p className="text-center text-sm font-bold text-red-600 underline">
						Once approved by admins, this is permanent.
					</p>

					<p className="text-center text-sm font-semibold text-blue-600">
						If you wish to proceed, select a deletion reason and click "Request
						Deletion". Clicking the button will send a request to the admins, so
						the process may take time.
					</p>

					{/* Reason Selection */}
					<div className="space-y-2">
						<Label htmlFor="reason-select">
							Deletion Reason <span className="text-destructive">*</span>
						</Label>
						<Select
							value={reason}
							onValueChange={(val) =>
								setValue("reason", val as RequestDeleteFormData["reason"], {
									shouldValidate: true,
								})
							}
						>
							<SelectTrigger id="reason-select">
								<SelectValue placeholder="Select a reason..." />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="duplicate">Duplicate</SelectItem>
								<SelectItem value="mistake">Made by Mistake</SelectItem>
								<SelectItem value="other">Other</SelectItem>
							</SelectContent>
						</Select>
						{errors.reason && (
							<p className="text-sm text-destructive">
								{errors.reason.message}
							</p>
						)}
					</div>

					<DialogFooter className="gap-2">
						<Button type="button" variant="outline" onClick={onClose}>
							Cancel
						</Button>
						<Button
							type="submit"
							disabled={requestDeleteMutation.isPending || !reason}
							variant="destructive"
						>
							{requestDeleteMutation.isPending
								? "Requesting..."
								: "Request Deletion"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
};
