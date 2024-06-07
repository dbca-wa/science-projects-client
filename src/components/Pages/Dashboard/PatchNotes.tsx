import { Head } from "@/components/Base/Head";
import HomeConfetti from "@/components/Fun/HomeConfetti";
import { UserFeedbackModal } from "@/components/Modals/UserFeedbackModal";
import theme from "@/theme";
import { IUserMe } from "@/types";
import { Box, Text, Button, Flex, Heading, Link, List, ListIcon, ListItem, useDisclosure, useColorMode } from "@chakra-ui/react"
import { useCallback, useEffect, useState } from "react";
import { MdCheckCircle } from "react-icons/md";


interface IUserInterface {
    userData: IUserMe;
    isLoggedIn: boolean;
    userLoading: boolean;
}

export const PatchNotes = ({ userData, isLoggedIn, userLoading }: IUserInterface) => {
    const VITE_PRODUCTION_BACKEND_BASE_URL = import.meta.env
        .VITE_PRODUCTION_BACKEND_BASE_URL;

    const VERSION = import.meta.env.VITE_SPMS_VERSION || "3.1.1";

    const [welcomeUser, setWelcomeUser] = useState("");
    const [spmsText, setSpmsText] = useState("Science Project Management System");
    // const [annualReportText, setAnnualReportText] = useState("Annual Report");
    const [shouldConcat, setShouldConcat] = useState(false);
    // const [startDate, setStartDate] = useState<string>();
    const teamsChatUrl = "msteams:/l/chat/0/0?users=jarid.prince@dbca.wa.gov.au";


    const {
        isOpen: isFeedbackModalOpen,
        onOpen: onOpenFeedbackModal,
        onClose: onCloseFeedbackModal,
    } = useDisclosure();


    // useEffect(() => {
    //   confetti({
    //     particleCount: 100,
    //     spread: 360,
    //     origin: {
    //       x: 0.385,
    //       y: 0.3,
    //     },
    //   });

    //   setTimeout(() => {
    //     confetti.reset();
    //   }, 5000);
    // }, []);


    const { colorMode } = useColorMode();

    const handleResize = useCallback(() => {
        // 1150 = the breakpoint at which issues occur with text overlaying
        if (window.innerWidth < 1150) {
            setWelcomeUser("");
            setShouldConcat(true);
            setSpmsText(
                `SPMS ${VITE_PRODUCTION_BACKEND_BASE_URL?.includes("-test") ? "(TEST)" : ""
                }`
            );
            // setAnnualReportText("Report");
        } else {
            setWelcomeUser(
                `Hello, ${userData?.first_name}! Welcome to SPMS, DBCA's portal for science project documentation, approval and reporting.`
            );
            setShouldConcat(false);
            // setAnnualReportText("Annual Report");
            if (window.innerWidth < 1350) {
                setSpmsText(
                    `Science Project <br/> Management System ${VITE_PRODUCTION_BACKEND_BASE_URL?.includes("-test") ? "(TEST)" : ""
                    }`
                );
            } else {
                setSpmsText(
                    `Science Project Management System ${VITE_PRODUCTION_BACKEND_BASE_URL?.includes("-test") ? "(TEST)" : ""
                    }`
                );
            }
        }
    }, [theme.breakpoints.lg, userData?.first_name]);



    useEffect(() => {
        handleResize(); // call the handleResize function once after mounting
        window.addEventListener("resize", handleResize); // add event listener to window object
        return () => window.removeEventListener("resize", handleResize); // remove event listener when unmounting
    }, [handleResize]);

    return (
        <>
            <HomeConfetti />
            <UserFeedbackModal
                userLoading={userLoading}
                userData={userData}
                isLoggedIn={isLoggedIn}
                isFeedbackModalOpen={isFeedbackModalOpen}
                onCloseFeedbackModal={onCloseFeedbackModal}
            />
            <Box
                mt={5}
                bgColor={colorMode === "dark" ? "gray.700" : "gray.100"}
                color={colorMode === "dark" ? "white" : "black"}
                rounded={6}
                flexDir={"column"}
                p={10}
                pos={"relative"}
                userSelect={"none"}
            >
                <Head title="Home" />

                <Heading mb={0} pb={shouldConcat ? 4 : 0}>
                    <div dangerouslySetInnerHTML={{ __html: spmsText }} />
                </Heading>
                {/* <br /> */}
                {!shouldConcat && (
                    <Text pt={4} fontSize={"19px"} fontWeight={"normal"}>
                        {welcomeUser}
                    </Text>
                )}

                <Flex flexDir={"column"}>
                    <Text
                        my={2}
                        fontSize={"16px"}
                        fontWeight={"semibold"}
                    // onClick={() => localStorage.removeItem("confettiCount")}
                    >
                        {/* &#127881;  &#127881; */}
                        {/* &#9881;&#65039; */}
                        &#127881; SPMS {VERSION} Patch Notes &#127881;
                        {/* &#9881;&#65039; */}
                    </Text>
                    <List spacing={1} ml={2} >
                        <ListItem fontSize={"small"} textIndent={"-21px"} marginLeft={"21px"}>
                            <ListIcon as={MdCheckCircle} color='green.500' />
                            Update: Batch populated Context and Aims sections for latest progress reports belonging to projects with prior reports
                        </ListItem>
                        <ListItem fontSize={"small"} textIndent={"-21px"} marginLeft={"21px"}>
                            <ListIcon as={MdCheckCircle} color='green.500' />
                            Change: Sorted project results - most recent projects first & terminated, closed and suspended projects appear at the end
                        </ListItem>
                        <ListItem fontSize={"small"} textIndent={"-21px"} marginLeft={"21px"}>
                            <ListIcon as={MdCheckCircle} color='green.500' />
                            Change: Tasks for project lead also appear for team to ensure entire team aware of status
                        </ListItem>
                        <ListItem fontSize={"small"} textIndent={"-21px"} marginLeft={"21px"}>
                            <ListIcon as={MdCheckCircle} color='green.500' />
                            Fix: Set status of project closures of non "science" to "approved" when auto closed
                        </ListItem>
                        <ListItem fontSize={"small"} textIndent={"-21px"} marginLeft={"21px"}>
                            <ListIcon as={MdCheckCircle} color='green.500' />
                            Fix: Fixed bug where some users who don't have a business area set could not see their tasks
                        </ListItem>
                        <ListItem fontSize={"small"} textIndent={"-21px"} marginLeft={"21px"}>
                            <ListIcon as={MdCheckCircle} color='green.500' />
                            Fix: Prevented a project plan spawn bug caused by bad data when approving a concept plan that already has a project plan
                        </ListItem>
                        {/* <ListItem fontSize={"small"} textIndent={"-21px"} marginLeft={"21px"}>
                            <ListIcon as={MdCheckCircle} color='green.500' />
                            Added "My Business Area" page for business area leaders to submit changes about their Business Area to directorate for review.
                        </ListItem> */}

                        {/* <ListItem fontSize={"small"} textIndent={"-21px"} marginLeft={"21px"}>
                            <ListIcon as={MdCheckCircle} color='green.500' />
                            Fix: Ensure progress reports of closed projects for a FY appear on that year's report
                        </ListItem> */}

                        <ListItem fontSize={"small"} textIndent={"-21px"} marginLeft={"21px"}>
                            <ListIcon as={MdCheckCircle} color='green.500' />
                            Feature: Added admin ability to batch populate progress reports for pre-existing progress reports (aims and context for latest year only)
                        </ListItem>
                    </List>

                    <span style={{ marginTop: 20 }}>
                        <Text as={"span"} fontSize={"16px"} fontWeight={"normal"}>
                            We are always looking for ways to improve, and value your
                            feedback! If you notice something off, or would like to request a
                            change, please submit feedback here, send an email to{" "}
                        </Text>
                        <Link
                            href={`mailto:jarid.prince@dbca.wa.gov.au&subject=SPMS Feedback`}
                            color={colorMode === "light" ? "blue.400" : "blue.300"}
                        >
                            jarid.prince@dbca.wa.gov.au
                        </Link>
                        <Text as={"span"} fontSize={"16px"} fontWeight={"normal"}>
                            {" "}
                            or{" "}
                        </Text>
                        <Link
                            href={teamsChatUrl}
                            color={colorMode === "light" ? "blue.400" : "blue.300"}
                        >
                            message on Teams.
                        </Link>
                        <Text as={"span"} fontSize={"16px"} fontWeight={"normal"}>
                            {" "}
                            Don't be shy, we can only make things better with your help!
                        </Text>
                    </span>
                </Flex>
                <Flex alignItems={"end"} flexDir={"row"} justifyContent={"right"}>
                    <Button
                        variant={"solid"}
                        color={"white"}
                        bg={"blue.500"}
                        _hover={{ bg: "blue.400" }}
                        onClick={onOpenFeedbackModal}
                        mt={4}
                    >
                        Submit Feedback
                    </Button>
                </Flex>
            </Box>
        </>
    )
}