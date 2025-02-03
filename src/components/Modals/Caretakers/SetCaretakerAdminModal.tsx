// Delete User Modal - for removing users from the system all together. Admin only.

import {
  Button,
  Center,
  Flex,
  FormControl,
  FormHelperText,
  FormLabel,
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
  Select,
  Text,
  Textarea,
  ToastId,
  UnorderedList,
  useColorMode,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import {
  AdminSwitchVar,
  MutationError,
  MutationSuccess,
  adminSetCaretaker,
  deleteUserAdmin,
  requestCaretaker,
} from "../../../lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useUserSearchContext } from "../../../lib/hooks/helper/UserSearchContext";
import { ICaretakerEntry, IUserMe } from "@/types";
import { useFormattedDate } from "@/lib/hooks/helper/useFormattedDate";
import { ShadcnDatePicker } from "../../Pages/Account/ShadcnDatePicker";
import { UserSearchDropdown } from "../../Navigation/UserSearchDropdown";
import useCaretakingChain from "@/lib/hooks/helper/useCaretakingChain";

interface IModalProps {
  isOpen: boolean;
  onClose: () => void;
  refetch: () => void;
  userIsSuper: boolean;
  userPk: string | number;
  userData: IUserMe;
}

export const SetCaretakerAdminModal = ({
  isOpen,
  onClose,
  userIsSuper,
  userPk,
  refetch,
  userData,
}: IModalProps) => {
  const [caretakerPk, setCaretakerPk] = useState<number | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [reason, setReason] = useState<
    "leave" | "resignation" | "other" | null
  >(null);
  const [notes, setNotes] = useState<string | undefined>(undefined);

  // useEffect(() => {
  //   console.log({
  //     userPk,
  //     caretakerPk,
  //     endDate,
  //     reason,
  //     notes,
  //   });
  // }, [userPk, caretakerPk, endDate, reason, notes]);

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
  const queryClient = useQueryClient();

  const { reFetch } = useUserSearchContext();

  // Toast
  const toast = useToast();
  const toastIdRef = useRef<ToastId>();
  const addToast = (data) => {
    toastIdRef.current = toast(data);
  };

  const adminSetCaretakerMutation = useMutation<
    MutationSuccess,
    MutationError,
    ICaretakerEntry
  >({
    // Start of mutation handling
    mutationFn: adminSetCaretaker,
    onMutate: () => {
      addToast({
        title: "Setting caretaker...",
        description: "One moment!",
        status: "loading",
        position: "top-right",
        // duration: 3000
      });
    },
    // Success handling based on API- file - declared interface
    onSuccess: () => {
      if (toastIdRef.current) {
        toast.update(toastIdRef.current, {
          title: "Success",
          description: `Caretaker set.`,
          status: "success",
          position: "top-right",
          duration: 3000,
          isClosable: true,
        });
      }
      queryClient
        .invalidateQueries({
          queryKey: ["pendingAdminTasks"],
        })
        .then(() => refetch())
        .then(() => onClose());
    },
    // Error handling based on API - file - declared interface
    onError: (error) => {
      console.log(error);
      let errorMessage = "An error occurred while setting a caretaker"; // Default error message

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
          title: "Update failed",
          description: errorMessage,
          status: "error",
          position: "top-right",
          duration: 3000,
          isClosable: true,
        });
      }
    },
  });

  const onSubmit = async (formData: ICaretakerEntry) => {
    console.log(formData);
    await adminSetCaretakerMutation.mutateAsync({
      userPk: formData.userPk,
      caretakerPk: formData.caretakerPk,
      // startDate: formData.startDate,
      endDate: formData.endDate,
      reason: formData.reason,
      notes: formData.notes,
    });
  };

  // const formattedStart = useFormattedDate(startDate);
  const formattedEnd = useFormattedDate(endDate);

  const ignoreArray = useCaretakingChain(userData);

  return (
    <Modal isOpen={isOpen} onClose={handleToastClose} size={"lg"}>
      <ModalOverlay />
      <Flex>
        <ModalContent bg={colorMode === "light" ? "white" : "gray.800"}>
          <ModalHeader>Set a Caretaker?</ModalHeader>
          <ModalCloseButton />

          <ModalBody>
            <Center mb={8} mt={2}>
              <Text fontSize={"lg"}>
                Are you sure you want to set a caretaker?
              </Text>
            </Center>
            <div>
              <FormControl my={2} mb={4} userSelect={"none"}>
                <FormLabel>Reason</FormLabel>
                <Select
                  variant="filled"
                  placeholder="Select the reason for their absence"
                  isDisabled={false}
                  onChange={(e) =>
                    setReason(
                      e.target.value as
                        | "leave"
                        | "resignation"
                        | "other"
                        | null,
                    )
                  }
                  value={reason ?? undefined}
                >
                  <option value="leave">On Leave</option>
                  <option value="resignation">Leaving the Department</option>
                  <option value="other">Other</option>
                </Select>
              </FormControl>

              {(reason === "other" ||
                reason === "resignation" ||
                reason === "leave") && (
                <>
                  {reason === "other" && (
                    <FormControl my={2} mb={4} userSelect={"none"}>
                      <FormLabel>Notes</FormLabel>
                      <Textarea
                        placeholder="Enter the reason"
                        onChange={(e) => setNotes(e.target.value)}
                        value={notes}
                      />
                      <FormHelperText>
                        Please provide a reason for this user's absence.
                      </FormHelperText>
                    </FormControl>
                  )}

                  {reason !== "resignation" && (
                    <Flex flexDir={"row"} gap={4}>
                      <FormControl my={2} mb={4} userSelect={"none"}>
                        <FormLabel>End Date</FormLabel>
                        <InputGroup flexDir={"column"}>
                          <ShadcnDatePicker
                            placeholder={"Enter end date"}
                            date={endDate}
                            setDate={setEndDate}
                          />
                          <FormHelperText>
                            When will the user return to the office?
                          </FormHelperText>
                        </InputGroup>
                      </FormControl>
                    </Flex>
                  )}

                  <UserSearchDropdown
                    isRequired={false}
                    onlyInternal
                    setUserFunction={setCaretakerPk}
                    label={"Caretaker"}
                    placeholder={"Enter a caretaker"}
                    helperText={
                      "Who will look after their projects while they are gone?"
                    }
                    ignoreArray={ignoreArray}
                  />
                </>
              )}
            </div>
          </ModalBody>
          <ModalFooter>
            <Grid gridTemplateColumns={"repeat(2, 1fr)"} gridGap={4}>
              <Button colorScheme="gray" onClick={onClose}>
                Cancel
              </Button>
              <Button
                disabled={
                  !userPk ||
                  !caretakerPk ||
                  (reason !== "resignation" && !endDate) ||
                  !reason ||
                  (reason === "other" && !notes)
                }
                variant={"solid"}
                color={"white"}
                background={colorMode === "light" ? "green.500" : "green.600"}
                _hover={{
                  background: colorMode === "light" ? "green.400" : "green.500",
                }}
                isLoading={adminSetCaretakerMutation.isPending}
                onClick={() =>
                  onSubmit({
                    userPk: userPk as number,
                    caretakerPk: caretakerPk,
                    // startDate: startDate,
                    endDate: endDate,
                    reason: reason,
                    notes: notes,
                  })
                }
                ml={3}
              >
                Set Caretaker
              </Button>
            </Grid>
          </ModalFooter>
        </ModalContent>
      </Flex>
    </Modal>
  );
};
