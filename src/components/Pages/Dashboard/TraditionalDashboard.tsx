// The traditional version of the dashboard

import {
  Box,
  Button,
  Center,
  Flex,
  Grid,
  Heading,
  ListItem,
  Text,
  UnorderedList,
  useColorMode,
  useDisclosure,
} from "@chakra-ui/react";
import { useCallback, useEffect, useState } from "react";
import { useUser } from "../../../lib/hooks/tanstack/useUser";
import theme from "../../../theme";
import { Head } from "../../Base/Head";
import { TraditionalTasksAndProjects } from "./TraditionalTasksAndProjects";
// import { IDashProps } from "../../../types";
import { UserFeedbackModal } from "@/components/Modals/UserFeedbackModal";
import { FaDatabase } from "react-icons/fa";
import { FaCirclePlus } from "react-icons/fa6";
import { TbWorldWww } from "react-icons/tb";
import { AddPersonalTaskModal } from "../../Modals/AddPersonalTaskModal";

export const TraditionalDashboard = () => {
  const user = useUser();

  const { colorMode } = useColorMode();
  const [welcomeUser, setWelcomeUser] = useState("");
  const [spmsText, setSpmsText] = useState("Science Project Management System");
  // const [annualReportText, setAnnualReportText] = useState("Annual Report");
  const [shouldConcat, setShouldConcat] = useState(false);
  // const [startDate, setStartDate] = useState<string>();

  const handleAddTaskClick = () => {
    // console.log("Clicked add button");
    onAddTaskOpen();
  };

  const handleResize = useCallback(() => {
    // 1150 = the breakpoint at which issues occur with text overlaying
    if (window.innerWidth < 1150) {
      setWelcomeUser("");
      setShouldConcat(true);
      setSpmsText("SPMS");
      // setAnnualReportText("Report");
    } else {
      setWelcomeUser(
        `Hello, ${user?.userData?.first_name}! Welcome to SPMS, DBCA's portal for science project documentation, approval and reporting.`
      );
      setShouldConcat(false);
      // setAnnualReportText("Annual Report");
      if (window.innerWidth < 1350) {
        setSpmsText("Science Project <br/> Management System (TEST)");
      } else {
        setSpmsText("Science Project Management System (TEST)");
      }
    }
  }, [theme.breakpoints.lg, user?.userData?.first_name]);

  useEffect(() => {
    handleResize(); // call the handleResize function once after mounting
    window.addEventListener("resize", handleResize); // add event listener to window object
    return () => window.removeEventListener("resize", handleResize); // remove event listener when unmounting
  }, [handleResize]);

  const {
    isOpen: isAddTaskOpen,
    onOpen: onAddTaskOpen,
    onClose: onAddTaskClose,
  } = useDisclosure();
  const {
    isOpen: isFeedbackModalOpen,
    onOpen: onOpenFeedbackModal,
    onClose: onCloseFeedbackModal,
  } = useDisclosure();

  return (
    <>
      <AddPersonalTaskModal
        user={user}
        isAddTaskOpen={isAddTaskOpen}
        onAddTaskClose={onAddTaskClose}
      />
      <UserFeedbackModal
        user={user}
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
          <Text mt={5} fontSize={"16px"} fontWeight={"normal"}>
            Currently under development, this version serves to identify and
            address bugs and areas for improvement. Please feel free to explore
            and test the site.
          </Text>
          <Text fontSize={"16px"} fontWeight={"normal"}>
            Rest assured, all data will be restored to a database snapshot when
            the site is production-ready.
          </Text>
          <Flex mt={4} flexDir={"column"}>
            <Box mt={2}>
              <Text as={"span"} fontWeight={"bold"}>
                Note:
              </Text>
              <Text
                ml={1}
                as={"span"}
                // fontWeight={'semibold'}
              >
                Lists and nested lists are now supported when copy-pasting from
                MS Word on Desktop. If you are using MS Word online, you must
                download the file and copy content from there.
              </Text>
            </Box>

            <Text mt={4}>
              Further note that the following is not yet implemented, and will
              be integrated on production release:
            </Text>
            <UnorderedList pl={8} pt={4}>
              <ListItem>'latest report' page</ListItem>
              <ListItem>PDF generation</ListItem>
              <ListItem>SPMS emails</ListItem>
            </UnorderedList>
          </Flex>
          <Flex mt={4}>
            <Text as={"span"} fontSize={"16px"} fontWeight={"normal"}>
              For feedback or feature requests, kindly submit them here:
            </Text>

            <Button
              ml={2}
              variant={"link"}
              color={"red.500"}
              onClick={onOpenFeedbackModal}
            >
              Submit Feedback
            </Button>
          </Flex>
          <Text>
            Don't be shy, we can only make things better with your help!
          </Text>
        </Flex>
      </Box>
      <Grid
        my={5}
        templateColumns={{
          base: "repeat(1, 1fr)",
          md: "repeat(3, 1fr)",
          lg: "repeat(3, 1fr)",
          // xl: "repeat(3, 1fr)",
        }}
        gap={10}
      >
        <Button
          leftIcon={<FaDatabase />}
          bgColor={colorMode === "light" ? `blue.500` : `blue.600`}
          color={colorMode === "light" ? `white` : `whiteAlpha.900`}
          _hover={{
            bg: colorMode === "light" ? `blue.600` : `blue.400`,
            color: colorMode === "light" ? `white` : `white`,
          }}
          as="a"
          href="https://data.dbca.wa.gov.au/"
        >
          {shouldConcat ? "Data" : "Data Catalogue"}
        </Button>
        <Button
          leftIcon={<TbWorldWww />}
          bgColor={colorMode === "light" ? `blue.500` : `blue.600`}
          color={colorMode === "light" ? `white` : `whiteAlpha.900`}
          _hover={{
            bg: colorMode === "light" ? `blue.600` : `blue.400`,
            color: colorMode === "light" ? `white` : `white`,
          }}
          as={"a"}
          href="https://scientificsites.dpaw.wa.gov.au/"
        >
          {shouldConcat ? "Scientific Sites" : "Scientific Site Register"}
        </Button>
        <Button
          leftIcon={<FaCirclePlus />}
          bgColor={colorMode === "light" ? `green.500` : `green.600`}
          color={colorMode === "light" ? `white` : `whiteAlpha.900`}
          _hover={{
            bg: colorMode === "light" ? `green.600` : `green.400`,
            color: colorMode === "light" ? `white` : `white`,
          }}
          onClick={handleAddTaskClick}
        >
          Add Quick Task
        </Button>
      </Grid>
      <TraditionalTasksAndProjects
      // onAddTaskOpen={onAddTaskOpen}
      />

      <Center mt={6}></Center>
    </>
  );
};
