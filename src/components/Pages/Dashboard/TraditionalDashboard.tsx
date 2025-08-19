// The traditional version of the dashboard

import {
  Button,
  Center,
  Grid,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
  useColorMode,
  useDisclosure,
} from "@chakra-ui/react";
import { useCallback, useEffect, useState } from "react";
import { useUser } from "../../../lib/hooks/tanstack/useUser";
import { TraditionalTasksAndProjects } from "./TraditionalTasksAndProjects";
// import { IDashProps } from "../../../types";
import theme from "@/theme";
import { FaDatabase } from "react-icons/fa";
import { FaCirclePlus } from "react-icons/fa6";
import { TbWorldWww } from "react-icons/tb";
import { CreateProjectPageModal } from "@/components/Modals/CreateProjectPageModal";

export const TraditionalDashboard = () => {
  const { isOpen, onClose, onOpen } = useDisclosure();
  const [shouldConcat, setShouldConcat] = useState(false);

  const { userData } = useUser();
  const { colorMode } = useColorMode();

  const handleResize = useCallback(() => {
    // 1150 = the breakpoint at which issues occur with text overlaying
    if (window.innerWidth < 1150) {
      setShouldConcat(true);
    } else {
      setShouldConcat(false);
    }
  }, [theme.breakpoints.lg, userData?.first_name]);

  useEffect(() => {
    handleResize(); // call the handleResize function once after mounting
    window.addEventListener("resize", handleResize); // add event listener to window object
    return () => window.removeEventListener("resize", handleResize); // remove event listener when unmounting
  }, [handleResize]);
  return (
    <>
      <CreateProjectPageModal isOpen={isOpen} onClose={onClose} />
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
          onClick={() => {
            window.open("https://data.bio.wa.gov.au/", "_blank");
          }}
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
          // as={"a"}
          // href="https://scientificsites.dpaw.wa.gov.au/"
          onClick={() =>
            window.open("https://scientificsites.dpaw.wa.gov.au/", "_blank")
          }
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
          onClick={onOpen}
        >
          Create Project
        </Button>
      </Grid>
      <TraditionalTasksAndProjects
      // onAddTaskOpen={onAddTaskOpen}
      />

      <Center mt={6}></Center>
    </>
  );
};
