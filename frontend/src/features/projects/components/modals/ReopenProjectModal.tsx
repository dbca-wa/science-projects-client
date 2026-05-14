import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { Textarea } from "@/shared/components/ui/textarea";
import { Label } from "@/shared/components/ui/label";
import { useReopenProject } from "@/features/projects/hooks/useReopenProject";

const reopenSchema = z.object({
	projectId: z.number(),
	confirmed: z.boolean().refine((val) => val === true, {
		message: "You must confirm to reopen the project",
	}),
	reason: z.string().min(10, "Reason must be at least 10 characters"),
});

type ReopenFormData = z.infer<typeof reopenSchema>;

interface ReopenProjectModalProps {
	isOpen: boolean;
	onClose: () => void;
	projectId: number;
}

export const ReopenProjectModal = ({
	isOpen,
	onClose,
	projectId,
}: ReopenProjectModalProps) => {
	const {
		register,
		handleSubmit,
		formState: { errors },
		watch,
		setValue,
	} = useForm<ReopenFormData>({
		resolver: zodResolver(reopenSchema),
		defaultValues: {
			projectId,
			confirmed: false,
			reason: "",
		},
	});

	const reopenMutation = useReopenProject();
	const navigate = useNavigate();
	// eslint-disable-next-line react-hooks/incompatible-library
	const confirmed = watch("confirmed");
	const reason = watch("reason");
	const canSubmit = confirmed && reason.length >= 10;

	const onSubmit = (data: ReopenFormData) => {
		reopenMutation.mutate(data.projectId, {
			onSuccess: () => {
				onClose();
				// Navigate to the overview tab — the closure tab no longer exists
				navigate(`/projects/${data.projectId}`);
			},
		});
	};

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="sm:max-w-[500px]">
				<DialogHeader>
					<DialogTitle>
						Are you sure you want to reopen this project?
					</DialogTitle>
					<DialogDescription>
						The following will occur when you reopen this project:
					</DialogDescription>
				</DialogHeader>

				<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
					<div className="rounded-lg bg-muted p-4">
						<h4 className="mb-3 text-lg font-semibold">Info</h4>
						<ul className="ml-6 list-disc space-y-2 text-sm">
							<li>
								The project will become active, with the status set to
								'updating'
							</li>
							<li>The project closure document will be deleted</li>
							<li>Progress Reports can be created again</li>
						</ul>
						<p className="mt-4 text-center text-sm font-bold text-blue-600 underline">
							You can close the project again at any time.
						</p>
					</div>

					{/* Confirmation Checkbox */}
					<div className="flex items-start space-x-2">
						<Checkbox
							id="confirmed"
							checked={confirmed}
							onCheckedChange={(checked) =>
								setValue("confirmed", checked as boolean)
							}
							aria-label="Are you sure you want to reopen this project?"
						/>
						<Label
							htmlFor="confirmed"
							className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
						>
							Are you sure you want to reopen this project?
						</Label>
					</div>
					{errors.confirmed && (
						<p className="text-sm text-destructive">
							{errors.confirmed.message}
						</p>
					)}

					{/* Reason Textarea */}
					<div className="space-y-2">
						<Label htmlFor="reason">Reason for reopening</Label>
						<Textarea
							id="reason"
							{...register("reason")}
							placeholder="Please provide a reason for reopening this project..."
							className="min-h-[100px]"
							aria-label="Reason for reopening"
						/>
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
							variant="default"
							disabled={!canSubmit || reopenMutation.isPending}
							className="bg-green-600 hover:bg-green-700"
						>
							{reopenMutation.isPending ? "Reopening..." : "Open Project"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
};
