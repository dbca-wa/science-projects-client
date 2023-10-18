import { Box, Text, Center, Grid, Modal, ModalBody, ModalContent, ModalHeader, ModalOverlay, ModalCloseButton, ModalFooter, Button, useColorMode } from "@chakra-ui/react"
import { ITaskDisplayCard } from "../../types";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    task: ITaskDisplayCard;
}

export const TaskDetailsModal = ({ isOpen, onClose, task }: Props) => {
    const { colorMode } = useColorMode();
    return (
        <Modal isOpen={isOpen} onClose={onClose}
            size={"md"}
        // isCentered={true}
        >
            <ModalOverlay />
            <ModalContent bg="white" p={4}
            >
                <ModalHeader
                    mt={5}
                >{task.name}</ModalHeader>
                <ModalCloseButton />

                <ModalBody
                    mb={5}
                >

                    <Text>{task.description}</Text>
                </ModalBody>
                {/* 
                <ModalFooter
                    mt={5}
                >
                    <Button variant="ghost" mr={3} onClick={onClose}>
                        Cancel
                    </Button>
                    <Button
                        form="taskcreation-form"
                        type="submit"
                        // isLoading={taskCreationMutation.isLoading}
                        bg={colorMode === "dark" ? "green.500" : "green.400"}
                        color={"white"}
                        _hover={
                            {
                                bg: colorMode === "dark" ? "green.400" : "green.300",
                            }
                        }
                    >
                        Create
                    </Button>
                </ModalFooter> */}
            </ModalContent>

        </Modal>
    )
}