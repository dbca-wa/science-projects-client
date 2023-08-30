import { Box, Button, Center, Flex, FormControl, FormLabel, Grid, HStack, Input, InputGroup, InputLeftAddon, Menu, MenuButton, MenuItem, MenuList, Modal, ModalBody, ModalCloseButton, ModalContent, ModalHeader, ModalOverlay, Select, Text, Textarea, VStack, useDisclosure, useToast } from "@chakra-ui/react"
import { IAddLocationForm, ISimpleLocationData } from "../../../types"
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MdMoreVert } from "react-icons/md";
import { useForm } from "react-hook-form";
import { FaSign } from "react-icons/fa";
import { deleteLocation, updateLocation } from "../../../lib/api";

export const LocationItemDisplay = ({ pk, name, area_type }: ISimpleLocationData) => {


    const { isOpen: isDeleteModalOpen, onOpen: onDeleteModalOpen, onClose: onDeleteModalClose } = useDisclosure();
    const { isOpen: isUpdateaModalOpen, onOpen: onUpdateModalOpen, onClose: onUpdateModalClose } = useDisclosure();

    const { register, handleSubmit } = useForm<IAddLocationForm>();

    const toast = useToast();
    const queryClient = useQueryClient();

    const updateMutation = useMutation(updateLocation,
        {
            onSuccess: () => {
                // console.log("success")
                toast({
                    status: "success",
                    title: "Updated",
                    position: "top-right"
                })
                onUpdateModalClose();
                queryClient.invalidateQueries(["locations"]);

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


    const deleteMutation = useMutation(deleteLocation,
        {
            onSuccess: () => {
                // console.log("success")
                toast({
                    status: "success",
                    title: "Deleted",
                    position: "top-right"
                })
                onDeleteModalClose();
                queryClient.invalidateQueries(["locations"]);

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

    const onUpdateSubmit = (formData: IAddLocationForm) => {
        updateMutation.mutate(formData);
    }

    const areaTypeMap: { [key: string]: string } = {
        dbcaregion: "DBCA Region",
        dbcadistrict: "DBCA District",
        ibra: "IBRA",
        imcra: "IMCRA",
        nrm: "NRM",
    };

    return (
        <>
            <Grid
                gridTemplateColumns={"1fr 3fr"}
                borderWidth={1}
                p={3}

            >
                <Flex
                    // bg={"red"}
                    // justifyContent={"center"}
                    alignItems={"center"}
                >
                    <Text>{areaTypeMap[area_type]}</Text>

                </Flex>
                <Flex
                    justifyContent={"space-between"}
                    alignItems={"center"}

                >
                    <Text>{name}</Text>
                    <Flex
                        flexDir={"column"}
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

                </Flex>

            </Grid>
            <Modal isOpen={isDeleteModalOpen} onClose={onDeleteModalClose}>
                <ModalOverlay />
                <ModalHeader>Delete Location</ModalHeader>
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
                                        Are you sure you want to delete this location?
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
                <ModalHeader>Update Location</ModalHeader>
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
                                        defaultValue={name} // Prefill with the 'name' prop
                                    />
                                </InputGroup>
                            </FormControl>
                            <FormControl>
                                <FormLabel>Area Type</FormLabel>
                                <Select
                                    {...register("area_type", { required: true })}
                                    defaultValue={area_type} // Prefill with the 'area_type' prop
                                >

                                    <option value={"dbcaregion"}>DBCA Region</option>
                                    <option value={"dbcadistrict"}>DBCA District</option>
                                    <option value={"ibra"}>Interim Biogeographic Regionalisation of Australia</option>
                                    <option value={"imcra"}>Integrated Marine and Coastal Regionisation of Australia</option>
                                    <option value={"nrm"}>Natural Resource Management Region</option>
                                </Select>
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