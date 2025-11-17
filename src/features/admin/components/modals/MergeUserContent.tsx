// Component/Route for handling user creation and the accomponying validation

import { Head } from "@/shared/components/Base/Head";
import { UserArraySearchDropdown } from "@/shared/components/Navigation/UserArraySearchDropdown";
import { mergeUsers } from "@/shared/lib/api";
import type { IMergeUser, IUserData } from "@/shared/types/index.d";
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
import { AxiosError } from "axios";
import { useRef, useState } from "react";

interface IProps {
  onSuccess?: () => void;
  onClose?: () => void;
  isModal?: boolean;
}

export const MergeUserContent = ({ onSuccess, isModal, onClose }: IProps) => {
  const { colorMode } = useColorMode();
  const toast = useToast();
  const ToastIdRef = useRef<ToastId | undefined>(undefined);
  const queryClient = useQueryClient();

  const mergeToast = (data) => {
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

  const mergeMutation = useMutation({
    mutationFn: mergeUsers,
    onMutate: () => {
      mergeToast({
        status: "loading",
        title: "Merging...",
        position: "top-right",
      });
    },
    onSuccess: () => {
      if (ToastIdRef.current) {
        toast.update(ToastIdRef.current, {
          title: "Merged!",
          description: `The users are now one!`,
          status: "success",
          position: "top-right",
          duration: 3000,
          isClosable: true,
        });
      }
      clearSecondaryUserArray();
      setPrimaryUser(null);
      onClose?.();
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (error: AxiosError) => {
      if (ToastIdRef.current) {
        toast.update(ToastIdRef.current, {
          title: "Failed",
          description: `${Object.values(error.response.data)[0] || "An error occurred"}`,
          status: "error",
          position: "top-right",
          duration: 3000,
          isClosable: true,
        });
      }
    },
  });

  const onSubmitMerge = (formData: IMergeUser) => {
    // console.log("SUBMISSION DATA:", formData);
    console.log(formData);
    // Transform into just primary keys
    const primaryUserPk = primaryUser?.pk;
    const secondaryUserPks = secondaryUsers?.map((user) => user.pk);
    // Mutate with primary keys
    mergeMutation.mutate({ primaryUserPk, secondaryUserPks });
    // mergeMutation.mutate(formData);
  };

  return (
    <>
      <Head title={"Merge Users"} />
      {!isModal && (
        <Box>
          <Text mb={8} fontWeight={"bold"} fontSize={"2xl"}>
            Merge Users
          </Text>
        </Box>
      )}

      <Box mb={3}>
        <Text color={colorMode === "light" ? "blue.500" : "blue.400"}>
          This form is for merging duplicate users. Please ensure that the user
          you merge has the correct information.
        </Text>
        <UnorderedList ml={6} mt={2}>
          <ListItem>
            The primary user will receive any projects belonging to the
            secondary user/s
          </ListItem>
          <ListItem>
            The primary user will receive any comments belonging to the
            secondary user/s
          </ListItem>
          <ListItem>
            The primary user will receive any documents and roles belonging to
            the secondary user/s on projects, where applicable (if primary user
            is already on the project and has a higher role, they will maintain
            the higher role)
          </ListItem>
          <ListItem
            textDecoration={"underline"}
            color={colorMode === "light" ? "red.500" : "red.400"}
          >
            The secondary user/s will be deleted from the system. This is
            permanent.
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
            placeholder="Search for primary user to merge into"
            helperText="This user will be the primary user after the merge, others will be deleted"
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
            placeholder="Search for an user"
            helperText="The user/s you would like to merge into the primary user"
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
            mergeMutation.isPending ||
            secondaryUsers?.length < 1 ||
            !primaryUser
          }
          isLoading={mergeMutation.isPending}
          onClick={() => {
            onSubmitMerge({
              primaryUser,
              secondaryUsers,
            });
          }}
        >
          Merge
        </Button>
      </Flex>
    </>
  );
};
