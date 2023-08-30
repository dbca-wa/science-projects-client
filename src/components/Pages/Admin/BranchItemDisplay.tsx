import { Box, Button, Center, Drawer, DrawerBody, DrawerContent, DrawerFooter, DrawerOverlay, Flex, FormControl, FormLabel, Grid, HStack, Input, InputGroup, InputLeftAddon, Menu, MenuButton, MenuItem, MenuList, Modal, ModalBody, ModalCloseButton, ModalContent, ModalHeader, ModalOverlay, Select, Text, Textarea, VStack, useDisclosure, useToast } from "@chakra-ui/react"
import { IBranch } from "../../../types"
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MdMoreVert } from "react-icons/md";
import { useForm } from "react-hook-form";
import { FaSign } from "react-icons/fa";
import { deleteBranch, updateBranch } from "../../../lib/api";
import { useFullUserByPk } from "../../../lib/hooks/useFullUserByPk";
import { UserProfile } from "../Users/UserProfile";


export const BranchItemDisplay = ({ pk, agency, name, manager }: IBranch) => {
    const { register, handleSubmit } = useForm<IBranch>();

    const toast = useToast();
    const { isOpen: isDeleteModalOpen, onOpen: onDeleteModalOpen, onClose: onDeleteModalClose } = useDisclosure();
    const { isOpen: isUpdateaModalOpen, onOpen: onUpdateModalOpen, onClose: onUpdateModalClose } = useDisclosure();
    const queryClient = useQueryClient();

    const { userLoading: managerLoading, userData: managerData } = useFullUserByPk(manager);


    const updateMutation = useMutation(updateBranch,
        {
            onSuccess: () => {
                // console.log("success")
                toast({
                    status: "success",
                    title: "Updated",
                    position: "top-right"
                })
                onUpdateModalClose();
                queryClient.invalidateQueries(["branches"]);

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


    const deleteMutation = useMutation(deleteBranch,
        {
            onSuccess: () => {
                // console.log("success")
                toast({
                    status: "success",
                    title: "Deleted",
                    position: "top-right"
                })
                onDeleteModalClose();
                queryClient.invalidateQueries(["branches"]);

            },
            onError: () => {
                // console.log("error")

            },
            onMutate: () => {
                // console.log("mutation")

            }
        }
    );

    const deleteLocationClick = () => {
        // console.log("deleted")
        deleteMutation.mutate(pk);
    }

    const onUpdateSubmit = (formData: IBranch) => {
        updateMutation.mutate(formData);
    }


    const { isOpen: isManagerOpen, onOpen: onManagerOpen, onClose: onManagerClose } = useDisclosure();
    const managerDrawerFunction = () => {
        console.log(`${managerData?.first_name} clicked`);
        onManagerOpen();
    }


    return (
        !managerLoading && managerData ? (
            <>

                <Drawer
                    isOpen={isManagerOpen}
                    placement='right'
                    onClose={onManagerOpen}
                    size={"sm"} //by default is xs
                >
                    <DrawerOverlay />
                    <DrawerContent>
                        <DrawerBody>
                            <UserProfile
                                pk={manager}
                            />
                        </DrawerBody>

                        <DrawerFooter>
                        </DrawerFooter>
                    </DrawerContent>
                </Drawer>


                <Grid
                    gridTemplateColumns="6fr 3fr 3fr"
                    width="100%"
                    p={3}
                    borderWidth={1}
                // bg={"red"}
                >
                    <Flex justifyContent="flex-start">
                        <Text>{name}</Text>

                    </Flex>
                    <Flex>
                        <Button
                            variant={"link"}
                            colorScheme="blue"
                            onClick={managerDrawerFunction}
                        >
                            {managerData.first_name} {managerData.last_name}
                        </Button>

                    </Flex>


                    <Flex
                        justifyContent="flex-end"
                        mr={2}
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
                        {/* </Button> */}
                    </Flex>


                </Grid>
                <Modal isOpen={isDeleteModalOpen} onClose={onDeleteModalClose}>
                    <ModalOverlay />
                    <ModalHeader>Delete Division</ModalHeader>
                    <ModalBody>
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
                                            Are you sure you want to delete this division?
                                        </Text>

                                    </Box>
                                    <Flex
                                        // bg="red"
                                        justifyContent={"space-evenly"}
                                    >
                                        <Button onClick={deleteLocationClick}>Yes</Button>
                                        <Button onClick={onDeleteModalClose}>No</Button>
                                    </Flex>



                                </Grid>
                            </Center>

                        </ModalContent>
                    </ModalBody>
                </Modal>
                <Modal isOpen={isUpdateaModalOpen} onClose={onUpdateModalClose}>
                    <ModalOverlay />
                    <ModalHeader>Update Division</ModalHeader>
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
                                    <FormLabel>Agency</FormLabel>
                                    <Input
                                        {...register("agency", { required: true })}
                                        defaultValue={agency} // Prefill 
                                    />
                                </FormControl>
                                <FormControl>
                                    <FormLabel>Name</FormLabel>
                                    <InputGroup>
                                        <InputLeftAddon children={<FaSign />} />
                                        <Input
                                            {...register("name", { required: true })}
                                            required
                                            type="text"
                                            defaultValue={name} // Prefill with the 'name' prop
                                        />
                                    </InputGroup>
                                </FormControl>
                                <FormControl>
                                    <FormLabel>Manager</FormLabel>
                                    <Input
                                        {...register("manager", { required: true })}
                                        defaultValue={manager} // Prefill 
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

        ) : null
    )
}