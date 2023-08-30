import { Box, Button, Center, Checkbox, Drawer, DrawerBody, DrawerContent, DrawerFooter, DrawerOverlay, Flex, FormControl, FormLabel, Grid, HStack, Input, InputGroup, InputLeftAddon, Menu, MenuButton, MenuItem, MenuList, Modal, ModalBody, ModalCloseButton, ModalContent, ModalHeader, ModalOverlay, Select, Text, Textarea, VStack, useDisclosure, useToast } from "@chakra-ui/react"
import { IDepartmentalService } from "../../../types"
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MdMoreVert } from "react-icons/md";
import { useForm } from "react-hook-form";
import { FaSign } from "react-icons/fa";
import { useFullUserByPk } from "../../../lib/hooks/useFullUserByPk";
import { UserProfile } from "../Users/UserProfile";
import { FcOk, FcCancel } from "react-icons/fc";
import { deleteDepartmentalService, updateDepartmentalService } from "../../../lib/api";

export const ServiceItemDisplay = ({ pk, name, director }: IDepartmentalService) => {

    const { register, handleSubmit } = useForm<IDepartmentalService>();

    const toast = useToast();
    const { isOpen: isDeleteModalOpen, onOpen: onDeleteModalOpen, onClose: onDeleteModalClose } = useDisclosure();
    const { isOpen: isUpdateaModalOpen, onOpen: onUpdateModalOpen, onClose: onUpdateModalClose } = useDisclosure();
    const queryClient = useQueryClient();
    const { userLoading, userData } = useFullUserByPk(director);

    const { isOpen: isUserOpen, onOpen: onUserOpen, onClose: onUserClose } = useDisclosure();
    const drawerFunction = () => {
        console.log(`${userData?.first_name} clicked`);
        onUserOpen();
    }

    const updateMutation = useMutation(updateDepartmentalService,
        {
            onSuccess: () => {
                // console.log("success")
                toast({
                    status: "success",
                    title: "Updated",
                    position: "top-right"
                })
                onUpdateModalClose();
                queryClient.invalidateQueries(["departmentalServices"]);

            },
            onError: () => {
                // console.log("error")
                toast({
                    status: "error",
                    title: "Failed",
                    position: "top-right"
                })
            },
            onMutate: () => {
                // console.log("attempting update private")
            }
        })


    const deleteMutation = useMutation(deleteDepartmentalService,
        {
            onSuccess: () => {
                // console.log("success")
                toast({
                    status: "success",
                    title: "Deleted",
                    position: "top-right"
                })
                onDeleteModalClose();
                queryClient.invalidateQueries(["departmentalServices"]);

            },
            onError: () => {
                // console.log("error")

            },
            onMutate: () => {
                // console.log("mutation")

            }
        }
    );

    const deleteButtonClick = () => {
        // console.log("deleted")
        deleteMutation.mutate(pk);
    }

    const onUpdateSubmit = (formData: IDepartmentalService) => {
        updateMutation.mutate(formData);
    }

    return (
        !userLoading && userData
            ?
            (
                <>
                    <Drawer
                        isOpen={isUserOpen}
                        placement='right'
                        onClose={onUserClose}
                        size={"sm"} //by default is xs
                    >
                        <DrawerOverlay />
                        <DrawerContent>
                            <DrawerBody>
                                <UserProfile
                                    pk={director}
                                />
                            </DrawerBody>

                            <DrawerFooter>
                            </DrawerFooter>
                        </DrawerContent>
                    </Drawer>

                    <Grid
                        gridTemplateColumns="6fr 3fr 1fr"
                        width="100%"
                        p={3}
                        borderWidth={1}
                    >
                        <Flex justifyContent="flex-start"
                            ml={4}
                        >
                            <Center
                            >
                                <Text>{name}</Text>
                            </Center>
                        </Flex>

                        <Flex
                        >
                            <Button
                                variant={"link"}
                                colorScheme="blue"
                                onClick={drawerFunction}
                            >
                                {userData.first_name} {userData.last_name}</Button>
                        </Flex>
                        <Flex justifyContent="flex-end"
                            alignItems={"center"}
                        >
                            <Menu
                            >
                                <MenuButton
                                    px={2}
                                    py={2}
                                    transition='all 0.2s'
                                    rounded={4}
                                    borderRadius='md'
                                    borderWidth='1px'
                                    _hover={{ bg: 'gray.400' }}
                                    _expanded={{ bg: 'blue.400' }}
                                    _focus={{ boxShadow: 'outline' }}
                                    mr={4}

                                >
                                    <Flex alignItems={"center"} justifyContent={"center"}>

                                        <MdMoreVert />
                                    </Flex>

                                </MenuButton>
                                <MenuList>
                                    <MenuItem onClick={onUpdateModalOpen}>
                                        Edit
                                    </MenuItem>
                                    <MenuItem onClick={onDeleteModalOpen}>
                                        Delete
                                    </MenuItem>
                                </MenuList>
                            </Menu>
                        </Flex>
                    </Grid>

                    <Modal isOpen={isDeleteModalOpen} onClose={onDeleteModalClose}>
                        <ModalOverlay />
                        <ModalHeader>Delete Research Function</ModalHeader>
                        <ModalBody
                        >
                            <ModalContent bg="white" p={4}
                                w={"100%"}
                                h={"100%"}
                            >
                                <Center
                                    w={"100%"}
                                    h={"100%"}
                                >
                                    <Grid
                                        gridGap={20}
                                    >
                                        <Box
                                            alignContent={"center"}
                                        >
                                            <Text fontSize={"xl"}
                                                fontWeight={"bold"}
                                            >
                                                Are you sure you want to delete this research function?
                                            </Text>

                                        </Box>
                                        <Flex
                                            // bg="red"
                                            justifyContent={"space-evenly"}
                                        >
                                            <Button onClick={deleteButtonClick}>Yes</Button>
                                            <Button onClick={onDeleteModalClose}>No</Button>
                                        </Flex>
                                    </Grid>
                                </Center>

                            </ModalContent>
                        </ModalBody>
                    </Modal>
                    <Modal isOpen={isUpdateaModalOpen} onClose={onUpdateModalClose}>
                        <ModalOverlay />
                        <ModalHeader>Update Research Function</ModalHeader>
                        <ModalBody>
                            <ModalContent bg="white" p={4}>
                                <FormControl>
                                    {/* Hidden input to capture the pk */}
                                    <input
                                        type="hidden"
                                        {...register("pk")}
                                        defaultValue={pk} // Prefill with the 'pk' prop
                                    />
                                </FormControl>
                                <VStack spacing={10} as="form" id="update-form" onSubmit={handleSubmit(onUpdateSubmit)}>
                                    <FormControl>
                                        <FormLabel>Name</FormLabel>
                                        <InputGroup>
                                            <InputLeftAddon children={<FaSign />} />
                                            <Input
                                                {...register("name", { required: true })}
                                                required
                                                type="text"
                                                defaultValue={name} // Prefill
                                            />
                                        </InputGroup>
                                    </FormControl>

                                    <FormControl>
                                        <FormLabel>Director</FormLabel>
                                        <Input
                                            {...register("director", { required: true })}
                                            defaultValue={director} // Prefill 
                                        />
                                    </FormControl>

                                    {updateMutation.isError ? (
                                        <Text color={"red.500"}>Something went wrong</Text>
                                    ) : null}
                                </VStack>
                                <Grid
                                    mt={10}
                                    w={"100%"}
                                    justifyContent={"end"}
                                    gridTemplateColumns={"repeat(2, 1fr)"}
                                    gridGap={4}
                                >
                                    <Button onClick={onUpdateModalClose}
                                        size="lg"

                                    >Cancel</Button>
                                    <Button
                                        form="update-form"
                                        type="submit"
                                        isLoading={updateMutation.isLoading}
                                        colorScheme="blue"
                                        size="lg"
                                    >
                                        Update
                                    </Button>
                                </Grid>

                            </ModalContent>
                        </ModalBody>
                    </Modal>

                </>
            )
            :
            null

    )
}