// WIP: Delete User Modal - for removing users from the system all together. Admin only.

import { CreateProject } from "@/routes/CreateProject";
import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  useColorMode,
} from "@chakra-ui/react";

interface IModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateProjectPageModal = ({ isOpen, onClose }: IModalProps) => {
  const { colorMode } = useColorMode();

  return (
    <Modal isOpen={isOpen} onClose={onClose} size={"6xl"}>
      <ModalOverlay />
      <ModalContent bg={colorMode === "light" ? "white" : "gray.800"}>
        <ModalHeader>Create Project</ModalHeader>
        <ModalCloseButton />

        <ModalBody>
          <CreateProject />
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
