// Tab data for Project Location on the creation page. WIP need to update to take in pre-set locations for use in update project.

import { Button, ModalBody, ModalFooter } from "@chakra-ui/react";
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

    // useEffect(() => {
    //     if (locationData.length > 0) {
    //         console.log(locationData)
    //         setLocationFilled(true)
    //     }
    //     else {
    //         setLocationFilled(false);
    //     }
    // }, [locationData, setLocationFilled])

    useEffect(() => {
        if (locationData.length > 0) {
            console.log(locationData)
            setLocationFilled(true)
        }
        else if (locationData.length === 0) {
            setLocationFilled(false);
        }
    }, [locationData])

    return (
        <>
            <ModalBody
                overflowY={"auto"}
                maxHeight={"58vh"}
            >
                {!locationsLoading && (
                    <>
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

                    </>
                )}


            </ModalBody>
            <ModalFooter>
                <Button onClick={backClick}>Cancel</Button>
                <Button
                    ml={3}
                    type="submit"
                    colorScheme="blue"
                    isDisabled={!locationFilled}
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
            </ModalFooter>
        </>
    )
}