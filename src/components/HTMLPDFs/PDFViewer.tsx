import { IDocGen, cancelAnnualReportPDF, generateAnnualReportPDF } from "@/lib/api";
import useApiEndpoint from "@/lib/hooks/useApiEndpoint";
import { useGetAnnualReportPDF } from "@/lib/hooks/useGetAnnualReportPDF";
import { IReport } from "@/types";
import { Box, Button, Center, Flex, Input, Spinner, Text, ToastId, useColorMode, useToast } from "@chakra-ui/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError, AxiosResponse } from "axios";
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

export const PDFViewer = ({ thisReport,
    // refetchData 
}: Props) => {

    const { register: genRegister, handleSubmit: handleGenSubmit } = useForm<IDocGen>();
    const { register: cancelGenRegister, handleSubmit: handleCancelGenSubmit } = useForm<IDocGen>();

    const apiEndpoint = useApiEndpoint();
    const queryClient = useQueryClient();

    const toast = useToast();
    const toastIdRef = useRef<ToastId>();
    const addToast = (data) => {
        toastIdRef.current = toast(data);
    };
    const annualReportPDFGenerationMutation = useMutation(generateAnnualReportPDF, {
        onMutate: () => {
            addToast({
                status: "loading",
                title: "Generating AR PDF",
                position: "top-right",
            });
        },
        onSuccess: (response: { res: AxiosResponse<any, any> }) => {
            if (toastIdRef.current) {
                toast.update(toastIdRef.current, {
                    title: "Success",
                    description: `AR PDF Generated`,
                    status: "success",
                    position: "top-right",
                    duration: 3000,
                    isClosable: true,
                });
            }
            // console.log(response);
            // console.log(response.res)
            // const fileUrl = `${apiEndpoint}${response.res.data.file}`;

            // if (fileUrl) {
            //     window.open(fileUrl, "_blank")
            // }

            queryClient.invalidateQueries(["annualReportPDF", thisReport?.pk ? thisReport.pk : thisReport.id]);

            // setTimeout(() => {
            //     refetchData();
            // }, 1000);
        },
        onError: (error: AxiosError) => {
            if (toastIdRef.current) {
                toast.update(toastIdRef.current, {
                    title: "Could Not Generate AR PDF",
                    description: error?.response?.data
                        ? `${error.response.status}: ${Object.values(error.response.data)[0]
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


    const cancelDocGenerationMutation = useMutation(cancelAnnualReportPDF, {
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
            queryClient.invalidateQueries(["annualReportPDF", thisReport?.pk ? thisReport.pk : thisReport.id]);

            // setTimeout(() => {
            //     refetchData();
            // }, 1000);
        },
        onError: (error: AxiosError) => {
            if (toastIdRef.current) {
                toast.update(toastIdRef.current, {
                    title: "Could Not Cancel",
                    description: error?.response?.data
                        ? `${error.response.status}: ${Object.values(error.response.data)[0]
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
    }

    const beginProjectDocPDFGeneration = (formData: IDocGen) => {
        console.log(formData)
        annualReportPDFGenerationMutation.mutate(formData);
    };



    const { pdfDocumentData, pdfDocumentDataLoading } = useGetAnnualReportPDF(thisReport?.pk ? thisReport.pk : thisReport?.id);
    const [binaryPdfData, setBinaryPdfData] = useState<string | null>(null);

    const { colorMode } = useColorMode();

    useEffect(() => {
        if (!pdfDocumentDataLoading) {
            // console.log(pdfDocumentData);
            const binary = atob(pdfDocumentData?.pdf_data);
            const arrayBuffer = new ArrayBuffer(binary.length);
            const uint8Array = new Uint8Array(arrayBuffer);

            for (let i = 0; i < binary.length; i++) {
                uint8Array[i] = binary.charCodeAt(i);
            }

            const blob = new Blob([arrayBuffer], { type: 'application/pdf' });
            const dataUrl = URL.createObjectURL(blob);

            // console.log(dataUrl);
            setBinaryPdfData(dataUrl);

        }
    }, [pdfDocumentDataLoading, pdfDocumentData])

    const determineDPI = () => {
        const dpi = 300;
        const heightMm = 297;
        const mmInInch = 25.4
        // Pixels: Amount in mm divided by 25.4 (conv fact. for mm to inches) by dpi
        const pixels = (heightMm / mmInInch) * dpi;
        return pixels;
    }

    return (
        pdfDocumentDataLoading || !binaryPdfData ? <Center><Spinner /></Center> :
            <Box>
                <Flex
                    alignContent={"center"}
                    justifyContent={"space-between"}
                    mb={4}
                >
                    <Center>
                        <Text>You may download this pdf or create a new one with more recent data in under 10 seconds.</Text>

                    </Center>
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

                        {
                            annualReportPDFGenerationMutation.isLoading ||
                                pdfDocumentData?.report?.pdf_generation_in_progress
                                ?
                                <Button
                                    size={"sm"}
                                    ml={2}
                                    variant={"solid"}
                                    color={"white"}
                                    background={
                                        colorMode === "light" ? "gray.400" : "gray.500"
                                    }
                                    _hover={{
                                        background:
                                            colorMode === "light" ? "gray.300" : "gray.400",
                                    }}
                                    loadingText={"Canceling"}
                                    isDisabled={
                                        cancelDocGenerationMutation.isLoading
                                    }
                                    type="submit"
                                    form="cancel-pdf-generation-form"
                                    isLoading={
                                        cancelDocGenerationMutation.isLoading
                                    }
                                >
                                    <Box mr={2}><FcCancel /></Box>
                                    Cancel
                                </Button> :
                                pdfDocumentData?.pdf_data ?
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
                                        background={
                                            colorMode === "light" ? "blue.500" : "blue.600"
                                        }
                                        _hover={{
                                            cursor: "pointer",
                                            background:
                                                colorMode === "light" ? "blue.400" : "blue.500",
                                        }}
                                        onClick={() => {
                                            window.open(`${apiEndpoint}${pdfDocumentData?.file}`, "_blank")
                                        }}
                                    >
                                        <Box mr={2}><FaFileDownload /></Box>
                                        Download PDF
                                    </Button>
                                    : null
                        }
                        <Button
                            size={"sm"}
                            ml={2}
                            variant={"solid"}
                            color={"white"}
                            background={
                                colorMode === "light" ? "green.500" : "green.600"
                            }
                            _hover={{
                                cursor: "pointer",
                                background:
                                    colorMode === "light" ? "green.400" : "green.500",
                            }}
                            loadingText={"Generation In Progress"}
                            isDisabled={
                                annualReportPDFGenerationMutation.isLoading ||
                                pdfDocumentData?.report?.pdf_generation_in_progress
                            }
                            type="submit"
                            form="pdf-generation-form"
                            isLoading={
                                annualReportPDFGenerationMutation.isLoading ||
                                pdfDocumentData?.report?.pdf_generation_in_progress
                            }
                        >
                            <Box mr={2}><BsStars /></Box>
                            Generate New
                        </Button>
                    </Flex>
                </Flex>
                <iframe
                    title="Annual Report PDF Viewer"
                    src={binaryPdfData}
                    width="100%"
                    height={`${determineDPI()}px`}
                    style={{ border: '1px solid black', borderRadius: "20px" }}
                ></iframe>
            </Box>
    )
}