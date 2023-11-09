import { Text, Center, Flex, Modal, ModalBody, ModalCloseButton, ModalContent, ModalHeader, ModalOverlay, ToastId, useToast, useColorMode, UnorderedList, ListItem, FormControl, InputGroup, Input, ModalFooter, Grid, Button } from "@chakra-ui/react";
import { ISimplePkProp, deleteProjectCall } from "../../lib/api";
import { useEffect, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { IUserMe } from "../../types";
import { useForm } from "react-hook-form";

interface Props {
    // thisUser: IUserMe;
    // leaderPk: number;
    projectPk: string | number;
    isOpen: boolean;
    onClose: () => void;
}

export const DeleteProjectModal = ({ projectPk, isOpen, onClose }: Props) => {

    const navigate = useNavigate();

    const toast = useToast();
    const toastIdRef = useRef<ToastId>();
    const addToast = (data: any) => {
        toastIdRef.current = toast(data)
    }


    // Mutation, query client, onsubmit, and api function 
    const queryClient = useQueryClient();

    const deleteProjectMutation = useMutation(deleteProjectCall,
        {
            onMutate: () => {
                addToast({
                    status: "loading",
                    title: `Deleting`,
                    position: "top-right"
                })
            },
            onSuccess: async (data) => {
                if (toastIdRef.current) {
                    toast.update(toastIdRef.current, {
                        title: 'Success',
                        description: `Project Deleted`,
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
                    navigate('/projects');

                    // queryClient.refetchQueries([`mytasks`])
                }, 350)
            },
            onError: (error) => {
                if (toastIdRef.current) {
                    toast.update(toastIdRef.current, {
                        title: `Could Not delete project`,
                        description: `${error}`,
                        status: 'error',
                        position: "top-right",
                        duration: 3000,
                        isClosable: true,
                    })
                }
            }


        })


    const deleteProject = (formData: ISimplePkProp) => {
        console.log(formData)
        deleteProjectMutation.mutate(formData);
    }

    const { colorMode } = useColorMode();
    const { register, handleSubmit, reset, watch } = useForm<ISimplePkProp>();

    const projPk = watch('pk');
    useEffect(() => console.log(projPk, projectPk), [projectPk, projPk])

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            size={"md"}
        >
            <ModalOverlay />
            <Flex as={"form"}
                onSubmit={handleSubmit(deleteProject)}>
                <ModalContent bg={colorMode === "light" ? "white" : "gray.800"}>
                    <ModalHeader>Delete Project?</ModalHeader>
                    <ModalCloseButton />

                    <ModalBody>

                        <Center>
                            <Text
                                fontWeight={"semibold"}
                                fontSize={"xl"}
                            >
                                Are you sure you want to delete this project? There's no turning back.
                            </Text>
                        </Center>
                        <Center
                            mt={8}
                        >
                            <UnorderedList>
                                <ListItem>The Project team and area will be cleared</ListItem>
                                <ListItem>The project photo will be deleted</ListItem>
                                <ListItem>Any related comments will be deleted</ListItem>
                                <ListItem>All related documents will be deleted</ListItem>
                            </UnorderedList>
                        </Center>
                        <FormControl>
                            <InputGroup>
                                <Input type="hidden" {...register("pk", { required: true, value: Number(projectPk) })} readOnly />
                            </InputGroup>
                        </FormControl>
                        <Center
                            mt={2}
                            p={5}
                            pb={3}
                        >
                            <Text
                                fontWeight={"bold"}
                                color={"red.400"}
                                textDecoration={'underline'}
                            >
                                This is permanent.
                            </Text>
                        </Center>
                        <Center
                            p={5}
                        >

                            <Text
                                fontWeight={"semibold"}
                                color={"blue.500"}
                            >
                                If instead you wish to create a project closure, please press cancel and select 'Create Closure' from the vertical ellipsis.
                            </Text>
                        </Center>



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
                                colorScheme="red"
                                // isDisabled={!changesMade}
                                isLoading={deleteProjectMutation.isLoading}
                                type="submit"
                                // bgColor={colorMode === "light" ? `green.500` : `green.600`}
                                // color={colorMode === "light" ? `white` : `whiteAlpha.900`}
                                // _hover={{
                                //     bg: colorMode === "light" ? `green.600` : `green.400`,
                                //     color: colorMode === "light" ? `white` : `white`
                                // }}
                                ml={3}

                            >
                                Delete
                            </Button>
                        </Grid>
                    </ModalFooter>
                </ModalContent>
            </Flex>

        </Modal>

    )
}