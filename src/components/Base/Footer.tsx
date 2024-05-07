// Component for Traditional version footer

import { Box, Center, Link, Text } from "@chakra-ui/react";
import { useCurrentYear } from "../../lib/hooks/helper/useCurrentYear";

export const Footer = () => {
  const currentYear = useCurrentYear();
  const FooterText = "SPMS2 v0.9.11";

  return (
    <Box
      position="absolute"
      bottom="0"
      width="100%"
      color="whiteAlpha.600"
      bgColor="blackAlpha.900"
      py={4}
      userSelect={"none"}
    >
      <Center fontSize="12px" textAlign="center">
        <Link
          color="whiteAlpha.800"
          href="https://github.com/dbca-wa/science-projects-client"
        >
          {FooterText}
        </Link>
        &nbsp;
        <Text>© 2012-{currentYear} DBCA. All rights reserved.</Text>
      </Center>
    </Box>
  );
};
