import { Text, Box, Button, Drawer, DrawerBody, DrawerContent, DrawerFooter, Flex, FormControl, Input, InputGroup, InputLeftAddon, VStack, useDisclosure, Center, Spinner, Grid, DrawerOverlay, DrawerCloseButton, DrawerHeader, FormLabel, Textarea, Checkbox, useToast, Select } from "@chakra-ui/react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { createBranch, getAllBranches } from "../../../lib/api";
import _ from 'lodash';
import { FaSign } from "react-icons/fa";
import { useQueryClient } from "@tanstack/react-query";
import { IBranch } from "../../../types";
import { BranchItemDisplay } from "./BranchItemDisplay";


export const BranchesCRUD = () => {
    const { register, handleSubmit } = useForm<IBranch>();
    const toast = useToast();
    const { isOpen: addIsOpen, onOpen: onAddOpen, onClose: onAddClose } = useDisclosure();

    const queryClient = useQueryClient();
    const mutation = useMutation(createBranch,
        {
            onSuccess: (data: IBranch) => {
                // console.log("success")
                toast({
                    status: "success",
                    title: "Created",
                    position: "top-right"
                })
                console.log(data);
                onAddClose();
                queryClient.invalidateQueries(["branches"]);
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
    const onSubmit = (formData: IBranch) => {
        mutation.mutate(formData);
    }
    const { isLoading, data: slices } = useQuery<IBranch[]>(
        {
            queryFn: getAllBranches,
            queryKey: ["branches"]
        }
    );
    const [searchTerm, setSearchTerm] = useState("");

    const [filteredSlices, setFilteredSlices] = useState<IBranch[]>([]);
    const [countOfItems, setCountOfItems] = useState(0);

    const handleSearchChange = (e: React.FormEvent<HTMLInputElement>) => {
        setSearchTerm(e.currentTarget.value);
    };


    useEffect(() => {
        if (slices) {
            // console.log(slices)
            const filtered = slices.filter((s) => {
                const nameMatch = s.name.toLowerCase().includes(searchTerm.toLowerCase());
                return nameMatch;
            });

            setFilteredSlices(filtered);
            setCountOfItems(filtered.length);
        }
    }, [slices, searchTerm]);


    useEffect(() => {
        // Initialize filteredSlices with all items when no filters are applied
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
                                Branches ({countOfItems})
                            </Text>
                        </Box>
                        <Flex width={"100%"} mt={4}>
                            <Input
                                type="text"
                                placeholder="Search branch by name"
                                value={searchTerm}
                                onChange={handleSearchChange}
                                w={"65%"}
                            />

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
                            gridTemplateColumns="6fr 3fr 3fr"
                            mt={4}
                            width="100%"
                            p={3}
                            borderWidth={1}
                            borderBottomWidth={0}
                        >
                            <Flex justifyContent="flex-start">
                                <Text as="b">Branch</Text>
                            </Flex>
                            <Flex
                            >
                                <Text as="b">Manager</Text>
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
                                    <BranchItemDisplay
                                        key={s.pk}
                                        pk={s.pk}
                                        name={s.name}
                                        manager={s.manager}
                                        agency={s.agency}
                                        old_id={s.old_id}
                                    />
                                ))}
                        </Grid>
                    </Box>


                    <Drawer isOpen={addIsOpen} onClose={onAddClose} size={"lg"}>
                        <DrawerOverlay />
                        <DrawerContent>
                            <DrawerCloseButton />
                            <DrawerHeader>Add Branch</DrawerHeader>
                            <DrawerBody>
                                <VStack spacing={10} as="form" id="add-form" onSubmit={handleSubmit(onSubmit)} >
                                    <FormControl>
                                        <FormLabel>Agency</FormLabel>
                                        <InputGroup>
                                            <InputLeftAddon children={<FaSign />} />
                                            <Input
                                                {...register("agency", { required: true })}
                                                required
                                                type="text"
                                            />
                                        </InputGroup>
                                    </FormControl>
                                    <FormControl>
                                        <FormLabel>Name</FormLabel>
                                        <Input
                                            {...register("name", { required: true })}
                                        />
                                    </FormControl>
                                    <FormControl>
                                        <FormLabel>Manager</FormLabel>
                                        <Input
                                            {...register("manager", { required: true })}
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