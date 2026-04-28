import { useState } from "react";
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
import { useSetProjectStatus } from "../../hooks/useSetProjectStatus";
import type { ProjectStatus } from "@/shared/types/project.types";

interface SetProjectStatusModalProps {
	isOpen: boolean;
	onClose: () => void;
	projectId: number;
	currentStatus: string;
}

const STATUS_OPTIONS: { value: ProjectStatus; label: string }[] = [
	{ value: "new", label: "New" },
	{ value: "pending", label: "Pending" },
	{ value: "active", label: "Active" },
	{ value: "updating", label: "Update Requested" },
	{ value: "closure_requested", label: "Closure Requested" },
	{ value: "completed", label: "Completed" },
	{ value: "terminated", label: "Terminated" },
	{ value: "suspended", label: "Suspended" },
];

export function SetProjectStatusModal({
	isOpen,
	onClose,
	projectId,
	currentStatus: _currentStatus,
}: SetProjectStatusModalProps) {
	const [selectedStatus, setSelectedStatus] = useState<string>("");

	const setStatusMutation = useSetProjectStatus();

	const handleSubmit = async () => {
		if (!selectedStatus) return;

		try {
			await setStatusMutation.mutateAsync({
				projectId,
				status: selectedStatus as ProjectStatus,
			});
			onClose();
			setSelectedStatus("");
		} catch (error) {
			console.error("Set status error:", error);
			// Error toast is handled by the mutation
		}
	};

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Set Project Status</DialogTitle>
					<DialogDescription>
						Change the status of this project (superuser only).
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-4">
					{/* Status Selection */}
					<div className="space-y-2">
						<Label htmlFor="status-select">
							Status <span className="text-destructive">*</span>
						</Label>
						<Select value={selectedStatus} onValueChange={setSelectedStatus}>
							<SelectTrigger
								id="status-select"
								className="w-full"
								aria-label="Select project status"
							>
								<SelectValue placeholder="Select a status..." />
							</SelectTrigger>
							<SelectContent>
								{STATUS_OPTIONS.map((option) => (
									<SelectItem key={option.value} value={option.value}>
										{option.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				</div>

				<DialogFooter className="gap-2">
					<Button type="button" variant="outline" onClick={onClose}>
						Cancel
					</Button>
					<Button
						onClick={handleSubmit}
						disabled={setStatusMutation.isPending || !selectedStatus}
					>
						{setStatusMutation.isPending ? "Setting..." : "Set Status"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
