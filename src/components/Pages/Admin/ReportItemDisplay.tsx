import { Box, Button, Center, Checkbox, Drawer, DrawerBody, DrawerContent, DrawerFooter, DrawerOverlay, Flex, FormControl, FormHelperText, FormLabel, Grid, HStack, Input, InputGroup, InputLeftAddon, Menu, MenuButton, MenuItem, MenuList, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Select, Spinner, Text, Textarea, VStack, useDisclosure, useToast } from "@chakra-ui/react"
import { IReport, IResearchFunction } from "../../../types"
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MdMoreVert } from "react-icons/md";
import { useForm } from "react-hook-form";
import { FaSign } from "react-icons/fa";
import { deleteReport, deleteResearchFunction, updateReport, updateReportMedia, updateResearchFunction } from "../../../lib/api";
import { useFullUserByPk } from "../../../lib/hooks/useFullUserByPk";
import { UserProfile } from "../Users/UserProfile";
import { FcOk, FcCancel } from "react-icons/fc";
import { useFormattedDate } from "../../../lib/hooks/useFormattedDate";
import { UserSearchDropdown } from "../../Navigation/UserSearchDropdown";
import { useEffect, useState } from "react";
import { AxiosError } from "axios";
import { CalendarWithCSS } from "../CreateProject/CalendarWithCSS";
import { useGetFullReport } from "../../../lib/hooks/useGetFullReport";

export const ReportItemDisplay = ({
    pk, year, created_at, updated_at, date_closed, date_open, creator,
    modifier, dm, publications, research_intro, service_delivery_intro, student_intro }: IReport) => {

    // useEffect(() => {
    //     console.log("Data from API: ", {
    //         date_open, date_closed, creator, modifier, dm, publications, research_intro, student_intro, service_delivery_intro,
    //     })
    // })

    const { reportData, reportLoading } = useGetFullReport(pk);
    useEffect(() => {
        if (!reportLoading)

            console.log(reportData);
    }, [reportData, reportLoading])

    const { register, handleSubmit, watch } = useForm<IReport>();
    // const [selectedCreator, setSelectedCreator] = useState<number>(creator);
    // const [selectedModifier, setSelectedModifier] = useState<number>(modifier);
    const [selectedDates, setSelectedDates] = useState([date_open, date_closed]);
    const dmData = watch("dm");
    const serviceDeliveryData = watch("service_delivery_intro");
    const researchIntroData = watch("research_intro");
    const studentIntroData = watch("student_intro");

    const publicationsData = watch("publications");


    const toast = useToast();
    const { isOpen: isDeleteModalOpen, onOpen: onDeleteModalOpen, onClose: onDeleteModalClose } = useDisclosure();
    const { isOpen: isUpdateModalOpen, onOpen: onUpdateModalOpen, onClose: onUpdateModalClose } = useDisclosure();
    const { isOpen: isUpdateMediaModalOpen, onOpen: onUpdateMediaModalOpen, onClose: onUpdateMediaModalClose } = useDisclosure();

    const queryClient = useQueryClient();

    const formattedDateOpen = useFormattedDate(date_open);
    const formattedDateClosed = useFormattedDate(date_closed);

    const partsOpen = formattedDateOpen.split('@');
    const firstPartDateOpen = partsOpen[0]?.trim();
    const secondPartDateOpen = `@ ${partsOpen[1]?.trim()}`;

    const partsClosed = formattedDateClosed.split('@');
    const firstPartDateClosed = partsClosed[0]?.trim();
    const secondPartDateClosed = `@ ${partsClosed[1]?.trim()}`;

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


    const updateMediaMutation = useMutation(updateReportMedia,
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

    const deleteBtnClicked = () => {
        // console.log("deleted")
        deleteMutation.mutate(pk);
    }

    const onUpdateSubmit = (formData: IReport) => {
        console.log(formData);
        updateMutation.mutate(formData);
    }

    const onUpdateMediaSubmit = (formData: IReport) => {
        console.log(formData);
        updateMediaMutation.mutate(formData);
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
                    <Flex justifyContent="flex-start"
                        alignItems={"center"}
                    >
                        <Button
                            variant={"link"}
                            colorScheme="blue"
                            onClick={onUpdateModalOpen}
                        >
                            {year}
                        </Button>
                    </Flex>
                    <Grid
                        alignItems={"center"}

                    >
                        <Box>
                            <Text>{firstPartDateOpen}</Text>

                        </Box>
                    </Grid>
                    <Grid
                        alignItems={"center"}

                    >
                        <Box>
                            <Text>{firstPartDateClosed}</Text>

                        </Box>
                    </Grid>
                    <Flex
                        alignItems={"center"}

                    >
                        <Button
                            variant={"link"}
                            colorScheme="blue"
                            onClick={creatorDrawerFunction}
                        >
                            {creatorData.first_name} {creatorData.last_name}
                        </Button>
                    </Flex>
                    <Flex
                        alignItems={"center"}

                    >
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
                                <MenuItem onClick={onUpdateMediaModalOpen}>
                                    Edit Media
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
                                    Are you sure you want to delete this report?
                                </Text>

                                <Text
                                    fontSize="lg"
                                    fontWeight="semibold"
                                    color={"blue.500"}
                                    mt={4}
                                >
                                    "{year}"
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


                <Modal isOpen={isUpdateMediaModalOpen} onClose={onUpdateMediaModalClose}
                    size={"6xl"}
                >
                    <ModalOverlay />
                    <ModalBody
                        h={"100%"}
                    // bg={"red"}
                    >

                        <ModalContent bg="white" p={4}>
                            <ModalHeader>Update Report Media</ModalHeader>

                            <ModalCloseButton />

                            <FormControl>
                                <input
                                    type="hidden"
                                    {...register("pk")}
                                    defaultValue={pk} // Prefill with the 'pk' prop
                                />
                            </FormControl>

                            <VStack spacing={6}>
                                <FormControl>
                                    <FormLabel>Coverpage</FormLabel>
                                </FormControl>
                                <FormControl>
                                    <FormLabel>Rear Coverpage</FormLabel>
                                </FormControl>
                                <FormControl>
                                    <FormLabel>Service Delivery Chapter Image</FormLabel>
                                </FormControl>
                                <FormControl>
                                    <FormLabel>Service Delivery Org Chart</FormLabel>
                                </FormControl>
                                <FormControl>
                                    <FormLabel>Research Chapter Image</FormLabel>
                                </FormControl>
                                <FormControl>
                                    <FormLabel>Partnerships Chapter Image</FormLabel>
                                </FormControl>
                                <FormControl>
                                    <FormLabel>Collaborations Chapter Image</FormLabel>
                                </FormControl>
                                <FormControl>
                                    <FormLabel>Student Projects Chapter Image</FormLabel>
                                </FormControl>
                                <FormControl>
                                    <FormLabel>Publications Chapter Image</FormLabel>
                                </FormControl>
                            </VStack>
                            <Center>
                                {updateMediaMutation.isError ? (
                                    <Box mt={4}>
                                        {Object.keys((updateMediaMutation.error as AxiosError).response.data).map((key) => (
                                            <Box key={key}>
                                                {((updateMediaMutation.error as AxiosError).response.data[key] as string[]).map((errorMessage, index) => (
                                                    <Text key={`${key}-${index}`} color="red.500">
                                                        {`${key}: ${errorMessage}`}
                                                    </Text>
                                                ))}
                                            </Box>
                                        ))}
                                    </Box>
                                ) : null}

                            </Center>



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
                                    <Button onClick={onUpdateMediaModalClose}
                                        size="lg"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        // form="update-form"
                                        // type="submit"
                                        isLoading={updateMediaMutation.isLoading}
                                        colorScheme="blue"
                                        size="lg"
                                    // onClick={() => {
                                    //     console.log("clicked")
                                    //     onUpdateMediaSubmit(
                                    //         {
                                    //             "pk": pk,
                                    //             "coverpage": "",
                                    //             "rearcoverpage": "",
                                    //             "sdschapterimage": "",
                                    //             "sdsorgchart": "",
                                    //             "resarchchapterimage": "",
                                    //             "partnershipschapterimage": "",
                                    //             "collaborationschapterimage": "",
                                    //             "studentprojectschapterimage": "",
                                    //             "publicationschapterimage": ""
                                    //         }
                                    //     )
                                    // }}

                                    >
                                        Update Media
                                    </Button>
                                </Grid>

                            </ModalFooter>
                        </ModalContent>


                    </ModalBody>
                </Modal>



                <Modal isOpen={isUpdateModalOpen} onClose={onUpdateModalClose}
                    // size={"full"}
                    size={"6xl"}
                >
                    <ModalOverlay />
                    <ModalBody
                        h={"100%"}
                    // bg={"red"}
                    >

                        <ModalContent bg="white" p={4}>
                            <ModalHeader>Update Report</ModalHeader>

                            <ModalCloseButton />

                            <FormControl>
                                {/* Hidden input to capture the pk */}
                                <input
                                    type="hidden"
                                    {...register("pk")}
                                    defaultValue={pk} // Prefill with the 'pk' prop
                                />
                            </FormControl>

                            {reportLoading ?
                                (<Spinner />
                                )
                                :
                                (
                                    <>
                                        <VStack spacing={6}
                                            // as="form" id="update-form" onSubmit={handleSubmit(onUpdateSubmit)}

                                            // bg={"red"}
                                            h={"100%"}
                                            p={6}
                                        >
                                            <FormControl>
                                                <FormLabel>Year</FormLabel>
                                                <InputGroup>
                                                    {/* <InputLeftAddon children={<FaSign />} /> */}
                                                    <Input
                                                        {...register("year", { required: true })}
                                                        disabled
                                                        required
                                                        type="text"
                                                        defaultValue={reportData.year} // Prefill with the 'name' prop
                                                    />
                                                </InputGroup>
                                            </FormControl>

                                            <FormControl
                                                isRequired
                                            >
                                                <FormLabel>Start and End Dates</FormLabel>
                                                <CalendarWithCSS onChange={setSelectedDates} preselectedDates={[date_open, date_closed]} />
                                                <FormHelperText>Select the period in which entries for this annual report are allowed. First day clicked is the open date, second is the close date.</FormHelperText>
                                            </FormControl>

                                            <FormControl>
                                                <FormLabel>Director's Message</FormLabel>
                                                <Textarea
                                                    {...register("dm", { required: false })}
                                                    defaultValue={reportData.dm}
                                                />
                                            </FormControl>

                                            <FormControl>
                                                <FormLabel>Service Delivery Intro</FormLabel>
                                                <Textarea
                                                    {...register("service_delivery_intro", { required: false })}
                                                    defaultValue={reportData.service_delivery_intro}

                                                />
                                            </FormControl>
                                            <FormControl>
                                                <FormLabel>Research Intro</FormLabel>
                                                <Textarea
                                                    {...register("research_intro", { required: false })}
                                                    defaultValue={reportData.research_intro}

                                                />
                                            </FormControl>

                                            <FormControl>
                                                <FormLabel>Student Intro</FormLabel>
                                                <Textarea
                                                    {...register("student_intro", { required: false })}
                                                    defaultValue={reportData.student_intro}

                                                />
                                            </FormControl>

                                            <FormControl>
                                                <FormLabel>Publications</FormLabel>
                                                <Textarea
                                                    {...register("publications", { required: false })}
                                                    defaultValue={reportData.publications}

                                                />
                                            </FormControl>

                                        </VStack>

                                        <Center>
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
                                                </Box>
                                            ) : null}

                                        </Center>



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
                                                                "year": year,
                                                                "date_open": selectedDates[0],
                                                                "date_closed": selectedDates[1],
                                                                "dm": dmData,
                                                                "publications": publicationsData,
                                                                "research_intro": researchIntroData,
                                                                "service_delivery_intro": serviceDeliveryData,
                                                                "student_intro": studentIntroData
                                                            }
                                                        )


                                                    }}

                                                >
                                                    Update
                                                </Button>
                                            </Grid>

                                        </ModalFooter>
                                    </>

                                )
                            }

                        </ModalContent>


                    </ModalBody>
                </Modal>
            </>
        ) : null
    )
}