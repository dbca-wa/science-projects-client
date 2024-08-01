import ScienceFooter from "@/components/Science/Footer/ScienceFooter";
import ScienceHeader from "@/components/Science/Header/ScienceHeader";
import { useMediaQuery } from "@/lib/utils/useMediaQuery";
import { Box, Flex } from "@chakra-ui/react";
import { ReactNode } from "react";
import "@/main.css";

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
