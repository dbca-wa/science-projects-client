import { Button, FormControl, FormLabel, Input, InputGroup, InputLeftAddon, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Textarea, ToastId, useColorMode, useDisclosure, useToast } from "@chakra-ui/react"
import { MdOutlineTitle } from "react-icons/md"
import { IQuickTask } from "../../types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { useRef } from "react";
import { createPersonalTask } from "../../lib/api";

interface IUserInterface {
    userData: any;
    isLoggedIn: boolean;
    userLoading: boolean;
}

interface Props {
    user: IUserInterface;
    isAnimating?: boolean;
    setIsAnimating?: (state: boolean) => void;
    isAddTaskOpen: boolean;
    onAddTaskClose: () => void;

}

export const AddPersonalTaskModal = ({ user, isAnimating, setIsAnimating, isAddTaskOpen, onAddTaskClose }: Props) => {
    const { colorMode } = useColorMode();
    const queryClient = useQueryClient();
    const { register, handleSubmit, reset } = useForm<IQuickTask>();
    const toast = useToast();
    const toastIdRef = useRef<ToastId>();
    const addToast = (data: any) => {
        toastIdRef.current = toast(data)
    }

    const taskCreationMutation = useMutation(createPersonalTask,
        {
            onMutate: () => {
                addToast({
                    status: "loading",
                    title: "Creating Task",
                    position: "top-right"
                })
            },
            onSuccess: (data) => {
                if (setIsAnimating) {
                    setIsAnimating(true)

                }


                if (toastIdRef.current) {
                    toast.update(toastIdRef.current, {
                        title: 'Success',
                        description: `Task Created`,
                        status: 'success',
                        position: "top-right",
                        duration: 3000,
                        isClosable: true,
                    })
                }
                reset()
                onAddTaskClose()

                setTimeout(() => {
                    if (setIsAnimating) {
                        setIsAnimating(false)
                    }
                    queryClient.invalidateQueries(["mytasks"]);

                    // queryClient.refetchQueries([`mytasks`])
                }, 350)
            },
            onError: (error) => {
                if (toastIdRef.current) {
                    toast.update(toastIdRef.current, {
                        title: 'Could Not Create Task',
                        description: `${error}`,
                        status: 'error',
                        position: "top-right",
                        duration: 3000,
                        isClosable: true,
                    })
                }
            }


        })

    const onSubmitTaskCreation = (formData: IQuickTask) => {
        taskCreationMutation.mutate(formData);
    }


    return (
        <Modal
            isOpen={isAddTaskOpen}
            onClose={onAddTaskClose}
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
                    Create Personal Task
                </ModalHeader>
                <ModalCloseButton />

                <ModalBody
                    as="form" id="taskcreation-form"
                    onSubmit={handleSubmit(onSubmitTaskCreation)}
                >
                    {user.userLoading === false
                        &&
                        (
                            <Input
                                {...register("user", { required: true })}
                                type="hidden"
                                defaultValue={user.userData.pk}
                            />
                        )}

                    <FormControl
                        pb={6}
                    >
                        <FormLabel>Title</FormLabel>
                        <InputGroup>
                            <InputLeftAddon children={<MdOutlineTitle />} />
                            <Input
                                placeholder="Enter the title of the task..."
                                {...register("name", { required: true })}
                                type="text"
                            />
                        </InputGroup>
                    </FormControl>

                    <FormControl>
                        <FormLabel>Description</FormLabel>
                        <InputGroup>
                            <Textarea
                                mt={2}
                                placeholder="Enter description text for the task..."
                                {...register("description", { required: true })}
                            />
                        </InputGroup>
                    </FormControl>
                </ModalBody>

                <ModalFooter>
                    <Button variant="ghost" mr={3} onClick={onAddTaskClose}>
                        Cancel
                    </Button>
                    <Button
                        form="taskcreation-form"
                        type="submit"
                        isLoading={taskCreationMutation.isLoading}
                        bg={colorMode === "dark" ? "green.500" : "green.400"}
                        color={"white"}
                        _hover={
                            {
                                bg: colorMode === "dark" ? "green.400" : "green.300",
                            }
                        }
                    >
                        Create
                    </Button>
                </ModalFooter>
            </ModalContent>

        </Modal>
    )
}