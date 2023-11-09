import { Text, Center, Flex, Modal, ModalBody, ModalCloseButton, ModalContent, ModalHeader, ModalOverlay, ToastId, useToast, useColorMode, UnorderedList, ListItem, FormControl, InputGroup, Input, ModalFooter, Grid, Button, Select, Box, FormLabel, FormHelperText, Textarea } from "@chakra-ui/react";
import { ICloseProjectProps, ISimplePkProp, closeProjectCall, deleteProjectCall, openProjectCall } from "../../lib/api";
import { useEffect, useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { IUserMe } from "../../types";
import { useForm } from "react-hook-form";
import { SimpleStateRichTextEditor } from "../RichTextEditor/Editors/SimpleStateRichTextEditor";

interface Props {
    // thisUser: IUserMe;
    // leaderPk: number;
    projectPk: string | number;
    isOpen: boolean;
    onClose: () => void;
    refetchData: () => void;

}

export const ProjectReopenModal = ({ projectPk, isOpen, onClose, refetchData }: Props) => {

    const { register, handleSubmit, reset, watch } = useForm<ISimplePkProp>();
    const projPk = watch('pk');

    const navigate = useNavigate();

    const toast = useToast();
    const toastIdRef = useRef<ToastId>();
    const addToast = (data: any) => {
        toastIdRef.current = toast(data)
    }


    // Mutation, query client, onsubmit, and api function 
    const queryClient = useQueryClient();

    const reopenMutation = useMutation(openProjectCall,
        {
            onMutate: () => {
                addToast({
                    status: "loading",
                    title: `Repening Project`,
                    position: "top-right"
                })
            },
            onSuccess: async (data) => {
                if (toastIdRef.current) {
                    toast.update(toastIdRef.current, {
                        title: 'Success',
                        description: `Project has been reopened`,
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

                    // navigate('/projects');

                    // queryClient.refetchQueries([`mytasks`])
                }, 350)
            },
            onError: (error) => {
                if (toastIdRef.current) {
                    toast.update(toastIdRef.current, {
                        title: `Could not reopen project`,
                        description: `${error}`,
                        status: 'error',
                        position: "top-right",
                        duration: 3000,
                        isClosable: true,
                    })
                }
            }


        })


    const openProject = (formData: ISimplePkProp) => {
        console.log(formData);
        const newForm = {
            "pk": projPk,
        }
        reopenMutation.mutate(newForm);
    }

    const { colorMode } = useColorMode();

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            size={"md"}
        >
            <ModalOverlay />
            <Flex
                as={"form"}
                onSubmit={handleSubmit(openProject)}
            >
                <ModalContent bg={colorMode === "light" ? "white" : "gray.800"}>
                    <ModalHeader>Are you sure you want to reopen this project?</ModalHeader>
                    <ModalCloseButton />

                    <ModalBody>
                        <Grid
                            gridTemplateColumns={"repeat(1, 1fr)"}
                            gridGap={10}
                        >



                            <Box
                                bg={"gray.50"}
                                rounded={'2xl'}
                                p={2}
                            >

                                <Box
                                    px={4}
                                >
                                    <Text
                                        fontWeight={"semibold"}
                                        fontSize={"xl"}
                                    >
                                        Info
                                    </Text>

                                </Box>


                                <Box
                                    mt={8}
                                >
                                    <Box
                                        px={4}
                                    >
                                        <Text>
                                            The following will occur:
                                        </Text>
                                    </Box>
                                    <UnorderedList px={10} pt={4}>
                                        <ListItem>The project will become active, with the status set to 'updating'</ListItem>
                                        <ListItem>The project closure document will be deleted</ListItem>
                                        <ListItem>Progress Reports can be created again</ListItem>
                                    </UnorderedList>
                                </Box>

                                <Center
                                    mt={2}
                                    p={5}
                                    pb={3}
                                >
                                    <Text
                                        fontWeight={"bold"}
                                        color={"blue.400"}
                                        textDecoration={'underline'}
                                    >
                                        You can close the project again at any time.
                                    </Text>
                                </Center>


                                <FormControl>
                                    <InputGroup>
                                        <Input type="hidden" {...register("pk", { required: true, value: Number(projectPk) })} readOnly />
                                    </InputGroup>
                                </FormControl>
                            </Box>

                        </Grid>


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
                                isLoading={reopenMutation.isLoading}
                                type="submit"
                                ml={3}

                            >
                                Open Project
                            </Button>
                        </Grid>
                    </ModalFooter>
                </ModalContent>
            </Flex>

        </Modal>

    )
}