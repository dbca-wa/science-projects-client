import { Text, Box, Button, Drawer, DrawerBody, DrawerContent, DrawerFooter, Flex, FormControl, Input, InputGroup, InputLeftAddon, VStack, useDisclosure, Center, Spinner, Grid, DrawerOverlay, DrawerCloseButton, DrawerHeader, FormLabel, Textarea, Checkbox, useToast, Select } from "@chakra-ui/react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { createResearchFunction, getAllResearchFunctions } from "../../../lib/api";
import _ from 'lodash';
import { FaSign } from "react-icons/fa";
import { useQueryClient } from "@tanstack/react-query";
import { IResearchFunction } from "../../../types";
import { ResearchFunctionItemDisplay } from "./ResearchFunctionItemDisplay";


export const ResearchFunctionsCRUD = () => {
    const { register, handleSubmit } = useForm<IResearchFunction>();
    const toast = useToast();
    const { isOpen: addIsOpen, onOpen: onAddOpen, onClose: onAddClose } = useDisclosure();

    const queryClient = useQueryClient();
    const mutation = useMutation(createResearchFunction,
        {
            onSuccess: (data: IResearchFunction) => {
                // console.log("success")
                toast({
                    status: "success",
                    title: "Created",
                    position: "top-right"
                })
                console.log(data);
                onAddClose();
                queryClient.invalidateQueries(["researchFunctions"]);
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
    const onSubmit = (formData: IResearchFunction) => {
        mutation.mutate(formData);
    }
    const { isLoading, data: slices } = useQuery<IResearchFunction[]>(
        {
            queryFn: getAllResearchFunctions,
            queryKey: ["researchFunctions"]
        }
    );
    const [searchTerm, setSearchTerm] = useState("");
    const [isActiveOnly, setIsActiveOnly] = useState(false);
    const [isInactiveOnly, setIsInactiveOnly] = useState(false);

    const [filteredSlices, setFilteredSlices] = useState<IResearchFunction[]>([]);
    const [countOfItems, setCountOfItems] = useState(0);

    const handleSearchChange = (e: React.FormEvent<HTMLInputElement>) => {
        setSearchTerm(e.currentTarget.value);
    };

    const handleActiveOnlyChange = () => {
        if (!isActiveOnly) {
            setIsActiveOnly(true);
            setIsInactiveOnly(false);
        } else {
            setIsActiveOnly(false);
        }
    };

    const handleInactiveOnlyChange = () => {
        if (!isInactiveOnly) {
            setIsInactiveOnly(true);
            setIsActiveOnly(false);
        } else {
            setIsInactiveOnly(false);
        }
    };



    useEffect(() => {
        if (slices) {
            const filtered = slices.filter((s) => {
                const nameMatch = s.name.toLowerCase().includes(searchTerm.toLowerCase());
                const isActiveMatch = (!isActiveOnly && !isActiveOnly) || (isActiveOnly && s.is_active) || (isActiveOnly && !s.is_active);
                return nameMatch && isActiveMatch;
            });

            setFilteredSlices(filtered);
            setCountOfItems(filtered.length);
        }
    }, [slices, searchTerm, isActiveOnly, isActiveOnly]);


    useEffect(() => {
        // Initialize filteredSlices with all items when no filters are applied
        if (!searchTerm && !isActiveOnly && !isActiveOnly && slices) {
            setFilteredSlices(slices);
            setCountOfItems(slices.length);
        }
    }, [searchTerm, isActiveOnly, isActiveOnly, slices]);


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
                            >Research Functions ({countOfItems})</Text>
                        </Box>
                        <Flex width={"100%"} mt={4}>
                            <Input
                                type="text"
                                placeholder="Search research function by name"
                                value={searchTerm}
                                onChange={handleSearchChange}
                                w={"65%"}

                            />
                            <Flex justifyContent={"space-between"} px={4} w={"100%"}>
                                <Checkbox
                                    checked={isActiveOnly}
                                    onChange={handleActiveOnlyChange}
                                    isDisabled={isInactiveOnly}
                                >
                                    Active Only
                                </Checkbox>
                                <Checkbox
                                    checked={isInactiveOnly}
                                    onChange={handleInactiveOnlyChange}
                                    isDisabled={isActiveOnly}
                                >
                                    Inactive Only
                                </Checkbox>
                            </Flex>


                            <Flex justifyContent={"flex-end"}
                                w={"30%"}
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
                            gridTemplateColumns="1fr 5fr 3fr 1fr"
                            mt={4}
                            width="100%"
                            p={3}
                            borderWidth={1}
                            borderBottomWidth={0}
                        >
                            <Flex justifyContent="flex-start">
                                <Text as="b">Active</Text>
                            </Flex>
                            <Flex
                            >
                                <Text as="b">Research Function</Text>
                            </Flex>
                            <Flex
                            >
                                <Text as="b">Leader</Text>
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
                                    <ResearchFunctionItemDisplay
                                        key={s.pk}
                                        pk={s.pk}
                                        name={s.name}
                                        description={s.description}
                                        association={s.association}
                                        is_active={s.is_active}
                                        leader={s.leader}
                                    />
                                ))}
                        </Grid>
                    </Box>


                    <Drawer isOpen={addIsOpen} onClose={onAddClose} size={"lg"}>
                        <DrawerOverlay />
                        <DrawerContent>
                            <DrawerCloseButton />
                            <DrawerHeader>Add Research Function</DrawerHeader>
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
                                        <FormLabel>Description</FormLabel>
                                        <Input
                                            {...register("description", { required: true })}
                                        />
                                    </FormControl>
                                    <FormControl>
                                        <FormLabel>Association</FormLabel>
                                        <Input
                                            {...register("association", { required: true })}
                                        />
                                    </FormControl>
                                    <FormControl>
                                        <FormLabel>Leader</FormLabel>
                                        <Input
                                            {...register("leader", { required: true })}
                                        />
                                    </FormControl>
                                    <FormControl>
                                        <FormLabel>Active?</FormLabel>
                                        <Checkbox
                                            {...register("is_active", { required: true })}
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