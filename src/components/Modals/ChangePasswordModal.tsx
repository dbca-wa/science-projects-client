// WIP/Currently unused: Component for changing a user's password 

import {
    Button, FormControl, FormHelperText, FormLabel, Icon, Input, InputGroup, InputLeftElement, Modal, ModalBody, ModalCloseButton, ModalContent,
    ModalFooter, ModalHeader, ModalOverlay
} from "@chakra-ui/react"
import { useState } from "react";
import { FaLock, FaUser } from "react-icons/fa";


interface IChangePasswordModalProps {
    isOpen: boolean;
    onClose: () => void;
}


export const ChangePasswordModal = ({ isOpen, onClose }: IChangePasswordModalProps) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordsMatch, setPasswordsMatch] = useState(false);

    const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setPassword(event.target.value);
        setPasswordsMatch(event.target.value === confirmPassword);
    };

    const handleConfirmPasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setConfirmPassword(event.target.value);
        setPasswordsMatch(event.target.value === password);
    };

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        // Handle form submission
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent bg={"white"}>
                <ModalHeader>Add User</ModalHeader>
                <ModalCloseButton />
                <form onSubmit={handleSubmit}>
                    <ModalBody>
                        <FormControl isRequired>
                            <FormLabel>Username</FormLabel>
                            <InputGroup>
                                <InputLeftElement children={<Icon as={FaUser} />} />
                                <Input type="text" placeholder="Username" value={username} onChange={(event) => setUsername(event.target.value)} maxLength={30} pattern="[A-Za-z0-9@.+_-]*" />
                            </InputGroup>
                            <FormHelperText>Required. 30 characters or fewer. Letters, digits and @/./+/-/_ only.</FormHelperText>
                        </FormControl>
                        <FormControl isRequired mt={4}>
                            <FormLabel>Password</FormLabel>
                            <InputGroup>
                                <InputLeftElement children={<Icon as={FaLock} />} />
                                <Input type="password" placeholder="Password" value={password} onChange={handlePasswordChange} />
                            </InputGroup>
                        </FormControl>
                        <FormControl isRequired mt={4}>
                            <FormLabel>Password Confirmation</FormLabel>
                            <InputGroup>
                                <InputLeftElement children={<Icon as={FaLock} />} />
                                <Input type="password" placeholder="Confirm Password" value={confirmPassword} onChange={handleConfirmPasswordChange} />
                            </InputGroup>
                            {passwordsMatch && (
                                <FormHelperText color="green.500">Passwords match</FormHelperText>
                            )}
                        </FormControl>
                    </ModalBody>
                    <ModalFooter>
                        <Button onClick={onClose}>Cancel</Button>
                        <Button type="submit" colorScheme="blue" ml={3} isDisabled={!username || !passwordsMatch}>Add User</Button>
                    </ModalFooter>
                </form>
            </ModalContent>
        </Modal>
    )
}