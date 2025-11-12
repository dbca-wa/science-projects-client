import {
  Button,
  Center,
  Flex,
  FormControl,
  Grid,
  Input,
  InputGroup,
  ListItem,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  ToastId,
  UnorderedList,
  useColorMode,
  useToast,
  UseToastOptions,
} from "@chakra-ui/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useRef } from "react";
import { useForm } from "react-hook-form";
import { requestMergeUserCall } from "@/lib/api";
import { IMakeRequestToAdmins } from "@/types";

interface Props {
  primaryUserPk: number;
  secondaryUserPks: number[];
  isOpen: boolean;
  onClose: () => void;
  refetch?: () => void;
}

export const RequestMergeUserModal = ({
  primaryUserPk,
  secondaryUserPks,
  isOpen,
  onClose,
  refetch,
}: Props) => {
  const toast = useToast();
  const toastIdRef = useRef<ToastId | undefined>(undefined);
  const addToast = (data: UseToastOptions) => {
    toastIdRef.current = toast(data);
  };

  // Mutation, query client, onsubmit, and api function
  const queryClient = useQueryClient();

  const requestMergeUserMutation = useMutation({
    mutationFn: requestMergeUserCall,
    onMutate: () => {
      addToast({
        status: "loading",
        title: `Requesting Merge`,
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
        queryClient
          .invalidateQueries({ queryKey: ["pendingAdminTasks"] })
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

  const requestUserMerge = (formData: IMakeRequestToAdmins) => {
    console.log(formData);
    requestMergeUserMutation.mutate(formData);
  };

  const { colorMode } = useColorMode();
  const {
    register,
    handleSubmit,
    formState: { isSubmitting, isValid },
  } = useForm<IMakeRequestToAdmins>();

  return (
    <Modal isOpen={isOpen} onClose={onClose} size={"2xl"}>
      <ModalOverlay />
      <Flex as={"form"} onSubmit={handleSubmit(requestUserMerge)}>
        <ModalContent
          color={colorMode === "dark" ? "gray.400" : null}
          bg={colorMode === "light" ? "white" : "gray.800"}
        >
          <ModalHeader>Request Merge?</ModalHeader>
          <ModalCloseButton />

          <ModalBody>
            <Center display={"flex"} flexDir={"column"}>
              <Text color={colorMode === "light" ? "blue.500" : "blue.400"}>
                This form is for merging duplicate users. Please ensure that the
                user you merge has the correct information.
              </Text>
              <UnorderedList ml={6} mt={2}>
                <ListItem>
                  The primary user (you) will receive any projects belonging to
                  the secondary user (account you merge with)
                </ListItem>
                <ListItem>
                  The primary user (you) will receive any comments belonging to
                  the secondary user (account you merge with)
                </ListItem>
                <ListItem>
                  The primary user (you) will receive any documents and roles
                  belonging to the secondary user (account you merge with) on
                  projects, where applicable (if primary user is already on the
                  project and has a higher role, they will maintain the higher
                  role)
                </ListItem>
                <ListItem
                  textDecoration={"underline"}
                  color={colorMode === "light" ? "red.500" : "red.400"}
                >
                  The secondary user (account you merge with) will be deleted
                  from the system. This is permanent.
                </ListItem>
              </UnorderedList>
            </Center>

            <FormControl>
              <InputGroup>
                <Input
                  type="hidden"
                  {...register("action", {
                    required: true,
                    value: "mergeuser",
                  })}
                  readOnly
                />
              </InputGroup>
            </FormControl>
            <FormControl>
              <InputGroup>
                <Input
                  type="hidden"
                  {...register("primaryUserPk", {
                    required: true,
                    value: Number(primaryUserPk),
                  })}
                  readOnly
                />
                <Input
                  type="hidden"
                  {...register("secondaryUserPks", {
                    required: true,
                    value: secondaryUserPks,
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
                If you wish to proceed, click "Request Merge". Clicking the
                button will send a request to the admins, so the process may
                take time.
              </Text>
            </Center>
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
                  requestMergeUserMutation.isPending || !isValid || isSubmitting
                }
                isLoading={requestMergeUserMutation.isPending}
                type="submit"
                ml={3}
              >
                Request Merge
              </Button>
            </Grid>
          </ModalFooter>
        </ModalContent>
      </Flex>
    </Modal>
  );
};
