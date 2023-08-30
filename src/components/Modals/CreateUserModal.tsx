// Modal version of CreateUser component

import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, useColorMode, useDisclosure } from '@chakra-ui/react';
import { CreateUser } from '../../routes/CreateUser';
import { useEffect } from 'react';

interface IAddUserModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const CreateUserModal = ({ isOpen, onClose }: IAddUserModalProps) => {
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
                <ModalHeader>Add User</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <CreateUser onSuccess={openToast} />
                </ModalBody>
            </ModalContent>
        </Modal>
    );
};