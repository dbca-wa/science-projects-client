// A button to download the annual report based on the current data. Will be used to generate actual report.

import { Button, ToastId, useColorMode, useToast } from "@chakra-ui/react"
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { FaDownload } from "react-icons/fa"
import { downloadReportPDF } from "../../../lib/api";

export const DownloadReportPDFButton = () => {
    const { colorMode } = useColorMode();

    const [isDownloadReportButtonDisabled, setIsDownloadReportButtonDisabled] = useState(false);

    const toast = useToast();
    const [onMutateToastId, setOnMutateToastId] = useState<ToastId>();

    const downloadReportMutation = useMutation(downloadReportPDF, {
        onMutate: () => {
            setIsDownloadReportButtonDisabled(true);
            const toastId = toast({
                position: 'top-right',
                status: "loading",
                title: "Downloading",
                description: "Downloading Report...",
                duration: null,
            })
            setOnMutateToastId(toastId);
        },
        onSuccess: () => {
            toast({
                position: 'top-right',
                status: "success",
                title: "Complete!",
                isClosable: true,
                description: "All Projects CSV Download Complete.",
            });
            setTimeout(() => {
                setIsDownloadReportButtonDisabled(false);
            }, 5000);
            if (onMutateToastId) {
                toast.close(onMutateToastId);
            }
        },
        onError: () => {
            toast({
                position: 'top-right',
                status: "error",
                title: "Error!",
                isClosable: true,
                description: "Unable to download Projects CSV.",
            });
            setTimeout(() => {
                setIsDownloadReportButtonDisabled(false);
            }, 5000);
            if (onMutateToastId) {
                toast.close(onMutateToastId);
            }
        },
    })

    const downloadReport = () => {
        console.log("Downloading...")
        const userID = 1;
        if (userID) {
            downloadReportMutation.mutate({ userID });
        }
    }



    return (
        <Button
            leftIcon={<FaDownload />}
            variant={"solid"}
            // colorScheme="blue"
            onClick={downloadReport}
            isDisabled={isDownloadReportButtonDisabled}
            bgColor={
                colorMode === "light" ? `green.500` : `green.600`
            }
            color={
                colorMode === "light" ? `white` : `whiteAlpha.900`
            }
            _hover={
                {
                    bg: colorMode === "light" ? `green.600` : `green.400`,
                    color: colorMode === "light" ? `white` : `white`
                }
            }
        >
            Generate PDF
        </Button>
    )
}