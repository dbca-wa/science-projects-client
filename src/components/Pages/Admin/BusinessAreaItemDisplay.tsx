import { Box, Button, Center, Drawer, DrawerBody, DrawerContent, DrawerFooter, DrawerOverlay, Flex, FormControl, FormLabel, Grid, HStack, Image, Input, InputGroup, InputLeftAddon, Menu, MenuButton, MenuItem, MenuList, Modal, ModalBody, ModalCloseButton, ModalContent, ModalHeader, ModalOverlay, Select, Text, Textarea, VStack, useDisclosure, useToast } from "@chakra-ui/react"
import { IBusinessArea } from "../../../types"
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MdMoreVert } from "react-icons/md";
import { useForm } from "react-hook-form";
import { FaSign } from "react-icons/fa";
import { deleteBusinessArea, updateBusinessArea } from "../../../lib/api";
import { useFullUserByPk } from "../../../lib/hooks/useFullUserByPk";
import { UserProfile } from "../Users/UserProfile";
import { useNoImage } from "../../../lib/hooks/useNoImage";
// import { useEffect } from "react";
// import NoImageFile from '/sad-face.gif'

export const BusinessAreaItemDisplay = ({ pk, slug, name, leader, finance_admin, data_custodian, focus, introduction, image }: IBusinessArea) => {

    const { register, handleSubmit } = useForm<IBusinessArea>();

    const toast = useToast();
    const { isOpen: isDeleteModalOpen, onOpen: onDeleteModalOpen, onClose: onDeleteModalClose } = useDisclosure();
    const { isOpen: isUpdateaModalOpen, onOpen: onUpdateModalOpen, onClose: onUpdateModalClose } = useDisclosure();
    const queryClient = useQueryClient();


    const { userLoading: leaderLoading, userData: leaderData } = useFullUserByPk(leader);
    const { userLoading: financeAdminLoading, userData: financeAdminData } = useFullUserByPk(finance_admin);
    const { userLoading: dataCustodianLoading, userData: dataCustodianData } = useFullUserByPk(data_custodian);

    const NoImageFile = useNoImage();

    // useEffect(() => {
    //     console.log(leader, finance_admin, data_custodian);
    // }, [leader, finance_admin, data_custodian])

    const updateMutation = useMutation(updateBusinessArea,
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


    const deleteMutation = useMutation(deleteBusinessArea,
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

    const deleteLocationClick = () => {
        // console.log("deleted")
        deleteMutation.mutate(pk);
    }

    const onUpdateSubmit = (formData: IBusinessArea) => {
        updateMutation.mutate(formData);
    }


    const { isOpen: isLeaderOpen, onOpen: onLeaderOpen, onClose: onLeaderClose } = useDisclosure();
    const { isOpen: isDataCustodianOpen, onOpen: onDataCustodianOpen, onClose: onDataCustodianClose } = useDisclosure();
    const { isOpen: isFinanceAdminOpen, onOpen: onFinanceAdminOpen, onClose: onFinanceAdminClose } = useDisclosure();
    const leaderDrawerFunction = () => {
        console.log(`${leaderData?.first_name} clicked`);
        onLeaderOpen();
    }
    const financeAdminDrawerFunction = () => {
        console.log(`${financeAdminData?.first_name} clicked`);
        onFinanceAdminOpen();
    }
    const dataCustodianDrawerFunction = () => {
        console.log(`${dataCustodianData?.first_name} clicked`);
        onDataCustodianOpen();
    }


    return (
        !leaderLoading && leaderData ? (
            <>

                <Drawer
                    isOpen={isLeaderOpen}
                    placement='right'
                    onClose={onLeaderClose}
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
                {!dataCustodianLoading && dataCustodianData !== null && dataCustodianData !== undefined

                    && (
                        <Drawer
                            isOpen={isDataCustodianOpen}
                            placement='right'
                            onClose={onDataCustodianClose}
                            size={"sm"} //by default is xs
                        >
                            <DrawerOverlay />
                            <DrawerContent>
                                <DrawerBody>
                                    <UserProfile
                                        pk={data_custodian}
                                    />
                                </DrawerBody>

                                <DrawerFooter>
                                </DrawerFooter>
                            </DrawerContent>
                        </Drawer>

                    )
                }

                {!financeAdminLoading && financeAdminData !== null && financeAdminData !== undefined

                    && (
                        <Drawer
                            isOpen={isFinanceAdminOpen}
                            placement='right'
                            onClose={onFinanceAdminClose}
                            size={"sm"} //by default is xs
                        >
                            <DrawerOverlay />
                            <DrawerContent>
                                <DrawerBody>
                                    <UserProfile
                                        pk={finance_admin}
                                    />
                                </DrawerBody>

                                <DrawerFooter>
                                </DrawerFooter>
                            </DrawerContent>
                        </Drawer>


                    )
                }



                <Grid
                    gridTemplateColumns="2fr 4fr 3fr 3fr 3fr 1fr"
                    width="100%"
                    p={3}
                    borderWidth={1}
                // bg={"red"}
                >
                    <Flex justifyContent="flex-start">
                        <Box rounded="lg" overflow="hidden" w="100px" h="69px">
                            <Image
                                src={image?.file ? image.file : image?.old_file ? image.old_file : NoImageFile}
                                width={"100%"}
                                height={"100%"}
                                objectFit={"cover"}

                            />
                        </Box>
                    </Flex>
                    <Flex>
                        <Text>{name}</Text>

                    </Flex>
                    <Flex>
                        <Button
                            variant={"link"}
                            colorScheme="blue"
                            onClick={leaderDrawerFunction}
                        >
                            {leaderData.first_name} {leaderData.last_name}
                        </Button>
                    </Flex>
                    <Flex>
                        {
                            !dataCustodianLoading && (
                                dataCustodianData ?
                                    <Button
                                        variant={"link"}
                                        colorScheme="blue"
                                        onClick={dataCustodianDrawerFunction}
                                    >
                                        {`${dataCustodianData.first_name} ${dataCustodianData.last_name}`}
                                    </Button> :
                                    <Text>Unset</Text>

                            )
                        }
                    </Flex>
                    <Flex>
                        {
                            !financeAdminLoading && (
                                financeAdminData ?
                                    <Button
                                        variant={"link"}
                                        colorScheme="blue"
                                        onClick={financeAdminDrawerFunction}
                                    >
                                        {`${financeAdminData.first_name} ${financeAdminData.last_name}`}
                                    </Button> :
                                    <Text>Unset</Text>

                            )
                        }

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
                    <ModalHeader>Update Business Area</ModalHeader>
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
                                {/* Hidden input to capture the slug */}
                                <input
                                    type="hidden"
                                    {...register("slug")}
                                    defaultValue={slug} // Prefill with the 'pk' prop
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
                                            defaultValue={name} // Prefill with the 'name' prop
                                        />
                                    </InputGroup>
                                </FormControl>
                                <FormControl>
                                    <FormLabel>Leader</FormLabel>
                                    <Input
                                        {...register("leader", { required: true })}
                                        defaultValue={leader} // Prefill 
                                    />
                                </FormControl>

                                <FormControl>
                                    <FormLabel>Finance Admin</FormLabel>
                                    <Input
                                        {...register("finance_admin", { required: true })}
                                        defaultValue={finance_admin} // Prefill 
                                    />
                                </FormControl>
                                <FormControl>
                                    <FormLabel>Data Custodian</FormLabel>
                                    <Input
                                        {...register("data_custodian", { required: true })}
                                        defaultValue={data_custodian} // Prefill 
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