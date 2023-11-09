import { Text, Center, Flex, Modal, ModalBody, ModalCloseButton, ModalContent, ModalHeader, ModalOverlay, ToastId, useToast, useColorMode, UnorderedList, ListItem, FormControl, InputGroup, Input, ModalFooter, Grid, Button, Select, FormHelperText, Spinner } from "@chakra-ui/react";
import { ISpawnDocument, spawnDocument } from "../../lib/api";
import { useEffect, useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useGetAvailableReportYears } from "../../lib/hooks/useGetAvailableReportYears";

interface Props {
    projectPk: string | number;
    documentKind: "progressreport";
    refetchData: () => void;
    isOpen: boolean;
    onClose: () => void;
}

export const CreateProgressReportModal = ({ projectPk, documentKind, refetchData, isOpen, onClose }: Props) => {

    const { availableReportYearsLoading, availableReportYearsData } = useGetAvailableReportYears(Number(projectPk));


    const { register, handleSubmit, reset, watch } = useForm<ISpawnDocument>();

    const yearValue = watch('year')
    const projPk = watch('projectPk');

    const [selectedReportId, setSelectedReportId] = useState<number>();
    const reportValue = watch('report_id')

    useEffect(() => {
        if (!availableReportYearsLoading && availableReportYearsData && yearValue) {
            const obj = availableReportYearsData.find(item => Number(item.year) === Number(yearValue));
            // console.log(obj)
            setSelectedReportId(obj.pk);

        }
    }, [yearValue, reportValue, availableReportYearsData, availableReportYearsLoading])

    const navigate = useNavigate();



    const toast = useToast();
    const toastIdRef = useRef<ToastId>();
    const addToast = (data: any) => {
        toastIdRef.current = toast(data)
    }


    // Mutation, query client, onsubmit, and api function 
    const queryClient = useQueryClient();

    const createProgressReportMutation = useMutation(spawnDocument,
        {
            onMutate: () => {
                addToast({
                    status: "loading",
                    title: `Creating Progress Report`,
                    position: "top-right"
                })
            },
            onSuccess: async (data) => {
                if (toastIdRef.current) {
                    toast.update(toastIdRef.current, {
                        title: 'Success',
                        description: `Progress Report Created`,
                        status: 'success',
                        position: "top-right",
                        duration: 3000,
                        isClosable: true,
                    })
                }
                // onClose();

                setTimeout(() => {
                    // if (setIsAnimating) {
                    //     setIsAnimating(false)
                    // }
                    queryClient.invalidateQueries(["projects", projectPk]);
                    refetchData();
                    onClose();
                }, 350)
            },
            onError: (error) => {
                if (toastIdRef.current) {
                    toast.update(toastIdRef.current, {
                        title: `Could not create progress report`,
                        description: `${error}`,
                        status: 'error',
                        position: "top-right",
                        duration: 3000,
                        isClosable: true,
                    })
                }
            }


        })


    const createProgressReportFunc = (formData: ISpawnDocument) => {

        const newFormData = {
            "report_id": selectedReportId,
            "year": formData.year,
            "kind": formData.kind,
            "projectPk": formData.projectPk,
        }

        console.log(newFormData);


        createProgressReportMutation.mutate(newFormData);
    }

    const { colorMode } = useColorMode();


    // useEffect(() => console.log(projPk, projectPk), [projectPk, projPk])

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            size={"md"}
        >
            <ModalOverlay />
            <Flex as={"form"}
                onSubmit={handleSubmit(createProgressReportFunc)}>
                <ModalContent bg={colorMode === "light" ? "white" : "gray.800"}>
                    <ModalHeader>Create Progress Report?</ModalHeader>
                    <ModalCloseButton />
                    {!availableReportYearsLoading
                        ?
                        (<>
                            <ModalBody>
                                <Center
                                    mt={8}
                                >
                                    <UnorderedList>
                                        <ListItem>This will create a progress report for the selected year.</ListItem>
                                        <ListItem>Years will only appear based on whether an annual report exists for that year</ListItem>
                                        <ListItem>Years which already have progress reports for this project will not be selectable</ListItem>
                                    </UnorderedList>
                                </Center>
                                <FormControl>
                                    <InputGroup>
                                        <Input type="hidden" {...register("projectPk", { required: true, value: Number(projectPk) })} readOnly />
                                    </InputGroup>
                                </FormControl>

                                <FormControl
                                    mt={6}
                                >
                                    <Select
                                        placeholder={'Select a report year'}
                                        {...register("year", { required: true })}
                                    >
                                        {availableReportYearsData?.map((freeReportYear, index: number) => {
                                            // console.log(freeReportYear.year)
                                            // console.log(yearValue)
                                            return (
                                                <option key={index} value={freeReportYear.year}
                                                // selected={ba.pk === currentBaData?.pk || ba.pk === undefined}
                                                >
                                                    {freeReportYear.year}
                                                </option>
                                            )
                                        })}
                                    </Select>
                                    <FormHelperText>Select an annual report for this progress report</FormHelperText>
                                </FormControl>


                                <FormControl>
                                    <InputGroup>
                                        <Input type="hidden" {...register("kind", { required: true, value: documentKind })} readOnly />
                                    </InputGroup>
                                </FormControl>
                            </ModalBody>
                            <ModalFooter>
                                <Grid
                                    gridTemplateColumns={"repeat(2, 1fr)"}
                                    gridGap={4}
                                >
                                    <Button
                                        colorScheme="gray"
                                        onClick={onClose}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        colorScheme="green"
                                        isLoading={createProgressReportMutation.isLoading}
                                        isDisabled={!yearValue || !selectedReportId || !projPk}
                                        type="submit"
                                        ml={3}
                                    >
                                        Create
                                    </Button>
                                </Grid>
                            </ModalFooter>
                        </>)
                        :
                        <Spinner />
                    }
                </ModalContent>
            </Flex>

        </Modal>

    )
}