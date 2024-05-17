// The traditional version of the dashboard

import {
  Box,
  Button,
  Center,
  Flex,
  Grid,
  Heading,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
  Text,
  useColorMode,
  useDisclosure
} from "@chakra-ui/react";
import { useCallback, useEffect, useState } from "react";
import { useUser } from "../../../lib/hooks/tanstack/useUser";
import theme from "../../../theme";
import { Head } from "../../Base/Head";
import { TraditionalTasksAndProjects } from "./TraditionalTasksAndProjects";
// import { IDashProps } from "../../../types";
import ConfettiComponent from "@/components/Fun/HomeConfetti";
import { UserFeedbackModal } from "@/components/Modals/UserFeedbackModal";
import { FaDatabase } from "react-icons/fa";
import { FaCirclePlus } from "react-icons/fa6";
import { TbWorldWww } from "react-icons/tb";
import { AddPersonalTaskModal } from "../../Modals/AddPersonalTaskModal";

export const TraditionalDashboard = () => {
  const VITE_PRODUCTION_BACKEND_BASE_URL = import.meta.env
    .VITE_PRODUCTION_BACKEND_BASE_URL;

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
      setSpmsText(`SPMS ${VITE_PRODUCTION_BACKEND_BASE_URL?.includes("-test") ? "(TEST)" : ""
        }`);
      // setAnnualReportText("Report");
    } else {
      setWelcomeUser(
        `Hello, ${user?.userData?.first_name}! Welcome to SPMS, DBCA's portal for science project documentation, approval and reporting.`
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

  const [dataCatalogueDisabled, setDataCatalogueDisabled] = useState(true);

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
      <ConfettiComponent />
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
          <Text mt={5} fontSize={"16px"} fontWeight={"semibold"}
            onClick={() => localStorage.removeItem("confettiCount")}
          >
            &#127881; We have successfully migrated to SPMS 3.0! &#127881;
          </Text>
          <Text>
            This new version features speed and security upgrades, dark mode, a
            new layout, copy-pasting from word, improved email and more!
          </Text>
          <span style={{ marginTop: 20 }}>
            <Text as={"span"} fontSize={"16px"} fontWeight={"normal"}>
              We are always looking for ways to improve, and value your
              feedback! If you notice something off (even minor issues), or would like to request a
              change, please submit feedback here, send an email to jarid.prince@dbca.wa.gov.au, or send a message on Teams. Don't be shy, we can only
              make things better with your help!
            </Text>

            <Button
              ml={2}
              variant={"link"}
              color={"red.500"}
              onClick={onOpenFeedbackModal}
            >
              Submit Feedback
            </Button>
          </span>
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

        <Popover trigger="hover">
          <PopoverTrigger>
            <Button
              leftIcon={<FaDatabase />}
              bgColor={colorMode === "light" ? `blue.500` : `blue.600`}
              color={colorMode === "light" ? `white` : `whiteAlpha.900`}
              _hover={{
                bg: colorMode === "light" ? `blue.600` : `blue.400`,
                color: colorMode === "light" ? `white` : `white`,
              }}
              // as="a"
              onClick={() => {
                if (!dataCatalogueDisabled) {
                  window.open("https://data.dbca.wa.gov.au/", "_blank")
                }
              }}
            // isDisabled={dataCatalogueDisabled}
            >
              {shouldConcat ? "Data" : "Data Catalogue"}
            </Button>
          </PopoverTrigger>
          <PopoverContent>
            <PopoverArrow />
            {/* <PopoverCloseButton /> */}
            {/* <PopoverHeader>Confirmation!</PopoverHeader> */}
            <PopoverBody
              justifyContent={"center"}
              display={"flex"}
            >
              Coming Soon
            </PopoverBody>
          </PopoverContent>
        </Popover>

        <Button
          leftIcon={<TbWorldWww />}
          bgColor={colorMode === "light" ? `blue.500` : `blue.600`}
          color={colorMode === "light" ? `white` : `whiteAlpha.900`}
          _hover={{
            bg: colorMode === "light" ? `blue.600` : `blue.400`,
            color: colorMode === "light" ? `white` : `white`,
          }}
          // as={"a"}
          // href="https://scientificsites.dpaw.wa.gov.au/"
          onClick={() => window.open("https://scientificsites.dpaw.wa.gov.au/", "_blank")}
        >
          {shouldConcat ? "Scientific Sites" : "Scientific Sites Register"}
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
