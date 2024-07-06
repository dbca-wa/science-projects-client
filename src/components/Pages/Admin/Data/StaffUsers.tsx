import { AddDBCAUserModal } from "@/components/Modals/Admin/AddDBCAUserModal";
import {
  Box,
  Text,
  Button,
  Divider,
  Grid,
  useColorMode,
  useDisclosure,
} from "@chakra-ui/react";

export const StaffUsers = () => {
  const { colorMode } = useColorMode();
  const {
    isOpen: isAddDBCAUserModalOpen,
    onOpen: onOpenAddDBCAUserModal,
    onClose: onCloseAddDBCAUserModal,
  } = useDisclosure();

  return (
    <>
      <AddDBCAUserModal
        isOpen={isAddDBCAUserModalOpen}
        onClose={onCloseAddDBCAUserModal}
      />
      <Box mt={8} mb={4}>
        <Text fontWeight={"semibold"} mb={3}>
          Users (Actions)
        </Text>
        <Divider />
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
      </Grid>
    </>
  );
};
