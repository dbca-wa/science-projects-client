import { Box, Flex, Input, Image } from "@chakra-ui/react";
import dbcaLogo from "@/assets/logo-dbca-bcs-white.svg";

export const ScienceHeader = () => {
  const navBarColor = "#477FC8";

  return (
    <Box
      w={"100%"}
      bg={navBarColor}
      color={"white"}
      display={"flex"}
      py={4}
      pos={"absolute"}
      top={0}
    >
      <Box w={"100%"}>
        <Image src={dbcaLogo} w={"500px"} />
      </Box>

      <Flex zIndex={99}>
        <Box>
          <Input />
        </Box>
      </Flex>
    </Box>
  );
};
