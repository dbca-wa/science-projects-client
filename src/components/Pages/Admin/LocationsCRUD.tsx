import { Text, Box, Button, Drawer, DrawerBody, DrawerContent, DrawerFooter, Flex, FormControl, Input, InputGroup, InputLeftAddon, VStack, useDisclosure, Center, Spinner, Grid, DrawerOverlay, DrawerCloseButton, DrawerHeader, FormLabel, Textarea, Checkbox, useToast, Select } from "@chakra-ui/react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { LocationItemDisplay } from "./LocationItemDisplay";
import { IAddLocationForm, ISimpleLocationData, OrganisedLocationData } from "../../../types";
import { createLocation, getAllLocations } from "../../../lib/api";
import _ from 'lodash';
import { FaSign } from "react-icons/fa";
import { useQueryClient } from "@tanstack/react-query";

export const LocationsCRUD = () => {
    const { register, handleSubmit } = useForm<IAddLocationForm>();
    const toast = useToast();
    const { isLoading, data: slices } = useQuery<OrganisedLocationData>(
        {
            queryFn: getAllLocations,
            queryKey: ["locations"]
        }
    );
    const queryClient = useQueryClient();


    const mutation = useMutation(createLocation,
        {
            onSuccess: (data: ISimpleLocationData) => {
                // console.log("success")
                toast({
                    status: "success",
                    title: "Created",
                    position: "top-right"
                })
                onAddClose();
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
                // console.log("mutation")

            }
        });
    const onSubmit = (formData: IAddLocationForm) => {
        mutation.mutate(formData);
    }

    const { isOpen: addIsOpen, onOpen: onAddOpen, onClose: onAddClose } = useDisclosure();
    const [searchLoading, setSearchLoading] = useState<boolean>(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [filteredSlices, setFilteredSlices] = useState<ISimpleLocationData[]>([]);
    const [selectedAreaTypes, setSelectedAreaTypes] = useState<string[]>([]);
    const [countOfItems, setCountOfItems] = useState(0);


    useEffect(() => {
        if (slices) {
            let newFilteredSlices: ISimpleLocationData[] = [];

            if (selectedAreaTypes.length > 0) {
                // Loop through the area types and append the slices to newFilteredSlices
                for (const areaType of selectedAreaTypes) {
                    if (slices[areaType]) {
                        newFilteredSlices = newFilteredSlices.concat(slices[areaType]);
                    }
                }
            } else {
                // If no area types are selected, show all slices
                for (const areaType in slices) {
                    newFilteredSlices = newFilteredSlices.concat(slices[areaType]);
                }
            }

            setFilteredSlices(newFilteredSlices);
        }
    }, [selectedAreaTypes, slices]);

    useEffect(() => {
        if (slices) {
            let count = 0;
            if (selectedAreaTypes.length > 0 || searchTerm !== "") {
                count = filteredSlices.length;
            } else {
                count = Object.values(slices).flat().length;
            }
            setCountOfItems(count);
        }
    }, [selectedAreaTypes, searchTerm, slices, filteredSlices]);

    const debouncedHandleSearchChange = useRef(
        _.debounce((searchTerm: string, slices: OrganisedLocationData) => {
            let filteredSlices: ISimpleLocationData[] = [];

            if (searchTerm) {
                for (const area_type in slices) {
                    filteredSlices = filteredSlices.concat(
                        slices[area_type].filter(sl =>
                            sl.name.toLowerCase().includes(searchTerm.toLowerCase())
                        )
                    );
                }
            } else {
                for (const area_type in slices) {
                    filteredSlices = filteredSlices.concat(slices[area_type]);
                }
            }

            setFilteredSlices(filteredSlices);
            setSearchLoading(false);
        }, 100)
    ).current;


    const handleSearchChange = (e: React.FormEvent<HTMLInputElement>) => {
        const newSearchTerm = e.currentTarget.value;
        setSearchTerm(newSearchTerm);
        setSearchLoading(true);

        if (slices) {
            debouncedHandleSearchChange(newSearchTerm, slices);
        }
    };

    useEffect(() => {
        if (slices) {
            if (selectedAreaTypes.length > 0 || searchTerm !== "") {
                let filteredSlices: ISimpleLocationData[] = [];

                // Apply search filter
                let slicesHere = slices;
                if (searchTerm) {
                    slicesHere = Object.keys(slicesHere).reduce((acc, areaType) => {
                        const filteredAreaType = slicesHere[areaType].filter(sl =>
                            sl.name.toLowerCase().includes(searchTerm.toLowerCase())
                        );
                        if (filteredAreaType.length > 0) {
                            acc[areaType] = filteredAreaType;
                        }
                        return acc;
                    }, {} as OrganisedLocationData);
                }

                // Apply area type filter
                if (selectedAreaTypes.length > 0) {
                    for (const areaType of selectedAreaTypes) {
                        if (slicesHere[areaType]) {
                            filteredSlices.push(...slicesHere[areaType]);
                        }
                    }
                } else {
                    // If no checkboxes are selected, show all slices
                    for (const areaType in slicesHere) {
                        filteredSlices = filteredSlices.concat(slicesHere[areaType]);
                    }
                }

                setFilteredSlices(filteredSlices);
                // setCountOfItems(filteredSlices.length); // Update the count based on the filtered slices
            } else {
                // If no checkboxes are selected and no search term, reset to show all slices
                setFilteredSlices(filteredSlices);
                // setCountOfItems(currentFilteredSlices.length); // Update the count based on the current filtered slices
            }
        }
    }, [selectedAreaTypes, searchTerm, slices, filteredSlices]);


    const handleAreaTypeCheckboxChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { value, checked } = e.target;

        if (checked) {
            setSelectedAreaTypes([value]); // Set only the clicked checkbox as selected
        } else {
            setSelectedAreaTypes([]); // Uncheck the clicked checkbox
        }
    };



    const areaTypeMap: {
        [key: string]: {
            val: string;
            name: string;
        };
    } = {
        dbcaregion: {
            val: "dbcaregion",
            name: "DBCA Region"
        },
        dbcadistrict: {
            val: "dbcadistrict",
            name: "DBCA District"
        },
        ibra: {
            val: "ibra",
            name: "IBRA"
        },
        imcra: {
            val: "imcra",
            name: "IMCRA"
        },
        nrm: {
            val: "nrm",
            name: "NRM"
        },
    };






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
                                Locations ({countOfItems})
                            </Text>
                        </Box>
                        <Flex width={"100%"} mt={4}>
                            <Input
                                type="text"
                                placeholder="Search locations by name"
                                value={searchTerm}
                                onChange={handleSearchChange}
                                w={"65%"}

                            />
                            <Flex
                                justifyContent={"space-between"}
                                px={4}
                                w={"100%"}
                            // bg={"red"}
                            >
                                {Object.keys(areaTypeMap).map((key) => (
                                    <Checkbox
                                        key={key}
                                        value={key}
                                        isChecked={selectedAreaTypes.includes(key)}
                                        onChange={handleAreaTypeCheckboxChange}
                                    >
                                        {areaTypeMap[key].name}
                                    </Checkbox>
                                ))}
                            </Flex>

                            <Flex justifyContent={"flex-end"}
                                // w={"100%"}
                                pl={10}
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
                                        gridTemplateColumns={"1fr 3fr"}
                                        mt={4}
                                        width="100%"
                                        p={3}
                                        borderWidth={1}
                                        borderBottomWidth={filteredSlices.length === 0 ? 1 : 0}
                                    >
                                        <Flex>
                                            <Text as={"b"}>Location Name</Text>

                                        </Flex>
                                        <Flex
                                            justifyContent={"space-between"}

                                        >
                                            <Text as={"b"}>Location Type</Text>

                                            <Text as={"b"}>Change</Text>
                                        </Flex>
                                    </Grid>
                                </>
                        }

                        {
                            searchLoading ? (
                                <Center w={"100%"} minH="100px" pt={10}>
                                    <Spinner size={"xl"} />
                                </Center>
                            ) : (
                                <Grid gridTemplateColumns={"repeat(1,1fr)"}>
                                    {searchTerm !== "" || selectedAreaTypes.length !== 0 ? (
                                        filteredSlices.map((s) => {
                                            if (selectedAreaTypes.length === 0 || selectedAreaTypes.includes(s.area_type)) {
                                                return (
                                                    <LocationItemDisplay
                                                        key={s.pk}
                                                        pk={s.pk}
                                                        name={s.name}
                                                        area_type={s.area_type}
                                                    />
                                                );
                                            }
                                            return null; // Return null for slices that don't match the filter
                                        })
                                    ) : (
                                        slices && (
                                            Object.keys(slices).sort().map((areaTypeKey) =>
                                                slices[areaTypeKey].map((s) => (
                                                    <LocationItemDisplay
                                                        key={s.pk}
                                                        pk={s.pk}
                                                        name={s.name}
                                                        area_type={s.area_type}
                                                    />
                                                ))
                                            )
                                        )
                                    )}

                                </Grid>


                            )
                        }
                    </Box>


                    <Drawer isOpen={addIsOpen} onClose={onAddClose} size={"lg"}>
                        <DrawerOverlay />
                        <DrawerContent>
                            <DrawerCloseButton />
                            <DrawerHeader>Add Location</DrawerHeader>
                            <DrawerBody>
                                <VStack spacing={10} as="form" id="add-form" onSubmit={handleSubmit(onSubmit)} >
                                    <FormControl>
                                        <FormLabel>Name</FormLabel>
                                        <InputGroup>
                                            {/* <InputLeftAddon children={<FaSign />} /> */}
                                            <Input
                                                autoFocus
                                                autoComplete="off"
                                                {...register("name", { required: true })} required type="text" />
                                        </InputGroup>
                                    </FormControl>
                                    <FormControl>
                                        <FormLabel>Area Type</FormLabel>
                                        <Select {...register("area_type", { required: true })} >
                                            <option value={"dbcaregion"}>DBCA Region</option>
                                            <option value={"dbcadistrict"}>DBCA District</option>
                                            <option value={"ibra"}>Interim Biogeographic Regionalisation of Australia</option>
                                            <option value={"imcra"}>Integrated Marine and Coastal Regionisation of Australia</option>
                                            <option value={"nrm"}>Natural Resource Management Region</option>
                                        </Select>

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
                                // onClick={() => {
                                //     console.log("clicked")
                                //     onSubmit(
                                //         {
                                //             "old_id": 1,
                                //             "name": nameData,
                                //             "area_type": slugData,
                                //         }
                                //     )

                                // }}
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