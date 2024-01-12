import {
  Box,
  Button,
  Center,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerFooter,
  DrawerOverlay,
  Flex,
  FormControl,
  FormLabel,
  Grid,
  HStack,
  Input,
  InputGroup,
  InputLeftAddon,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
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
  VStack,
  useColorMode,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { IBranch } from "../../../types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MdMoreVert } from "react-icons/md";
import { useForm } from "react-hook-form";
import { FaSign } from "react-icons/fa";
import { deleteBranch, updateBranch } from "../../../lib/api";
import { useFullUserByPk } from "../../../lib/hooks/useFullUserByPk";
import { UserProfile } from "../Users/UserProfile";
import { UserSearchDropdown } from "../../Navigation/UserSearchDropdown";
import { useState } from "react";
import { TextButtonFlex } from "../../TextButtonFlex";

export const BranchItemDisplay = ({ pk, agency, name, manager }: IBranch) => {
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

  const updateMutation = useMutation(updateBranch, {
    onSuccess: () => {
      // console.log("success")
      toast({
        status: "success",
        title: "Updated",
        position: "top-right",
      });
      onUpdateModalClose();
      queryClient.invalidateQueries(["branches"]);
      reset();
    },
    onError: () => {
      // console.log("error")
      toast({
        status: "error",
        title: "Failed",
        position: "top-right",
      });
    },
    onMutate: () => {
      // console.log("attempting update private")
    },
  });

  const deleteMutation = useMutation(deleteBranch, {
    onSuccess: () => {
      // console.log("success")
      toast({
        status: "success",
        title: "Deleted",
        position: "top-right",
      });
      onDeleteModalClose();
      queryClient.invalidateQueries(["branches"]);
    },
    onError: () => {
      // console.log("error")
    },
    onMutate: () => {
      // console.log("mutation")
    },
  });

  const deleteBtnClicked = () => {
    // console.log("deleted")
    deleteMutation.mutate(pk);
  };

  // const onUpdateSubmit = (formData: IBranch) => {
  //     updateMutation.mutate(formData);
  // }

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
        {/* <Flex justifyContent="flex-start" alignItems={"center"}>
                        <Button
                            variant={"link"}
                            colorScheme="blue"
                            onClick={onUpdateModalOpen}
                        >
                            {name ?? ""}
                        </Button>

                    </Flex> */}

        <TextButtonFlex
          name={
            managerData?.first_name
              ? `${managerData?.first_name} ${managerData?.last_name}`
              : `${managerData?.username}`
          }
          onClick={managerDrawerFunction}
        />
        {/* <Flex>
                        <Button
                            variant={"link"}
                            colorScheme="blue"
                            onClick={managerDrawerFunction}
                        >
                            {managerData?.first_name ? `${managerData?.first_name} ${managerData?.last_name}` : `${managerData?.username}`}
                        </Button>

                    </Flex> */}

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
              _focus={{ boxShadow: "outline" }}
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
          {/* </Button> */}
        </Flex>
      </Grid>
      <Modal isOpen={isDeleteModalOpen} onClose={onDeleteModalClose}>
        <ModalOverlay />
        <ModalContent bg={colorMode === "light" ? "white" : "gray.800"}>
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
              <Button
                onClick={onDeleteModalClose}
                color={"white"}
                background={colorMode === "light" ? "red.500" : "red.600"}
                _hover={{
                  background: colorMode === "light" ? "red.400" : "red.500",
                }}
              >
                No
              </Button>
              <Button
                onClick={deleteBtnClicked}
                color={"white"}
                background={colorMode === "light" ? "green.500" : "green.600"}
                _hover={{
                  background: colorMode === "light" ? "green.400" : "green.500",
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
              {/* <FormControl> */}
              {/* <FormLabel>Agency</FormLabel> */}
              {/* <InputGroup> */}
              {/* <InputLeftAddon children={<FaSign />} /> */}
              <Input
                {...register("agency", { required: true })}
                value={1}
                required
                type="hidden"
              />
              {/* </InputGroup> */}
              {/* </FormControl> */}
              <FormControl>
                <FormLabel>Branch Name</FormLabel>
                <Input
                  {...register("name", { required: true })}
                  defaultValue={name}
                />
              </FormControl>
              <FormControl>
                {/* <FormLabel>Manager</FormLabel> */}
                <UserSearchDropdown
                  {...register("manager", { required: true })}
                  onlyInternal={false}
                  isRequired={true}
                  setUserFunction={setSelectedUser}
                  preselectedUserPk={manager}
                  isEditable
                  label="Manager"
                  placeholder="Search for a user"
                  helperText={<>The manager of the branch.</>}
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
                  console.log("clicked");
                  onSubmitBranchUpdate({
                    // "old_id": 1, //default
                    pk: pk,
                    agency: 1, // dbca
                    name: nameData,
                    manager: selectedUser,
                  });
                }}
                isLoading={updateMutation.isLoading}
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
