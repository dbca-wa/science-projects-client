import {
  Box,
  Button,
  Flex,
  List,
  ListItem,
  Text,
  useColorMode,
} from "@chakra-ui/react";

export const RemedyMemberlessProjectsModalContent = () => {
  const { colorMode } = useColorMode();
  return (
    <>
      <Box>
        {/* <Text>Memberless Projects</Text> */}

        <List>
          <ListItem>- All memberless projects will be effected</ListItem>
          <ListItem>
            - The function will add the creator of the project and set them as
            leader
          </ListItem>
          <ListItem>
            - If the leader cannot be set to the creator, or the creator is a
            maintainer (Florian/Jarid), the project will remain unchanged
          </ListItem>
        </List>
        <Text color={colorMode === "light" ? "blue.500" : "blue.300"} my={2}>
          Caution: This will update all projects without members.
        </Text>
        <Flex justifyContent={"flex-end"} py={4}>
          <Box>
            <Button
              bg={"green.500"}
              color={"white"}
              _hover={{
                bg: "green.400",
              }}
            >
              Remedy
            </Button>
          </Box>
        </Flex>
      </Box>
    </>
  );
};
