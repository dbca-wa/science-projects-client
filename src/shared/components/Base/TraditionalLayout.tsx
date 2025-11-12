// A component for handlign the traditional layout

import { Box, Image, Spinner, useColorMode } from "@chakra-ui/react";
import { Outlet } from "react-router-dom";
import dayImage from "@/assets/80mile.jpg";
import nightImage from "@/assets/night.webp";
import { useLayoutSwitcher } from "@/shared/hooks/helper/LayoutSwitcherContext";
import OldHeader from "../Navigation/OldHeader";
import { TraditionalPageWrapper } from "../Wrappers/TraditionalPageWrapper";
import { Footer } from "./Footer";

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
    <Box
      h={"100vh"}
      w={"100vw"}
      top={0}
      left={0}
      overscrollBehaviorY={"none"}
      // overflowY={"scroll"}
      minW={"720px"}
      display="flex"
      flexDirection="column"
      pos={"fixed"}
    >
      <Box
        top={0}
        left={0}
        right={0}
        scrollBehavior={"smooth"}
        overflowY={"scroll"}
        css={{
          msOverflowStyle: "none",
          scrollbarWidth: "none",
          listStyle: "none",
          "::-webkit-scrollbar": {
            display: "none",
          },
        }}
      >
        <OldHeader />

        <TraditionalPageWrapper>
          <Box
            overscrollBehaviorY={"none"}
            my={6}
            minH={"1000px"}
            bgColor={"white"}
            rounded={6}
            py={4}
            bg={colorMode === "light" ? "white" : "blackAlpha.800"}
          >
            <Box mx={10} h={"100%"} minH={"100vh"}>
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
    </Box>
  );
};
