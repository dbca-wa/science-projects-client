// Modal for promoting or demoting users

import { Modal, ModalBody, ModalCloseButton, ModalContent, ModalHeader, ModalOverlay, Text, useColorMode, useDisclosure } from "@chakra-ui/react"
import { useEffect } from "react";

interface IModalProps {
    isOpen: boolean;
    onClose: () => void;
    userIsSuper: boolean;
    userIsMe: boolean;
}


export const PromoteUserModal = ({ isOpen, onClose, userIsSuper, userIsMe }: IModalProps) => {

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
        <Modal isOpen={isOpen} onClose={handleToastClose}>
            <ModalOverlay />
            <ModalContent bg={colorMode === "light" ? "white" : "gray.800"}>
                <ModalHeader>Promote User?</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <Text>Are you sure you want to promote this user to admin (superuser)?</Text>
                </ModalBody>
            </ModalContent>
        </Modal>
    )
}