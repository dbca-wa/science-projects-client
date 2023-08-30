// Modal for editing user details

import { Button, Center, Grid, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Text, useColorMode, useDisclosure } from "@chakra-ui/react"
import { useEffect, useState } from "react";

interface IModalProps {
    isOpen: boolean;
    onClose: () => void;
}


export const EditUserDetailsModal = ({ isOpen, onClose }: IModalProps) => {

    const { colorMode } = useColorMode();
    const { isOpen: isToastOpen, onOpen: openToast, onClose: closeToast } = useDisclosure();

    useEffect(() => {
        if (isToastOpen) {
            onClose(); // Close the modal when the toast is shown
        }
    }, [isToastOpen, onClose]);

    const handleToastClose = () => {
        closeToast();
        onClose(); // Close the modal when the toast is manually closed
    };

    const [changesMade, setChangesMade] = useState(false);

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleToastClose}
            size={"sm"}
        >
            <ModalOverlay />
            <ModalContent bg={colorMode === "light" ? "white" : "gray.800"}>
                <ModalHeader>Edit User?</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <Center
                        mt={4}
                    >
                        <Text>Editing user details</Text>
                    </Center>

                    <Center
                        mt={6}
                        p={5}
                    >
                        <Text>
                            If you have made changes that you are happy with, please proceed.
                        </Text>
                    </Center>

                </ModalBody>
                <ModalFooter>
                    <Grid
                        gridTemplateColumns={"repeat(2, 1fr)"}
                        gridGap={4}
                    >
                        <Button
                            colorScheme="gray"
                        >
                            Cancel
                        </Button>
                        <Button
                            colorScheme="red"
                            isDisabled={!changesMade}
                        >
                            Update
                        </Button>
                    </Grid>
                </ModalFooter>
            </ModalContent>
        </Modal>
    )
}