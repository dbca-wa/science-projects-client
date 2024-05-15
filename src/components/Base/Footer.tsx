// Component for Traditional version footer

import { Box, Center, Link, Text } from "@chakra-ui/react";
import { useCurrentYear } from "../../lib/hooks/helper/useCurrentYear";

export const Footer = () => {
  const currentYear = useCurrentYear();
  const VERSION = import.meta.env.VITE_SPMS_VERSION || "3.0.0";

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
      <Center fontSize="12px" textAlign="center"
        onClick={() => console.log(VERSION)}
      >
        <Link
          color="whiteAlpha.800"
          href="https://github.com/dbca-wa/science-projects-client"
        >
          {`SPMS ${VERSION}`}
        </Link>
        &nbsp;
        <Text>© 2012-{currentYear} DBCA. All rights reserved.</Text>
      </Center>
    </Box>
  );
};
