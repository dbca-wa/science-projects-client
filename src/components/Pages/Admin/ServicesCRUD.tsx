import { Text, Box, Button, Drawer, DrawerBody, DrawerContent, DrawerFooter, Flex, FormControl, Input, InputGroup, InputLeftAddon, VStack, useDisclosure, Center, Spinner, Grid, DrawerOverlay, DrawerCloseButton, DrawerHeader, FormLabel, Textarea, Checkbox, useToast, Select } from "@chakra-ui/react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { createDepartmentalService, getAllDepartmentalServices } from "../../../lib/api";
import _ from 'lodash';
import { FaSign } from "react-icons/fa";
import { useQueryClient } from "@tanstack/react-query";
import { IDepartmentalService } from "../../../types";
import { ServiceItemDisplay } from "./ServiceItemDisplay";


export const ServicesCRUD = () => {
    const { register, handleSubmit } = useForm<IDepartmentalService>();
    const toast = useToast();
    const { isOpen: addIsOpen, onOpen: onAddOpen, onClose: onAddClose } = useDisclosure();

    const queryClient = useQueryClient();
    const mutation = useMutation(createDepartmentalService,
        {
            onSuccess: (data: IDepartmentalService) => {
                // console.log("success")
                toast({
                    status: "success",
                    title: "Created",
                    position: "top-right"
                })
                console.log(data);
                onAddClose();
                queryClient.invalidateQueries(["departmentalServices"]);
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
    const onSubmit = (formData: IDepartmentalService) => {
        mutation.mutate(formData);
    }
    const { isLoading, data: slices } = useQuery<IDepartmentalService[]>(
        {
            queryFn: getAllDepartmentalServices,
            queryKey: ["departmentalServices"]
        }
    );
    const [searchTerm, setSearchTerm] = useState("");
    const [filteredSlices, setFilteredSlices] = useState<IDepartmentalService[]>([]);
    const [countOfItems, setCountOfItems] = useState(0);

    const handleSearchChange = (e: React.FormEvent<HTMLInputElement>) => {
        setSearchTerm(e.currentTarget.value);
    };

    useEffect(() => {
        if (slices) {
            const filtered = slices.filter((s) => {
                const nameMatch = s.name.toLowerCase().includes(searchTerm.toLowerCase());
                return nameMatch;
            });

            setFilteredSlices(filtered);
            setCountOfItems(filtered.length);
        }
    }, [slices, searchTerm]);


    useEffect(() => {
        // Initialize filteredSlices with all items
        if (!searchTerm && slices) {
            setFilteredSlices(slices);
            setCountOfItems(slices.length);
        }
    }, [searchTerm, slices]);


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
                                Departmental Services ({countOfItems})
                            </Text>
                        </Box>
                        <Flex width={"100%"} mt={4}>
                            <Input
                                type="text"
                                placeholder="Search service by name"
                                value={searchTerm}
                                onChange={handleSearchChange}
                                w={"65%"}
                            />

                            <Flex justifyContent={"flex-end"}
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
                            gridTemplateColumns="6fr 3fr 1fr"
                            mt={4}
                            width="100%"
                            p={3}
                            borderWidth={1}
                            borderBottomWidth={0}
                        >
                            <Flex justifyContent="flex-start">
                                <Text as="b">Service</Text>

                            </Flex>
                            <Flex
                            >
                                <Text as="b">Director</Text>
                            </Flex>
                            <Flex justifyContent="flex-end"
                                mr={2}
                            >
                                <Text as="b">Change</Text>
                            </Flex>
                        </Grid>

                        <Grid gridTemplateColumns={"repeat(1,1fr)"}>
                            {filteredSlices
                                .sort((a, b) => a.name.localeCompare(b.name))
                                .map((s) => (
                                    <ServiceItemDisplay
                                        key={s.pk}
                                        pk={s.pk}
                                        name={s.name}
                                        director={s.director}
                                    />
                                ))}
                        </Grid>
                    </Box>


                    <Drawer isOpen={addIsOpen} onClose={onAddClose} size={"lg"}>
                        <DrawerOverlay />
                        <DrawerContent>
                            <DrawerCloseButton />
                            <DrawerHeader>Add Service</DrawerHeader>
                            <DrawerBody>
                                <VStack spacing={10} as="form" id="add-form" onSubmit={handleSubmit(onSubmit)} >
                                    <FormControl>
                                        <FormLabel>Name</FormLabel>
                                        <InputGroup>
                                            <InputLeftAddon children={<FaSign />} />
                                            <Input
                                                {...register("name", { required: true })}
                                                required
                                                type="text"
                                            />
                                        </InputGroup>
                                    </FormControl>

                                    <FormControl>
                                        <FormLabel>Director</FormLabel>
                                        <Input
                                            {...register("director", { required: true })}
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
                                    colorScheme="blue" size="lg" width={"100%"}>Create</Button>
                            </DrawerFooter>
                        </DrawerContent>
                    </Drawer>
                </>
            }
        </>
    )
}