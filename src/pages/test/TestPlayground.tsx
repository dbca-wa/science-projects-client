// Route for testing new components
import { Head } from "@/shared/components/layout/base/Head";
import { Box, Text } from "@chakra-ui/react";

export const TestPlayground = () => {
  return (
    <>
      <Head title="Test Playground" />
      <Box>
        <Text>Test</Text>
      </Box>
    </>
  );
};
