import { Box, Center, Spinner, Text, VStack } from "@chakra-ui/react";

/**
 * Loading fallback component for lazy-loaded routes
 * Displays a spinner while the route component is being loaded
 */
export const LoadingFallback = () => {
  return (
    <Center minH="100vh" w="100%">
      <VStack spacing={4}>
        <Spinner
          thickness="4px"
          speed="0.65s"
          emptyColor="gray.200"
          color="blue.500"
          size="xl"
        />
        <Text fontSize="lg" color="gray.600">
          Loading...
        </Text>
      </VStack>
    </Center>
  );
};
