// Tab data for Project External Project info on the creation page.

import { Button, FormControl, FormHelperText, FormLabel, Grid, Icon, Input, InputGroup, InputLeftAddon, ModalBody, ModalFooter, Select, Textarea, useColorMode } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import "../../../styles/modalscrollbar.css";
import { IoIosCreate } from "react-icons/io";
import { ICreateProjectExternalDetails, ICreateProjectStudentDetails } from "../../../lib/api";
import { MdCorporateFare, MdOutlineTitle } from "react-icons/md";
import { AiFillDollarCircle } from "react-icons/ai";
import { HiAcademicCap } from "react-icons/hi";
import { FaUniversity } from "react-icons/fa";

interface IProjectStudentProps {
    studentFilled: boolean;
    setStudentFilled: React.Dispatch<React.SetStateAction<boolean>>;
    studentData: ICreateProjectStudentDetails;
    setStudentData: (data: any) => void;
    createClick: () => void;
    onClose: () => void;
    backClick: () => void;
}

export const ProjectStudentSection = (
    {
        backClick,
        createClick,
        studentFilled,
        setStudentFilled,
        studentData,
        setStudentData,
    }: IProjectStudentProps
) => {
    const { colorMode } = useColorMode();

    const [hoveredTitle, setHoveredTitle] = useState(false);

    const titleBorderColor = `${colorMode === "light" ?
        hoveredTitle ? "blackAlpha.300" : "blackAlpha.200" :
        hoveredTitle ? "whiteAlpha.400" : "whiteAlpha.300"}`


    const [level, setLevel] = useState<string>("");
    const [organisation, setOrganisation] = useState<string>("");

    useEffect(() => {
        setStudentData({
            "level": level,
            "organisation": organisation,
        });
    }, [level, organisation]);


    useEffect(() => {
        if (
            organisation.length > 0 && level.length > 0
        ) {
            console.log(studentData)
            setStudentFilled(true)
        }
        else {
            setStudentFilled(false);
        }
    }, [studentData, level, organisation, setStudentData])


    return (
        <>
            <ModalBody
                overflowY={"auto"}
                maxHeight={"58vh"}
            >
                <FormControl
                    pb={6}
                    isRequired
                >
                    <FormLabel>Organisation</FormLabel>
                    <InputGroup>
                        <InputLeftAddon children={<FaUniversity />} />
                        <Input
                            placeholder="Enter the corresponding organisation..."
                            value={organisation}
                            onChange={(e) => {
                                setOrganisation(e.target.value);
                            }}
                            // {...register("name", { required: true })}
                            type="text"
                        />
                    </InputGroup>
                    <FormHelperText>The academic organisation of the student</FormHelperText>
                </FormControl>


                <FormControl
                    pb={6}
                    isRequired
                    userSelect={"none"}
                >
                    <FormLabel
                        onMouseEnter={() => setHoveredTitle(true)}
                        onMouseLeave={() => setHoveredTitle(false)}
                    >
                        Level</FormLabel>
                    <InputGroup>
                        <InputLeftAddon
                            left={0}
                            bg={colorMode === "light" ? "gray.100" : "whiteAlpha.300"}
                            px={4}
                            zIndex={1}
                            borderColor={titleBorderColor}
                            borderTopRightRadius={"none"}
                            borderBottomRightRadius={"none"}
                            borderRight={"none"}
                        // boxSize={10}
                        >
                            <Icon as={HiAcademicCap} boxSize={5} />
                        </InputLeftAddon>

                        <Select placeholder={'Select a level'}
                            borderLeft={"none"}
                            borderTopLeftRadius={"none"}
                            borderBottomLeftRadius={"none"}
                            pl={"2px"}
                            borderLeftColor={"transparent"}
                            onMouseEnter={() => setHoveredTitle(true)}
                            onMouseLeave={() => setHoveredTitle(false)}
                            // {...register("title", {
                            //     value: data?.title,
                            // })}
                            onChange={(e) => {
                                setLevel(e.target.value);
                            }}
                            value={level}
                        >
                            <option value='phd'>
                                PhD
                            </option>
                            <option value='msc'>
                                MSc
                            </option>
                            <option value='honours'>
                                BSc Honours
                            </option>
                            <option value='fourth_year'>
                                Fourth Year
                            </option>
                            <option value='third_year'>
                                Third Year
                            </option>
                            <option value='undergrad'>
                                Undergradate
                            </option>

                        </Select>

                    </InputGroup>

                    <FormHelperText>The level of the student and the project</FormHelperText>

                </FormControl>

            </ModalBody>
            <ModalFooter
            //  pos="absolute" bottom={0} right={0}
            >
                <Grid
                    gridTemplateColumns={"repeat(2, 1fr)"}
                    gridGap={4}
                >
                    <Button
                        colorScheme="gray"

                        onClick={backClick}
                    >
                        Cancel
                    </Button>

                    <Button
                        ml={3}
                        type="submit"
                        colorScheme="blue"
                        isDisabled={!studentFilled}
                        onClick={() => {
                            console.log('Here is the student data'
                            )
                            console.log(studentData)
                            createClick()

                        }}
                        rightIcon={<IoIosCreate />}
                    >
                        Create
                    </Button>
                </Grid>
            </ModalFooter>
        </>
    )
}