import { Head } from "@/components/Base/Head";
import HomeConfetti from "@/components/Fun/HomeConfetti";
import theme from "@/theme";
import { IUserMe } from "@/types";
import {
  Box,
  Button,
  Heading,
  Link,
  Text,
  useColorMode,
} from "@chakra-ui/react";
import { useCallback, useEffect, useState } from "react";
import PatchNotes from "./PatchNotes";

interface IUserInterface {
  userData: IUserMe;
  showNotes: boolean;
}

export const WelcomeBox = ({ userData, showNotes }: IUserInterface) => {
  const VITE_PRODUCTION_BASE_URL = import.meta.env.VITE_PRODUCTION_BASE_URL;
  const VERSION = import.meta.env.VITE_SPMS_VERSION || "Development v3";

  const [welcomeUser, setWelcomeUser] = useState("");
  const [spmsText, setSpmsText] = useState("Science Project Management System");
  const [shouldConcat, setShouldConcat] = useState(false);
  const { colorMode } = useColorMode();

  const handleResize = useCallback(() => {
    if (window.innerWidth < 1150) {
      setShouldConcat(true);
      setSpmsText(
        `SPMS ${VITE_PRODUCTION_BASE_URL?.includes("-test") ? "(TEST)" : ""}`,
      );
      // setAnnualReportText("Report");
    } else {
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

  useEffect(() => {
    setWelcomeUser(
      `Hello ${userData?.display_first_name ?? userData?.first_name} ${userData?.display_last_name ?? userData?.last_name}! Welcome to SPMS, DBCA's portal for science project planning, approval and reporting.`,
    );
  }, []);

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
        {/* {!shouldConcat && ( */}
        <Text pt={4} fontSize={"19px"} fontWeight={"normal"}>
          {welcomeUser}
        </Text>

        {/* Patch Notes */}
        {showNotes ? <PatchNotes /> : null}

        {/* Feedback */}
        <div className="mt-4">
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
          </span>
          <Text as={"span"} fontSize={"16px"} fontWeight={"normal"}>
            {" "}
            Don't be shy, we can only make things better with your help!
          </Text>

          <div className="mt-6 flex items-center justify-between">
            <p className="text-blue-500">Version {VERSION}</p>
            <Button
              variant={"solid"}
              color={"white"}
              bg={"blue.500"}
              _hover={{ bg: "blue.400" }}
              as={Link}
              href={`mailto:ecoinformatics.admin@dbca.wa.gov.au?subject=SPMS Feedback`}
            >
              Submit Feedback
            </Button>
          </div>
        </div>
      </Box>
    </>
  );
};
