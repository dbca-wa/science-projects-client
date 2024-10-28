import { AddDBCAUserModal } from "@/components/Modals/Admin/AddDBCAUserModal";
import { MergeUsersModal } from "@/components/Modals/Admin/MergeUsersModal";
import {
  Box,
  Text,
  Button,
  Divider,
  Grid,
  useColorMode,
  useDisclosure,
  Flex,
} from "@chakra-ui/react";

export const StaffUsers = () => {
  const { colorMode } = useColorMode();
  const {
    isOpen: isAddDBCAUserModalOpen,
    onOpen: onOpenAddDBCAUserModal,
    onClose: onCloseAddDBCAUserModal,
  } = useDisclosure();

  const {
    isOpen: isMergeUserModalOpen,
    onOpen: onOpenMergeUserModal,
    onClose: onCloseMergeUserModal,
  } = useDisclosure();

  return (
    <>
      <AddDBCAUserModal
        isOpen={isAddDBCAUserModalOpen}
        onClose={onCloseAddDBCAUserModal}
      />
      <MergeUsersModal
        isOpen={isMergeUserModalOpen}
        onClose={onCloseMergeUserModal}
      />
      <Box>
        <Flex alignItems={"center"} mt={4}>
          <Text fontSize={"x-large"} py={4} flex={1}>
            Admin User Actions
          </Text>
        </Flex>
      </Box>

      <Grid gridTemplateColumns={"repeat(2, 1fr)"} gridGap={4}>
        <Button
          bg={colorMode === "light" ? "blue.500" : "blue.600"}
          color={"white"}
          _hover={{
            bg: colorMode === "light" ? "blue.400" : "blue.500",
          }}
          onClick={onOpenAddDBCAUserModal}
        >
          Add a DBCA User
        </Button>
        <Button
          bg={colorMode === "light" ? "orange.600" : "orange.700"}
          color={"white"}
          _hover={{
            bg: colorMode === "light" ? "orange.500" : "orange.600",
          }}
          isDisabled={true}
        >
          Set Caretaker
        </Button>

        <Button
          bg={colorMode === "light" ? "orange.600" : "orange.700"}
          color={"white"}
          _hover={{
            bg: colorMode === "light" ? "orange.500" : "orange.600",
          }}
          isDisabled={true}
        >
          Set Maintainer
        </Button>
        <Button
          bg={colorMode === "light" ? "red.600" : "red.700"}
          color={"white"}
          _hover={{
            bg: colorMode === "light" ? "red.500" : "red.600",
          }}
          // isDisabled={true}
          onClick={onOpenMergeUserModal}
        >
          Merge Users
        </Button>
      </Grid>
    </>
  );
};
