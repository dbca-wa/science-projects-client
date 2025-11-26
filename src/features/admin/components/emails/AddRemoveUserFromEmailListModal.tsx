import {
  addRemoveUserFromEmailListCall,
  IAdjustEmailListProps,
} from "@/features/admin/services/admin.service";
import type { EmailListPerson, IEmailListUser } from "@/shared/types";
import {
  Text,
  Button,
  Flex,
  FormControl,
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
  type ToastId,
  useColorMode,
  useToast,
  type UseToastOptions,
} from "@chakra-ui/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { UserArraySearchDropdown } from "@/features/users/components/UserArraySearchDropdown";

interface IEmailListModalProps {
  isOpen: boolean;
  onClose: () => void;
  divisionPk: number;
  refetch: () => void;
  currentList: IEmailListUser[];
}

const AddRemoveUserFromEmailListModal = ({
  isOpen,
  onClose,
  divisionPk,
  refetch,
  currentList,
}: IEmailListModalProps) => {
  const toast = useToast();
  const ToastIdRef = useRef<ToastId | undefined>(undefined);
  const addToast = (data: UseToastOptions) => {
    ToastIdRef.current = toast(data);
  };

  const [usersToAction, setUsersToAction] = useState<EmailListPerson[]>(
    currentList || [],
  );

  const { colorMode } = useColorMode();
  const queryClient = useQueryClient();

  // Use react-hook-form but with manual value handling
  const {
    register,
    handleSubmit,
    setValue,
    formState: { isSubmitting, isValid },
  } = useForm<IAdjustEmailListProps>();

  // Update the form value whenever usersToAction changes
  useEffect(() => {
    setValue("usersList", usersToAction?.map((u) => u.pk) || []);
  }, [usersToAction, setValue]);

  // Debug log to check updates
  useEffect(() => {
    if (divisionPk === 1) {
      // console.log("Users to action updated:", usersToAction);
      // console.log(
      //   "Users list for submission:",
      //   usersToAction?.map((u) => u.pk),
      // );
    }
  }, [usersToAction, divisionPk]);

  const addRemoveEmailListMutation = useMutation({
    mutationFn: addRemoveUserFromEmailListCall,
    onMutate: () => {
      addToast({
        status: "loading",
        title: `Adjusting Email List`,
        position: "top-right",
      });
    },
    onSuccess: async () => {
      if (ToastIdRef.current) {
        toast.update(ToastIdRef.current, {
          title: "Success",
          description: `Adjusted Email List`,
          status: "success",
          position: "top-right",
          duration: 3000,
          isClosable: true,
        });
      }

      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ["divisions"] });
        refetch();
        onClose();
      }, 350);
    },
    onError: (error: AxiosError) => {
      if (ToastIdRef.current) {
        toast.update(ToastIdRef.current, {
          title: `Could not action request`,
          description: `${error.response?.data}`,
          status: "error",
          position: "top-right",
          duration: 3000,
          isClosable: true,
        });
      }
    },
  });

  const handleAction = (formData: IAdjustEmailListProps) => {
    // Important: Get the latest users list directly from state
    const dataToSubmit = {
      ...formData,
      usersList: usersToAction?.map((u) => u.pk) || [],
    };

    // console.log("Submitting form data:", dataToSubmit);
    addRemoveEmailListMutation.mutate(dataToSubmit);
  };

  const handleAddUser = (user: EmailListPerson) => {
    setUsersToAction((prev) => [...(prev || []), user]);
  };

  const handleRemoveUser = (user: EmailListPerson) => {
    setUsersToAction((prev) =>
      (prev || []).filter((existingUser) => existingUser.pk !== user.pk),
    );
  };

  const handleClearAll = () => {
    setUsersToAction([]);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size={"md"}>
      <ModalOverlay />
      <Flex as={"form"} onSubmit={handleSubmit(handleAction)}>
        <ModalContent
          color={colorMode === "dark" ? "gray.400" : null}
          bg={colorMode === "light" ? "white" : "gray.800"}
        >
          <ModalHeader>{"Adjust Email List"}</ModalHeader>
          <ModalCloseButton />

          <ModalBody>
            <FormControl>
              <InputGroup>
                <Input
                  type="hidden"
                  {...register("divisionPk", {
                    required: true,
                    value: divisionPk,
                  })}
                  readOnly
                />
              </InputGroup>
            </FormControl>

            {/* Not setting a direct value here, but using setValue in the useEffect instead */}
            <Input
              type="hidden"
              {...register("usersList", {
                validate: (value) => Array.isArray(value), // This will pass for empty arrays too
              })}
            />

            <UserArraySearchDropdown
              isRequired={false}
              label={"User List"}
              placeholder={"Enter a user's name"}
              helperText={"Select users for this email list"}
              array={usersToAction}
              arrayAddFunction={handleAddUser}
              arrayRemoveFunction={handleRemoveUser}
              arrayClearFunction={handleClearAll}
              ignoreUserPks={usersToAction?.map((u) => u.pk)}
              internalOnly
            />
          </ModalBody>
          <ModalFooter>
            <Flex flexDir={"column"} w={"full"}>
              <Grid gridTemplateColumns={"repeat(2, 1fr)"} gridGap={4}>
                <Button colorScheme="gray" onClick={() => onClose()}>
                  Cancel
                </Button>
                <Button
                  color={"white"}
                  background={colorMode === "light" ? "green.500" : "green.600"}
                  _hover={{
                    background:
                      colorMode === "light" ? "green.400" : "green.500",
                  }}
                  disabled={
                    addRemoveEmailListMutation.isPending ||
                    !divisionPk ||
                    isSubmitting ||
                    !isValid
                  }
                  isLoading={addRemoveEmailListMutation.isPending}
                  type="submit"
                  ml={3}
                >
                  Update
                </Button>
              </Grid>
            </Flex>
          </ModalFooter>
        </ModalContent>
      </Flex>
    </Modal>
  );
};

export default AddRemoveUserFromEmailListModal;
