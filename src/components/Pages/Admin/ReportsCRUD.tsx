import { Text, Box, Button, Drawer, DrawerBody, DrawerContent, DrawerFooter, Flex, FormControl, Input, InputGroup, InputLeftAddon, VStack, useDisclosure, Center, Spinner, Grid, DrawerOverlay, DrawerCloseButton, DrawerHeader, FormLabel, Textarea, Checkbox, useToast, Select, FormHelperText, Switch } from "@chakra-ui/react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { createReport, getAllReports } from "../../../lib/api";
import _ from 'lodash';
import { FaSign } from "react-icons/fa";
import { useQueryClient } from "@tanstack/react-query";
import { IReport, IReportCreation } from "../../../types";
import { ReportItemDisplay } from "./ReportItemDisplay";
import { CalendarWithCSS } from "../CreateProject/CalendarWithCSS";
import { AxiosError } from "axios";

export const ReportsCRUD = () => {
    const { register, handleSubmit, watch } = useForm<IReportCreation>();

    const yearData = watch('year');
    const [selectedDates, setSelectedDates] = useState([null, null]);
    const seekUpdateValue = watch('seek_update');
    useEffect(() => {
        console.log(selectedDates)
    }, [selectedDates])

    const toast = useToast();
    const { isOpen: addIsOpen, onOpen: onAddOpen, onClose: onAddClose } = useDisclosure();

    const queryClient = useQueryClient();
    const mutation = useMutation(createReport,
        {
            onSuccess: (data: IReport) => {
                // console.log("success")
                toast({
                    status: "success",
                    title: "Created",
                    position: "top-right"
                })
                console.log(data);
                onAddClose();
                queryClient.invalidateQueries(["reports"]);
            },
            onError: () => {
                console.log("error")
                toast({
                    status: "error",
                    title: "Failed",
                    position: "top-right"
                })
            },
            onMutate: () => {
                console.log("mutation")

            }
        });
    const onSubmit = (formData: IReportCreation) => {
        console.log(formData);
        mutation.mutate(formData);
    }
    const { isLoading, data: slices } = useQuery<IReport[]>(
        {
            queryFn: getAllReports,
            queryKey: ["reports"]
        }
    );

    const [countOfItems, setCountOfItems] = useState(0);


    useEffect(() => {
        if (slices) {
            setCountOfItems(slices.length);
        }
    }, [slices]);

    return (
        <>
            {isLoading ?
                <Center h={"200px"}>
                    <Spinner />
                </Center> :
                <>
                    <Box maxW={"100%"} maxH={"100%"}>
                        <Box>
                            <Text
                                fontWeight={"semibold"}
                                fontSize={"lg"}
                            >
                                Reports ({countOfItems})
                            </Text>
                        </Box>
                        <Flex width={"100%"} mt={4}>

                            <Flex
                                justifyContent={"flex-end"}
                                w={"100%"}
                            >
                                <Button onClick={onAddOpen}

                                    colorScheme="green"
                                    bg={"green.500"}
                                    color={"white"}
                                    _hover={
                                        {
                                            bg: "green.400"
                                        }
                                    }
                                >
                                    Add
                                </Button>
                            </Flex>
                        </Flex>
                        <Grid
                            gridTemplateColumns="1fr 3fr 3fr 2fr 2fr 1fr"
                            mt={4}
                            width="100%"
                            p={3}
                            borderWidth={1}
                            borderBottomWidth={slices.length === 0 ? 1 : 0}
                        >
                            <Flex justifyContent="flex-start">
                                <Text as="b">Year</Text>
                            </Flex>
                            <Flex
                            >
                                <Text as="b">Open Date</Text>
                            </Flex>
                            <Flex
                            >
                                <Text as="b">Closing Date</Text>
                            </Flex>
                            <Flex
                            >
                                <Text as="b">Creator</Text>
                            </Flex>
                            <Flex
                            >
                                <Text as="b">Modifier</Text>
                            </Flex>
                            <Flex justifyContent="flex-end"
                                mr={2}
                            >
                                <Text as="b">Change</Text>
                            </Flex>
                        </Grid>
                        <Grid gridTemplateColumns={"repeat(1,1fr)"}>
                            {slices && slices
                                .sort((a, b) => b.year - a.year) // Sort in descending order based on the year
                                .map((s) => (
                                    <ReportItemDisplay
                                        key={s.pk}
                                        pk={s.pk}
                                        year={s.year}
                                        date_open={s.date_open}
                                        date_closed={s.date_closed}

                                        created_at={s.created_at}
                                        updated_at={s.updated_at}

                                        creator={s.creator}
                                        modifier={s.modifier}
                                        dm={s.dm}
                                        publications={s.publications}
                                        research_intro={s.research_intro}
                                        service_delivery_intro={s.service_delivery_intro}
                                        student_intro={s.student_intro}
                                    />
                                ))}
                        </Grid>
                    </Box>


                    <Drawer isOpen={addIsOpen} onClose={onAddClose} size={"lg"}>
                        <DrawerOverlay />
                        <DrawerContent>
                            <DrawerCloseButton />
                            <DrawerHeader>Add Report</DrawerHeader>
                            <DrawerBody>
                                <VStack spacing={10}
                                // as="form" id="add-form" onSubmit={handleSubmit(onSubmit)}
                                >
                                    <FormControl
                                        isRequired
                                    >
                                        <FormLabel>Year</FormLabel>
                                        <InputGroup>
                                            {/* <InputLeftAddon children={<FaSign />} /> */}
                                            <Input
                                                autoFocus
                                                autoComplete="off"
                                                {...register("year", { required: true })}
                                                defaultValue={new Date().getFullYear()}
                                                required
                                                type="number"
                                            />
                                        </InputGroup>
                                        <FormHelperText>The year for the report. For example, if for FY 2022-2023, type 2023.</FormHelperText>

                                    </FormControl>
                                    {/* <FormControl>
                                        <FormLabel>Creator</FormLabel>
                                        <Input
                                            {...register("creator", { required: true })}
                                        />
                                    </FormControl>
                                    <FormControl>
                                        <FormLabel>Created At</FormLabel>
                                        <Input
                                            {...register("created_at", { required: true })}
                                        />
                                    </FormControl>

                                    <FormControl>
                                        <FormLabel>Updated At</FormLabel>
                                        <Input
                                            {...register("updated_at", { required: true })}
                                        />
                                    </FormControl> */}
                                    {/* <FormControl>
                                        <FormLabel>Date Open</FormLabel>
                                        <Input
                                            {...register("date_open", { required: true })}
                                        />
                                    </FormControl>
                                    <FormControl>
                                        <FormLabel>Date Closed</FormLabel>
                                        <Input
                                            {...register("date_closed", { required: true })}
                                        />
                                    </FormControl> */}

                                    <FormControl
                                        isRequired
                                    >
                                        <FormLabel>Start and End Dates</FormLabel>
                                        <CalendarWithCSS onChange={setSelectedDates} />
                                        <FormHelperText>Select the period in which entries for this annual report are allowed. First day clicked is the open date, second is the close date.</FormHelperText>
                                    </FormControl>

                                    <FormControl>
                                        <FormLabel>Do you want to seek updates on projects now?</FormLabel>

                                        <Switch
                                            defaultChecked={false}
                                            {...register('seek_update')}
                                        />
                                        <FormHelperText
                                            color={"red.700"}
                                        >
                                            This will set eligible projects to updating, create a progress/student report for this report, and send an email to users letting them know that an update is required.
                                            Note: This is not recommended on creation. Instead, it is suggested that a report is created without this on, and the 'Seek Update' button (available on edit) is pressed when the report is ready for submissions.
                                        </FormHelperText>

                                    </FormControl>


                                    {/* <FormControl>
                                        <FormLabel>Service Delivery Intro</FormLabel>
                                        <Textarea
                                            {...register("service_delivery_intro", { required: false })}
                                        />
                                    </FormControl>
                                    <FormControl>
                                        <FormLabel>Research Intro</FormLabel>
                                        <Textarea
                                            {...register("research_intro", { required: false })}
                                        />
                                    </FormControl>

                                    <FormControl>
                                        <FormLabel>Student Intro</FormLabel>
                                        <Textarea
                                            {...register("student_intro", { required: false })}
                                        />
                                    </FormControl>

                                    <FormControl>
                                        <FormLabel>Publications</FormLabel>
                                        <Textarea
                                            {...register("publications", { required: false })}
                                        />
                                    </FormControl> */}
                                    {mutation.isError
                                        ? <Box mt={4}>
                                            {Object.keys((mutation.error as AxiosError).response.data).map((key) => (
                                                <Box key={key}>
                                                    {((mutation.error as AxiosError).response.data[key] as string[]).map((errorMessage, index) => (
                                                        <Text key={`${key}-${index}`} color="red.500">
                                                            {`${key}: ${errorMessage}`}
                                                        </Text>
                                                    ))}
                                                </Box>
                                            ))}
                                        </Box>
                                        : null
                                    }
                                </VStack>
                            </DrawerBody>
                            <DrawerFooter>
                                <Button
                                    // form="add-form"
                                    // type="submit"
                                    isLoading={mutation.isLoading}
                                    colorScheme="blue" size="lg" width={"100%"}
                                    isDisabled={
                                        selectedDates[0] === (undefined || null) || selectedDates[1] === (undefined || null)
                                    }
                                    onClick={() => {
                                        console.log("clicked")
                                        onSubmit(
                                            {
                                                "old_id": 1,
                                                "year": yearData,
                                                "date_open": selectedDates[0],
                                                "date_closed": selectedDates[1],
                                                dm: "<p></p>",
                                                publications: "<p></p>",
                                                research_intro: "<p></p>",
                                                service_delivery_intro: "<p></p>",
                                                student_intro: "<p></p>",
                                                seek_update: seekUpdateValue,
                                            }
                                        )


                                    }}
                                >
                                    Create
                                </Button>
                            </DrawerFooter>
                        </DrawerContent>
                    </Drawer>
                </>
            }
        </>
    )
}

