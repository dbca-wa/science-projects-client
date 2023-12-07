// Tab data for Project Location on the creation page. WIP need to update to take in pre-set locations for use in update project.

import { Box, Button, Flex, Grid, Image, Text, ModalBody, ModalFooter, Skeleton } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import "../../../styles/modalscrollbar.css";
import { useGetLocations } from "../../../lib/hooks/useGetLocations";
import { IoIosCreate } from "react-icons/io";
import { AreaCheckAndMaps } from "./AreaCheckAndMaps";

interface IProjectLocationProps {
    locationFilled: boolean;
    setLocationFilled: (val: boolean) => void;
    locationData: number[];
    setLocationData: React.Dispatch<React.SetStateAction<any>>;
    createClick: () => void;
    onClose: () => void;
    backClick: () => void;
    nextClick?: (data: any) => void;
    projectType: string;
    currentYear: number;
    colorMode: string;
}

export const ProjectLocationSection = (
    {
        backClick,
        nextClick,
        createClick,
        locationFilled,
        setLocationFilled,
        locationData,
        setLocationData,
        projectType
    }: IProjectLocationProps) => {
    const { dbcaRegions, dbcaDistricts, nrm, ibra, imcra, locationsLoading } = useGetLocations();

    const [selectedRegions, setSelectedRegions] = useState<number[]>([]);
    const [selectedDistricts, setSelectedDistricts] = useState<number[]>([]);
    const [selectedIbras, setSelectedIbras] = useState<number[]>([]);
    const [selectedImcras, setSelectedImcras] = useState<number[]>([]);
    const [selectedNrms, setSelectedNrms] = useState<number[]>([]);

    useEffect(() => {
        setLocationData([
            ...selectedRegions,
            ...selectedDistricts,
            ...selectedIbras,
            ...selectedImcras,
            ...selectedNrms,
        ]);
    }, [selectedRegions, selectedIbras, selectedDistricts, selectedImcras, selectedNrms, setLocationData]);


    const [fixed, setFixed] = useState(false);

    const handleScroll = () => {
        const offset = window.scrollY;
        setFixed(offset < 200);
    };

    useEffect(() => {
        window.addEventListener("scroll", handleScroll);
        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
    }, []);


    // useEffect(() => {
    //     if (locationData.length > 0) {
    //         console.log(locationData)
    //         setLocationFilled(true)
    //     }
    //     else if (locationData.length === 0) {
    //         setLocationFilled(false);
    //     }
    // }, [locationData])

    return (
        <>
            {!locationsLoading && (
                <Grid
                    gridTemplateColumns={"repeat(2, 1fr)"}
                    gridColumnGap={4}
                    px={4}
                >
                    <Flex
                        flexDir={"column"}
                    >
                        {dbcaRegions && (
                            <AreaCheckAndMaps
                                title="DBCA Regions"
                                areas={dbcaRegions}
                                required
                                selectedAreas={selectedRegions}
                                setSelectedAreas={setSelectedRegions}
                            />

                        )}
                        {dbcaDistricts && (
                            <AreaCheckAndMaps
                                title="DBCA Districts"
                                areas={dbcaDistricts}
                                required
                                selectedAreas={selectedDistricts}
                                setSelectedAreas={setSelectedDistricts}
                            />

                        )}
                        {ibra && (
                            <AreaCheckAndMaps
                                title="IBRAs"
                                areas={ibra}
                                required
                                selectedAreas={selectedIbras}
                                setSelectedAreas={setSelectedIbras}
                            />

                        )}
                        {imcra && (
                            <AreaCheckAndMaps
                                title="IMCRAs"
                                areas={imcra}
                                required
                                selectedAreas={selectedImcras}
                                setSelectedAreas={setSelectedImcras}
                            />

                        )}
                        {nrm && (
                            <AreaCheckAndMaps
                                title="Natural Resource Management Regions"
                                areas={nrm}
                                required
                                selectedAreas={selectedNrms}
                                setSelectedAreas={setSelectedNrms}
                            />

                        )}

                    </Flex>

                    {/* <Box
                        position={fixed ? "fixed" : "static"}
                        top={fixed ? 0 : "auto"}
                        zIndex={1000} // Adjust the zIndex to make sure it appears above other content
                        overflow={'hidden'}
                        h={'500px'} // Set the height of the image container
                        bg={"red"}
                        rounded={"2xl"}
                    >
                        <Image
                            src="/soon.jpg"
                            objectFit={'cover'}
                            w={"100%"}
                            h={"100%"}
                        />
                    </Box> */}

                    <Box
                        position="sticky"
                        top={"120px"} // Adjust the top value if needed
                        overflow={'hidden'}
                        h={'700px'} // Set the height of the image container
                        // bg={"red"}
                        rounded={"2xl"}
                    >
                        <Text
                            // color={"white"}
                            // zIndex={999}
                            fontWeight={'bold'}
                            my={2}
                            // ml={2}
                            textAlign={'center'}
                        >
                            Map in development
                        </Text>
                        {/* <Skeleton
                            // position="sticky"
                            // top={"125px"} // Adjust the top value if needed
                            // overflow={'hidden'}
                            // h={'500px'} // Set the height of the image container
                            // bg={"red"}
                            rounded={"2xl"}
                        > */}
                        <Box
                            position="sticky"
                            // top={"105px"} // Adjust the top value if needed
                            overflow={'hidden'}
                            // h={'500px'} // Set the height of the image container
                            bg={"gray.200"}
                            w={"100%"}
                            h={"500px"}
                            // h={"100%"}
                            rounded={"2xl"}
                        >
                            {/* <Image
                                src="/soon.jpg"
                                objectFit={'cover'}
                                w={"100%"}
                                h={"100%"}
                            /> */}
                        </Box>
                        {/* </Skeleton> */}
                        <Flex
                            w={"100%"}
                            justifyContent={"flex-end"}
                            pb={4}
                            pt={4}
                        >
                            <Button onClick={backClick}>Cancel</Button>
                            <Button
                                ml={3}
                                type="submit"
                                colorScheme="blue"
                                // isDisabled={!locationFilled}
                                onClick={() => {
                                    console.log('Here is the location data'
                                    )
                                    console.log(locationData)
                                    if (projectType.includes("External") || projectType.includes("Student")) {
                                        if (locationFilled) {
                                            console.log("going next")
                                            console.log(locationData)
                                            setLocationFilled(true)
                                            nextClick(

                                                locationData
                                                // "locations": [...locationData]

                                            )
                                        } else return;
                                    } else {
                                        createClick()
                                    }
                                }}
                                rightIcon={(projectType.includes("External") || projectType.includes("Student")) ? undefined : <IoIosCreate />}
                            >
                                {(projectType.includes("External") || projectType.includes("Student")) ? `Next` : `Create`}
                            </Button>
                        </Flex>
                    </Box>

                    {/* <Box
                        position="fixed"
                        // top={0}
                        // right={0} // Adjust the right value if needed
                        overflow={'hidden'}
                        h={'500px'} // Set the height of the image container
                        bg={"red"}
                        rounded={"2xl"}
                    >
                        <Image
                            src="/soon.jpg"
                            objectFit={'cover'}
                            w={"100%"}
                            h={"100%"}
                        />
                    </Box> */}

                    {/* <Box
                        position="sticky"
                        top={0}
                        overflow={'hidden'}
                        h={'500px'} // Set the height of the image container
                        bg={"red"}
                        rounded={"2xl"}
                    >
                        <Image
                            src="/soon.jpg"
                            objectFit={'cover'}
                            w={"100%"}
                            h={"100%"}
                        />
                    </Box> */}

                    {/* <Box
                        overflow={'hidden'}
                        h={'500px'} // Set the height of the image container
                        bg={"red"}
                        rounded={"2xl"}
                        style={{
                            backgroundImage: `url('/soon.jpg')`, // Set the image as background
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            backgroundAttachment: 'fixed', // Make the image fixed on scroll
                        }}
                    ></Box> */}
                    {/* <Box
                        overflow={'hidden'}
                        h={'500px'}
                        bg={"red"}
                        rounded={"2xl"}
                    >
                        <Image
                            src="/soon.jpg"
                            objectFit={'cover'}
                            w={"100%"}
                            h={"100%"}
                        />
                    </Box> */}
                </Grid>

            )}

            {/* <Flex
                w={"100%"}
                justifyContent={"flex-end"}
                pb={4}
            >
                <Button onClick={backClick}>Cancel</Button>
                <Button
                    ml={3}
                    type="submit"
                    colorScheme="blue"
                    // isDisabled={!locationFilled}
                    onClick={() => {
                        console.log('Here is the location data'
                        )
                        console.log(locationData)
                        if (projectType.includes("External") || projectType.includes("Student")) {
                            if (locationFilled) {
                                console.log("going next")
                                console.log(locationData)
                                setLocationFilled(true)
                                nextClick(

                                    locationData
                                    // "locations": [...locationData]

                                )
                            } else return;
                        } else {
                            createClick()
                        }
                    }}
                    rightIcon={(projectType.includes("External") || projectType.includes("Student")) ? undefined : <IoIosCreate />}
                >
                    {(projectType.includes("External") || projectType.includes("Student")) ? `Next` : `Create`}
                </Button>
            </Flex> */}
        </>
    )
}