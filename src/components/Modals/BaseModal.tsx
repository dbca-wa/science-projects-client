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

interface IModalProps {
  isOpen: boolean;
  onClose: () => void;
  modalTitle: string;
  children: React.ReactNode;
  modalSize?: string;
}

export const BaseModal = ({
  isOpen,
  onClose,
  modalSize,
  modalTitle,
  children,
}: IModalProps) => {
  const { colorMode } = useColorMode();
  const {
    isOpen: isToastOpen,
    // onOpen: openToast,
    onClose: closeToast,
  } = useDisclosure();

  useEffect(() => {
    if (isToastOpen) {
      onClose();
    }
  }, [isToastOpen, onClose]);

  const handleToastClose = () => {
    closeToast();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleToastClose} size={modalSize || "3xl"}>
      <ModalOverlay />
      <ModalContent
        color={colorMode === "dark" ? "gray.400" : null}
        bg={colorMode === "light" ? "white" : "gray.800"}
      >
        <ModalHeader>{modalTitle}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>{children}</ModalBody>
      </ModalContent>
    </Modal>
  );
};
