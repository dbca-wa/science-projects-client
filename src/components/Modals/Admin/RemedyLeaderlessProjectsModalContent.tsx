import { Box, Text } from "@chakra-ui/react";

export const RemedyLeaderlessProjectsModalContent = () => {
  return (
    <>
      <Box>
        <Text>Projects with No Leaders ()</Text>
        <Text color={"gray.500"}>
          Note: This is a system-wide action that will update project
          memberships. It finds projects with members but no leaders and sets
          the leader based on the is_leader property.
        </Text>
      </Box>
    </>
  );
};
