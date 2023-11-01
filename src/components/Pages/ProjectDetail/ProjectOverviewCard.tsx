// Displayed when looking at the Project Details by selecting it on the projects page. Displays more data about the project and allows editing.

import { Box, Button, Center, Flex, Grid, Image, Tag, Text, useColorMode, useDisclosure } from "@chakra-ui/react"
import { AiFillCalendar, AiFillEdit, AiFillTag } from "react-icons/ai"
import { Link } from "react-router-dom";
import { HiOutlineExternalLink } from 'react-icons/hi'
import { ProjectDetailEditModal } from "../../Modals/ProjectDetailEditModal";
import { IFullProjectDetails, IProjectData, IProjectMember } from "../../../types";
import { FaUserFriends } from "react-icons/fa";
import { GiMaterialsScience } from "react-icons/gi";
import { MdScience } from "react-icons/md";
import { RiBook3Fill } from 'react-icons/ri'
import { useNoImage } from "../../../lib/hooks/useNoImage";
import { useEffect } from "react";
import { useLayoutSwitcher } from "../../../lib/hooks/LayoutSwitcherContext";
import { SimpleRichTextEditor } from "../../RichTextEditor/Editors/SimpleRichTextEditor";
import useApiEndpoint from "../../../lib/hooks/useApiEndpoint";
import useServerImageUrl from "../../../lib/hooks/useServerImageUrl";

interface IProjectOverviewCardProps {
    baseInformation: IProjectData;
    details: IFullProjectDetails | null | undefined;
    members: IProjectMember[];
}


export const ProjectOverviewCard = (
    { baseInformation, details, members }: IProjectOverviewCardProps
) => {

    const baseApi = useApiEndpoint();
    const { isOpen: isEditProjectDetailModalOpen, onOpen: onEditProjectDetailModalOpen, onClose: onEditProjectDetailModalClose } = useDisclosure()
    const { colorMode } = useColorMode();
    useEffect(() => {
        console.log(baseInformation)
    })

    const determineAuthors = (members: IProjectMember[]) => {
        // Filters members with non-null first and last names
        const filteredMembers = members.filter((member) => {
            return member.user.first_name !== null && member.user.last_name !== null;
        });

        // Sorts the filteredMembers array alphabetically based on last_name
        filteredMembers.sort((a, b) => {
            const lastNameA = a.user.last_name!.toUpperCase();
            const lastNameB = b.user.last_name!.toUpperCase();
            if (lastNameA < lastNameB) return -1;
            if (lastNameA > lastNameB) return 1;
            return 0;
        });

        // Formats the names and create the 'authors' string
        const authorsArray = filteredMembers.map((member) => {
            const initials = `${member.user.first_name?.charAt(0)}.` || ""; // Use empty string as a default if first_name is null
            return `${initials} ${member.user.last_name || ""}`; // Use empty string as a default if last_name is null
        });

        const authorsDisplay = authorsArray.join(", ");

        return authorsDisplay;
    };

    const authorsDisplay = determineAuthors(members);

    const determineKeywords = () => {
        const info = baseInformation.keywords
        if (info !== "" && info !== null)
            return baseInformation.keywords.split(", ").map(keyword => keyword.charAt(0).toUpperCase() + keyword.slice(1));
        else return ["None"]
    }

    const keywords = determineKeywords();

    const determineProjectLabel = () => {
        const year = baseInformation.year;
        const number = baseInformation.number;
        let stringified_number = ""
        if (number < 10) {
            stringified_number = "00" + String(number)
        }
        else if (number >= 10 && number < 100) {
            stringified_number = "0" + String(number)
        }
        else {
            stringified_number = String(number)
        }
        let type = baseInformation.kind;
        if (type === "student") {
            type = "STP"
        } else if (type === "external") {
            type = "EXT"
        } else if (type === "science") {
            type = "SP"

        } else {
            // Core Function
            type = "CF"
        }

        const label = `${type}-${year}-${stringified_number}`
        return label
    }

    const projectLabel = determineProjectLabel();

    const determineProjectYears = (baseInformation: IProjectData) => {
        const startDate = baseInformation.start_date || baseInformation.created_at;
        const endDate = baseInformation.end_date || null;

        let startYear, endYear;

        if (startDate instanceof Date) {
            startYear = startDate.getFullYear();
        } else {
            const parsedStartDate = new Date(startDate);
            startYear = parsedStartDate.getFullYear();
        }

        if (endDate instanceof Date) {
            endYear = endDate.getFullYear();
        } else if (endDate !== null) {
            const parsedEndDate = new Date(endDate);
            endYear = parsedEndDate.getFullYear();
        } else {
            endYear = null;
        }

        if (endYear !== null) {
            return `${startYear}-${endYear}`;
        } else {
            return `${startYear}-`;
        }
    };

    const projectYears = determineProjectYears(baseInformation);
    // division

    const noImage = useNoImage();

    useEffect(() => {
        console.log(baseInformation)
    }, [])

    const { layout } = useLayoutSwitcher();


    // const editorKey = selectedYear.toString() + colorMode;


    const imageUrl = useServerImageUrl(baseInformation?.image?.file)

    return (
        <>
            <Box
                minH={"100px"}
                bg={colorMode === "light" ? "gray.100" : "gray.700"}
                color={colorMode === "light" ? "black" : "whiteAlpha.900"}
                rounded={"lg"}
                overflow={"hidden"}
            >
                <Grid
                    p={4}
                    pt={6}
                    px={6}
                    templateColumns={{
                        base: "1fr", // Single column layout for small screens (mobile)
                        lg: "minmax(300px, 4fr) 5fr", // Left column takes minimum 200px and can grow up to 4fr, right column takes 5fr
                    }}
                    gap={3}
                >
                    <Box
                        // bg={"red"}
                        h={
                            {
                                base: "350px",
                                "2xl": "500px",
                                "3xl": "600px"
                            }
                        }
                        rounded={"xl"}
                        overflow={"hidden"}
                    >
                        <Image
                            src={
                                baseInformation?.image?.file
                                    ? imageUrl :
                                    noImage
                            }
                            objectFit={"cover"}
                            w={"100%"}
                            h={"100%"}
                        />

                    </Box>

                    <Box
                        px={2}
                        pos={"relative"}
                    >
                        <Box pb={3}>
                            <Button
                                fontSize="xl"
                                fontWeight="bold"
                                variant={"link"}
                                color={colorMode === "light" ? "blue.500" : "blue.300"}
                                whiteSpace={"normal"}
                                textAlign={"left"}
                            >
                                <Link to={`/projects/${baseInformation.pk !== undefined ? baseInformation.pk : baseInformation.id}`}>
                                    {baseInformation.title}
                                </Link>
                            </Button>
                            <Text
                                mt={2}
                                color={colorMode === "light" ? "gray.600" : "gray.400"}
                                fontSize={"sm"}
                            >
                                {authorsDisplay}
                            </Text>
                        </Box>


                        <Box
                            pt={2}
                            pb={5}
                            display="flex"
                            alignItems="center"
                        >
                            <AiFillCalendar size={"16px"} />
                            <Grid
                                ml={3}
                                templateColumns={{
                                    base: "repeat(1, 1fr)",
                                    sm: "repeat(1, 1fr)",
                                    md: "repeat(1, 1fr)",
                                    lg: "repeat(1, 1fr)",
                                    xl: "repeat(1, 1fr)",
                                }}
                                gridTemplateRows={"28px"}
                                gap={4}
                            >
                                <Tag
                                    size={"sm"}
                                    textAlign={"center"}
                                    justifyContent={"center"}
                                    p={"10px"}
                                    bgColor={colorMode === "light" ? "gray.200" : "gray.800"}
                                    color={colorMode === "light" ? "black" : "white"}
                                >
                                    {projectYears}
                                </Tag>

                            </Grid>
                        </Box>

                        {/* Rest of the project details */}

                        <Box
                            // pb={4}
                            display="inline-flex"
                            alignItems="center"
                        >
                            <AiFillTag size={"16px"} />
                            <Grid
                                ml={3}
                                templateColumns={
                                    layout === "traditional"
                                        ? {
                                            base: "repeat(1, 1fr)",
                                            sm: "repeat(2, 1fr)",
                                            md: "repeat(3, 1fr)",
                                            lg: "repeat(2, 1fr)",
                                            "1200px": "repeat(3, 1fr)",
                                            xl: "repeat(4, 1fr)",
                                        }
                                        : {
                                            base: "repeat(1, 1fr)",
                                            sm: "repeat(2, 1fr)",
                                            md: "repeat(3, 1fr)",
                                            lg: "repeat(4, 1fr)",
                                            xl: "repeat(6, 1fr)",
                                        }
                                }
                                // gridTemplateRows={"28px"}
                                gap={4}
                            >
                                {keywords?.map((tag, index) => (

                                    <Tag
                                        height={"100%"}
                                        size={"sm"}
                                        key={index}
                                        textAlign={"center"}
                                        justifyContent={"center"}
                                        // p={"10px"}
                                        minH={"50px"}
                                        bgColor={colorMode === "light" ? "gray.200" : "gray.800"}
                                        color={colorMode === "light" ? "black" : "white"}
                                        style={{ flex: "1" }} // Make each tag expand to fill available space
                                    >
                                        {tag}
                                    </Tag>

                                ))}
                            </Grid>
                        </Box>



                    </Box>
                </Grid>

                {/* Description and Edit Project Details */}
                <Box p={6} pt={0}>
                    {/* <Box
                        pb={2}
                    >
                        {baseInformation?.tagline
                            ? <Text><b>Tagline:</b> {baseInformation.tagline}</Text>
                            : <Text><b>Tagline:</b> This project has no tagline</Text>
                        }
                    </Box> */}
                    <Box
                        mt={4}
                    >
                        {/* {baseInformation?.description
                            ? <Text><b>Description:</b> {baseInformation.description}</Text>
                            : <Text><b>Description:</b> This project has no description</Text>} */}

                        <SimpleRichTextEditor
                            key={`description${colorMode}`} // Change the key to force a re-render
                            data={baseInformation.description}
                            section={"description"}
                            titleTextSize={"20px"}
                        />
                    </Box>

                    <Flex py={4} pb={0}
                        w={"100%"}
                        justifyContent={"flex-end"}
                    >
                        {/* <Button
                                variant={"link"}
                                colorScheme="blue"
                                leftIcon={<HiOutlineExternalLink />}
                                onClick={() => {
                                    window.open('https://data.dbca.wa.gov.au/', "_blank")
                                }}
                            >
                                Review datasets tagged with {projectLabel}
                            </Button> */}

                        <Text
                            color={
                                colorMode === "dark" ? "blue.200" : "blue.400"
                            }
                            fontWeight={"bold"}
                            cursor={"pointer"}
                            _hover={
                                {
                                    color: colorMode === "dark" ? "blue.100" : "blue.300",
                                    textDecoration: "underline",
                                }
                            }
                            onClick={() => {
                                window.open('https://data.dbca.wa.gov.au/', "_blank")
                            }}
                        >
                            Review datasets tagged with {projectLabel}
                        </Text>
                        <Box
                            mt={1}
                            ml={2}
                            // mr={2}
                            color={colorMode === "dark" ? "blue.200" : "blue.400"}
                            // mr={3}
                            alignItems={"center"}
                            alignContent={"center"}
                        // boxSize={3}
                        // bg={"red"}
                        >
                            <HiOutlineExternalLink />
                        </Box>
                    </Flex>
                    <Flex pt={6} justifyContent={"right"}>
                        <ProjectDetailEditModal
                            projectType={
                                baseInformation.kind === "student" ? "Student Project" :
                                    baseInformation.kind === "external" ? "External Project" :
                                        baseInformation.kind === "science" ? "Science Project" : "Core Function"}
                            isOpen={isEditProjectDetailModalOpen}
                            onClose={onEditProjectDetailModalClose}
                            icon={
                                baseInformation.kind === "student" ? RiBook3Fill :
                                    baseInformation.kind === "external" ? FaUserFriends :
                                        baseInformation.kind === "science" ? MdScience : GiMaterialsScience
                            }
                            baseInformation={baseInformation}
                            details={details}

                        />

                        {/* <ProjectDetailEditModal
                            onClose={onEditProjectDetailModalClose}
                            isOpen={isEditProjectDetailModalOpen}
                        /> */}
                        {/* <Button
                            bg={
                                colorMode === "light" ? "green.500" : "green.600"
                            }
                            color={"white"}
                            _hover={

                                {
                                    bg: colorMode === "light" ? "green.400" : "green.500"
                                }
                            }
                            leftIcon={<AiFillEdit />}
                            onClick={onEditProjectDetailModalOpen}>
                            Edit Project Details
                        </Button> */}
                    </Flex>
                </Box>

            </Box>
        </>
    );
};