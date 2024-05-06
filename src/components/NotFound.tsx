// WIP Error component for 404 - displays the error in page. WIP as design in displaying data needs work.
// Needs to be in the middle.

import {
  Heading,
  VStack,
  Text,
  Button,
  Kbd,
  Grid,
  Box,
  useColorMode,
} from "@chakra-ui/react";
import { Link, useRouterState, useRouter } from "@tanstack/react-router";

import { AiFillHome } from "react-icons/ai";
import { IoIosArrowBack } from "react-icons/io";

export const NotFound = () => {
  const { colorMode } = useColorMode();
  const location = useRouterState().location;
  const urlpath = location.pathname;
  const router = useRouter();

  const goBack = () => {
    router.history.back();
  };

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minH="100vh"
      background={colorMode === "dark" ? "gray.800" : "gray.100"}
    >
      <Grid
        gridTemplateColumns="repeat(1, 1fr)"
        gridTemplateRows="1fr 1fr 1fr 1fr"
        height="100%"
      >
        <VStack spacing={8} align="center">
          <Heading>Page not found.</Heading>
          <Text>
            Oh, oh. We couldn't find{" "}
            <Kbd
              bg={colorMode === "dark" ? "gray.600" : "gray.300"}
              p={1}
              pb={0}
            >
              {urlpath}
            </Kbd>{" "}
            on this server.
          </Text>
          <Grid gridTemplateColumns="repeat(2, 1fr)" gridColumnGap={20}>
            <Link to="/">
              <Button
                variant="link"
                colorScheme="twitter"
                leftIcon={<AiFillHome />}
              >
                Go home
              </Button>
            </Link>
            <Button
              variant="link"
              colorScheme="twitter"
              leftIcon={<IoIosArrowBack />}
              onClick={goBack}
            >
              Go back
            </Button>
          </Grid>
        </VStack>
      </Grid>
    </Box>
  );
};
