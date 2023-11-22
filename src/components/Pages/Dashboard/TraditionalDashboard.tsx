// The traditional version of the dashboard

import { Box, Button, Center, Grid, Heading, Text, useColorMode, useDisclosure } from "@chakra-ui/react"
import { TraditionalTasksAndProjects } from "./TraditionalTasksAndProjects"
import { Head } from "../../Base/Head"
import { useCallback, useEffect, useState } from "react";
import theme from "../../../theme";
import { useUser } from "../../../lib/hooks/useUser";
import { IDashProps } from "../../../types";
import { AddIcon } from "@chakra-ui/icons";
import { AddPersonalTaskModal } from "../../Modals/AddPersonalTaskModal";


export const TraditionalDashboard = ({ activeTab }: IDashProps) => {
    const user = useUser();

    const { colorMode } = useColorMode();
    const [welcomeUser, setWelcomeUser] = useState("");
    const [spmsText, setSpmsText] = useState("Science Project Management System");
    const [annualReportText, setAnnualReportText] = useState("Annual Report");
    const [shouldConcat, setShouldConcat] = useState(false);

    const handleResize = useCallback(() => {
        // 1150 = the breakpoint at which issues occur with text overlaying
        if (window.innerWidth < 1150) {
            setWelcomeUser("");
            setShouldConcat(true);
            setSpmsText("SPMS");
            setAnnualReportText("Report");
        } else {
            setWelcomeUser(
                `Hello, ${user?.userData?.first_name}! Welcome to SPMS, DBCA's portal for science project documentation, approval and reporting.`
            );
            setShouldConcat(false);
            setAnnualReportText("Annual Report");
            if (window.innerWidth < 1350) {
                setSpmsText("Science Project <br/> Management System");
            }
            else {
                setSpmsText("Science Project Management System");
            }
        }
    }, [theme.breakpoints.lg, user?.userData?.first_name]);

    useEffect(() => {
        handleResize(); // call the handleResize function once after mounting
        window.addEventListener("resize", handleResize); // add event listener to window object
        return () => window.removeEventListener("resize", handleResize); // remove event listener when unmounting
    }, [handleResize]);

    const { isOpen: isAddTaskOpen, onOpen: onAddTaskOpen, onClose: onAddTaskClose } = useDisclosure();


    return (
        (
            <>
                <AddPersonalTaskModal
                    user={user}
                    isAddTaskOpen={isAddTaskOpen}
                    onAddTaskClose={onAddTaskClose}
                />

                <Box
                    mt={5}
                    bgColor={
                        colorMode === "dark" ? "gray.700" :
                            "gray.100"
                    }
                    color={
                        colorMode === "dark" ? "white" : "black"
                    }
                    rounded={6}
                    flexDir={"column"}
                    p={10}
                    pos={"relative"}
                    userSelect={"none"}
                >
                    <Head title="Home" />

                    <Heading
                        mb={0}
                        pb={shouldConcat ? 4 : 0}
                    >
                        <div dangerouslySetInnerHTML={{ __html: spmsText }} />
                    </Heading>
                    {/* <br /> */}
                    {!shouldConcat && (
                        <Text
                            py={4}
                            fontSize={"19px"}
                            fontWeight={"normal"}
                        >
                            {
                                welcomeUser
                            }
                        </Text>

                    )}
                    {/* <br /> */}
                    <Text
                        fontWeight={"thin"}

                    >
                        Please note that this web application is under reconstruction and not all features may work. Please update and submit (when ready) all documents awaiting your attention in the "My Tasks" section below. From the same section, you may manually add a simple todo to ensure you are on top of things. You can view and update project details of projects you belong to in the "My Projects" section below.
                    </Text>
                </Box>
                <Grid
                    my={5}
                    templateColumns={{
                        base: "repeat(1, 1fr)",
                        md: "repeat(2, 1fr)",
                        lg: "repeat(2, 1fr)",
                        // xl: "repeat(3, 1fr)",
                    }}
                    gap={10}
                >
                    <Button
                        bgColor={
                            colorMode === "light" ? `blue.500` : `blue.600`
                        }
                        color={
                            colorMode === "light" ? `white` : `whiteAlpha.900`
                        }
                        _hover={
                            {
                                bg: colorMode === "light" ? `blue.600` : `blue.400`,
                                color: colorMode === "light" ? `white` : `white`
                            }
                        }
                        as="a" href="https://data.dbca.wa.gov.au/"
                    >
                        {
                            shouldConcat ?
                                "Data" :
                                "Data Catalogue"
                        }
                    </Button>
                    <Button
                        bgColor={
                            colorMode === "light" ? `green.500` : `green.600`
                        }
                        color={
                            colorMode === "light" ? `white` : `whiteAlpha.900`
                        }
                        _hover={
                            {
                                bg: colorMode === "light" ? `green.600` : `green.400`,
                                color: colorMode === "light" ? `white` : `white`
                            }
                        }
                        as={"a"} href="https://scientificsites.dpaw.wa.gov.au/"
                    >
                        {
                            shouldConcat ?
                                "Scientific Sites" :
                                "Scientific Site Register"
                        }
                    </Button>
                    {/* <Button
                        bgColor={
                            colorMode === "light" ? `red.500` : `red.600 `
                        }
                        color={
                            colorMode === "light" ? `white` : `whiteAlpha.900`
                        }
                        _hover={
                            {
                                bg: colorMode === "light" ? `red.600` : `red.400`,
                                color: colorMode === "light" ? `white` : `white`
                            }
                        }
                        // colorScheme="red"
                        as={"a"} href="https://scienceprojects.dbca.wa.gov.au/arar_dashboard"
                        gridColumn={{ base: "1 / -1", xl: "auto" }}

                    >
                        {
                            shouldConcat ?
                                "Projects Pending" :
                                "Projects Pending Approval"
                        }

                    </Button> */}

                </Grid>
                <TraditionalTasksAndProjects onAddTaskOpen={onAddTaskOpen} />



                <Center mt={6}>
                </Center>
            </>
        )

    )
}
