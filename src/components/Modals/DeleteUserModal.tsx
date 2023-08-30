// WIP: Delete User Modal - for removing users from the system all together. Admin only.

import { Button, Center, Grid, ListItem, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Text, UnorderedList, useColorMode, useDisclosure } from "@chakra-ui/react"
import { useEffect } from "react";

interface IModalProps {
    isOpen: boolean;
    onClose: () => void;
    userIsSuper: boolean;
    userIsMe: boolean;
}


export const DeleteUserModal = ({ isOpen, onClose, userIsSuper, userIsMe }: IModalProps) => {

    const { colorMode } = useColorMode();
    const { isOpen: isToastOpen, onOpen: openToast, onClose: closeToast } = useDisclosure();

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
        <Modal
            isOpen={isOpen}
            onClose={handleToastClose}
            size={"sm"}
        >
            <ModalOverlay />
            <ModalContent bg={colorMode === "light" ? "white" : "gray.800"}>
                <ModalHeader>Delete User?</ModalHeader>
                <ModalCloseButton />
                <ModalBody>

                    <Center>
                        <Text
                            fontWeight={"bold"}
                            fontSize={"xl"}
                        >
                            Are you sure you want to delete this user?
                        </Text>
                    </Center>
                    <Center
                        mt={4}
                    >
                        <UnorderedList>
                            <ListItem>They will be removed from projects they are on</ListItem>
                            <ListItem>Their comments will be deleted</ListItem>
                            <ListItem>Projects they started will have no leader</ListItem>
                        </UnorderedList>
                    </Center>

                    <Center
                        mt={6}
                        p={5}
                    >
                        <Text>
                            If this is okay or this is a duplicate account, please proceed.
                        </Text>
                    </Center>
                    {/* <Text>You can't demote yourself.</Text>
                    <Text>You can't delete yourself.</Text> */}


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
                        >
                            Delete
                        </Button>
                    </Grid>
                </ModalFooter>
            </ModalContent>
        </Modal>
    )
}