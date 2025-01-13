import { useMediaQuery } from "@/lib/utils/useMediaQuery";
import { Box, Flex } from "@chakra-ui/react";
import { ReactNode } from "react";
import "@/main.css";
import "@/components/StaffProfiles/science_staff.css";
import ScienceHeader from "./Header/ScienceHeader";
import ScienceFooter from "./Footer/ScienceFooter";

export const ScienceStaffLayout = ({ children }: { children: ReactNode }) => {
  const isDesktop = useMediaQuery("(min-width: 768px)");

  return (
    <Box
      h={"100vh"}
      w={"100vw"}
      overscrollBehaviorY={"none"}
      // overflowY={"scroll"}
      minW={"720px"}
      display="flex"
      flexDirection="column"
      pos={"fixed"}
      // bg={"red.300"}
    >
      <Box
        minH={"full"}
        // bg={"blue.300"}
        top={0}
        left={0}
        right={0}
        bottom={0}
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
        <ScienceHeader isDesktop={isDesktop} />
        <Box
          as="main"
          className="text-slate-900"
          flex="1"
          display="flex"
          flexDirection="column"
          overscrollBehaviorY={"none"}
          minH={"full"}
          pos={"relative"}
        >
          {children}
        </Box>
        <Box pos={"relative"} w={"full"} bottom={0}>
          <ScienceFooter />
        </Box>
      </Box>
    </Box>
  );
};
