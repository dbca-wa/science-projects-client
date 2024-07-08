import { Box, Text } from "@chakra-ui/react";

export const RemedyMultipleLeaderProjectsModalContent = () => {
  return (
    <>
      <Box>
        <Text>Projects with Multiple Leaders ()</Text>
        <Text color={"gray.500"}>
          Note: This is a system-wide action that will update project
          memberships. It finds projects with multiple leader roles and sets the
          leader based on the is_leader value.
        </Text>
      </Box>
    </>
  );
};
