// Component/Route for handling user creation and the accomponying validation

import { Head } from "@/shared/components/layout/base/Head";
import { UserArraySearchDropdown } from "@/features/users/components/UserArraySearchDropdown";
import { mergeUsers } from "@/features/users/services/users.service";
import type { IMergeUser, IUserData } from "@/shared/types";
import {
  Box,
  Button,
  Flex,
  FormControl,
  Grid,
  ListItem,
  Text,
  type ToastId,
  UnorderedList,
  useColorMode,
  useToast,
} from "@chakra-ui/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";

interface IProps {
  onSuccess?: () => void;
  onClose?: () => void;
  isModal?: boolean;
}

export const CaretakerSetContent = ({
  onSuccess,
  isModal,
  onClose,
}: IProps) => {
  const { colorMode } = useColorMode();
  const toast = useToast();
  const ToastIdRef = useRef<ToastId | undefined>(undefined);
  const queryClient = useQueryClient();

  const caretakerToast = (data) => {
    ToastIdRef.current = toast(data);
  };

  const [primaryUser, setPrimaryUser] = useState<IUserData | null>(null);
  const [secondaryUsers, setSecondaryUsers] = useState<IUserData[] | null>([]);

  const addSecondaryUserPkToArray = (user: IUserData) => {
    setSecondaryUsers((prev) => [...prev, user]);
  };

  const removeSecondaryUserPkFromArray = (user: IUserData) => {
    setSecondaryUsers((prev) => prev.filter((item) => item !== user));
  };

  const clearSecondaryUserArray = () => {
    setSecondaryUsers([]);
  };

  //   const caretakerAdminMutation = useMutation({
  //     mutationFn: setCaretaker,
  //     onMutate: () => {
  //       mergeToast({
  //         status: "loading",
  //         title: "Setting caretaker...",
  //         position: "top-right",
  //       });
  //     },
  //     onSuccess: () => {
  //       if (ToastIdRef.current) {
  //         toast.update(ToastIdRef.current, {
  //           title: "Merged!",
  //           description: `Caretaker set!`,
  //           status: "success",
  //           position: "top-right",
  //           duration: 3000,
  //           isClosable: true,
  //         });
  //       }
  //       clearSecondaryUserArray();
  //       setPrimaryUser(null);
  //       onClose?.();
  //       queryClient.invalidateQueries({ queryKey: ["users"] });
  //     },
  //     onError: () => {
  //       if (ToastIdRef.current) {
  //         toast.update(ToastIdRef.current, {
  //           title: "Failed",
  //           description: `Something went wrong!`,
  //           status: "error",
  //           position: "top-right",
  //           duration: 3000,
  //           isClosable: true,
  //         });
  //       }
  //     },
  //   });

  const onSubmitCaretaker = (formData: IMergeUser) => {
    // console.log("SUBMISSION DATA:", formData);
    console.log(formData);
    // Transform into just primary keys
    const primaryUserPk = primaryUser?.pk;
    const secondaryUserPks = secondaryUsers?.map((user) => user.pk);
    // Mutate with primary keys
    // caretakerAdminMutation.mutate({ primaryUserPk, secondaryUserPks });
  };

  return (
    <>
      <Head title={"Merge Users"} />
      {!isModal && (
        <Box>
          <Text mb={8} fontWeight={"bold"} fontSize={"2xl"}>
            Set User Caretaker
          </Text>
        </Box>
      )}

      <Box mb={3}>
        <Text color={colorMode === "light" ? "blue.500" : "blue.400"}>
          This form is for setting a caretaker for a user who is on leave or has
          left the department.
        </Text>
        <UnorderedList ml={6} mt={2}>
          <ListItem>
            The primary user is the user who needs a caretaker
          </ListItem>
          <ListItem
            textDecoration={"underline"}
            color={colorMode === "light" ? "red.500" : "red.400"}
          >
            The secondary user/s will be able to act on their behalf until
            caretaker status is removed.
          </ListItem>
        </UnorderedList>
      </Box>

      <Grid gridColumnGap={8} gridTemplateColumns={"repeat(1, 1fr)"}>
        <FormControl>
          <UserArraySearchDropdown
            isRequired
            autoFocus
            isEditable
            setterFunction={setPrimaryUser}
            ignoreUserPks={[...secondaryUsers.map((user) => user.pk)]}
            label="Primary User"
            placeholder="Search for primary user who is going away"
            helperText="This user will be able to act normally"
          />
        </FormControl>
        <FormControl>
          <UserArraySearchDropdown
            isRequired
            isEditable
            array={secondaryUsers}
            arrayAddFunction={addSecondaryUserPkToArray}
            arrayRemoveFunction={removeSecondaryUserPkFromArray}
            arrayClearFunction={clearSecondaryUserArray}
            ignoreUserPks={[primaryUser?.pk]}
            label="Secondary User/s"
            placeholder="Search for users"
            helperText="The user/s you would like to become caretaker for the primary user"
          />
        </FormControl>
      </Grid>

      {/* ======================================================= */}

      <Flex mt={5} justifyContent="end">
        <Button
          bgColor={colorMode === "light" ? `red.500` : `red.600`}
          color={colorMode === "light" ? `white` : `whiteAlpha.900`}
          _hover={{
            bg: colorMode === "light" ? `red.600` : `red.400`,
            color: colorMode === "light" ? `white` : `white`,
          }}
          ml={3}
          isDisabled={
            true
            // caretakerAdminMutation.isPending ||
            // secondaryUsers?.length < 1 ||
            // !primaryUser
          }
          //   isLoading={
          //     true
          //     caretakerAdminMutation.isPending
          //   }
          //   onClick={() => {
          //     onSubmitCaretaker({
          //       primaryUser,
          //       secondaryUsers,
          //     });
          //   }}
        >
          Set Caretaker
        </Button>
      </Flex>
    </>
  );
};
