import {
  Button,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  ToastId,
  useColorMode,
  useToast,
} from "@chakra-ui/react";
import { useMutation } from "@tanstack/react-query";
import { useRef } from "react";
import { FaCaretDown } from "react-icons/fa";
import { downloadProjectsCSV, downloadProjectsCSVAR } from "../../../lib/api";
import { AxiosError, AxiosResponse } from "axios";

export const DownloadProjectsCSVButton = () => {
  const toast = useToast();
  const toastIdRef = useRef<ToastId | undefined>(undefined);
  const { colorMode } = useColorMode();

  // Unified toast helper
  const showToast = (
    status: "loading" | "success" | "error",
    title: string,
    description?: string,
    duration?: number | null,
  ) => {
    if (toastIdRef.current) {
      toast.update(toastIdRef.current, {
        status,
        title,
        description,
        position: "top-right",
        duration: duration === undefined ? 3000 : duration,
        isClosable: status !== "loading",
      });
    } else {
      toastIdRef.current = toast({
        status,
        title,
        description,
        position: "top-right",
        duration: duration === undefined ? 3000 : duration,
        isClosable: status !== "loading",
      });
    }
  };

  // Full CSV download mutation
  const downloadFullCSVMutation = useMutation({
    mutationFn: downloadProjectsCSV,
    onMutate: () => {
      showToast("loading", "Generating Full Projects CSV", undefined, null);
    },
    onSuccess: (response: { res: AxiosResponse<any, any> } | Blob) => {
      showToast("success", "Success", "Full Projects CSV Downloaded");

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
      showToast("error", "Download Failed", errorMessage);
    },
    onSettled: () => {
      // Clean up toast reference after mutation completes
      setTimeout(() => {
        toastIdRef.current = undefined;
      }, 100);
    },
  });

  // Annual report CSV download mutation
  const downloadAnnualReportMutation = useMutation({
    mutationFn: downloadProjectsCSVAR,
    onMutate: () => {
      showToast("loading", "Generating Annual Report CSV", undefined, null);
    },
    onSuccess: (response: { res: AxiosResponse<any, any> } | Blob) => {
      showToast("success", "Success", "Annual Report CSV Downloaded");

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
      showToast("error", "Download Failed", errorMessage);
    },
    onSettled: () => {
      // Clean up toast reference after mutation completes
      setTimeout(() => {
        toastIdRef.current = undefined;
      }, 100);
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
    <Menu>
      <MenuButton
        as={Button}
        variant="solid"
        color="white"
        background={colorMode === "light" ? "green.500" : "green.600"}
        _hover={{
          background: colorMode === "light" ? "green.400" : "green.500",
        }}
        _active={{
          background: colorMode === "light" ? "green.600" : "green.700",
        }}
        rightIcon={<FaCaretDown />}
        isLoading={isLoading}
        disabled={isLoading}
        loadingText="Downloading..."
      >
        CSV
      </MenuButton>
      <MenuList
        bg={colorMode === "light" ? "white" : "gray.800"}
        borderColor={colorMode === "light" ? "gray.200" : "gray.600"}
      >
        <MenuItem
          onClick={handleFullDownload}
          isDisabled={isLoading}
          _hover={
            !isLoading
              ? {
                  bg: colorMode === "light" ? "gray.100" : "gray.700",
                }
              : {}
          }
          _disabled={{
            opacity: 0.6,
            cursor: "not-allowed",
          }}
        >
          Full
        </MenuItem>
        <MenuItem
          onClick={handleAnnualReportDownload}
          isDisabled={isLoading}
          _hover={
            !isLoading
              ? {
                  bg: colorMode === "light" ? "gray.100" : "gray.700",
                }
              : {}
          }
          _disabled={{
            opacity: 0.6,
            cursor: "not-allowed",
          }}
        >
          Annual Report
        </MenuItem>
      </MenuList>
    </Menu>
  );
};
