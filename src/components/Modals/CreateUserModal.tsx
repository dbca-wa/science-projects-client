// Modal version of CreateUser component

import { CreateUser } from "@/routes/CreateUser";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  useColorMode,
  useDisclosure,
} from "@chakra-ui/react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

interface IAddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateUserModal = ({ isOpen, onClose }: IAddUserModalProps) => {
  const { colorMode } = useColorMode();
  const { isOpen: isToastOpen, onClose: closeToast } = useDisclosure();

  useEffect(() => {
    if (isToastOpen) {
      onClose();
    }
  }, [isToastOpen, onClose]);

  const handleToastClose = () => {
    closeToast();
    onClose();
  };

  const navigate = useNavigate();

  return (
    <Modal isOpen={isOpen} onClose={handleToastClose} size={"3xl"}>
      <ModalOverlay />
      <ModalContent bg={colorMode === "light" ? "white" : "gray.800"}>
        <ModalHeader>Add User</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <CreateUser
            isModal
            onClose={handleToastClose}
            onSuccess={() => navigate("/users")}
          />
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
