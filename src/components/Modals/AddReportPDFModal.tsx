import { Button, Text, FormControl, FormLabel, Input, InputGroup, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Select, Textarea, ToastId, useColorMode, useDisclosure, useToast, FormHelperText } from "@chakra-ui/react"
import { MdOutlineTitle } from "react-icons/md"
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { useEffect, useRef, useState } from "react";
import { useUser } from "../../lib/hooks/useUser";
import { IAddPDF, addPDFToReport } from "../../lib/api";
import { useGetARARsWithoputPDF } from "../../lib/hooks/useGetARARsWithoputPDF";
import { SingleFileUpload } from "../SingleFileStateUpload";
import { report } from "process";


interface Props {
    isAddPDFOpen: boolean;
    onAddPDFClose: () => void;
    refetchPDFs: () => void;
}

export const AddReportPDFModal = ({ isAddPDFOpen, onAddPDFClose, refetchPDFs }: Props) => {
    const { colorMode } = useColorMode();
    const queryClient = useQueryClient();
    // const { register, handleSubmit, reset, watch } = useForm<IAddPDF>();
    // const reportPk = watch('reportId');

    const toast = useToast();
    const toastIdRef = useRef<ToastId>();
    const addToast = (data: any) => {
        toastIdRef.current = toast(data)
    }


    const [uploadedPDF, setUploadedPDF] = useState<File>();
    const [reportId, setReportId] = useState<number>();
    const [isError, setIsError] = useState(false);

    const { userData, userLoading } = useUser();
    const { reportsWithoutPDFLoading, reportsWithoutPDFData, refetchReportsWithoutPDFs } = useGetARARsWithoputPDF();

    useEffect(() => {
        if (!reportsWithoutPDFLoading && reportsWithoutPDFData) {
            setReportId(reportsWithoutPDFData.length > 0 ? reportsWithoutPDFData[0]?.pk : 0);
        }
    }, [reportsWithoutPDFLoading, reportsWithoutPDFData])

    const ararPDFAdditionMutation = useMutation(addPDFToReport,
        {
            onMutate: () => {
                addToast({
                    status: "loading",
                    title: "Adding PDF",
                    position: "top-right"
                })
            },
            onSuccess: (data) => {

                if (toastIdRef.current) {
                    toast.update(toastIdRef.current, {
                        title: 'Success',
                        description: `PDF Added`,
                        status: 'success',
                        position: "top-right",
                        duration: 3000,
                        isClosable: true,
                    })
                }
                // reset()
                onAddPDFClose()

                setTimeout(() => {
                    queryClient.invalidateQueries(["ararsWithoutPDFs"]);
                    queryClient.invalidateQueries(["ararsWithPDFs"]);
                    refetchPDFs();
                    refetchReportsWithoutPDFs();
                }, 350)
            },
            onError: (error) => {
                if (toastIdRef.current) {
                    toast.update(toastIdRef.current, {
                        title: 'Could Not Add PDF',
                        description: `${error}`,
                        status: 'error',
                        position: "top-right",
                        duration: 3000,
                        isClosable: true,
                    })
                }
            }


        })

    const onSubmitPDFAdd = () => {
        console.log(reportId);
        console.log(uploadedPDF);
        const formData = {
            userId: userData?.pk ? userData.pk : userData.id,
            reportId,
            pdfFile: uploadedPDF,
        }
        ararPDFAdditionMutation.mutate(formData);
    }


    return (
        <Modal
            isOpen={isAddPDFOpen}
            onClose={onAddPDFClose}
            size={"sm"}
        // scrollBehavior="inside"
        // isCentered={true}
        >
            <ModalOverlay />
            <ModalContent
                color={colorMode === "light" ? "black" : "white"}
                bg={colorMode === "light" ? "white" : "gray.800"}
            >
                <ModalHeader
                >
                    Add PDF to Report
                </ModalHeader>
                <ModalCloseButton />

                <ModalBody
                // as="form" id="addpdf-form"
                // onSubmit={handleSubmit(onSubmitPDFAdd)}
                >
                    <Text
                        mb={4}
                    >
                        Use this form to add the finalized pdf to the report.
                    </Text>
                    {/* {user.userLoading === false
                        &&
                        (
                            <Input
                                {...register("user", { required: true })}
                                type="hidden"
                                defaultValue={user.userData.pk}
                            />
                        )} */}


                    {!reportsWithoutPDFLoading && reportsWithoutPDFData ? (
                        <>
                            <FormControl
                                pb={6}
                            >
                                <FormLabel>Selected Report</FormLabel>
                                <Select
                                    value={reportsWithoutPDFData.length > 0 ? reportsWithoutPDFData[0]?.pk : 0}
                                    onChange={(e) => setReportId(Number(e.target.value))}
                                >
                                    {!reportsWithoutPDFLoading && (
                                        reportsWithoutPDFData.map((report, index) => (
                                            <option
                                                key={index}
                                                value={report?.pk}
                                            >
                                                {report?.year}
                                            </option>
                                        )
                                        ))}
                                </Select>
                            </FormControl>

                        </>
                    ) : null}

                    <FormControl>
                        <FormLabel>PDF File</FormLabel>
                        <SingleFileUpload
                            fileType={"pdf"}
                            uploadedFile={uploadedPDF}
                            setUploadedFile={setUploadedPDF}
                            isError={isError}
                            setIsError={setIsError}
                        />

                    </FormControl>
                </ModalBody>

                <ModalFooter>
                    <Button
                        // variant="ghost" 
                        mr={3} onClick={onAddPDFClose}>
                        Cancel
                    </Button>
                    <Button
                        // form="addpdf-form"
                        // type="submit"
                        isLoading={ararPDFAdditionMutation.isLoading}
                        bg={colorMode === "dark" ? "green.500" : "green.400"}
                        color={"white"}
                        _hover={
                            {
                                bg: colorMode === "dark" ? "green.400" : "green.300",
                            }
                        }
                        isDisabled={!uploadedPDF || !reportId || reportId === 0 || isError}
                        onClick={() => {
                            onSubmitPDFAdd();
                        }}
                    >
                        Add
                    </Button>
                </ModalFooter>
            </ModalContent>

        </Modal>
    )
}