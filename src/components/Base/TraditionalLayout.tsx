// A component for handlign the traditional layout

import { Box, Image, Spinner, useColorMode } from "@chakra-ui/react";
import { Outlet } from "@tanstack/react-router";
import { TraditionalPageWrapper } from "../Wrappers/TraditionalPageWrapper";
import { Footer } from "./Footer";
import dayImage from "../../assets/80mile.jpg";
import nightImage from "../../assets/night.webp";
import { useLayoutSwitcher } from "../../lib/hooks/helper/LayoutSwitcherContext";
import OldHeader from "../Navigation/OldHeader";

export const TraditionalLayout = () => {
  const { colorMode } = useColorMode();
  const { loading } = useLayoutSwitcher();

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100vh"
      >
        <Spinner size="xl" />
      </Box>
    );
  }
  return (
    <Box minH={"100vh"} minW={"720px"}>
      <TraditionalPageWrapper>
        <OldHeader />
        <Box
          mt={6}
          minH={"500px"}
          bgColor={"white"}
          rounded={6}
          py={10}
          bg={colorMode === "light" ? "white" : "blackAlpha.800"}
        >
          <Box mx={10}>
            <Outlet />
          </Box>
        </Box>

        <Image
          src={colorMode === "light" ? dayImage : nightImage}
          width={"100%"}
          height={"100%"}
          objectFit={"cover"}
          position="fixed"
          zIndex={-1}
          top={0}
          left={0}
          userSelect={"none"}
        />
      </TraditionalPageWrapper>
      <Footer />
    </Box>
  );
};
