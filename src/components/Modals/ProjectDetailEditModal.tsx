// Modal Component for editing the Project Details

import { useState } from 'react';
import { Button, InputGroup, InputLeftElement, Input, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, FormControl, FormLabel, FormHelperText, Icon, Textarea, Grid, Tabs, TabList, Tab, TabPanels, TabPanel } from '@chakra-ui/react';
import { FaUser } from 'react-icons/fa';
import { BsCashCoin } from 'react-icons/bs';
import { GoListOrdered } from 'react-icons/go';
import { AiFillQuestionCircle } from 'react-icons/ai';
import { MdAccessTimeFilled } from 'react-icons/md';
import "../../styles/modalscrollbar.css";


interface IAddUserModalProps {
    isOpen: boolean;
    onClose: () => void;
}


export const ProjectDetailEditModal = ({ isOpen, onClose }: IAddUserModalProps) => {
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

    const onUpdateBtnClick = () => {
        console.log("updated")
        onClose();
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent bg={"white"}>
                <ModalHeader>Edit Project</ModalHeader>
                <ModalCloseButton />
                <Tabs isFitted variant='enclosed'>
                    <TabList mb='1em'>
                        <Tab>Details</Tab>
                        <Tab>Location</Tab>
                        <Tab>Display</Tab>
                    </TabList>
                    <TabPanels>
                        <TabPanel>
                            <form onSubmit={handleSubmit}>
                                <ModalBody
                                    overflowY={"auto"}
                                    maxHeight={"60vh"}

                                // className={scrollableModalStyles}
                                >
                                    <FormControl isRequired mb={4}>
                                        <FormLabel>Username</FormLabel>
                                        <InputGroup>
                                            <InputLeftElement children={<Icon as={FaUser} />} />
                                            <Input type="text" placeholder="Username" value={username} onChange={(event) => setUsername(event.target.value)} maxLength={30} pattern="[A-Za-z0-9@.+_-]*" />
                                        </InputGroup>
                                        <FormHelperText>The DBCA staff member to participate in the project team.</FormHelperText>
                                    </FormControl>
                                    <Grid
                                        gridTemplateColumns={"repeat(2, 1fr)"}
                                        gridColumnGap={4}
                                        my={4}
                                    >
                                        <FormControl isRequired >
                                            <FormLabel>Time Allocation (0 to 1 FTE)</FormLabel>
                                            <InputGroup>
                                                <InputLeftElement children={<Icon as={MdAccessTimeFilled} />} />
                                                <Input type="text" placeholder="0" value={username} onChange={(event) => setUsername(event.target.value)} maxLength={30} pattern="[A-Za-z0-9@.+_-]*" />
                                            </InputGroup>
                                            <FormHelperText>Indicative time allocation as a fraction of a Full Time Equivalent (210 person-days). Values between 0 and 1. Fill in estimated allocation for the next 12 months.</FormHelperText>
                                        </FormControl>
                                        <FormControl isRequired mb={4}>
                                            {/* 
                            CHOICES:
                            - Supervising Scientist
                            - Research Scientist
                            - Technical Officer
                            - External Collaborator
                            - Academic Supervisor
                            - Supervised Student
                            - External Peer
                            - Consulted Peer
                            - Involved Group
                        
                        */}
                                            <FormLabel>Role</FormLabel>
                                            <InputGroup>
                                                <InputLeftElement children={<Icon as={AiFillQuestionCircle} />} />
                                                <Input type="text" placeholder="Role" value={username} onChange={(event) => setUsername(event.target.value)} maxLength={30} pattern="[A-Za-z0-9@.+_-]*" />
                                            </InputGroup>
                                            <FormHelperText>The role this team member fills within this project.</FormHelperText>
                                        </FormControl>

                                    </Grid>

                                    <Grid
                                        gridTemplateColumns={"repeat(2, 1fr)"}
                                        gridColumnGap={4}
                                        my={4}

                                    >


                                        <FormControl isRequired mb={4}>
                                            <FormLabel>List Position</FormLabel>
                                            <InputGroup>
                                                <InputLeftElement children={<Icon as={GoListOrdered} />} />
                                                <Input type="text" placeholder="100" value={username} onChange={(event) => setUsername(event.target.value)} maxLength={30} pattern="[A-Za-z0-9@.+_-]*" />
                                            </InputGroup>
                                            <FormHelperText>The lowest position number comes first in the team members list. Ignore to keep alphabetical order, increase to shift member towards the end of the list, decrease to promote member to beginning of the list.</FormHelperText>
                                        </FormControl>

                                        <FormControl isRequired mb={4}>
                                            <FormLabel>Short Code</FormLabel>
                                            <InputGroup>
                                                <InputLeftElement children={<Icon as={BsCashCoin} />} />
                                                <Input type="text" placeholder="100" value={username} onChange={(event) => setUsername(event.target.value)} maxLength={30} pattern="[A-Za-z0-9@.+_-]*" />
                                            </InputGroup>
                                            <FormHelperText>Cost code for this project membership's salary. Allocated by divisional admin.</FormHelperText>
                                        </FormControl>
                                    </Grid>

                                    <FormControl isRequired my={4}
                                    >
                                        <FormLabel>Comments</FormLabel>
                                        <InputGroup>
                                            <Textarea placeholder='Here is a sample placeholder' />
                                        </InputGroup>
                                        <FormHelperText>Any comments clarifying the project membership.</FormHelperText>
                                    </FormControl>
                                </ModalBody>
                                <ModalFooter>
                                    <Button onClick={onClose}>Cancel</Button>
                                    <Button type="submit" colorScheme="blue" ml={3} isDisabled={!username || !passwordsMatch}
                                        onClick={onUpdateBtnClick}
                                    >
                                        Update
                                    </Button>
                                </ModalFooter>
                            </form>

                        </TabPanel>
                        <TabPanel>
                            <p>two!</p>
                        </TabPanel>
                        <TabPanel>
                            <FormControl my={4}
                            >
                                <FormLabel>Image</FormLabel>
                                <InputGroup>
                                    <Textarea placeholder='Here is a sample placeholder' />
                                </InputGroup>
                                <FormHelperText>Any comments clarifying the project membership.</FormHelperText>
                            </FormControl>

                            <p>three!</p>
                        </TabPanel>
                    </TabPanels>
                </Tabs>
            </ModalContent>
        </Modal>
    );
}
