import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
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
import { useCloseProject } from "../../hooks/useCloseProject";

const closureSchema = z.object({
	outcome: z.enum(["completed", "terminated"], {
		message: "Please select an outcome",
	}),
});

type ClosureFormData = z.infer<typeof closureSchema>;

interface ProjectClosureModalProps {
	isOpen: boolean;
	onClose: () => void;
	projectId: number;
	projectKind: string;
}

export function ProjectClosureModal({
	isOpen,
	onClose,
	projectId,
	projectKind: _projectKind,
}: ProjectClosureModalProps) {
	const [reason, setReason] = useState<string>("");

	const {
		control,
		handleSubmit,
		watch,
		formState: { errors },
		reset,
	} = useForm<ClosureFormData>({
		resolver: zodResolver(closureSchema),
		defaultValues: {
			outcome: undefined,
		},
	});

	const closeMutation = useCloseProject();

	// eslint-disable-next-line react-hooks/incompatible-library
	const outcome = watch("outcome");

	// Generate reason text based on outcome
	useEffect(() => {
		let reasonText = "";
		if (outcome === "completed") {
			reasonText = "The project has run its course and was completed";
		} else if (outcome === "terminated") {
			reasonText = "The project has not been completed, but is terminated.";
		}
		setReason(reasonText);
	}, [outcome]);

	const onSubmit = async (data: ClosureFormData) => {
		if (!reason) return;

		try {
			await closeMutation.mutateAsync({
				projectId,
				outcome: data.outcome,
				reason,
			});
			onClose();
			reset();
			setReason("");
		} catch (error) {
			console.error(`[ProjectClosureModal] Mutation failed:`, error);
			// Error is already handled by the mutation's onError
		}
	};

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="sm:max-w-[600px]">
				<DialogHeader>
					<DialogTitle>
						Are you sure you want to close this project?
					</DialogTitle>
					<DialogDescription>
						The project will remain in the system with the following changes:
					</DialogDescription>
				</DialogHeader>

				<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
					<div className="rounded-lg bg-muted p-4">
						<h4 className="mb-3 text-lg font-semibold">Info</h4>
						<p className="mb-3 text-sm">
							The project will remain in the system, however, the following will
							occur:
						</p>
						<ul className="ml-6 list-disc space-y-2 text-sm">
							<li>Spawns a project closure document</li>
							<li>Prevents any further reports</li>
							<li>
								Sets the status of the project to closure requested, until the
								closure document is approved
							</li>
						</ul>
						<p className="mt-4 text-center text-sm font-bold text-red-600 underline">
							You can re-open the project at any time and the closure form will
							be deleted.
						</p>
						<p className="mt-4 text-center text-sm font-semibold text-blue-600">
							If instead you wish to permanently delete this project, please
							press cancel and select 'Delete' from the menu.
						</p>
					</div>

					{/* Outcome Selection */}
					<div className="space-y-2">
						<Label htmlFor="outcome-select">
							Outcome <span className="text-destructive">*</span>
						</Label>
						<Controller
							name="outcome"
							control={control}
							render={({ field }) => (
								<Select value={field.value} onValueChange={field.onChange}>
									<SelectTrigger id="outcome-select" className="w-full">
										<SelectValue placeholder="Select a closure reason..." />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="completed">Completion</SelectItem>
										<SelectItem value="terminated">Termination</SelectItem>
									</SelectContent>
								</Select>
							)}
						/>
						<p className="text-sm text-muted-foreground">
							Select an intended outcome for this project on closure.
						</p>
						{errors.outcome && (
							<p className="text-sm text-destructive">
								{errors.outcome.message}
							</p>
						)}
					</div>

					<div className="text-center">
						<p className="text-sm font-semibold underline">
							Once created, please fill out the scientific outputs, knowledge
							transfer and data location sections on the closure form.
						</p>
					</div>

					<DialogFooter className="gap-2">
						<Button type="button" variant="outline" onClick={onClose}>
							Cancel
						</Button>
						<Button
							type="submit"
							disabled={closeMutation.isPending || !outcome || !reason}
							variant="destructive"
						>
							{closeMutation.isPending ? "Requesting..." : "Request Closure"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
