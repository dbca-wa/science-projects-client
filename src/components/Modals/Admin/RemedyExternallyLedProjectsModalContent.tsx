import { Box, Text } from "@chakra-ui/react";

export const RemedyExternallyLedProjectsModalContent = () => {
  return (
    <>
      <Box>
        <Text>Projects with External Leaders ()</Text>
        <Text color={"gray.500"}>
          Note: This is a system-wide action that will update project
          memberships. It finds projects with external leaders and sets the
          leader to the creator of the project. The external member is set to
        </Text>
      </Box>
    </>
  );
};
