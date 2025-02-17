import { Head } from "@/components/Base/Head";
import HomeConfetti from "@/components/Fun/HomeConfetti";
import { UserFeedbackModal } from "@/components/Modals/UserFeedbackModal";
import theme from "@/theme";
import { IUserMe } from "@/types";
import {
  Box,
  Text,
  Button,
  Flex,
  Heading,
  Link,
  List,
  ListIcon,
  ListItem,
  useDisclosure,
  useColorMode,
} from "@chakra-ui/react";
import { title } from "process";
import { useCallback, useEffect, useState } from "react";
import { MdCheckCircle } from "react-icons/md";

interface IUserInterface {
  userData: IUserMe;
}

const PatchNoteEntry = ({
  title,
  kind,
  description,
}: {
  title: string;
  kind: "feature" | "update";
  description: string;
}) => {
  return (
    <ListItem fontSize={"small"} textIndent={"-21px"} marginLeft={"21px"}>
      <ListIcon as={MdCheckCircle} color="green.500" />
      <Text as="span" fontWeight="semibold">
        {`${kind[0].toUpperCase()}${kind.slice(1)}: ${title}`}
      </Text>
      <Text
        display="block"
        mt={0}
        ml="21px"
        sx={{
          textIndent: "0",
          marginLeft: "0",
        }}
      >
        {description}
      </Text>
    </ListItem>
  );
};

export const PatchNotes = ({ userData }: IUserInterface) => {
  const VITE_PRODUCTION_BASE_URL = import.meta.env.VITE_PRODUCTION_BASE_URL;

  const VERSION = import.meta.env.VITE_SPMS_VERSION || "3.1.5";

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
        `SPMS ${VITE_PRODUCTION_BASE_URL?.includes("-test") ? "(TEST)" : ""}`,
      );
      // setAnnualReportText("Report");
    } else {
      setWelcomeUser(
        `Hello, ${userData?.display_first_name ?? userData?.first_name} ${userData?.display_last_name ?? userData?.last_name}! Welcome to SPMS, DBCA's portal for science project documentation, approval and reporting.`,
      );
      setShouldConcat(false);
      // setAnnualReportText("Annual Report");
      if (window.innerWidth < 1350) {
        setSpmsText(
          `Science Project <br/> Management System ${
            VITE_PRODUCTION_BASE_URL?.includes("-test") ? "(TEST)" : ""
          }`,
        );
      } else {
        setSpmsText(
          `Science Project Management System ${
            VITE_PRODUCTION_BASE_URL?.includes("-test") ? "(TEST)" : ""
          }`,
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
          <List spacing={1} ml={2}>
            <PatchNoteEntry
              title={"Caretaker mode"}
              kind="feature"
              description={
                "Users can now request and assign a caretaker to manage their workload while away from work. Projects shown on your public profile are those that you are directly involved with. If there are any projects which you are already unofficially managing in a caretaker capacity, request to become that user's caretaker, then assign those projects to that user."
              }
            />
            <PatchNoteEntry
              title={"Hide From Public profile"}
              kind="feature"
              description={
                "In addition to caretaker mode, you can directly hide any project you are a member of from your public profile. You can do this by visiting the project's overview tab and clicking the orange 'Hide From Staff Profile' button. This will not impact the project's visibility to other users."
              }
            />

            <PatchNoteEntry
              title={"Staff Profile Publications"}
              kind="feature"
              description={
                "Publications belonging to staff are now fetched from the library and displayed on their public profile. Users may also add additional publications."
              }
            />

            <PatchNoteEntry
              title={"Dependencies"}
              kind="update"
              description={"Servers and dependencies updated."}
            />
          </List>

          <span style={{ marginTop: 20 }}>
            <Text as={"span"} fontSize={"16px"} fontWeight={"normal"}>
              We are always looking for ways to improve, and value your
              feedback! If you notice something off, or would like to request a
              change, please send an email to{" "}
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
          </span>
          <Text as={"span"} fontSize={"16px"} fontWeight={"normal"}>
            {" "}
            Don't be shy, we can only make things better with your help!
          </Text>
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
  );
};
