// WIP: Delete User Modal - for removing users from the system all together. Admin only.

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
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import {
  AdminSwitchVar,
  MutationError,
  MutationSuccess,
  deactivateUserAdmin,
} from "../../lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useUserSearchContext } from "../../lib/hooks/helper/UserSearchContext";
import { IUserData } from "@/types";

interface IModalProps {
  isOpen: boolean;
  onClose: () => void;
  userIsSuper: boolean;
  user: IUserData;
}

export const DeactivateUserModal = ({
  isOpen,
  onClose,
  userIsSuper,
  user,
}: IModalProps) => {
  const { colorMode } = useColorMode();
  const { isOpen: isToastOpen, onClose: closeToast } = useDisclosure();

  useEffect(() => {
    if (isToastOpen) {
      onClose();
    }
  }, [isToastOpen, onClose]);

  const handleToastClose = () => {
    closeToast();
    onClose();
  };

  const { reFetch } = useUserSearchContext();

  // Toast
  const toast = useToast();
  const toastIdRef = useRef<ToastId>();
  const addToast = (data) => {
    toastIdRef.current = toast(data);
  };
  const queryClient = useQueryClient();

  const { register, handleSubmit } = useForm<AdminSwitchVar>();

  const deactivationMutation = useMutation<
    MutationSuccess,
    MutationError,
    AdminSwitchVar
  >({
    // Start of mutation handling
    mutationFn: deactivateUserAdmin,
    onMutate: () => {
      addToast({
        title: "Deactivating Account...",
        description: "One moment!",
        status: "loading",
        position: "top-right",
        // duration: 3000
      });
    },
    // Success handling based on API- file - declared interface
    onSuccess: (data) => {
      console.log(data);

      if (toastIdRef.current) {
        toast.update(toastIdRef.current, {
          title: "Success",
          description: `User Deactivated`,
          status: "success",
          position: "top-right",
          duration: 3000,
          isClosable: true,
        });
      }
      //  Close the modal
      if (onClose) {
        onClose();
      }
      queryClient.invalidateQueries({ queryKey: ["users", user?.pk] });
      reFetch();
    },
    // Error handling based on API - file - declared interface
    onError: (error) => {
      console.log(error);
      let errorMessage = "An error occurred while deactivating"; // Default error message

      const collectErrors = (data, prefix = "") => {
        if (typeof data === "string") {
          return [data];
        }

        const errorMessages = [];

        for (const key in data) {
          if (Array.isArray(data[key])) {
            const nestedErrors = collectErrors(data[key], `${prefix}${key}.`);
            errorMessages.push(...nestedErrors);
          } else if (typeof data[key] === "object") {
            const nestedErrors = collectErrors(data[key], `${prefix}${key}.`);
            errorMessages.push(...nestedErrors);
          } else {
            errorMessages.push(`${prefix}${key}: ${data[key]}`);
          }
        }

        return errorMessages;
      };

      if (error.response && error.response.data) {
        const errorMessages = collectErrors(error.response.data);
        if (errorMessages.length > 0) {
          errorMessage = errorMessages.join("\n"); // Join errors with new lines
        }
      } else if (error.message) {
        errorMessage = error.message; // Use the error message from the caught exception
      }

      if (toastIdRef.current) {
        toast.update(toastIdRef.current, {
          title: "Deactivation failed",
          description: errorMessage,
          status: "error",
          position: "top-right",
          duration: 3000,
          isClosable: true,
        });
      }
    },
  });

  const onSubmit = async ({ userPk }: AdminSwitchVar) => {
    await deactivationMutation.mutateAsync({ userPk });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleToastClose} size={"sm"}>
      <ModalOverlay />
      <Flex as={"form"} onSubmit={handleSubmit(onSubmit)}>
        <ModalContent bg={colorMode === "light" ? "white" : "gray.800"}>
          <ModalHeader>{user?.is_active ? "Deactivate" : "Reactivate"} User?</ModalHeader>
          <ModalCloseButton />

          <ModalBody>
            <Center>
              <Text fontWeight={"bold"} fontSize={"xl"}>
                Are you sure you want to {user?.is_active ? "deactivate" : "reactivate"} this user?
              </Text>
            </Center>
            <Center mt={4}>
              <UnorderedList mb={0} pb={0}>
                <ListItem mb={0} pb={0}>They will now receive emails</ListItem>
              </UnorderedList>
            </Center>
            <FormControl mt={0} mb={4} userSelect="none">
              <InputGroup>
                <Input
                  type="hidden"
                  {...register("userPk", { required: true, value: user?.pk })}
                  readOnly
                />
              </InputGroup>
            </FormControl>
            <Center mt={6} p={5}>
              <Text>If this is okay, please proceed.</Text>
            </Center>
          </ModalBody>
          <ModalFooter>
            <Grid gridTemplateColumns={"repeat(2, 1fr)"} gridGap={4}>
              <Button colorScheme="gray" onClick={onClose}>
                Cancel
              </Button>
              <Button
                // isDisabled={!changesMade}
                isDisabled={userIsSuper}
                isLoading={deactivationMutation.isPending}
                type="submit"
                color={"white"}
                background={colorMode === "light" ? user?.is_active ? "red.500" : "green.500" : user?.is_active ? "red.600" : "green.500"}
                _hover={{
                  background: colorMode === "light" ? "red.400" : "red.500",
                }}
                ml={3}
              >
                {user?.is_active ? "Deactivate" : "Reactivate"}
              </Button>
            </Grid>
          </ModalFooter>
        </ModalContent>
      </Flex>
    </Modal>
  );
};
