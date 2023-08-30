// Modal for editing a user's membership for their profile

import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, useColorMode, useDisclosure, FormControl, FormLabel, InputGroup, Grid, useToast, Select } from '@chakra-ui/react';
import { ChangeEvent, useEffect, useState } from 'react';


interface IEditMembershipModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentOrganisationData: string;
    currentBranchData: string;
}

export const EditMembershipModal = ({ isOpen, onClose, currentOrganisationData, currentBranchData }: IEditMembershipModalProps) => {
    const { colorMode } = useColorMode();
    const { isOpen: isToastOpen, onOpen: openToast, onClose: closeToast } = useDisclosure();

    const [organisation, setOrganisation] = useState<string | undefined>(currentOrganisationData);
    const [branch, setBranch] = useState<string | undefined>(currentBranchData);

    const toast = useToast();

    const handleBranchChange = (e: ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        if (value === '' || value === undefined || value === null) {
            setBranch(currentBranchData);
        } else {
            setBranch(value);
        }
    }


    useEffect(() => {
        console.log(organisation)
    }, [organisation])

    useEffect(() => {
        console.log(branch)
    }, [branch])

    useEffect(() => {
        if (isToastOpen) {
            onClose();
        }
    }, [isToastOpen, onClose]);

    const handleToastClose = () => {
        closeToast();
        onClose();
    };

    interface IMembershipUpdate {
        branch: string | undefined;
    }

    const updateUserProfile = async ({ branch }: IMembershipUpdate) => {
        console.log(branch);
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const userDataUpdated: IMembershipUpdate = {
            branch: branch,
        };

        await updateUserProfile(userDataUpdated);

        toast({
            position: "top-right",
            title: "Update Successful",
            description: "Personal Information Updated.",
            status: "success",
            duration: 5000,
            isClosable: true,
        });

    }

    const [branchOptions, setBranchOptions] = useState([
        {
            name: "Ecoinformatics",
            value: "ecoinfo",
        }
    ]);

    return (
        <Modal isOpen={isOpen} onClose={handleToastClose}>
            <ModalOverlay />
            <ModalContent bg={colorMode === "light" ? "white" : "gray.800"}>
                <ModalHeader>Edit Membership</ModalHeader>
                <ModalCloseButton />
                <ModalBody>

                    <form onSubmit={handleSubmit}>
                        <Grid
                            gridColumnGap={8}
                            gridTemplateColumns={"repeat(2, 1fr)"}
                        >
                            {/* Organisation */}
                            <FormControl my={2} mb={4}
                                userSelect={"none"}
                            >
                                <FormLabel>Organisation</FormLabel>
                                <InputGroup>
                                    <Select placeholder={'Department of Biodiversity, Conservation and Attractions'}
                                        isDisabled={true}
                                    >
                                        <option value='dbca'>
                                            Department of Biodiversity, Conservation and Attractions
                                        </option>
                                    </Select>
                                </InputGroup>
                            </FormControl>


                            {/* Expertise */}
                            <FormControl my={2} mb={4}
                                userSelect={"none"}
                            >
                                <FormLabel>Branch</FormLabel>
                                <InputGroup>
                                    <Select placeholder={'Select a Branch'}
                                        onChange={handleBranchChange}
                                    >
                                        {branchOptions.map((branch, index) => {
                                            return (
                                                <option key={index} value={branch.value}>
                                                    {branch.name}
                                                </option>
                                            )
                                        })}

                                    </Select>
                                </InputGroup>
                            </FormControl>

                        </Grid>
                    </form>
                </ModalBody>
            </ModalContent>
        </Modal>
    );

}