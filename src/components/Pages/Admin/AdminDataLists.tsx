import { ProjectLeadEmailModal } from "@/components/Modals/ProjectLeadEmailModal";
import { Button, useDisclosure } from "@chakra-ui/react";


export const AdminDataLists = () => {
  const {
    isOpen: isProjectLeadEmailModalOpen,
    onOpen: onProjectLeadEmailModalOpen,
    onClose: onProjectLeadEmailModalClose,
  } = useDisclosure();

  return (
    <>
      <ProjectLeadEmailModal
        isOpen={isProjectLeadEmailModalOpen}
        onClose={onProjectLeadEmailModalClose}
      />
      <Button
        onClick={onProjectLeadEmailModalOpen}
      >
        Active Project Lead Emails
      </Button>
    </>
  );
};
