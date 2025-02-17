import {
  IDocGen,
  cancelAnnualReportPDF,
  generateAnnualReportPDF,
  generateAnnualReportUnapprovedPDF,
} from "@/lib/api";
import useApiEndpoint from "@/lib/hooks/helper/useApiEndpoint";
import { useGetAnnualReportPDF } from "@/lib/hooks/tanstack/useGetAnnualReportPDF";
import { IReport } from "@/types";
import {
  Box,
  Button,
  Center,
  Flex,
  Grid,
  Input,
  Spinner,
  Text,
  ToastId,
  useColorMode,
  useToast,
  UseToastOptions,
} from "@chakra-ui/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { BsStars } from "react-icons/bs";
import { FaFileDownload } from "react-icons/fa";
import { FcCancel } from "react-icons/fc";

interface Props {
  thisReport: IReport;
  // refetchData: () => void;
}

export const PDFViewer = ({
  thisReport,
}: // refetchData
Props) => {
  const { register: genRegister, handleSubmit: handleGenSubmit } =
    useForm<IDocGen>();
  const { register: cancelGenRegister, handleSubmit: handleCancelGenSubmit } =
    useForm<IDocGen>();

  const apiEndpoint = useApiEndpoint();
  const queryClient = useQueryClient();

  const toast = useToast();
  const toastIdRef = useRef<ToastId | undefined>(undefined);
  const addToast = (data: UseToastOptions) => {
    toastIdRef.current = toast(data);
  };

  const annualReportPDFGenerationMutation = useMutation({
    mutationFn: generateAnnualReportPDF,
    onMutate: () => {
      addToast({
        status: "loading",
        title: "Generating AR PDF",
        position: "top-right",
      });
    },
    onSuccess: () => {
      if (toastIdRef.current) {
        toast.update(toastIdRef.current, {
          title: "Success",
          description: `Annual Report PDF Generated`,
          status: "success",
          position: "top-right",
          duration: 3000,
          isClosable: true,
        });
      }
      queryClient.invalidateQueries({
        queryKey: [
          "annualReportPDF",
          thisReport?.pk ? thisReport.pk : thisReport.id,
        ],
      });
    },
    onError: (error: AxiosError) => {
      if (toastIdRef.current) {
        toast.update(toastIdRef.current, {
          title: "Could Not Generate AR PDF",
          description: error?.response?.data
            ? `${error.response.status}: ${
                Object.values(error.response.data)[0]
              }`
            : "Error",
          status: "error",
          position: "top-right",
          duration: 3000,
          isClosable: true,
        });
      }
    },
  });

  const unapprovedAnnualReportPDFGenerationMutation = useMutation({
    mutationFn: generateAnnualReportUnapprovedPDF,
    onMutate: () => {
      addToast({
        status: "loading",
        title: "Generating AR PDF",
        position: "top-right",
      });
    },
    onSuccess: () => {
      if (toastIdRef.current) {
        toast.update(toastIdRef.current, {
          title: "Success",
          description: `Annual Report PDF Generated`,
          status: "success",
          position: "top-right",
          duration: 3000,
          isClosable: true,
        });
      }
      queryClient.invalidateQueries({
        queryKey: [
          "annualReportPDF",
          thisReport?.pk ? thisReport.pk : thisReport.id,
        ],
      });
    },
    onError: (error: AxiosError) => {
      if (toastIdRef.current) {
        toast.update(toastIdRef.current, {
          title: "Could Not Generate AR PDF",
          description: error?.response?.data
            ? `${error.response.status}: ${
                Object.values(error.response.data)[0]
              }`
            : "Error",
          status: "error",
          position: "top-right",
          duration: 3000,
          isClosable: true,
        });
      }
    },
  });

  const beginUnapprovedProjectDocPDFGeneration = (formData: IDocGen) => {
    // console.log(formData);
    unapprovedAnnualReportPDFGenerationMutation.mutate(formData);
  };

  const cancelDocGenerationMutation = useMutation({
    mutationFn: cancelAnnualReportPDF,
    onMutate: () => {
      addToast({
        status: "loading",
        title: "Canceling Generation",
        position: "top-right",
      });
    },
    onSuccess: () => {
      if (toastIdRef.current) {
        toast.update(toastIdRef.current, {
          title: "Success",
          description: `Canceled`,
          status: "success",
          position: "top-right",
          duration: 3000,
          isClosable: true,
        });
      }
      queryClient.cancelQueries({
        queryKey: [
          "annualReportPDF",
          thisReport?.pk ? thisReport.pk : thisReport.id,
        ],
      });
      pdfDocumentData.report.pdf_generation_in_progress = false;

      // queryClient.invalidateQueries({
      //   queryKey: [
      //     "annualReportPDF",
      //     thisReport?.pk ? thisReport.pk : thisReport.id,
      //   ],
      // });
      // Turn off the loading toast, set the pdfDocumentData?.report?.pdf_generation_in_progress to false
      // and set the pdfDocumentData to undefined
      // setPdfDocumentData(undefined);
    },
    onError: (error: AxiosError) => {
      if (toastIdRef.current) {
        console.log(error);
        toast.update(toastIdRef.current, {
          title: "Could Not Cancel",
          description: error?.response?.data
            ? `${error.response.status}: ${
                Object.values(error.response.data)[0]
              }`
            : "Error",
          status: "error",
          position: "top-right",
          duration: 3000,
          isClosable: true,
        });
      }
    },
  });

  const beginCancelDocGen = (formData: IDocGen) => {
    console.log(formData);
    cancelDocGenerationMutation.mutate(formData);
  };

  const beginProjectDocPDFGeneration = (formData: IDocGen) => {
    annualReportPDFGenerationMutation.mutate(formData);
  };

  const { pdfDocumentData, pdfDocumentDataLoading } = useGetAnnualReportPDF(
    thisReport?.pk ? thisReport.pk : thisReport?.id,
  );
  const [binaryPdfData, setBinaryPdfData] = useState<string | null>(null);

  const { colorMode } = useColorMode();

  const [showRestartMessage, setShowRestartMessage] = useState(false);
  const [generationTime, setGenerationTime] = useState(0);

  useEffect(() => {
    let timer;
    if (
      pdfDocumentData?.report?.pdf_generation_in_progress === true ||
      annualReportPDFGenerationMutation.isPending ||
      unapprovedAnnualReportPDFGenerationMutation.isPending
    ) {
      timer = setInterval(() => {
        setGenerationTime((prevTime) => prevTime + 1000); // Increase by 1 second (1000 milliseconds)
        if (generationTime >= 10000) {
          setShowRestartMessage(true); // Show restart message after 10 seconds
        }
      }, 1000); // Run every second
    } else {
      clearInterval(timer); // Stop the timer when generation is not in progress
      setGenerationTime(0); // Reset generation time
      setShowRestartMessage(false); // Hide restart message
    }

    return () => clearInterval(timer); // Cleanup timer on component unmount or when pdf_generation_in_progress changes
  }, [
    pdfDocumentData,
    generationTime,
    annualReportPDFGenerationMutation,
    unapprovedAnnualReportPDFGenerationMutation,
  ]);

  useEffect(() => {
    if (!pdfDocumentDataLoading && pdfDocumentData !== undefined) {
      const binary = atob(pdfDocumentData?.pdf_data);
      const arrayBuffer = new ArrayBuffer(binary.length);
      const uint8Array = new Uint8Array(arrayBuffer);

      for (let i = 0; i < binary.length; i++) {
        uint8Array[i] = binary.charCodeAt(i);
      }

      const blob = new Blob([arrayBuffer], { type: "application/pdf" });
      const dataUrl = URL.createObjectURL(blob);

      setBinaryPdfData(dataUrl);
    }
  }, [pdfDocumentDataLoading, pdfDocumentData]);

  const determineDPI = () => {
    const dpi = 300;
    const heightMm = 297;
    const mmInInch = 25.4;
    // Pixels: Amount in mm divided by 25.4 (conv fact. for mm to inches) by dpi
    const pixels = (heightMm / mmInInch) * dpi;
    return pixels;
  };

  return (
    <Box>
      <Flex alignContent={"center"} justifyContent={"flex-end"} mb={4}>
        <Flex>
          <Text fontSize={"sm"} color={"gray.500"} mr={2}>
            {showRestartMessage
              ? "Generation taking longer than expected. Please try again."
              : null}
          </Text>
          <Text fontSize={"sm"} color={"gray.500"} mr={2}>
            {generationTime > 0
              ? `Generation time: ${generationTime / 1000} seconds`
              : null}
          </Text>
        </Flex>

        <Flex>
          <Box
            as="form"
            id="cancel-pdf-generation-form"
            onSubmit={handleCancelGenSubmit(beginCancelDocGen)}
          >
            <Input
              type="hidden"
              {...cancelGenRegister("document_pk", {
                required: true,
                value: thisReport?.pk ? thisReport.pk : thisReport?.id,
              })}
            />
          </Box>

          <Box
            as="form"
            id="pdf-generation-form"
            onSubmit={handleGenSubmit(beginProjectDocPDFGeneration)}
          >
            <Input
              type="hidden"
              {...genRegister("document_pk", {
                required: true,
                value: thisReport?.pk ? thisReport.pk : thisReport?.id,
              })}
            />
          </Box>

          <Box
            as="form"
            id="pdf-generation-form-unapproved"
            onSubmit={handleGenSubmit(beginUnapprovedProjectDocPDFGeneration)}
          >
            <Input
              type="hidden"
              {...genRegister("document_pk", {
                required: true,
                value: thisReport?.pk ? thisReport.pk : thisReport?.id,
              })}
            />
          </Box>

          {/* If the generation mutation is still pending but has been cancelled 
            show the generate buttons, otherwise show the cancel button
          */}
          {(annualReportPDFGenerationMutation.isPending &&
            !cancelDocGenerationMutation.isSuccess) ||
          (unapprovedAnnualReportPDFGenerationMutation.isPending &&
            !cancelDocGenerationMutation.isSuccess) ||
          pdfDocumentData?.report?.pdf_generation_in_progress ? (
            <Button
              size={"sm"}
              ml={2}
              variant={"solid"}
              color={"white"}
              background={colorMode === "light" ? "gray.400" : "gray.500"}
              _hover={{
                background: colorMode === "light" ? "gray.300" : "gray.400",
              }}
              loadingText={"Canceling"}
              isDisabled={cancelDocGenerationMutation.isPending}
              type="submit"
              form="cancel-pdf-generation-form"
              isLoading={cancelDocGenerationMutation.isPending}
            >
              <Box mr={2}>
                <FcCancel />
              </Box>
              Cancel
            </Button>
          ) : pdfDocumentData?.pdf_data ? (
            <Button
              as={motion.div}
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 10, opacity: 0 }}
              sx={{ transitionDuration: 0.7, animationDelay: 1 }}
              size={"sm"}
              ml={2}
              variant={"solid"}
              color={"white"}
              background={colorMode === "light" ? "blue.500" : "blue.600"}
              _hover={{
                cursor: "pointer",
                background: colorMode === "light" ? "blue.400" : "blue.500",
              }}
              onClick={() => {
                window.open(`${apiEndpoint}${pdfDocumentData?.file}`, "_blank");
              }}
            >
              <Box mr={2}>
                <FaFileDownload />
              </Box>
              Download PDF
            </Button>
          ) : null}
          <Button
            size={"sm"}
            ml={2}
            variant={"solid"}
            color={"white"}
            background={colorMode === "light" ? "green.500" : "green.600"}
            _hover={{
              cursor: "pointer",
              background: colorMode === "light" ? "green.400" : "green.500",
            }}
            loadingText={"Generation In Progress"}
            type="submit"
            form="pdf-generation-form"
            isLoading={
              (annualReportPDFGenerationMutation.isPending &&
                !cancelDocGenerationMutation.isPending) ||
              (unapprovedAnnualReportPDFGenerationMutation.isPending &&
                !cancelDocGenerationMutation.isPending)
            }
          >
            <Box mr={2}>
              <BsStars />
            </Box>
            Generate New
          </Button>

          <Button
            size={"sm"}
            ml={2}
            variant={"solid"}
            color={"white"}
            background={colorMode === "light" ? "orange.500" : "orange.600"}
            _hover={{
              cursor: "pointer",
              background: colorMode === "light" ? "orange.400" : "orange.500",
            }}
            loadingText={"Generation In Progress"}
            isDisabled={
              pdfDocumentData?.report?.pdf_generation_in_progress ||
              (annualReportPDFGenerationMutation.isPending &&
                !cancelDocGenerationMutation.isSuccess) ||
              (unapprovedAnnualReportPDFGenerationMutation.isPending &&
                !cancelDocGenerationMutation.isSuccess)
            }
            type="submit"
            form="pdf-generation-form-unapproved"
            isLoading={
              pdfDocumentData?.report?.pdf_generation_in_progress ||
              (annualReportPDFGenerationMutation.isPending &&
                !cancelDocGenerationMutation.isSuccess) ||
              (unapprovedAnnualReportPDFGenerationMutation.isPending &&
                !cancelDocGenerationMutation.isSuccess)
            }
          >
            <Box mr={2}>
              <BsStars />
            </Box>
            Include Unapproved
          </Button>
        </Flex>
      </Flex>
      {!pdfDocumentDataLoading ? (
        pdfDocumentData !== undefined ? (
          (pdfDocumentData?.report?.pdf_generation_in_progress &&
            !cancelDocGenerationMutation.isSuccess) ||
          (annualReportPDFGenerationMutation.isPending &&
            !cancelDocGenerationMutation.isSuccess) ? (
            <Center mt={100}>
              <img
                src="/bouncing-ball.svg"
                alt="Loading..."
                width={"20%"}
                height={"20%"}
              />
            </Center>
          ) : (
            <iframe
              title="Annual Report PDF Viewer"
              src={binaryPdfData}
              width="100%"
              height={`${determineDPI() / 3.9}px`}
              style={{
                border: "1px solid black",
                borderRadius: "20px",
              }}
            ></iframe>
          )
        ) : (
          <Center>
            <Grid>
              <Center>
                <Text>There is no pdf.</Text>
              </Center>
              <Center>
                <Text>Click generate new to create one.</Text>
              </Center>
            </Grid>
          </Center>
        )
      ) : (
        <Center mt={4}>
          <Spinner />
        </Center>
      )}
    </Box>
  );
};
