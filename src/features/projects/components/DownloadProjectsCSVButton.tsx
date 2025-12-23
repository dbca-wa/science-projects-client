import { Button } from "@/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import { useRef } from "react";
import { FaCaretDown } from "react-icons/fa";
import { downloadProjectsCSV, downloadProjectsCSVAR } from "@/features/projects/services/projects.service";
import { AxiosError, type AxiosResponse } from "axios";

export const DownloadProjectsCSVButton = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  // Full CSV download mutation
  const downloadFullCSVMutation = useMutation({
    mutationFn: downloadProjectsCSV,
    onMutate: () => {
      toast.loading("Generating Full Projects CSV");
    },
    onSuccess: (response: { res: AxiosResponse<any, any> } | Blob) => {
      toast.success("Full Projects CSV Downloaded");

      // Handle file download
      const downloadUrl = window.URL.createObjectURL(response as Blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.setAttribute("download", "projects-full.csv");
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
    },
    onError: (error: AxiosError) => {
      const errorMessage = error?.response?.data
        ? `${error.response.status}: ${Object.values(error.response.data)[0]}`
        : "Unable to download Full Projects CSV";
      toast.error(`Download Failed: ${errorMessage}`);
    },
  });

  // Annual report CSV download mutation
  const downloadAnnualReportMutation = useMutation({
    mutationFn: downloadProjectsCSVAR,
    onMutate: () => {
      toast.loading("Generating Annual Report CSV");
    },
    onSuccess: (response: { res: AxiosResponse<any, any> } | Blob) => {
      toast.success("Annual Report CSV Downloaded");

      // Handle file download
      const downloadUrl = window.URL.createObjectURL(response as Blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.setAttribute("download", "projects-annual-report.csv");
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
    },
    onError: (error: AxiosError) => {
      const errorMessage = error?.response?.data
        ? `${error.response.status}: ${Object.values(error.response.data)[0]}`
        : "Unable to download Annual Report CSV";
      toast.error(`Download Failed: ${errorMessage}`);
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
          className={`text-white ${
            isDark 
              ? "bg-green-600 hover:bg-green-500" 
              : "bg-green-500 hover:bg-green-400"
          }`}
          disabled={isLoading}
        >
          {isLoading ? "Downloading..." : "CSV"}
          <FaCaretDown className="ml-2 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem
          onClick={handleFullDownload}
          disabled={isLoading}
        >
          Full
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={handleAnnualReportDownload}
          disabled={isLoading}
        >
          Annual Report
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
