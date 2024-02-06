import {
    Button,
    Flex,
    FormControl,
    FormHelperText,
    FormLabel,
    Grid,
    Input,
    InputGroup,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    useColorMode,
} from "@chakra-ui/react";

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

export const DocumentApprovedEmailModal = ({ isOpen, onClose }: Props) => {


    const onClick = () => {
        // API Call here
        console.log("API CALL")
    };

    const { colorMode } = useColorMode();

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            size={"md"}
        // isCentered={true}
        >
            {" "}
            <ModalOverlay />
            <ModalContent bg={colorMode === "light" ? "white" : "gray.800"} p={4}>
                <ModalHeader mt={5}>Insert Table</ModalHeader>
                <ModalCloseButton />
                <ModalBody mb={5}>
                    <Grid gridRowGap={4}>
                        <FormControl>
                            <FormLabel>Email Address</FormLabel>
                            <InputGroup>
                                <Input
                                    placeholder={"@dbca.wa.gov.au..."}
                                    //   label="Rows"
                                    //   onChange={(e) => setRows(e.target.value)}
                                    //   value={rows}
                                    type="email"
                                />
                            </InputGroup>
                            <FormHelperText>
                                Enter the email address you would like to send to
                            </FormHelperText>
                        </FormControl>
                        <FormControl>
                            <FormLabel>HTML</FormLabel>
                            <InputGroup>
                                {/* <Statef
                /> */}
                            </InputGroup>
                            <FormHelperText>
                                Enter the number of columns for the table
                            </FormHelperText>
                        </FormControl>
                    </Grid>
                </ModalBody>
                <ModalFooter>
                    <Flex>
                        <Button onClick={onClose} mr={3} colorScheme={"gray"}>
                            Cancel
                        </Button>
                        <Button
                            //   disabled={isDisabled}
                            onClick={onClick}
                            color={"white"}
                            background={colorMode === "light" ? "green.500" : "green.600"}
                            _hover={{
                                background: colorMode === "light" ? "green.400" : "green.500",
                            }}
                        >
                            Confirm
                        </Button>
                    </Flex>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};
