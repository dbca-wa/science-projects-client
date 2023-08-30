import { Text, Box, Button, Drawer, DrawerBody, DrawerContent, DrawerFooter, Flex, FormControl, Input, InputGroup, InputLeftAddon, VStack, useDisclosure, Center, Spinner, Grid, DrawerOverlay, DrawerCloseButton, DrawerHeader, FormLabel, Textarea, Checkbox, useToast, Select } from "@chakra-ui/react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { createReport, getAllReports } from "../../../lib/api";
import _ from 'lodash';
import { FaSign } from "react-icons/fa";
import { useQueryClient } from "@tanstack/react-query";
import { IReport } from "../../../types";
import { ReportItemDisplay } from "./ReportItemDisplay";

export const ReportsCRUD = () => {
    const { register, handleSubmit } = useForm<IReport>();
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
    const onSubmit = (formData: IReport) => {
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
                            borderBottomWidth={0}
                        >
                            <Flex justifyContent="flex-start">
                                <Text as="b">Year</Text>
                            </Flex>
                            <Flex
                            >
                                <Text as="b">Date Opened</Text>
                            </Flex>
                            <Flex
                            >
                                <Text as="b">Date Closed</Text>
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
                                <VStack spacing={10} as="form" id="add-form" onSubmit={handleSubmit(onSubmit)} >
                                    <FormControl>
                                        <FormLabel>Year</FormLabel>
                                        <InputGroup>
                                            <InputLeftAddon children={<FaSign />} />
                                            <Input
                                                {...register("year", { required: true })}
                                                required
                                                type="text"
                                            />
                                        </InputGroup>
                                    </FormControl>
                                    <FormControl>
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
                                    </FormControl>
                                    <FormControl>
                                        <FormLabel>Date Open</FormLabel>
                                        <Input
                                            {...register("date_open", { required: true })}
                                        />
                                    </FormControl>
                                    <FormControl>
                                        <FormLabel>Date Closed</FormLabel>
                                        <Input
                                            {...register("date_open", { required: true })}
                                        />
                                    </FormControl>
                                    <FormControl>
                                        <FormLabel>Date Closed</FormLabel>
                                        <Input
                                            {...register("date_open", { required: true })}
                                        />
                                    </FormControl>
                                    <FormControl>
                                        <FormLabel>Publications</FormLabel>
                                        <Input
                                            {...register("publications", { required: false })}
                                        />
                                    </FormControl>
                                    <FormControl>
                                        <FormLabel>Research Intro</FormLabel>
                                        <Input
                                            {...register("research_intro", { required: false })}
                                        />
                                    </FormControl>
                                    <FormControl>
                                        <FormLabel>Service Delivery Intro</FormLabel>
                                        <Input
                                            {...register("service_delivery_intro", { required: false })}
                                        />
                                    </FormControl>
                                    <FormControl>
                                        <FormLabel>Student Intro</FormLabel>
                                        <Input
                                            {...register("student_intro", { required: false })}
                                        />
                                    </FormControl>
                                    {mutation.isError
                                        ? <Text color={"red.500"}>
                                            Something went wrong
                                        </Text>
                                        : null
                                    }
                                </VStack>
                            </DrawerBody>
                            <DrawerFooter>
                                <Button
                                    form="add-form"
                                    type="submit"
                                    isLoading={mutation.isLoading}
                                    colorScheme="blue" size="lg" width={"100%"}
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

