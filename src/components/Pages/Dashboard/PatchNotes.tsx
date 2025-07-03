import { Head } from "@/components/Base/Head";
import HomeConfetti from "@/components/Fun/HomeConfetti";
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
  kind: "feature" | "update" | "fix";
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

  const VERSION = import.meta.env.VITE_SPMS_VERSION || "Development v3";

  const [welcomeUser, setWelcomeUser] = useState("");
  const [spmsText, setSpmsText] = useState("Science Project Management System");
  const [shouldConcat, setShouldConcat] = useState(false);
  const { colorMode } = useColorMode();

  const handleResize = useCallback(() => {
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
      <Box
        mt={5}
        bgColor={colorMode === "dark" ? "gray.700" : "gray.200"}
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
            &#127881; SPMS {VERSION} Patch Notes &#127881;
          </Text>
          <List spacing={1} ml={2} userSelect={"none"}>
            <PatchNoteEntry
              title={"Admin | View All Unapproved Docs"}
              kind="feature"
              description={
                "Added functionality to view all unapproved documents for admins in a given FY and send bump emails"
              }
            />
            <PatchNoteEntry
              title={
                "Admin | Show all projects with a closure that are not closed"
              }
              kind="feature"
              description={
                "Added functionality to view all projects with a project closure that are not in a closed state (for handling projects that were previously closed as suspended)"
              }
            />
            {/* <PatchNoteEntry
              title={"Admin | Set Maintainer"}
              kind="feature"
              description={
                "Added functionality to set the maintainer of SPMS going forward"
              }
            /> */}
            {/* <PatchNoteEntry
              title={"Fixed map toggle states"}
              kind="fix"
              description={
                "Fixed a bug causing map toggling to work incorrectly - labels and colours now adhere to state set by user correctly"
              }
            /> */}
            {/* <PatchNoteEntry
              title={"Annual Report banner"}
              kind="fix"
              description={
                "Adjusted the display of annual report banner image to remedy issues in production (caused by OIM rules/changes)"
              }
            /> */}
            <PatchNoteEntry
              title={"Mentions"}
              kind="update"
              description={
                "Users can now mention users in the project team and business area on project documents. By default, a comment with no mention will not email anyone"
              }
            />
            <PatchNoteEntry
              title={"Allow Same Name"}
              kind="update"
              description={
                "Allow adding users with same name if email is not the same"
              }
            />
            <PatchNoteEntry
              title={"Vite and Tailwind Updates"}
              kind="update"
              description={
                "Updated core dependencies for frontend to new major versions for improved performance"
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
              href={`mailto:ecoinformatics.admin@dbca.wa.gov.au?subject=SPMS Feedback`}
              color={colorMode === "light" ? "blue.400" : "blue.300"}
            >
              ecoinformatics.admin@dbca.wa.gov.au
            </Link>
            .
            {/* <Text as={"span"} fontSize={"16px"} fontWeight={"normal"}>
              {" "}
              or{" "}
            </Text>
            <Link
              onClick={handleTeamsClick}
              // href={teamsChatUrl}
              color={colorMode === "light" ? "blue.400" : "blue.300"}
            >
              message on Teams.
            </Link> */}
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
            mt={4}
            as={Link}
            href={`mailto:ecoinformatics.admin@dbca.wa.gov.au?subject=SPMS Feedback`}
          >
            Submit Feedback
          </Button>
        </Flex>
      </Box>
    </>
  );
};
