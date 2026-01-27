import { Button } from "@/shared/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { ChevronDown, Loader2 } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { projectService } from "@/features/projects/services/project.service";

/**
 * DownloadProjectsCSVButton
 * Dropdown button for downloading projects CSV (Full or Annual Report)
 * Only visible to superusers
 */
export const DownloadProjectsCSVButton = () => {
	// Full CSV download mutation
	const downloadFullCSVMutation = useMutation({
		mutationFn: () => projectService.downloadProjectsCSV(),
		onMutate: () => {
			toast.loading("Generating Full Projects CSV...", { id: "csv-download" });
		},
		onSuccess: (blob) => {
			toast.success("Full Projects CSV Downloaded", { id: "csv-download" });

			// Handle file download
			const downloadUrl = window.URL.createObjectURL(blob);
			const link = document.createElement("a");
			link.href = downloadUrl;
			link.setAttribute("download", "projects-full.csv");
			document.body.appendChild(link);
			link.click();
			link.remove();
			window.URL.revokeObjectURL(downloadUrl);
		},
		onError: (error: Error) => {
			toast.error("Download Failed", {
				id: "csv-download",
				description: error.message || "Unable to download Full Projects CSV",
			});
		},
	});

	// Annual report CSV download mutation
	const downloadAnnualReportMutation = useMutation({
		mutationFn: () => projectService.downloadProjectsCSVAR(),
		onMutate: () => {
			toast.loading("Generating Annual Report CSV...", { id: "csv-download" });
		},
		onSuccess: (blob) => {
			toast.success("Annual Report CSV Downloaded", { id: "csv-download" });

			// Handle file download
			const downloadUrl = window.URL.createObjectURL(blob);
			const link = document.createElement("a");
			link.href = downloadUrl;
			link.setAttribute("download", "projects-annual-report.csv");
			document.body.appendChild(link);
			link.click();
			link.remove();
			window.URL.revokeObjectURL(downloadUrl);
		},
		onError: (error: Error) => {
			toast.error("Download Failed", {
				id: "csv-download",
				description: error.message || "Unable to download Annual Report CSV",
			});
		},
	});

	// Check if any mutation is running
	const isLoading =
		downloadFullCSVMutation.isPending || downloadAnnualReportMutation.isPending;

	const handleFullDownload = () => {
		downloadFullCSVMutation.mutate();
	};

	const handleAnnualReportDownload = () => {
		downloadAnnualReportMutation.mutate();
	};

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					variant="default"
					className="flex-1 lg:flex-initial bg-green-600 hover:bg-green-500 text-white dark:bg-green-600 dark:hover:bg-green-500"
					disabled={isLoading}
				>
					{isLoading ? (
						<>
							<Loader2 className="mr-1 size-4 animate-spin" />
							Downloading...
						</>
					) : (
						<>
							CSV
							<ChevronDown className="ml-1 size-4" />
						</>
					)}
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="start">
				<DropdownMenuItem 
					onClick={handleFullDownload}
					className={isLoading ? "opacity-50 cursor-not-allowed" : ""}
					onSelect={(e) => {
						if (isLoading) e.preventDefault();
					}}
				>
					Full
				</DropdownMenuItem>
				<DropdownMenuItem 
					onClick={handleAnnualReportDownload}
					className={isLoading ? "opacity-50 cursor-not-allowed" : ""}
					onSelect={(e) => {
						if (isLoading) e.preventDefault();
					}}
				>
					Annual Report
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
};
