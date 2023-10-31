import { Box, Button, Center, Checkbox, Drawer, DrawerBody, DrawerContent, DrawerFooter, DrawerOverlay, Flex, FormControl, FormLabel, Grid, HStack, Input, InputGroup, InputLeftAddon, Menu, MenuButton, MenuItem, MenuList, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Select, Text, Textarea, VStack, useDisclosure, useToast } from "@chakra-ui/react"
import { IResearchFunction } from "../../../types"
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MdMoreVert } from "react-icons/md";
import { useForm } from "react-hook-form";
import { FaSign } from "react-icons/fa";
import { deleteResearchFunction, updateResearchFunction } from "../../../lib/api";
import { useFullUserByPk } from "../../../lib/hooks/useFullUserByPk";
import { UserProfile } from "../Users/UserProfile";
import { FcOk, FcCancel } from "react-icons/fc";
import { UserSearchDropdown } from "../../Navigation/UserSearchDropdown";
import { useState } from "react";
import { AxiosError } from "axios";

export const ResearchFunctionItemDisplay = ({ pk, name, is_active, association, description, leader }: IResearchFunction) => {

    const { register, handleSubmit, watch } = useForm<IResearchFunction>();
    const nameData = watch('name');
    const descriptionData = watch('description');
    const associationData = watch('association');
    const [isChecked, setIsChecked] = useState(is_active);


    const activeData = watch('is_active');
    const [selectedLeader, setSelectedLeader] = useState<number>();

    const toast = useToast();
    const { isOpen: isDeleteModalOpen, onOpen: onDeleteModalOpen, onClose: onDeleteModalClose } = useDisclosure();
    const { isOpen: isUpdateaModalOpen, onOpen: onUpdateModalOpen, onClose: onUpdateModalClose } = useDisclosure();
    const queryClient = useQueryClient();
    const { userLoading, userData } = useFullUserByPk(leader);

    const { isOpen: isUserOpen, onOpen: onUserOpen, onClose: onUserClose } = useDisclosure();
    const drawerFunction = () => {
        console.log(`${userData?.first_name} clicked`);
        onUserOpen();
    }

    const updateMutation = useMutation(updateResearchFunction,
        {
            onSuccess: () => {
                // console.log("success")
                toast({
                    status: "success",
                    title: "Updated",
                    position: "top-right"
                })
                onUpdateModalClose();
                queryClient.invalidateQueries(["researchFunctions"]);

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


    const deleteMutation = useMutation(deleteResearchFunction,
        {
            onSuccess: () => {
                // console.log("success")
                toast({
                    status: "success",
                    title: "Deleted",
                    position: "top-right"
                })
                onDeleteModalClose();
                queryClient.invalidateQueries(["researchFunctions"]);

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

    const onUpdateSubmit = (formData: IResearchFunction) => {
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
                                    pk={leader}
                                />
                            </DrawerBody>

                            <DrawerFooter>
                            </DrawerFooter>
                        </DrawerContent>
                    </Drawer>

                    <Grid
                        gridTemplateColumns="3fr 2fr 6fr 1fr"
                        width="100%"
                        p={3}
                        borderWidth={1}
                    >
                        <Flex justifyContent="flex-start"
                            ml={4}
                            alignItems={"center"}
                        >
                            <Button
                                variant={"link"}
                                colorScheme="blue"
                                onClick={onUpdateModalOpen}
                            >
                                {name ?? ""}
                            </Button>

                        </Flex>
                        <Flex
                            alignItems={"center"}
                        // bg={"red"}
                        >
                            <Center
                                ml={3.5}
                            >
                                {isChecked === true ?
                                    <FcOk /> : <FcCancel />
                                }
                            </Center>

                        </Flex>
                        <Flex
                            alignItems={"center"}
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
                        <ModalContent bg="white">
                            <ModalHeader>Delete Division</ModalHeader>
                            <ModalBody>
                                <Box>
                                    <Text fontSize="lg" fontWeight="semibold">
                                        Are you sure you want to delete this research function?
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
                                    <Button onClick={deleteButtonClick} colorScheme="green" ml={3}>
                                        Yes
                                    </Button>
                                </Flex>

                            </ModalFooter>
                        </ModalContent>
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
                                            {/* <InputLeftAddon children={<FaSign />} /> */}
                                            <Input
                                                autoFocus
                                                autoComplete="off"
                                                {...register("name", { required: true })}
                                                required
                                                type="text"
                                                defaultValue={name} // Prefill
                                            />
                                        </InputGroup>
                                    </FormControl>
                                    <FormControl>
                                        <FormLabel>Description</FormLabel>
                                        <Input
                                            autoComplete="off"

                                            {...register("description", { required: true })}
                                            defaultValue={description} // Prefill 
                                        />
                                    </FormControl>
                                    <FormControl>
                                        <FormLabel>Association</FormLabel>
                                        <Input
                                            autoComplete="off"

                                            {...register("association", { required: true })}
                                            defaultValue={association} // Prefill 
                                        />
                                    </FormControl>
                                    <FormControl>
                                        <UserSearchDropdown
                                            {...register("leader", { required: true })}

                                            onlyInternal={false}
                                            isRequired={true}
                                            setUserFunction={setSelectedLeader}
                                            preselectedUserPk={leader}
                                            label="Leader"
                                            placeholder="Search for a user..."
                                            isEditable
                                            helperText={
                                                <>
                                                    The leader of the Research Function
                                                </>
                                            }
                                        />

                                    </FormControl>
                                    <FormControl>
                                        <FormLabel>Active?</FormLabel>
                                        <Checkbox
                                            {...register("is_active", { required: true })}
                                            isChecked={isChecked} // Prefill 
                                            onChange={() => setIsChecked(!isChecked)}
                                        />
                                    </FormControl>

                                    {updateMutation.isError ? (
                                        <Box mt={4}>
                                            {Object.keys((updateMutation.error as AxiosError).response.data).map((key) => (
                                                <Box key={key}>
                                                    {((updateMutation.error as AxiosError).response.data[key] as string[]).map((errorMessage, index) => (
                                                        <Text key={`${key}-${index}`} color="red.500">
                                                            {`${key}: ${errorMessage}`}
                                                        </Text>
                                                    ))}
                                                </Box>
                                            ))}
                                        </Box>) : null}
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
                                                    "old_id": 1,
                                                    "name": nameData,
                                                    "description": descriptionData,
                                                    "association": associationData,
                                                    "leader": selectedLeader,
                                                    "is_active": activeData,
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
            )
            :
            null

    )
}