// A button to download projects to a csv. TODO: Limit to admins.

import { Button, ToastId, useColorMode, useToast } from "@chakra-ui/react";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { FaDownload } from "react-icons/fa";
import { downloadProjectsCSV } from "../../../lib/api/api";

export const DownloadProjectsCSVButton = () => {
  const { colorMode } = useColorMode();
  const [
    isDownloadProjectsButtonDisabled,
    setIsDownloadProjectsButtonDisabled,
  ] = useState(false);

  const toast = useToast();
  const [onMutateToastId, setOnMutateToastId] = useState<ToastId>();

  const downloadAllProjectsMutation = useMutation({
    mutationFn: downloadProjectsCSV,
    onMutate: () => {
      setIsDownloadProjectsButtonDisabled(true);
      const toastId = toast({
        position: "top-right",
        status: "loading",
        title: "Downloading",
        duration: null,
        description: "Downloading Projects CSV...",
      });
      setOnMutateToastId(toastId);
    },
    onSuccess: () => {
      toast({
        position: "top-right",
        status: "success",
        title: "Complete!",
        isClosable: true,
        description: "All Projects CSV Download Complete.",
      });
      setTimeout(() => {
        setIsDownloadProjectsButtonDisabled(false);
      }, 5000);

      if (onMutateToastId) {
        toast.close(onMutateToastId);
      }
    },
    onError: () => {
      toast({
        position: "top-right",
        status: "error",
        title: "Error!",
        isClosable: true,
        description: "Unable to download Projects CSV.",
      });
      setTimeout(() => {
        setIsDownloadProjectsButtonDisabled(false);
      }, 5000);
      if (onMutateToastId) {
        toast.close(onMutateToastId);
      }
    },
  });

  const downloadAllProjectsCSV = () => {
    downloadAllProjectsMutation.mutate();
    console.log("Downloading...");
  };
  return (
    <Button
      leftIcon={<FaDownload />}
      variant={"solid"}
      bgColor={colorMode === "light" ? `green.500` : `green.600`}
      color={colorMode === "light" ? `white` : `whiteAlpha.900`}
      _hover={{
        bg: colorMode === "light" ? `green.600` : `green.400`,
        color: colorMode === "light" ? `white` : `white`,
      }}
      onClick={downloadAllProjectsCSV}
      isDisabled={isDownloadProjectsButtonDisabled}
    >
      Download Projects
    </Button>
  );
};
