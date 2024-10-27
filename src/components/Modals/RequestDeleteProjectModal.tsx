import {
  Text,
  Center,
  Flex,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  ToastId,
  useToast,
  useColorMode,
  UnorderedList,
  ListItem,
  FormControl,
  InputGroup,
  Input,
  ModalFooter,
  Grid,
  Button,
  Select,
  Box,
} from "@chakra-ui/react";
import { requestDeleteProjectCall } from "../../lib/api";
import { useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { IMakeRequestToAdmins } from "../../types";
import { AxiosError } from "axios";

interface Props {
  projectPk: string | number;
  isOpen: boolean;
  onClose: () => void;
  refetch?: () => void;
}

export const RequestDeleteProjectModal = ({
  projectPk,
  isOpen,
  onClose,
  refetch,
}: Props) => {
  const toast = useToast();
  const toastIdRef = useRef<ToastId>();
  const addToast = (data) => {
    toastIdRef.current = toast(data);
  };

  // Mutation, query client, onsubmit, and api function
  const queryClient = useQueryClient();

  const requestDeleteProjectMutation = useMutation({
    mutationFn: requestDeleteProjectCall,
    onMutate: () => {
      addToast({
        status: "loading",
        title: `Requesting Deletion`,
        position: "top-right",
      });
    },
    onSuccess: async () => {
      if (toastIdRef.current) {
        toast.update(toastIdRef.current, {
          title: "Success",
          description: `Request Made`,
          status: "success",
          position: "top-right",
          duration: 3000,
          isClosable: true,
        });
      }

      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ["pendingAdminTasks"] });
        queryClient
          .invalidateQueries({ queryKey: ["project", projectPk] })
          .then(() => refetch?.())
          .then(() => onClose());
      }, 350);
    },
    onError: (error: AxiosError) => {
      if (toastIdRef.current) {
        toast.update(toastIdRef.current, {
          title: `Could not request deletion`,
          description: `${error.response.data}`,
          status: "error",
          position: "top-right",
          duration: 3000,
          isClosable: true,
        });
      }
      if (
        error.response.data ===
          "A request for this project's deletion has already been made!" ||
        error.response.data === "Project already has a pending deletion request"
      ) {
        onClose();
      }
    },
  });

  const requestDeletion = (formData: IMakeRequestToAdmins) => {
    console.log(formData);
    requestDeleteProjectMutation.mutate(formData);
  };

  const { colorMode } = useColorMode();
  const {
    register,
    handleSubmit,
    formState: { isSubmitting, isValid },
  } = useForm<IMakeRequestToAdmins>();

  return (
    <Modal isOpen={isOpen} onClose={onClose} size={"md"}>
      <ModalOverlay />
      <Flex as={"form"} onSubmit={handleSubmit(requestDeletion)}>
        <ModalContent bg={colorMode === "light" ? "white" : "gray.800"}>
          <ModalHeader>Request Deletion?</ModalHeader>
          <ModalCloseButton />

          <ModalBody>
            <Center>
              <Text fontWeight={"semibold"} fontSize={"xl"}>
                Are you sure you want to delete this project? There's no turning
                back.
              </Text>
            </Center>
            <Center mt={8}>
              <UnorderedList>
                <ListItem>The Project team and area will be cleared</ListItem>
                <ListItem>The project photo will be deleted</ListItem>
                <ListItem>Any related comments will be deleted</ListItem>
                <ListItem>All related documents will be deleted</ListItem>
              </UnorderedList>
            </Center>

            <FormControl>
              <InputGroup>
                <Input
                  type="hidden"
                  {...register("action", {
                    required: true,
                    value: "deleteproject",
                  })}
                  readOnly
                />
              </InputGroup>
            </FormControl>
            <FormControl>
              <InputGroup>
                <Input
                  type="hidden"
                  {...register("project", {
                    required: true,
                    value: Number(projectPk),
                  })}
                  readOnly
                />
              </InputGroup>
            </FormControl>
            <Center mt={2} p={5} pb={3}>
              <Text
                fontWeight={"bold"}
                color={"red.400"}
                textDecoration={"underline"}
              >
                Once approved by admins, this is permanent.
              </Text>
            </Center>
            <Center p={5}>
              <Text fontWeight={"semibold"} color={"blue.500"}>
                If you wish to proceed, select a deletion reason and click
                "Request Deletion". Clicking the button will send a request to
                the admins, so the process may take time.
              </Text>
            </Center>

            <Box>
              <Select {...register("reason", { required: true })}>
                <option value="duplicate">Duplicate</option>
                <option value="mistake">Made by Mistake</option>
                <option value="other">Other</option>
              </Select>
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
                disabled={
                  requestDeleteProjectMutation.isPending ||
                  !isValid ||
                  isSubmitting
                }
                isLoading={requestDeleteProjectMutation.isPending}
                type="submit"
                ml={3}
              >
                Request Deletion
              </Button>
            </Grid>
          </ModalFooter>
        </ModalContent>
      </Flex>
    </Modal>
  );
};
