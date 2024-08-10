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
    <Flex direction="column" minH="100vh" className="bg-slate-100">
      <ScienceHeader isDesktop={isDesktop} />
      <Box as="main" flex={1} className="text-slate-900">
        {children}
      </Box>
      <ScienceFooter />
    </Flex>
  );
};
