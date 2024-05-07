// WIP: Error handler for non-404 errors.

import {
  Heading,
  VStack,
  Text,
  Button,
  Grid,
  Box,
  useColorMode,
  Center,
} from "@chakra-ui/react";
import { Link, useRouter } from "@tanstack/react-router";

import { AiFillHome } from "react-icons/ai";
import { IoIosArrowBack } from "react-icons/io";

interface GenericErrorProps {
  code: number;
  message: string;
  stack?: string; // Stack trace prop
}

export const OtherError = ({ code, message, stack }: GenericErrorProps) => {
  const { colorMode } = useColorMode();
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
          <Heading>Error: {code}</Heading>
          <Text>Oh, oh. We have an error!</Text>
          <Text>{message}</Text>
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
            {/* <Link to='/'> */}
            <Button
              variant="link"
              colorScheme="twitter"
              leftIcon={<IoIosArrowBack />}
              onClick={goBack}
            >
              Go back
            </Button>
            {/* </Link> */}
          </Grid>
          <Center p={20}>
            <Text>{stack}</Text>
          </Center>
        </VStack>
      </Grid>
    </Box>
  );
};
