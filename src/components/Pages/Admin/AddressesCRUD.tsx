import { Text, Box, Button, Drawer, DrawerBody, DrawerContent, DrawerFooter, Flex, FormControl, Input, InputGroup, InputLeftAddon, VStack, useDisclosure, Center, Spinner, Grid, DrawerOverlay, DrawerCloseButton, DrawerHeader, FormLabel, Textarea, Checkbox, useToast, Select } from "@chakra-ui/react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { IAddress, IBranch } from "../../../types";
import { createAddress, getAllAddresses } from "../../../lib/api";
import _ from 'lodash';
import { useQueryClient } from "@tanstack/react-query";
import { AddressItemDisplay } from "./AddressItemDisplay";
import { BranchSearchDropdown } from "../../Navigation/BranchSearchDropdown";
import { AxiosError } from "axios";

export const AddressesCRUD = () => {
    const { register, handleSubmit, watch, reset } = useForm<IAddress>();
    const toast = useToast();
    const { isOpen: addIsOpen, onOpen: onAddOpen, onClose: onAddClose } = useDisclosure();

    const queryClient = useQueryClient();
    const mutation = useMutation(createAddress,
        {
            onSuccess: (data: IAddress) => {
                // console.log("success")
                toast({
                    status: "success",
                    title: "Created",
                    position: "top-right"
                })
                console.log(data);
                reset();
                onAddClose();
                queryClient.invalidateQueries(["addresses"]);
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
    // const onSubmit = (formData: IAddress) => {
    //     mutation.mutate(formData);
    // }

    const onSubmitAddressCreation = (formData: IAddress) => {
        mutation.mutate(formData);
    }



    const { isLoading, data: slices } = useQuery<IAddress[]>(
        {
            queryFn: getAllAddresses,
            queryKey: ["addresses"]
        }
    );

    useEffect(() => {
        if (!isLoading)
            console.log(slices)
    }, [isLoading, slices])

    const [searchTerm, setSearchTerm] = useState("");

    const [filteredSlices, setFilteredSlices] = useState<IAddress[]>([]);
    const [countOfItems, setCountOfItems] = useState(0);

    const handleSearchChange = (e: React.FormEvent<HTMLInputElement>) => {
        setSearchTerm(e.currentTarget.value);
    };



    useEffect(() => {
        if (slices) {
            const filtered = slices.filter((s) => {
                if (s.branch && typeof s.branch === 'object') {
                    const branch = s.branch as IBranch;
                    const nameMatch = branch.name.toLowerCase().includes(searchTerm.toLowerCase());
                    return nameMatch;
                }
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

    const [selectedBranch, setSelectedBranch] = useState<number>();

    const streetData = watch('street');
    const cityData = watch('city');
    const stateData = watch('state');
    const countryData = watch('country');
    const zipcodeData = watch('zipcode');
    const poboxData = watch('pobox');


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
                                Addresses ({countOfItems})
                            </Text>
                        </Box>
                        <Flex width={"100%"} mt={4}>
                            <Input
                                type="text"
                                placeholder="Search address by branch"
                                value={searchTerm}
                                onChange={handleSearchChange}
                                w={"65%"}
                                zIndex={0}
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
                        {
                            countOfItems === 0
                                ?
                                <Box
                                    py={10}
                                    fontWeight={"bold"}
                                >
                                    <Text>No results</Text>
                                </Box>
                                :
                                <>
                                    <Grid
                                        gridTemplateColumns="2fr 4fr 2fr 2fr 1fr 1fr"
                                        mt={4}
                                        width="100%"
                                        p={3}
                                        borderWidth={1}
                                        borderBottomWidth={filteredSlices.length === 0 ? 1 : 0}
                                    >
                                        <Flex justifyContent="flex-start">
                                            <Text as="b">Branch</Text>
                                        </Flex>
                                        <Flex
                                        >
                                            <Text as="b">Street</Text>
                                        </Flex>
                                        <Flex
                                        >
                                            <Text as="b">City</Text>
                                        </Flex>
                                        <Flex
                                        >
                                            <Text as="b">Country</Text>
                                        </Flex>
                                        <Flex
                                        >
                                            <Text as="b">PO Box</Text>
                                        </Flex>
                                        <Flex justifyContent="flex-end"
                                            mr={2}
                                        >
                                            <Text as="b">Change</Text>
                                        </Flex>
                                    </Grid>

                                    <Grid gridTemplateColumns={"repeat(1,1fr)"}>
                                        {filteredSlices
                                            .sort((a, b) => {
                                                const nameA = typeof a.branch === 'object' ? (a.branch as IBranch)?.name : '';
                                                const nameB = typeof b.branch === 'object' ? (b.branch as IBranch)?.name : '';
                                                return nameA.localeCompare(nameB);
                                            })
                                            .map((s) => (
                                                <AddressItemDisplay
                                                    key={s.pk}
                                                    pk={s.pk}
                                                    street={s.street}
                                                    country={s.country}
                                                    city={s.city}
                                                    pobox={s.pobox}
                                                    branch={s.branch}
                                                    agency={s.agency}
                                                    suburb={s.suburb}
                                                    zipcode={s.zipcode}
                                                    state={s.state}
                                                />
                                            ))}
                                    </Grid>

                                </>
                        }
                    </Box>


                    <Drawer isOpen={addIsOpen} onClose={onAddClose} size={"lg"}>
                        <DrawerOverlay />
                        <DrawerContent>
                            <DrawerCloseButton />
                            <DrawerHeader>Add Address</DrawerHeader>
                            <DrawerBody>
                                <VStack spacing={2} as="form" id="add-form" onSubmit={handleSubmit(onSubmitAddressCreation)} >
                                    <FormControl>
                                        {/* <FormLabel>Branch</FormLabel> */}
                                        {/* <Input
                                            {...register("branch", { required: true })}
                                        /> */}
                                        <BranchSearchDropdown
                                            {...register("branch", { required: true })}
                                            autoFocus
                                            isRequired={true}
                                            setBranchFunction={setSelectedBranch}
                                            isEditable
                                            label="Branch"
                                            placeholder="Search for a branch"
                                            helperText={
                                                <>
                                                    The branch this address belongs to.
                                                </>
                                            }
                                        />
                                    </FormControl>

                                    <FormControl>
                                        <FormLabel>Street</FormLabel>
                                        <InputGroup>
                                            {/* <InputLeftAddon children={<FaSign />} /> */}
                                            <Input
                                                {...register("street", { required: true })}
                                                required
                                                type="text"
                                            />
                                        </InputGroup>
                                    </FormControl>
                                    <FormControl>
                                        <FormLabel>Zip Code</FormLabel>
                                        <Input
                                            {...register("zipcode", { required: true })}
                                        />
                                    </FormControl>
                                    <FormControl>
                                        <FormLabel>City</FormLabel>
                                        <Input
                                            {...register("city", { required: true })}
                                        />
                                    </FormControl>
                                    <FormControl>
                                        <FormLabel>State</FormLabel>
                                        <Input
                                            {...register("state", { required: true })}
                                            value={"WA"}
                                        />
                                    </FormControl>

                                    <FormControl>
                                        <FormLabel>Country</FormLabel>
                                        <Input
                                            {...register("country", { required: true })}
                                            value={"Australia"}
                                        />
                                    </FormControl>
                                    <FormControl>
                                        <FormLabel>PO Box</FormLabel>
                                        <Input
                                            {...register("pobox", { required: false })}
                                        />
                                    </FormControl>
                                    {/* <FormControl>
                                        <FormLabel>Agency</FormLabel>
                                        <Input
                                            {...register("agency", { required: true })}
                                        />
                                    </FormControl> */}
                                    {mutation.isError && (
                                        <Box mt={4}>
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
                                    )}
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
                                        onSubmitAddressCreation(
                                            {
                                                // "agency": 1,
                                                "branch": selectedBranch,
                                                "street": streetData,
                                                "city": cityData,
                                                "zipcode": zipcodeData,
                                                "state": stateData,
                                                "country": countryData,
                                                "pobox": poboxData,
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