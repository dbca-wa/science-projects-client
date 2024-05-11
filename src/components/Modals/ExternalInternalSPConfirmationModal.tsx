// Modal designed to send out emails seeking endorsement on the project plan where required
// Will send an email out to users marked as is_biometrician, is_herb_curator, or is_aec

import {
  Box,
  Text,
  Button,
  Checkbox,
  Flex,
  Grid,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useColorMode,
  Center,
} from "@chakra-ui/react";
import React, { useState } from "react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  mutationFunction: () => void;
  isExternalSP: boolean;
  setIsExternalSP: React.Dispatch<React.SetStateAction<boolean>>;
}

export const ExternalInternalSPConfirmationModal = ({
  isOpen,
  onClose,
  mutationFunction,
  isExternalSP,
  setIsExternalSP,
}: Props) => {
  const [buttonDisabled, setButtonDisabled] = useState(false);

  const { colorMode } = useColorMode();

  return (
    <Modal isOpen={isOpen} onClose={onClose} size={"2xl"}>
      <ModalOverlay />
      <Flex
      // as={"form"}
      // onSubmit={handleSubmit(seekEndorsementAndSaveFunc)}
      >
        <ModalContent bg={colorMode === "light" ? "white" : "gray.800"}>
          <ModalHeader>Is this an externally led project?</ModalHeader>
          <ModalCloseButton />

          <ModalBody>
            <Center mt={6} display={"flex"} flexDir={"column"}>
              <Grid mt={2}>
                <Checkbox
                  defaultChecked={isExternalSP}
                  // value={!isInternalSP}
                  onChange={() => setIsExternalSP((prev) => !prev)}
                >
                  Yes, this is an externally led project
                </Checkbox>
              </Grid>
              {isExternalSP ? (
                <Box my={4}>
                  <Text color={"blue.500"}>
                    As this is an externally led project, a concept plan will
                    NOT be created.{" "}
                  </Text>
                  <Text color={"blue.500"}>
                    Instead a project plan will be created.
                  </Text>
                </Box>
              ) : (
                <Box my={4}>
                  <Text color={"blue.500"}>
                    As this is not an externally led project, a concept plan
                    will be created.
                  </Text>
                </Box>
              )}
            </Center>
          </ModalBody>
          <ModalFooter>
            <Grid gridTemplateColumns={"repeat(2, 1fr)"} gridGap={4}>
              <Button colorScheme="gray" onClick={onClose}>
                Cancel
              </Button>

              <Button
                color={"white"}
                background={colorMode === "light" ? "green.500" : "green.600"}
                _hover={{
                  background: colorMode === "light" ? "green.400" : "green.500",
                }}
                ml={3}
                isDisabled={buttonDisabled}
                onClick={() => {
                  setButtonDisabled(true);
                  mutationFunction();
                  onClose();
                }}
              >
                Create
              </Button>
            </Grid>
            {}
          </ModalFooter>
        </ModalContent>
      </Flex>
    </Modal>
  );
};
