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
import { UserSearchDropdown } from "../../Navigation/UserSearchDropdown";
import { AxiosError } from "axios";


export const ResearchFunctionsCRUD = () => {
    const { register, handleSubmit, watch } = useForm<IResearchFunction>();

    const nameData = watch('name');
    const descriptionData = watch('description');
    const associationData = watch('association');
    const activeData = watch('is_active');

    const [selectedLeader, setSelectedLeader] = useState<number>();


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
        console.log(formData);
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
                            <Flex justifyContent={"flex-start"} px={4} w={"100%"}>
                                <Checkbox
                                    pr={5}
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
                            gridTemplateColumns="5fr 2fr 4fr 1fr"
                            mt={4}
                            width="100%"
                            p={3}
                            borderWidth={1}
                            borderBottomWidth={filteredSlices.length === 0 ? 1 : 0}
                        >
                            <Flex justifyContent="flex-start">
                                <Text as="b">Research Function</Text>

                            </Flex>
                            <Flex
                            >
                                <Text as="b">Active</Text>

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
                                            {/* <InputLeftAddon children={<FaSign />} /> */}
                                            <Input
                                                autoComplete="off"
                                                autoFocus
                                                {...register("name", { required: true })}
                                                required
                                                type="text"
                                            />
                                        </InputGroup>
                                    </FormControl>
                                    <FormControl>
                                        <FormLabel>Description</FormLabel>
                                        <Input
                                            autoComplete="off"
                                            {...register("description", { required: true })}
                                        />
                                    </FormControl>
                                    <FormControl>
                                        <FormLabel>Association</FormLabel>
                                        <Input
                                            autoComplete="off"
                                            {...register("association", { required: true })}
                                        />
                                    </FormControl>
                                    <FormControl>
                                        <UserSearchDropdown
                                            {...register("leader", { required: true })}

                                            onlyInternal={false}
                                            isRequired={true}
                                            setUserFunction={setSelectedLeader}
                                            label="Leader"
                                            placeholder="Search for a user..."
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
                                            defaultValue={1}
                                            defaultChecked
                                        />
                                    </FormControl>
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
                                    onClick={() => {
                                        console.log("clicked")
                                        onSubmit(
                                            {
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