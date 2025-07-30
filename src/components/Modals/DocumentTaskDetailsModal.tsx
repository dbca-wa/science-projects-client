import {
  Text,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  ModalCloseButton,
  useColorMode,
} from "@chakra-ui/react";
import { ITaskDisplayCard } from "../../types";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  task: ITaskDisplayCard;
}

export const DocumentTaskDetailsModal = ({ isOpen, onClose, task }: Props) => {
  const { colorMode } = useColorMode();

  return (
    <Modal isOpen={isOpen} onClose={onClose} size={"md"}>
      <ModalOverlay />
      <ModalContent
        color={colorMode === "dark" ? "gray.400" : null}
        bg="white"
        p={4}
      >
        <ModalHeader mt={5}>{task.name}</ModalHeader>
        <ModalCloseButton />

        <ModalBody mb={5}>
          <Text>{task.description}</Text>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
