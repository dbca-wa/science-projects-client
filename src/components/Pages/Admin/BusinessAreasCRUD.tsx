import { Text, Box, Button, Drawer, DrawerBody, DrawerContent, DrawerFooter, Flex, FormControl, Input, InputGroup, InputLeftAddon, VStack, useDisclosure, Center, Spinner, Grid, DrawerOverlay, DrawerCloseButton, DrawerHeader, FormLabel, Textarea, Checkbox, useToast, Select, FormHelperText } from "@chakra-ui/react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { BusinessAreaItemDisplay } from "./BusinessAreaItemDisplay";
import { createBusinessArea, getAllBusinessAreas } from "../../../lib/api";
import _ from 'lodash';
import { FaSign } from "react-icons/fa";
import { useQueryClient } from "@tanstack/react-query";
import { IBusinessArea } from "../../../types";
import { ImagePreview } from "../CreateProject/ImagePreview";


export const BusinessAreasCRUD = () => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (files && files.length > 0) {
            setSelectedFile(files[0]);
        }
    };



    const { register, handleSubmit } = useForm<IBusinessArea>();
    const toast = useToast();
    const { isOpen: addIsOpen, onOpen: onAddOpen, onClose: onAddClose } = useDisclosure();

    const queryClient = useQueryClient();
    const mutation = useMutation(createBusinessArea,
        {
            onSuccess: (data: IBusinessArea) => {
                // console.log("success")
                toast({
                    status: "success",
                    title: "Created",
                    position: "top-right"
                })
                console.log(data);
                onAddClose();
                queryClient.invalidateQueries(["businessAreas"]);
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
    const onSubmit = (formData: IBusinessArea) => {
        mutation.mutate(formData);
    }
    const { isLoading, data: slices } = useQuery<IBusinessArea[]>(
        {
            queryFn: getAllBusinessAreas,
            queryKey: ["businessAreas"]
        }
    );

    useEffect(() => {
        if (!isLoading)
            console.log(slices)
    }, [isLoading, slices])

    const [searchTerm, setSearchTerm] = useState("");

    const [filteredSlices, setFilteredSlices] = useState<IBusinessArea[]>([]);
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
                                Business Areas ({countOfItems})
                            </Text>
                        </Box>
                        <Flex width={"100%"} mt={4}>
                            <Input
                                type="text"
                                placeholder="Search business area by name"
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
                            gridTemplateColumns="2fr 4fr 3fr 3fr 3fr 1fr"
                            mt={4}
                            width="100%"
                            p={3}
                            borderWidth={1}
                            borderBottomWidth={filteredSlices.length === 0 ? 1 : 0}
                        >
                            <Flex justifyContent="flex-start">
                                <Text as="b">Image</Text>
                            </Flex>
                            <Flex
                            >
                                <Text as="b">Business Area</Text>
                            </Flex>
                            <Flex
                            >
                                <Text as="b">Leader</Text>
                            </Flex>
                            <Flex
                            >
                                <Text as="b">Finance Admin</Text>
                            </Flex>
                            <Flex
                            >
                                <Text as="b">Data Custodian</Text>
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
                                    <BusinessAreaItemDisplay
                                        key={s.pk}
                                        pk={s.pk}
                                        slug={s.slug}
                                        name={s.name}
                                        leader={s.leader}
                                        finance_admin={s.finance_admin}
                                        data_custodian={s.data_custodian}
                                        focus={s.focus}
                                        introduction={s.introduction}
                                        image={s.image}
                                    />
                                ))}
                        </Grid>
                    </Box>


                    <Drawer isOpen={addIsOpen} onClose={onAddClose} size={"lg"}>
                        <DrawerOverlay />
                        <DrawerContent>
                            <DrawerCloseButton />
                            <DrawerHeader>Add Business Area</DrawerHeader>
                            <DrawerBody>
                                <VStack spacing={10} as="form" id="add-form" onSubmit={handleSubmit(onSubmit)} >
                                    <FormControl>
                                        <FormLabel>Slug</FormLabel>
                                        <InputGroup>
                                            <InputLeftAddon children={<FaSign />} />
                                            <Input
                                                {...register("slug", { required: true })}
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
                                        <FormLabel>Leader</FormLabel>
                                        <Input
                                            {...register("leader", { required: true })}
                                        />
                                    </FormControl>
                                    <FormControl>
                                        <FormLabel>Finance Admin</FormLabel>
                                        <Input
                                            {...register("finance_admin", { required: true })}
                                        />
                                    </FormControl>
                                    <FormControl>
                                        <FormLabel>Data Custodian</FormLabel>
                                        <Input
                                            {...register("data_custodian", { required: true })}
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