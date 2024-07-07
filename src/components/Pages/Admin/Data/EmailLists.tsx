import { ProjectLeadEmailModal } from "@/components/Modals/ProjectLeadEmailModal";
import { Button, useColorMode, useDisclosure } from "@chakra-ui/react";

export const EmailLists = () => {
  const { colorMode } = useColorMode();
  const {
    isOpen: isProjectLeadEmailModalOpen,
    onOpen: onProjectLeadEmailModalOpen,
    onClose: onProjectLeadEmailModalClose,
  } = useDisclosure();

  return (
    <>
      <Button
        onClick={onProjectLeadEmailModalOpen}
        bg={colorMode === "light" ? "green.500" : "green.500"}
        color={"white"}
        _hover={{
          bg: colorMode === "light" ? "green.400" : "green.400",
        }}
      >
        Active Project Lead Emails
      </Button>
      <ProjectLeadEmailModal
        isOpen={isProjectLeadEmailModalOpen}
        onClose={onProjectLeadEmailModalClose}
      />
    </>
  );
};
