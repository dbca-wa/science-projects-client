import { ScienceContentRender } from "@/components/Science/ScienceContentRender";
import { ScienceFooter } from "@/components/Science/ScienceFooter";
// import { ScienceHeader } from "@/components/Science/ScienceHeader";
import { Box } from "@chakra-ui/react";
export const Science = () => {
  return (
    <Box pos={"relative"} h={"100vh"} w={"100%"}>
      {/* <ScienceHeader /> */}
      <ScienceContentRender />
      <ScienceFooter />
    </Box>
  );
};
