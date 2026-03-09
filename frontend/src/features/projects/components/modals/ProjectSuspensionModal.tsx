import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { useSuspendProject } from "../../hooks/useSuspendProject";

interface ProjectSuspensionModalProps {
	isOpen: boolean;
	onClose: () => void;
	projectId: number;
	currentStatus: string;
}

export function ProjectSuspensionModal({
	isOpen,
	onClose,
	projectId,
	currentStatus,
}: ProjectSuspensionModalProps) {
	const suspendMutation = useSuspendProject();

	const isSuspended = currentStatus === "suspended";
	const action = isSuspended ? "unsuspend" : "suspend";
	const actionTitle = isSuspended ? "Unsuspend" : "Suspend";

	const handleSubmit = async () => {
		console.log(
			`[ProjectSuspensionModal] Submit clicked - ${action}ing project ${projectId}`
		);
		console.log(`[ProjectSuspensionModal] Current status: ${currentStatus}`);
		console.log(
			`[ProjectSuspensionModal] Will set suspend to: ${!isSuspended}`
		);

		try {
			console.log(`[ProjectSuspensionModal] Calling mutateAsync...`);
			await suspendMutation.mutateAsync({
				projectId,
				suspend: !isSuspended,
			});
			console.log(
				`[ProjectSuspensionModal] mutateAsync completed successfully`
			);
			console.log(`[ProjectSuspensionModal] Closing modal...`);
			onClose();
		} catch (error) {
			console.error(`[ProjectSuspensionModal] Mutation failed:`, error);
			// Error is already handled by the mutation's onError
		}
	};

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="sm:max-w-[500px]">
				<DialogHeader>
					<DialogTitle>
						Are you sure you want to {action} this project?
					</DialogTitle>
					<DialogDescription>
						The following will occur when you {action} this project:
					</DialogDescription>
				</DialogHeader>

				<div className="rounded-lg bg-muted p-4">
					<h4 className="mb-3 text-lg font-semibold">Info</h4>
					<p className="mb-3 text-sm">The following will occur:</p>
					<ul className="ml-6 list-disc space-y-2 text-sm">
						<li>
							{isSuspended
								? "The project will become active, with the status set to 'active'"
								: "The project will become inactive, with the status set to 'suspended'"}
						</li>
						<li>
							{isSuspended
								? "The project's progress reports will be included on the Annual Report, if one exists/is created for that FY."
								: "The project will not be closed, but its progress reports will not be included on the Annual Report."}
						</li>
						{!isSuspended && (
							<li>
								When a new Annual Reporting cycle begins, you will be sent a
								request to update your progress report. Either update the report
								or re-suspend the project.
							</li>
						)}
						<li>This will not create or delete any Project Closures</li>
					</ul>
					<p className="mt-4 text-center text-sm font-bold text-blue-600 underline">
						{isSuspended
							? "You can suspend the project again at any time, immediately setting the status of the project to 'suspended'"
							: "You can unsuspend the project again at any time, setting the status of the project to 'active'"}
					</p>
				</div>

				<DialogFooter className="gap-2">
					<Button type="button" variant="outline" onClick={onClose}>
						Cancel
					</Button>
					<Button
						onClick={handleSubmit}
						disabled={suspendMutation.isPending}
						className="bg-green-600 hover:bg-green-700"
					>
						{suspendMutation.isPending
							? `${actionTitle}ing...`
							: `${actionTitle} Project`}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
