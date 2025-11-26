import {
  Box,
  Button,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerFooter,
  DrawerOverlay,
  Flex,
  FormControl,
  FormLabel,
  Grid,
  Input,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  VStack,
  useColorMode,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { MdMoreVert } from "react-icons/md";
import { deleteBranch, updateBranch } from "@/features/admin/services/admin.service";
import { useFullUserByPk } from "@/features/users/hooks/useFullUserByPk";
import type { IBranch } from "@/shared/types";
import { UserSearchDropdown } from "@/features/users/components/UserSearchDropdown";
import { TextButtonFlex } from "@/shared/components/TextButtonFlex";
import { UserProfile } from "@/features/users/components/UserProfile";

export const BranchItemDisplay = ({ pk, name, manager }: IBranch) => {
  const { register, handleSubmit, watch, reset } = useForm<IBranch>();

  const toast = useToast();
  const {
    isOpen: isDeleteModalOpen,
    onOpen: onDeleteModalOpen,
    onClose: onDeleteModalClose,
  } = useDisclosure();
  const {
    isOpen: isUpdateaModalOpen,
    onOpen: onUpdateModalOpen,
    onClose: onUpdateModalClose,
  } = useDisclosure();
  const queryClient = useQueryClient();

  const { userLoading: managerLoading, userData: managerData } =
    useFullUserByPk(manager);

  const nameData = watch("name");
  const [selectedUser, setSelectedUser] = useState<number>(manager);

  const updateMutation = useMutation({
    mutationFn: updateBranch,
    onSuccess: () => {
      toast({
        status: "success",
        title: "Updated",
        position: "top-right",
      });
      onUpdateModalClose();
      queryClient.invalidateQueries({ queryKey: ["branches"] });
      reset();
    },
    onError: () => {
      toast({
        status: "error",
        title: "Failed",
        position: "top-right",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteBranch,
    onSuccess: () => {
      toast({
        status: "success",
        title: "Deleted",
        position: "top-right",
      });
      onDeleteModalClose();
      queryClient.invalidateQueries({ queryKey: ["branches"] });
    },
  });

  const deleteBtnClicked = () => {
    deleteMutation.mutate(pk);
  };

  const onSubmitBranchUpdate = (formData: IBranch) => {
    updateMutation.mutate(formData);
  };

  const {
    isOpen: isManagerOpen,
    onOpen: onManagerOpen,
    onClose: onManagerClose,
  } = useDisclosure();

  const managerDrawerFunction = () => {
    console.log(`${managerData?.first_name} clicked`);
    onManagerOpen();
  };

  const { colorMode } = useColorMode();

  return !managerLoading && managerData ? (
    <>
      <Drawer
        isOpen={isManagerOpen}
        placement="right"
        onClose={onManagerClose}
        size={"sm"} //by default is xs
      >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerBody>
            <UserProfile pk={manager} />
          </DrawerBody>

          <DrawerFooter></DrawerFooter>
        </DrawerContent>
      </Drawer>

      <Grid
        gridTemplateColumns="6fr 3fr 3fr"
        width="100%"
        p={3}
        borderWidth={1}
        // bg={"red"}
      >
        <TextButtonFlex name={name} onClick={onUpdateModalOpen} />
        <TextButtonFlex
          name={
            managerData?.first_name
              ? `${managerData?.first_name} ${managerData?.last_name}`
              : `${managerData?.username}`
          }
          onClick={managerDrawerFunction}
        />

        <Flex justifyContent="flex-end" mr={2} alignItems={"center"}>
          <Menu>
            <MenuButton
              px={2}
              py={2}
              transition="all 0.2s"
              rounded={4}
              borderRadius="md"
              borderWidth="1px"
              _hover={{ bg: "gray.400" }}
              _expanded={{ bg: "blue.400" }}
              _focus={{ boxShadow: "outline-solid" }}
            >
              <Flex alignItems={"center"} justifyContent={"center"}>
                <MdMoreVert />
              </Flex>
            </MenuButton>
            <MenuList>
              <MenuItem onClick={onUpdateModalOpen}>Edit</MenuItem>
              <MenuItem onClick={onDeleteModalOpen}>Delete</MenuItem>
            </MenuList>
          </Menu>
        </Flex>
      </Grid>
      <Modal isOpen={isDeleteModalOpen} onClose={onDeleteModalClose}>
        <ModalOverlay />
        <ModalContent
          color={colorMode === "dark" ? "gray.400" : null}
          bg={colorMode === "light" ? "white" : "gray.800"}
        >
          <ModalHeader>Delete Branch</ModalHeader>
          <ModalBody>
            <Box>
              <Text fontSize="lg" fontWeight="semibold">
                Are you sure you want to delete this branch?
              </Text>

              <Text
                fontSize="lg"
                fontWeight="semibold"
                color={"blue.500"}
                mt={4}
              >
                "{name}"
              </Text>
            </Box>
          </ModalBody>
          <ModalFooter justifyContent="flex-end">
            <Flex>
              <Button onClick={onDeleteModalClose} colorScheme={"gray"}>
                No
              </Button>
              <Button
                onClick={deleteBtnClicked}
                color={"white"}
                background={colorMode === "light" ? "red.500" : "red.600"}
                _hover={{
                  background: colorMode === "light" ? "red.400" : "red.500",
                }}
                ml={3}
              >
                Yes
              </Button>
            </Flex>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <Modal isOpen={isUpdateaModalOpen} onClose={onUpdateModalClose}>
        <ModalOverlay />
        <ModalHeader>Update Branch</ModalHeader>
        <ModalBody>
          <ModalContent
            color={colorMode === "dark" ? "gray.400" : null}
            bg={colorMode === "light" ? "white" : "gray.800"}
            p={4}
            px={6}
          >
            <FormControl>
              {/* Hidden input to capture the pk */}
              <input
                type="hidden"
                {...register("pk")}
                defaultValue={pk} // Prefill with the 'pk' prop
              />
            </FormControl>

            <VStack
              spacing={10}
              as="form"
              id="update-form"
              onSubmit={handleSubmit(onSubmitBranchUpdate)}
            >
              <Input
                {...register("agency", { required: true })}
                value={1}
                required
                type="hidden"
              />
              <FormControl>
                <FormLabel>Branch Name</FormLabel>
                <Input
                  {...register("name", { required: true })}
                  defaultValue={name}
                />
              </FormControl>
              <FormControl>
                <UserSearchDropdown
                  {...register("manager", { required: true })}
                  onlyInternal={false}
                  isRequired={true}
                  setUserFunction={setSelectedUser}
                  preselectedUserPk={manager}
                  isEditable
                  label="Manager"
                  placeholder="Search for a user"
                  helperText={"The manager of the branch."}
                />
                {/* <Input
                                            {...register("manager", { required: true })}
                                        /> */}
              </FormControl>
              {updateMutation.isError ? (
                <Text color={"red.500"}>Something went wrong</Text>
              ) : null}
            </VStack>

            <Grid
              mt={10}
              w={"100%"}
              justifyContent={"end"}
              gridTemplateColumns={"repeat(2, 1fr)"}
              gridGap={4}
            >
              <Button onClick={onUpdateModalClose} size="lg">
                Cancel
              </Button>
              <Button
                // form="update-form"
                // type="submit"
                onClick={() => {
                  onSubmitBranchUpdate({
                    // "old_id": 1, //default
                    pk: pk,
                    agency: 1, // dbca
                    name: nameData,
                    manager: selectedUser,
                  });
                }}
                isLoading={updateMutation.isPending}
                color={"white"}
                background={colorMode === "light" ? "blue.500" : "blue.600"}
                _hover={{
                  background: colorMode === "light" ? "blue.400" : "blue.500",
                }}
                size="lg"
              >
                Update
              </Button>
            </Grid>
          </ModalContent>
        </ModalBody>
      </Modal>
    </>
  ) : null;
};
