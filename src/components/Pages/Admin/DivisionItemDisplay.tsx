import { Box, Button, Center, Drawer, DrawerBody, DrawerContent, DrawerFooter, DrawerOverlay, Flex, FormControl, FormLabel, Grid, HStack, Input, InputGroup, InputLeftAddon, Menu, MenuButton, MenuItem, MenuList, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Select, Text, Textarea, VStack, useDisclosure, useToast } from "@chakra-ui/react"
import { IDivision } from "../../../types"
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MdMoreVert } from "react-icons/md";
import { useForm } from "react-hook-form";
import { FaSign } from "react-icons/fa";
import { deleteDivision, updateDivision } from "../../../lib/api";
import { useFullUserByPk } from "../../../lib/hooks/useFullUserByPk";
import { UserProfile } from "../Users/UserProfile";
import { UserSearchDropdown } from "../../Navigation/UserSearchDropdown";
import { useState } from "react";

export const DivisionItemDisplay = ({ pk, slug, name, director, approver, old_id }: IDivision) => {

    const { register, handleSubmit, watch } = useForm<IDivision>();

    const toast = useToast();
    const { isOpen: isDeleteModalOpen, onOpen: onDeleteModalOpen, onClose: onDeleteModalClose } = useDisclosure();
    const { isOpen: isUpdateaModalOpen, onOpen: onUpdateModalOpen, onClose: onUpdateModalClose } = useDisclosure();
    const queryClient = useQueryClient();

    const { userLoading: directorLoading, userData: directorData } = useFullUserByPk(director);
    const { userLoading: approverLoading, userData: approverData } = useFullUserByPk(approver);

    const [selectedDirector, setSelectedDirector] = useState<number>(director);
    const [selectedApprover, setSelectedApprover] = useState<number>(approver);
    const slugData = watch('slug');
    const nameData = watch('name');
    const updateMutation = useMutation(updateDivision,
        {
            onSuccess: () => {
                // console.log("success")
                toast({
                    status: "success",
                    title: "Updated",
                    position: "top-right"
                })
                onUpdateModalClose();
                queryClient.invalidateQueries(["divisions"]);

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


    const deleteMutation = useMutation(deleteDivision,
        {
            onSuccess: () => {
                // console.log("success")
                toast({
                    status: "success",
                    title: "Deleted",
                    position: "top-right"
                })
                onDeleteModalClose();
                queryClient.invalidateQueries(["divisions"]);

            },
            onError: () => {
                // console.log("error")

            },
            onMutate: () => {
                // console.log("mutation")

            }
        }
    );

    const deleteBtnClicked = () => {
        // console.log("deleted")
        deleteMutation.mutate(pk);
    }

    const onUpdateSubmit = (formData: IDivision) => {
        console.log(formData)
        updateMutation.mutate(formData);
    }


    const { isOpen: isDirectorOpen, onOpen: onDirectorOpen, onClose: onDirectorClose } = useDisclosure();
    const { isOpen: isApproverOpen, onOpen: onApproverOpen, onClose: onApproverClose } = useDisclosure();
    const directorDrawerFunction = () => {
        console.log(`${directorData?.first_name} clicked`);
        onDirectorOpen();
    }
    const approverDrawerFunction = () => {
        console.log(`${approverData?.first_name} clicked`);
        onApproverOpen();
    }

    return (
        !directorLoading && directorData && !approverLoading && approverData ? (
            <>

                <Drawer
                    isOpen={isDirectorOpen}
                    placement='right'
                    onClose={onDirectorClose}
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

                <Drawer
                    isOpen={isApproverOpen}
                    placement='right'
                    onClose={onApproverClose}
                    size={"sm"} //by default is xs
                >
                    <DrawerOverlay />
                    <DrawerContent>
                        <DrawerBody>
                            <UserProfile
                                pk={approver}
                            />
                        </DrawerBody>

                        <DrawerFooter>
                        </DrawerFooter>
                    </DrawerContent>
                </Drawer>


                <Grid
                    gridTemplateColumns="2fr 2fr 3fr 3fr 1fr"
                    width="100%"
                    p={3}
                    borderWidth={1}
                // bg={"red"}
                >
                    <Flex justifyContent="flex-start"
                        alignItems={"center"}
                    >
                        <Text
                            fontWeight={"semibold"}
                        >
                            <Button
                                variant={"link"}
                                colorScheme="blue"
                                onClick={onUpdateModalOpen}
                            >
                                {name ?? ""}
                            </Button>
                        </Text>

                    </Flex>
                    <Flex
                        alignItems={"center"}
                    >
                        <Text fontWeight={"semibold"}>{slug}</Text>


                    </Flex>
                    <Flex>
                        <Button
                            variant={"link"}
                            colorScheme="blue"
                            onClick={directorDrawerFunction}
                        >
                            {directorData.first_name} {directorData.last_name}
                        </Button>

                    </Flex>
                    <Flex>
                        <Button
                            variant={"link"}
                            colorScheme="blue"
                            onClick={approverDrawerFunction}
                        >
                            {approverData.first_name} {approverData.last_name}
                        </Button>
                    </Flex>



                    <Flex
                        justifyContent="flex-end"
                        mr={2} alignItems={"center"}
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
                    <ModalContent bg="white">
                        <ModalHeader>Delete Division</ModalHeader>
                        <ModalBody>
                            <Box>
                                <Text fontSize="lg" fontWeight="semibold">
                                    Are you sure you want to delete this division?
                                </Text>

                                <Text
                                    fontSize="lg"
                                    fontWeight="semibold"
                                    color={"blue.500"}
                                    mt={4}
                                >
                                    "{name}"
                                </Text>

                            </Box>
                        </ModalBody>
                        <ModalFooter justifyContent="flex-end">
                            <Flex>
                                <Button onClick={onDeleteModalClose} colorScheme="red">
                                    No
                                </Button>
                                <Button onClick={deleteBtnClicked} colorScheme="green" ml={3}>
                                    Yes
                                </Button>
                            </Flex>

                        </ModalFooter>
                    </ModalContent>
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
                            <FormControl>
                                {/* Hidden input to capture the old_id */}
                                <input
                                    type="hidden"
                                    {...register("old_id")}
                                    defaultValue={old_id} // Prefill with the 'pk' prop
                                />
                            </FormControl>
                            {/* <FormControl>
                                <input
                                    type="hidden"
                                    {...register("slug")}
                                    defaultValue={slug} // Prefill with the 'pk' prop
                                />
                            </FormControl> */}
                            <VStack spacing={6} as="form" id="update-form" onSubmit={handleSubmit(onUpdateSubmit)}>
                                <FormControl>
                                    <FormLabel>Name</FormLabel>
                                    <InputGroup>
                                        {/* <InputLeftAddon children={<FaSign />} /> */}
                                        <Input
                                            {...register("name", { required: true })}
                                            required
                                            type="text"
                                            defaultValue={name} // Prefill with the 'name' prop
                                        />
                                    </InputGroup>
                                </FormControl>
                                <FormControl>
                                    <FormLabel>Slug</FormLabel>

                                    {/* Hidden input to capture the slug */}
                                    <Input
                                        type="text"

                                        {...register("slug")}
                                        defaultValue={slug} // Prefill with the 'pk' prop
                                    />
                                </FormControl>
                                <FormControl>
                                    <UserSearchDropdown
                                        {...register("director", { required: true })}

                                        onlyInternal={false}
                                        isRequired={true}
                                        setUserFunction={setSelectedDirector}
                                        label="Director"
                                        placeholder="Search for a user..."
                                        preselectedUserPk={director}
                                        isEditable
                                        helperText={
                                            <>
                                                The director of the Division
                                            </>
                                        }
                                    />

                                </FormControl>
                                <FormControl>
                                    <UserSearchDropdown
                                        {...register("approver", { required: true })}

                                        onlyInternal={false}
                                        isRequired={true}
                                        setUserFunction={setSelectedApprover}
                                        label="Approver"
                                        placeholder="Search for a user..."
                                        preselectedUserPk={approver}

                                        isEditable
                                        helperText={
                                            <>
                                                The approver of the Division
                                            </>
                                        }
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

                                >
                                    Cancel
                                </Button>
                                <Button
                                    // form="update-form"
                                    // type="submit"
                                    isLoading={updateMutation.isLoading}
                                    colorScheme="blue"
                                    size="lg"

                                    onClick={() => {
                                        console.log("clicked")
                                        onUpdateSubmit(
                                            {
                                                "pk": pk,
                                                "name": nameData,
                                                "slug": slugData,
                                                "director": selectedDirector,
                                                "approver": selectedApprover,
                                            }
                                        )

                                    }}

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