import { Box, Button, Center, Checkbox, Drawer, DrawerBody, DrawerContent, DrawerFooter, DrawerOverlay, Flex, FormControl, FormLabel, Grid, HStack, Input, InputGroup, InputLeftAddon, Menu, MenuButton, MenuItem, MenuList, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Select, Text, Textarea, VStack, useDisclosure, useToast } from "@chakra-ui/react"
import { IReport, IResearchFunction } from "../../../types"
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MdMoreVert } from "react-icons/md";
import { useForm } from "react-hook-form";
import { FaSign } from "react-icons/fa";
import { deleteReport, deleteResearchFunction, updateReport, updateResearchFunction } from "../../../lib/api";
import { useFullUserByPk } from "../../../lib/hooks/useFullUserByPk";
import { UserProfile } from "../Users/UserProfile";
import { FcOk, FcCancel } from "react-icons/fc";
import { useFormattedDate } from "../../../lib/hooks/useFormattedDate";

export const ReportItemDisplay = ({
    pk, year, created_at, updated_at, date_closed, date_open, creator,
    modifier, dm, publications, research_intro, service_delivery_intro, student_intro }: IReport) => {

    const { register, handleSubmit } = useForm<IReport>();

    const toast = useToast();
    const { isOpen: isDeleteModalOpen, onOpen: onDeleteModalOpen, onClose: onDeleteModalClose } = useDisclosure();
    const { isOpen: isUpdateaModalOpen, onOpen: onUpdateModalOpen, onClose: onUpdateModalClose } = useDisclosure();
    const queryClient = useQueryClient();

    const formattedDateOpen = useFormattedDate(date_open);
    const formattedDateClosed = useFormattedDate(date_closed);

    const { userLoading: modifierLoading, userData: modifierData } = useFullUserByPk(modifier);
    const { userLoading: creatorLoading, userData: creatorData } = useFullUserByPk(creator);

    // useEffect(() => {
    //     console.log(leader, finance_admin, data_custodian);
    // }, [leader, finance_admin, data_custodian])

    const updateMutation = useMutation(updateReport,
        {
            onSuccess: () => {
                // console.log("success")
                toast({
                    status: "success",
                    title: "Updated",
                    position: "top-right"
                })
                onUpdateModalClose();
                queryClient.invalidateQueries(["reports"]);

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


    const deleteMutation = useMutation(deleteReport,
        {
            onSuccess: () => {
                // console.log("success")
                toast({
                    status: "success",
                    title: "Deleted",
                    position: "top-right"
                })
                onDeleteModalClose();
                queryClient.invalidateQueries(["reports"]);

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

    const onUpdateSubmit = (formData: IReport) => {
        updateMutation.mutate(formData);
    }


    const { isOpen: isCreatorOpen, onOpen: onCreatorOpen, onClose: onCreatorClose } = useDisclosure();
    const { isOpen: isModifierOpen, onOpen: onModifierOpen, onClose: onModifierClose } = useDisclosure();
    const creatorDrawerFunction = () => {
        console.log(`${creatorData?.first_name} clicked`);
        onCreatorOpen();
    }
    const modifierDrawerFunction = () => {
        console.log(`${modifierData?.first_name} clicked`);
        onModifierOpen();
    }

    return (
        !creatorLoading && creatorData ? (
            <>

                <Drawer
                    isOpen={isCreatorOpen}
                    placement='right'
                    onClose={onCreatorClose}
                    size={"sm"} //by default is xs
                >
                    <DrawerOverlay />
                    <DrawerContent>
                        <DrawerBody>
                            <UserProfile
                                pk={creator}
                            />
                        </DrawerBody>

                        <DrawerFooter>
                        </DrawerFooter>
                    </DrawerContent>
                </Drawer>
                {!modifierLoading && modifierData

                    && (
                        <Drawer
                            isOpen={isModifierOpen}
                            placement='right'
                            onClose={onModifierClose}
                            size={"sm"} //by default is xs
                        >
                            <DrawerOverlay />
                            <DrawerContent>
                                <DrawerBody>
                                    <UserProfile
                                        pk={modifier}
                                    />
                                </DrawerBody>

                                <DrawerFooter>
                                </DrawerFooter>
                            </DrawerContent>
                        </Drawer>
                    )
                }



                <Grid
                    gridTemplateColumns="1fr 3fr 3fr 2fr 2fr 1fr"
                    width="100%"
                    p={3}
                    borderWidth={1}
                // bg={"red"}
                >
                    <Flex justifyContent="flex-start">
                        <Text>{year}</Text>

                    </Flex>
                    <Flex>
                        <Text>{formattedDateOpen}</Text>

                    </Flex>
                    <Flex>
                        <Text>{formattedDateClosed}</Text>

                    </Flex>
                    <Flex>
                        <Button
                            variant={"link"}
                            colorScheme="blue"
                            onClick={creatorDrawerFunction}
                        >
                            {creatorData.first_name} {creatorData.last_name}
                        </Button>
                    </Flex>
                    <Flex>
                        {
                            !modifierLoading && (
                                modifierData ?
                                    <Button
                                        variant={"link"}
                                        colorScheme="blue"
                                        onClick={modifierDrawerFunction}
                                    >
                                        {`${modifierData.first_name} ${modifierData.last_name}`}
                                    </Button> :
                                    <Text>-</Text>

                            )
                        }
                    </Flex>


                    <Flex
                        justifyContent="flex-end"
                        mr={2}
                        alignItems={"center"}

                    >
                        <Menu>
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
                    <ModalHeader>Delete Business Area</ModalHeader>
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
                                            Are you sure you want to delete this Business Area?
                                        </Text>
                                    </Box>
                                    <Flex
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
                    <ModalHeader>Update Business Area</ModalHeader>
                    <ModalBody
                        h={"100%"}
                    // bg={"red"}
                    >
                        <ModalContent bg="white" p={4}>
                            <FormControl>
                                {/* Hidden input to capture the pk */}
                                <input
                                    type="hidden"
                                    {...register("pk")}
                                    defaultValue={pk} // Prefill with the 'pk' prop
                                />
                            </FormControl>

                            <VStack spacing={10} as="form" id="update-form" onSubmit={handleSubmit(onUpdateSubmit)}
                                // bg={"red"}
                                h={"100%"}
                                p={6}
                            >
                                <FormControl>
                                    <FormLabel>Year</FormLabel>
                                    <InputGroup>
                                        <InputLeftAddon children={<FaSign />} />
                                        <Input
                                            {...register("year", { required: true })}
                                            disabled
                                            required
                                            type="text"
                                            defaultValue={year} // Prefill with the 'name' prop
                                        />
                                    </InputGroup>
                                </FormControl>
                                <FormControl>
                                    <FormLabel>Created At</FormLabel>
                                    <Input
                                        {...register("created_at", { required: true })}
                                        disabled
                                    // defaultValue={created_at} // Prefill 
                                    // defaultValue={created_at.toISOString()} // Convert the Date object to a string
                                    />
                                </FormControl>

                                <FormControl>
                                    <FormLabel>Creator</FormLabel>
                                    <Input
                                        {...register("creator", { required: true })}
                                        defaultValue={creator} // Prefill 
                                    />
                                </FormControl>
                                <FormControl>
                                    <FormLabel>Modifier</FormLabel>
                                    <Input
                                        {...register("modifier", { required: true })}
                                        defaultValue={modifier} // Prefill 
                                    />
                                </FormControl>
                                {updateMutation.isError ? (
                                    <Text color={"red.500"}>Something went wrong</Text>
                                ) : null}
                            </VStack>
                            <ModalFooter>
                                <Grid
                                    // pos={"absolute"}
                                    // bottom={0}
                                    // bg={"red"}
                                    h={"100%"}
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
                                        form="update-form"
                                        type="submit"
                                        isLoading={updateMutation.isLoading}
                                        colorScheme="blue"
                                        size="lg"
                                    >
                                        Update
                                    </Button>
                                </Grid>

                            </ModalFooter>
                        </ModalContent>


                    </ModalBody>
                </Modal>
            </>
        ) : null
    )
}