// Modal for editing a user's membership for their profile

import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  useColorMode,
  FormControl,
  FormLabel,
  InputGroup,
  Grid,
  useToast,
  Select,
  ModalFooter,
  Button,
  type ToastId,
  Input,
  Flex,
  type UseToastOptions,
} from "@chakra-ui/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRef } from "react";
import {
  IMembershipUpdateVariables,
  IProfileUpdateSuccess,
  MutationError,
  updateMembership,
} from "@/features/users/services/users.service";
import { useForm } from "react-hook-form";
import type { IAffiliation, IBranch, IBusinessArea } from "@/shared/types";
import { useBusinessAreas } from "@/features/business-areas/hooks/useBusinessAreas";
import { useBranches } from "@/features/admin/hooks/useBranches";
import { useAffiliations } from "@/features/admin/hooks/useAffiliations";
import { AffiliationCreateSearchDropdown } from "@/features/admin/components/AffiliationCreateSearchDropdown";

interface IEditMembershipModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentOrganisationData: string;
  currentBranchData: IBranch;
  currentBaData: IBusinessArea;
  currentAffiliationData: IAffiliation;
  userId: number;
}

export const EditMembershipModal = ({
  isOpen,
  onClose,
  currentBranchData,
  currentBaData,
  currentAffiliationData,
  userId,
}: IEditMembershipModalProps) => {
  const { colorMode } = useColorMode();
  // Toast
  const toast = useToast();
  const ToastIdRef = useRef<ToastId | undefined>(undefined);
  const addToast = (data: UseToastOptions) => {
    ToastIdRef.current = toast(data);
  };

  const { baLoading, baData } = useBusinessAreas();
  const { branchesLoading, branchesData } = useBranches();
  const { affiliationsLoading, affiliationsData } = useAffiliations();

  // Mutation, query client, onsubmit, and api function
  const queryClient = useQueryClient();

  const mutation = useMutation<
    IProfileUpdateSuccess,
    MutationError,
    IMembershipUpdateVariables
  >({
    // Start of mutation handling
    mutationFn: updateMembership,
    onMutate: () => {
      addToast({
        title: "Updating membership...",
        description: "One moment!",
        status: "loading",
        position: "top-right",
        // duration: 3000
      });
    },
    // Success handling based on API- file - declared interface
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: [`membership`, userId] });
      queryClient.refetchQueries({ queryKey: [`me`] });

      if (ToastIdRef.current) {
        toast.update(ToastIdRef.current, {
          title: "Success",
          description: `Information Updated`,
          status: "success",
          position: "top-right",
          duration: 3000,
          isClosable: true,
        });
      }
      //  Close the modal
      onClose?.();
    },
    // Error handling based on API - file - declared interface
    onError: (error) => {
      console.log(error);
      let errorMessage = "An error occurred while updating"; // Default error message

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

      if (ToastIdRef.current) {
        toast.update(ToastIdRef.current, {
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

  //  React Hook Form
  const { register, handleSubmit, setValue } =
    useForm<IMembershipUpdateVariables>();

  //  When submitting form - starts the mutation
  const onSubmit = async ({
    userPk,
    branch,
    business_area,
    affiliation,
  }: IMembershipUpdateVariables) => {
    await mutation.mutateAsync({ userPk, branch, business_area, affiliation });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size={"3xl"}
      scrollBehavior="inside"
    >
      <ModalOverlay />
      <ModalContent
        color={colorMode === "dark" ? "gray.400" : null}
        bg={colorMode === "light" ? "white" : "gray.800"}
      >
        <Flex
          direction="column"
          height="100%"
          as="form"
          onSubmit={handleSubmit(onSubmit)}
        >
          <ModalHeader>Edit Membership</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl my={2} mb={4} userSelect="none">
              <InputGroup>
                <Input
                  type="hidden"
                  {...register("userPk", { required: true, value: userId })}
                  readOnly
                />
              </InputGroup>
            </FormControl>
            <Grid gridColumnGap={8} gridTemplateColumns={"repeat(1, 1fr)"}>
              {/* Organisation */}
              <FormControl my={2} mb={4} userSelect={"none"}>
                <FormLabel>Organisation</FormLabel>
                <InputGroup>
                  <Select
                    placeholder={
                      "Department of Biodiversity, Conservation and Attractions"
                    }
                    isDisabled={true}
                  >
                    <option value="dbca">
                      Department of Biodiversity, Conservation and Attractions
                    </option>
                  </Select>
                </InputGroup>
              </FormControl>

              {/* Affiliation */}
              <FormControl my={2} mb={4} userSelect={"none"}>
                <AffiliationCreateSearchDropdown
                  // autoFocus
                  isRequired={false}
                  preselectedAffiliationPk={currentAffiliationData?.pk}
                  setterFunction={(
                    selectedAffiliation: IAffiliation | undefined,
                  ) => {
                    if (selectedAffiliation) {
                      setValue("affiliation", selectedAffiliation.pk);
                    } else {
                      setValue("affiliation", undefined); // Clear the affiliation in the form
                    }
                  }}
                  isEditable
                  hideTags
                  label="Affiliation"
                  placeholder="Search for or an affiliation"
                  helperText="The entity this user is affiliated with"
                />
              </FormControl>

              {/* Branch */}
              <FormControl my={2} mb={4} userSelect={"none"}>
                <FormLabel>Branch</FormLabel>
                <InputGroup>
                  {!branchesLoading && branchesData && (
                    <Select
                      placeholder={"Select a Branch"}
                      defaultValue={currentBranchData?.pk || ""}
                      {...register("branch")}
                    >
                      {branchesData.map((branch: IBranch, index: number) => {
                        return (
                          <option key={index} value={branch.pk}>
                            {branch.name}
                          </option>
                        );
                      })}
                    </Select>
                  )}
                </InputGroup>
              </FormControl>

              {/* Business Area */}
              <FormControl my={2} mb={4} userSelect={"none"}>
                <FormLabel>Business Area</FormLabel>
                <InputGroup>
                  {!baLoading && baData && (
                    <Select
                      placeholder={"Select a Business Area"}
                      defaultValue={currentBaData?.pk || ""}
                      {...register("business_area")}
                    >
                      {baData.map((ba: IBusinessArea, index: number) => {
                        return (
                          <option key={index} value={ba.pk}>
                            {ba.name}
                          </option>
                        );
                      })}
                    </Select>
                  )}
                </InputGroup>
              </FormControl>
            </Grid>
          </ModalBody>
          <ModalFooter>
            <Button
              isLoading={mutation.isPending}
              type="submit"
              bgColor={colorMode === "light" ? `green.500` : `green.600`}
              color={colorMode === "light" ? `white` : `whiteAlpha.900`}
              _hover={{
                bg: colorMode === "light" ? `green.600` : `green.400`,
                color: colorMode === "light" ? `white` : `white`,
              }}
              ml={3}
            >
              Update
            </Button>
          </ModalFooter>
        </Flex>
      </ModalContent>
    </Modal>
  );
};
