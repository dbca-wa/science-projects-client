import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
	AlertDialog,
	AlertDialogContent,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogCancel,
} from "@/shared/components/ui/alert-dialog";
import { Button } from "@/shared/components/ui/button";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { Label } from "@/shared/components/ui/label";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { AlertTriangle, Loader2 } from "lucide-react";
import { apiClient } from "@/shared/services/api/client.service";
import type { IAnnualReport } from "@/shared/types/report.types";

interface DeletePreviewResponse {
	progress_reports: number;
	student_reports: number;
	total_documents: number;
}

interface DeleteAnnualReportDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	report: IAnnualReport | null;
	onConfirm: () => void;
	isPending: boolean;
}

export function DeleteAnnualReportDialog({
	open,
	onOpenChange,
	report,
	onConfirm,
	isPending,
}: DeleteAnnualReportDialogProps) {
	const [understood, setUnderstood] = useState(false);

	// Fetch cascade counts when dialog opens
	const { data: preview, isLoading: previewLoading } = useQuery({
		queryKey: ["report-delete-preview", report?.id],
		queryFn: () =>
			apiClient.get<DeletePreviewResponse>(
				`documents/reports/${report!.id}/delete-preview`
			),
		enabled: open && !!report?.id,
		staleTime: 10_000,
	});

	// Reset checkbox when dialog opens/closes
	const handleOpenChange = (isOpen: boolean) => {
		if (!isOpen) {
			setUnderstood(false);
		}
		onOpenChange(isOpen);
	};

	const divisionName = report?.division?.name ?? "Unknown Division";
	const year = report?.year ?? "—";

	const progressCount = preview?.progress_reports ?? 0;
	const studentCount = preview?.student_reports ?? 0;
	const totalCount = preview?.total_documents ?? 0;

	return (
		<AlertDialog open={open} onOpenChange={handleOpenChange}>
			<AlertDialogContent className="max-w-lg">
				<AlertDialogHeader>
					<AlertDialogTitle className="flex items-center gap-2 text-destructive">
						<AlertTriangle className="size-5" />
						Delete Annual Report
					</AlertDialogTitle>
					<AlertDialogDescription className="text-base">
						You are about to permanently delete the{" "}
						<span className="font-semibold">{year}</span> annual report for{" "}
						<span className="font-semibold">{divisionName}</span>.
					</AlertDialogDescription>
				</AlertDialogHeader>

				<div className="space-y-4 py-2">
					{/* Warning about cascade with counts */}
					<div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 space-y-3">
						<p className="text-sm font-semibold text-destructive">
							This will also permanently delete:
						</p>

						{previewLoading ? (
							<div className="space-y-2 ml-2">
								<Skeleton className="h-4 w-48" />
								<Skeleton className="h-4 w-44" />
							</div>
						) : (
							<ul className="list-disc list-inside text-sm text-muted-foreground space-y-1.5 ml-2">
								<li>
									<span className="font-semibold text-foreground">
										{progressCount}
									</span>{" "}
									progress report{progressCount !== 1 ? "s" : ""} and their
									project documents
								</li>
								<li>
									<span className="font-semibold text-foreground">
										{studentCount}
									</span>{" "}
									student report{studentCount !== 1 ? "s" : ""} and their
									project documents
								</li>
								<li className="pt-1 font-medium text-foreground">
									{totalCount} document{totalCount !== 1 ? "s" : ""} total will
									be removed
								</li>
							</ul>
						)}

						<p className="text-xs text-muted-foreground pt-1">
							This cannot be undone. Projects will lose their {year} report
							data.
						</p>
					</div>

					{/* Confirmation checkbox */}
					<div className="flex items-center space-x-3 pt-2">
						<Checkbox
							id="understand-delete"
							checked={understood}
							onCheckedChange={(checked) => setUnderstood(!!checked)}
							className="size-5 border-2"
						/>
						<Label
							htmlFor="understand-delete"
							className="text-sm font-medium cursor-pointer select-none"
						>
							I understand this will permanently delete all associated reports
						</Label>
					</div>
				</div>

				<AlertDialogFooter>
					<AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
					<Button
						variant="destructive"
						onClick={onConfirm}
						disabled={!understood || isPending || previewLoading}
					>
						{isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
						Delete Annual Report
					</Button>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
