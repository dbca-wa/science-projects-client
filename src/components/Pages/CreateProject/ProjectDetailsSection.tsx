// WIP project detail section for project creation

import { Box, Button, Flex, FormControl, FormHelperText, FormLabel, Grid, Icon, InputGroup, ModalBody, ModalFooter, Select } from "@chakra-ui/react"
import { useEffect, useState } from "react";
import { BsFillCalendarEventFill } from "react-icons/bs";

import 'react-calendar/dist/Calendar.css'
import "../../../styles/modalscrollbar.css";
import { CalendarWithCSS } from "./CalendarWithCSS";
import { useResearchFunctions } from "../../../lib/hooks/useResearchFunctions";
import { IBusinessArea, IDepartmentalService, IResearchFunction } from "../../../types";
import { useBusinessAreas } from "../../../lib/hooks/useBusinessAreas";
import { useDepartmentalServices } from "../../../lib/hooks/useDepartmentalServices";
import { UserSearchDropdown } from "../../Navigation/UserSearchDropdown";


interface IProjectDetailSectionProps {
    thisUser: number;
    projectDetailsFilled: boolean;
    setProjectDetailsFilled: (val: boolean) => void;
    nextClick: (data: any) => void;
    onClose: () => void;
    backClick: () => void;
    projectType: string;
    colorMode: string;
}

export const ProjectDetailsSection = ({
    backClick, nextClick, projectDetailsFilled, setProjectDetailsFilled, projectType, thisUser, onClose, colorMode }: IProjectDetailSectionProps) => {

    const [selectedBusinessArea, setSelectedBusinessArea] = useState<number>(0);
    const [selectedDepartmentalService, setSelectedDepartmentalService] = useState<number>(0);
    const [selectedResearchFunction, setSelectedResearchFunction] = useState<number>(0);

    const [selectedSupervisingScientist, setSelectedSupervisingScientist] = useState<number>();
    const [selectedDataCustodian, setSelectedDataCustodian] = useState<number>();
    const [selectedDates, setSelectedDates] = useState();

    useEffect(() => {
        // Adjust to auto set, but allow for closing and re-setting data custodian.
        // if (selectedSupervisingScientist && !selectedDataCustodian) {
        //     setSelectedDataCustodian(selectedSupervisingScientist);
        // }
        if (
            selectedBusinessArea
            && selectedDepartmentalService
            && selectedResearchFunction
            && selectedSupervisingScientist
            && selectedDataCustodian
            && selectedDates) {
            setProjectDetailsFilled(true)
            console.log(
                {
                    "businessArea": selectedBusinessArea,
                    "researchFunction": selectedResearchFunction,
                    "departmentalService": selectedDepartmentalService,
                    "dataCustodian": selectedDataCustodian,
                    "supervisingScientist": selectedSupervisingScientist,
                    "dates": selectedDates,
                }

            )
        }
        else {
            setProjectDetailsFilled(false)
        }
    }, [selectedDates, selectedDataCustodian, selectedSupervisingScientist, selectedResearchFunction, selectedDepartmentalService, selectedBusinessArea, setProjectDetailsFilled])

    const [researchFunctionsList, setResearchFunctionsList] = useState<IResearchFunction[]>([]);
    const [businessAreaList, setBusinessAreaList] = useState<IBusinessArea[]>([]);
    const [servicesList, setServicesList] = useState<IDepartmentalService[]>([]);

    const { rfData: researchFunctionsFromAPI, rfLoading } = useResearchFunctions();
    const { baData: businessAreaDataFromAPI, baLoading } = useBusinessAreas();
    const { dsData: servicesDataFromAPI, dsLoading } = useDepartmentalServices();

    useEffect(() => {
        if (!rfLoading) {
            // console.log(researchFunctionsFromAPI)
            const alphabetisedRF = [...researchFunctionsFromAPI]
            alphabetisedRF.sort((a, b) => a.name.localeCompare(b.name));
            setResearchFunctionsList(alphabetisedRF)
        }
    }, [rfLoading, researchFunctionsFromAPI])

    useEffect(() => {
        if (!baLoading) {
            // console.log(businessAreaDataFromAPI)
            const alphabetisedBA = [...businessAreaDataFromAPI]
            alphabetisedBA.sort((a, b) => a.name.localeCompare(b.name));
            setBusinessAreaList(alphabetisedBA)
        }
    }, [baLoading, businessAreaDataFromAPI])

    useEffect(() => {
        if (!dsLoading) {
            // console.log(servicesDataFromAPI)
            const alphabetisedDS = [...servicesDataFromAPI]
            alphabetisedDS.sort((a, b) => a.name.localeCompare(b.name));
            setServicesList(alphabetisedDS)
        }
    }, [dsLoading, servicesDataFromAPI])


    return (
        <>

            <Grid
                gridTemplateColumns={"repeat(2, 1fr)"}
                gridGap={8}
                my={4}
            // justifyContent={"center"}
            // alignItems={"center"}
            >

                <UserSearchDropdown
                    isRequired={true}
                    setUserFunction={setSelectedSupervisingScientist}
                    preselectedUserPk={thisUser}
                    label={projectType !== "Student Project" ? "Research Scientist" : "Supervising Scientist"}
                    placeholder={projectType === "Student Project" ? "Search for a Supervising Scientist" : "Search for a Research Scientist"}
                    helperText={
                        <Box
                            mt={2}
                        >
                            {projectType === "Student Project" ? "The supervising scientist." : "Research Scientist (Project Leader)"}
                        </Box>
                    }
                />

                <UserSearchDropdown
                    isRequired={true}
                    setUserFunction={setSelectedDataCustodian}
                    // preselectedUserPk={selectedDataCustodian}
                    preselectedUserPk={thisUser}
                    isEditable={true}
                    label="Data Custodian"
                    placeholder="Search for a data custodian"
                    helperText={
                        <Box
                        >
                            The data custodian (SPP E25) responsible for data management, publishing, and metadata documentation on the&nbsp;
                            <Button onClick={() => {
                                window.open("http://data.dbca.wa.gov.au/", "_blank");
                            }}
                                variant={"link"}
                                colorScheme="blue"
                            >
                                data catalogue.
                            </Button>
                        </Box>
                    }
                />


            </Grid>

            <Grid
                gridTemplateColumns={"repeat(2, 1fr)"}
                gridGap={8}
            >
                <Box w={"100%"} h={"100%"} display="flex" alignItems="center" justifyContent="center">
                    <FormControl isRequired>

                        <FormLabel>
                            <Box
                                display={"inline-flex"}
                                justifyContent={"center"}
                                alignItems={"center"}
                            >
                                <Icon as={BsFillCalendarEventFill} mr={2} />
                                Start and End Dates
                            </Box>

                        </FormLabel>

                        <CalendarWithCSS onChange={setSelectedDates} />

                        <FormHelperText>
                            Select a start and end date by clicking on the calendar. The first clicked date is the start date, the second is the end date.
                        </FormHelperText>
                    </FormControl>
                </Box>
                <Box>
                    <FormControl isRequired mb={4}>
                        <FormLabel>Departmental Service</FormLabel>
                        <InputGroup>
                            <Select
                                variant='filled' placeholder='Select a Deparmental Service'
                                onChange={(event) => setSelectedDepartmentalService(parseInt(event.target.value))}
                                value={selectedDepartmentalService}
                            >
                                {servicesList.map((service, index) => {
                                    return (
                                        <option key={index} value={service.pk}>
                                            {service.name}
                                        </option>
                                    )
                                })}
                            </Select>
                        </InputGroup>
                        <FormHelperText>The DBCA service that this project delivers outputs to.</FormHelperText>
                    </FormControl>


                    <FormControl isRequired>
                        <FormLabel>Business Area</FormLabel>

                        <InputGroup>
                            <Select
                                variant='filled' placeholder='Select a Business Area'
                                onChange={(event) => setSelectedBusinessArea(parseInt(event.target.value))}
                                value={selectedBusinessArea}
                            >
                                {businessAreaList.map((ba, index) => {
                                    return (
                                        <option key={index} value={ba.pk}>
                                            {ba.name}
                                        </option>
                                    )
                                })}
                            </Select>
                        </InputGroup>
                        <FormHelperText>The Business Area / Program that this project belongs to.</FormHelperText>
                    </FormControl>
                    <FormControl isRequired mb={4}>
                        <FormLabel>Research Function</FormLabel>
                        <InputGroup>
                            <Select
                                variant='filled' placeholder='Select a Research Function'
                                onChange={(event) => setSelectedResearchFunction(parseInt(event.target.value))}
                                value={selectedResearchFunction}
                            >
                                {researchFunctionsList?.map((rf, index) => {
                                    return (
                                        <option
                                            key={index}
                                            value={rf?.pk}
                                        >
                                            {rf?.name}
                                        </option>
                                    )
                                })}
                            </Select>
                        </InputGroup>
                        <FormHelperText>The Research Function this project mainly contributes to.</FormHelperText>
                    </FormControl>

                </Box>

            </Grid>


            {/* <Grid
                    gridTemplateColumns={"repeat(2, 1fr)"}
                    gridColumnGap={8}
                    my={4}
                    bg={"red"}
                > */}

            {/* </Grid> */}
            <Flex
                w={"100%"}
                justifyContent={"flex-end"}
                pb={4}
            >
                <Button onClick={backClick}>Back</Button>
                <Button
                    ml={3}
                    // type="submit"
                    colorScheme="blue"
                    isDisabled={!projectDetailsFilled}
                    onClick={
                        () => {
                            if (projectDetailsFilled) {
                                console.log("going next")
                                nextClick(
                                    {
                                        "businessArea": selectedBusinessArea,
                                        "researchFunction": selectedResearchFunction,
                                        "departmentalService": selectedDepartmentalService,
                                        "dataCustodian": selectedDataCustodian,
                                        "supervisingScientist": selectedSupervisingScientist,
                                        "dates": selectedDates,
                                    }
                                )
                            } else return;
                        }
                    }
                >
                    Next &rarr;
                </Button>
            </Flex>

        </>
    )
}



{/* HIDING USER __ SHOULD TAKE CURRENT USER */ }
{/* <FormControl isRequired mb={4}>
                <FormLabel>Username</FormLabel>
                <InputGroup>
                    <InputLeftElement children={<Icon as={FaUser} />} />
                    <Input type="text" placeholder="Username" value={username} onChange={(event) => setUsername(event.target.value)} maxLength={30} pattern="[A-Za-z0-9@.+_-]*" />
                </InputGroup>
                <FormHelperText>The DBCA staff member to participate in the project team.</FormHelperText>
            </FormControl> */}
