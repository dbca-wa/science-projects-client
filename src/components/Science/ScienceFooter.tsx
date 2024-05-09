import { Box, Link, Text } from "@chakra-ui/react";

export const ScienceFooter = () => {
  return (
    <Box
      w={"100%"}
      bg={"#6D8F59"}
      color={"white"}
      display={"flex"}
      justifyContent={"center"}
      py={4}
      pos={"absolute"}
      bottom={0}
    >
      <Text>
        All contents copyright ©{" "}
        <Link href="wa.gov.au" _hover={{ color: "blue.200" }}>
          Government of Western Australia
        </Link>
        . All rights reserved.{" "}
      </Text>
    </Box>
  );
};
