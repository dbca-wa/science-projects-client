import {
  Text,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  ModalCloseButton,
} from "@chakra-ui/react";
import { ITaskDisplayCard } from "../../types";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  task: ITaskDisplayCard;
}

export const DocumentTaskDetailsModal = ({ isOpen, onClose, task }: Props) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size={"md"}>
      <ModalOverlay />
      <ModalContent bg="white" p={4}>
        <ModalHeader mt={5}>{task.name}</ModalHeader>
        <ModalCloseButton />

        <ModalBody mb={5}>
          <Text>{task.description}</Text>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
