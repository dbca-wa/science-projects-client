import { Box, Button, Center, Drawer, DrawerBody, DrawerContent, DrawerFooter, DrawerOverlay, Flex, FormControl, FormLabel, Grid, HStack, Input, InputGroup, InputLeftAddon, Menu, MenuButton, MenuItem, MenuList, Modal, ModalBody, ModalCloseButton, ModalContent, ModalHeader, ModalOverlay, Select, Text, Textarea, VStack, useColorMode, useDisclosure, useToast } from "@chakra-ui/react"
import { IAddress } from "../../../types"
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MdMoreVert } from "react-icons/md";
import { useForm } from "react-hook-form";
import { FaSign } from "react-icons/fa";
import { deleteAddress, updateAddress } from "../../../lib/api";
import { BranchSearchDropdown } from "../../Navigation/BranchSearchDropdown";
import { useState } from "react";

export const AddressItemDisplay = ({ pk, street, city, country, agency, branch, pobox }: IAddress) => {

    const { register, handleSubmit } = useForm<IAddress>();

    const toast = useToast();
    const { isOpen: isDeleteModalOpen, onOpen: onDeleteModalOpen, onClose: onDeleteModalClose } = useDisclosure();
    const { isOpen: isUpdateaModalOpen, onOpen: onUpdateModalOpen, onClose: onUpdateModalClose } = useDisclosure();
    const queryClient = useQueryClient();
    const { colorMode } = useColorMode();
    const [selectedBranch, setSelectedBranch] = useState<number>();

    const updateMutation = useMutation(updateAddress,
        {
            onSuccess: () => {
                // console.log("success")
                toast({
                    status: "success",
                    title: "Updated",
                    position: "top-right"
                })
                onUpdateModalClose();
                queryClient.invalidateQueries(["addresses"]);

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


    const deleteMutation = useMutation(deleteAddress,
        {
            onSuccess: () => {
                // console.log("success")
                toast({
                    status: "success",
                    title: "Deleted",
                    position: "top-right"
                })
                onDeleteModalClose();
                queryClient.invalidateQueries(["addresses"]);

            },
            onError: () => {
                // console.log("error")

            },
            onMutate: () => {
                // console.log("mutation")

            }
        }
    );

    const deleteAddressClick = () => {
        // console.log("deleted")
        deleteMutation.mutate(pk);
    }

    const onUpdateSubmit = (formData: IAddress) => {
        updateMutation.mutate(formData);
    }


    return (
        <>
            <Grid
                gridTemplateColumns="2fr 4fr 2fr 2fr 1fr 1fr"
                width="100%"
                p={3}
                borderWidth={1}
            // bg={"red"}
            >
                <Flex justifyContent="flex-start">
                    <Text
                        fontWeight={"semibold"}
                    >{branch ? branch.name : null}</Text>

                </Flex>
                <Flex>
                    <Text>{street}</Text>
                </Flex>
                <Flex>
                    <Text>{city}</Text>
                </Flex>
                <Flex>
                    <Text>{country}</Text>
                </Flex>
                <Flex>
                    <Text>{pobox ? pobox : "-"}</Text>
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
                            alignItems={"center"} justifyContent={"center"}

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
                <ModalHeader>Delete Address</ModalHeader>
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
                                        Are you sure you want to delete this address?
                                    </Text>

                                </Box>
                                <Flex
                                    // bg="red"
                                    justifyContent={"space-evenly"}
                                >
                                    <Button onClick={deleteAddressClick}>Yes</Button>
                                    <Button onClick={onDeleteModalClose}>No</Button>
                                </Flex>



                            </Grid>
                        </Center>

                    </ModalContent>
                </ModalBody>
            </Modal>
            <Modal isOpen={isUpdateaModalOpen} onClose={onUpdateModalClose}>
                <ModalOverlay />
                <ModalHeader>Update Address</ModalHeader>
                <ModalBody>
                    <ModalContent bg={colorMode === "light" ? "white" : "gray.800"} p={4}>
                        <FormControl>
                            {/* Hidden input to capture the pk */}
                            <input
                                type="hidden"
                                {...register("pk")}
                                defaultValue={pk} // Prefill with the 'pk' prop
                            />
                            <input
                                {...register("agency", { required: true })}
                                type="hidden"
                                defaultValue={1} // Prefill with the 'name' prop
                            />
                        </FormControl>
                        <VStack spacing={10} as="form" id="update-form" onSubmit={handleSubmit(onUpdateSubmit)}>

                            <BranchSearchDropdown
                                // onlyInternal={false}
                                {...register("branch", { required: true })}
                                isRequired={true}
                                setBranchFunction={setSelectedBranch}
                                label="Branch"
                                placeholder="Search for a Branch"
                                helperText={
                                    <>
                                        The branch the address belongs to.
                                    </>
                                }
                            />

                            {/* 
                            <FormControl>
                                <FormLabel>Branch</FormLabel>
                                <InputGroup>
                                    <InputLeftAddon children={<FaSign />} />
                                    <Input
                                        {...register("branch", { required: true })}
                                        required
                                        type="text"
                                        defaultValue={branch ? branch.pk : undefined} // Prefill with the 'name' prop
                                    />
                                </InputGroup>
                            </FormControl> */}

                            <FormControl>

                                <FormLabel>Street</FormLabel>
                                <Input
                                    {...register("street", { required: true })}
                                    defaultValue={street} // Prefill 
                                />
                            </FormControl>

                            <FormControl>
                                <FormLabel>City</FormLabel>
                                <Input
                                    {...register("city", { required: true })}
                                    defaultValue={city}
                                />
                            </FormControl>

                            <FormControl>
                                <FormLabel>Country</FormLabel>
                                <Input
                                    {...register("country", { required: true })}
                                    defaultValue={country}
                                />
                            </FormControl>

                            <FormControl>
                                <FormLabel>PO Box</FormLabel>
                                <Input
                                    {...register("pobox", { required: true })}
                                    defaultValue={pobox}
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
}