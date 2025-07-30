// Modal designed to send out emails seeking endorsement on the project plan where required
// Will send an email out to users marked as is_biometrician, is_herb_curator, or is_aec

import {
  Box,
  Button,
  Flex,
  Grid,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  ToastId,
  useColorMode,
  useToast,
  UseToastOptions,
} from "@chakra-ui/react";
import { useMutation } from "@tanstack/react-query";
import { useRef } from "react";
import { deleteAECPDFEndorsement } from "../../lib/api";

interface Props {
  projectPlanPk: number;
  isOpen: boolean;
  onClose: () => void;
  refetchEndorsements: () => void;
  setToggle: () => void;
}

export const DeletePDFEndorsementModal = ({
  projectPlanPk,
  isOpen,
  onClose,
  refetchEndorsements,
  setToggle,
}: Props) => {
  const toast = useToast();
  const toastIdRef = useRef<ToastId | undefined>(undefined);
  const addToast = (data: UseToastOptions) => {
    toastIdRef.current = toast(data);
  };

  const deleteAECPDFEndorsementMutation = useMutation({
    mutationFn: deleteAECPDFEndorsement,
    onMutate: () => {
      addToast({
        status: "loading",
        title: `Updating Endorsements`,
        position: "top-right",
      });
    },
    onSuccess: async () => {
      if (toastIdRef.current) {
        toast.update(toastIdRef.current, {
          title: "Success",
          description: `Updated Endorsements`,
          status: "success",
          position: "top-right",
          duration: 3000,
          isClosable: true,
        });
      }

      setTimeout(() => {
        refetchEndorsements();
        setToggle();
        onClose();
      }, 350);
    },
    onError: (error) => {
      if (toastIdRef.current) {
        toast.update(toastIdRef.current, {
          title: `Could Not Update Endorsements`,
          description: `${error}`,
          status: "error",
          position: "top-right",
          duration: 3000,
          isClosable: true,
        });
      }
    },
  });

  const onDeleteAECPDFAndApproval = () => {
    deleteAECPDFEndorsementMutation.mutate(projectPlanPk);
  };

  const { colorMode } = useColorMode();

  return (
    <Modal isOpen={isOpen} onClose={onClose} size={"2xl"}>
      <ModalOverlay />
      <Flex>
        <ModalContent
          color={colorMode === "dark" ? "gray.400" : null}
          bg={colorMode === "light" ? "white" : "gray.800"}
        >
          <ModalHeader>Delete AEC PDF?</ModalHeader>
          <ModalCloseButton />

          <ModalBody>
            <Box mt={2}>
              <Text fontWeight={"semibold"} fontSize={"lg"}>
                Note that this will remove the AEC approval.
              </Text>
            </Box>
          </ModalBody>
          <ModalFooter>
            <Grid gridTemplateColumns={"repeat(2, 1fr)"} gridGap={4}>
              <Button colorScheme="gray" onClick={onClose}>
                Cancel
              </Button>

              <Button
                color={"white"}
                background={colorMode === "light" ? "red.500" : "red.600"}
                _hover={{
                  background: colorMode === "light" ? "red.400" : "red.500",
                }}
                isLoading={deleteAECPDFEndorsementMutation.isPending}
                ml={3}
                onClick={() => onDeleteAECPDFAndApproval()}
              >
                Delete
              </Button>
            </Grid>
            {}
          </ModalFooter>
        </ModalContent>
      </Flex>
    </Modal>
  );
};
