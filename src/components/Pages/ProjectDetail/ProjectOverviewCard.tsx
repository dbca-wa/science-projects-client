// Displayed when looking at the Project Details by selecting it on the projects page. Displays more data about the project and allows editing.

import { Box, Button, Flex, Grid, Image, Tag, Text, useColorMode, useDisclosure } from "@chakra-ui/react"
import { AiFillCalendar, AiFillEdit, AiFillTag } from "react-icons/ai"
import { Link } from "react-router-dom";
import { HiOutlineExternalLink } from 'react-icons/hi'
import { ProjectDetailEditModal } from "../../Modals/ProjectDetailEditModal";
import { IFullProjectDetails, IProjectData, IProjectMember } from "../../../types";

interface IProjectOverviewCardProps {
    baseInformation: IProjectData;
    details: IFullProjectDetails | null | undefined;
    members: IProjectMember[];
}


export const ProjectOverviewCard = (
    { baseInformation, details, members }: IProjectOverviewCardProps
) => {

    const { isOpen: isEditProjectDetailModalOpen, onOpen: onEditProjectDetailModalOpen, onClose: onEditProjectDetailModalClose } = useDisclosure()
    const { colorMode } = useColorMode();

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
        const label = ""
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


    return (
        <>
            <Box
                minH={"100px"}
                bg={colorMode === "light" ? "gray.50" : "gray.700"}
                color={colorMode === "light" ? "black" : "whiteAlpha.900"}
                rounded={"lg"}
                overflow={"hidden"}
            >
                <Grid
                    p={4}
                    templateColumns={{
                        base: "1fr", // Single column layout for small screens (mobile)
                        lg: "minmax(200px, 4fr) 5fr", // Left column takes minimum 200px and can grow up to 4fr, right column takes 5fr
                    }}
                    gap={3}
                >
                    <Image
                        src={
                            baseInformation?.image?.file
                                ? baseInformation?.image?.file
                                : baseInformation?.image?.old_file ?
                                    baseInformation?.image?.old_file :
                                    "/sad-face.png"
                        }
                        objectFit={"cover"}
                        rounded={"lg"}
                        w={"100%"}
                    />

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
                                <Link to={`/projects/${baseInformation.pk}`}>
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



                        {/* Rest of the project details */}

                        <Box
                            // pb={4}
                            display="inline-flex"
                            alignItems="center"
                        >
                            <AiFillTag size={"16px"} />
                            <Grid
                                ml={3}
                                templateColumns={{
                                    base: "repeat(1, 1fr)",
                                    sm: "repeat(2, 1fr)",
                                    md: "repeat(3, 1fr)",
                                    lg: "repeat(4, 1fr)",
                                    xl: "repeat(6, 1fr)",
                                }}
                                gridTemplateRows={"28px"}
                                gap={4}
                            >
                                {keywords?.map((tag, index) => {
                                    return (
                                        <Tag
                                            size={"sm"}
                                            key={index}
                                            textAlign={"center"}
                                            justifyContent={"center"}
                                            p={"10px"}
                                            bgColor={colorMode === "light" ? "gray.300" : "gray.800"}
                                            color={colorMode === "light" ? "black" : "white"}
                                        >
                                            {tag}
                                        </Tag>
                                    );
                                })}
                            </Grid>
                        </Box>

                        <Box
                            pt={5}
                            display="inline-flex"
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
                                    size={"md"}
                                    textAlign={"center"}
                                    justifyContent={"center"}
                                    p={"10px"}
                                    bgColor={colorMode === "light" ? "gray.300" : "gray.800"}
                                    color={colorMode === "light" ? "black" : "white"}
                                >
                                    {projectYears}
                                </Tag>

                            </Grid>
                        </Box>

                        <Box py={4} pb={0}>
                            <Button variant={"link"} colorScheme="blue" leftIcon={<HiOutlineExternalLink />}>
                                Review Datasets tagged with {projectLabel}
                            </Button>
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
                    <Box>
                        {baseInformation?.description
                            ? <Text><b>Description:</b> {baseInformation.description}</Text>
                            : <Text><b>Description:</b> This project has no description</Text>}
                    </Box>

                    <Flex pt={6} justifyContent={"right"}>
                        <ProjectDetailEditModal
                            onClose={onEditProjectDetailModalClose}
                            isOpen={isEditProjectDetailModalOpen}
                        />
                        <Button leftIcon={<AiFillEdit />} onClick={onEditProjectDetailModalOpen}>
                            Edit Project Details
                        </Button>
                    </Flex>
                </Box>

            </Box>
        </>
    );
};