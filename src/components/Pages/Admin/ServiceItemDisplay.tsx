import {
  Box,
  Button,
  Center,
  Checkbox,
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
import { IDepartmentalService } from "../../../types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MdMoreVert } from "react-icons/md";
import { useForm } from "react-hook-form";
import { FaSign } from "react-icons/fa";
import { useFullUserByPk } from "../../../lib/hooks/useFullUserByPk";
import { UserProfile } from "../Users/UserProfile";
import { FcOk, FcCancel } from "react-icons/fc";
import {
  deleteDepartmentalService,
  updateDepartmentalService,
} from "../../../lib/api";
import { useState } from "react";
import { UserSearchDropdown } from "../../Navigation/UserSearchDropdown";
import { TextButtonFlex } from "../../TextButtonFlex";
import { UnboundStatefulEditor } from "@/components/RichTextEditor/Editors/UnboundStatefulEditor";

export const ServiceItemDisplay = ({
  pk,
  name,
  director,
}: IDepartmentalService) => {
  const { register, handleSubmit, watch } = useForm<IDepartmentalService>();
  const [selectedDirector, setSelectedDirector] = useState<number>();
  // const nameData = watch("name");
  const [nameData, setNameData] = useState(name);

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
  const { userLoading, userData } = useFullUserByPk(director);

  const {
    isOpen: isUserOpen,
    onOpen: onUserOpen,
    onClose: onUserClose,
  } = useDisclosure();
  const drawerFunction = () => {
    console.log(`${userData?.first_name} clicked`);
    onUserOpen();
  };

  const updateMutation = useMutation(updateDepartmentalService, {
    onSuccess: () => {
      // console.log("success")
      toast({
        status: "success",
        title: "Updated",
        position: "top-right",
      });
      onUpdateModalClose();
      queryClient.invalidateQueries(["departmentalServices"]);
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

  const deleteMutation = useMutation(deleteDepartmentalService, {
    onSuccess: () => {
      // console.log("success")
      toast({
        status: "success",
        title: "Deleted",
        position: "top-right",
      });
      onDeleteModalClose();
      queryClient.invalidateQueries(["departmentalServices"]);
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

  const onUpdateSubmit = (formData: IDepartmentalService) => {
    updateMutation.mutate(formData);
  };

  const { colorMode } = useColorMode();

  return !userLoading && userData ? (
    <>
      <Drawer
        isOpen={isUserOpen}
        placement="right"
        onClose={onUserClose}
        size={"sm"} //by default is xs
      >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerBody>
            <UserProfile pk={director} />
          </DrawerBody>

          <DrawerFooter></DrawerFooter>
        </DrawerContent>
      </Drawer>
      <Grid
        gridTemplateColumns="5fr 4fr 1fr"
        width="100%"
        p={3}
        borderWidth={1}
        // gridColumnGap={8}
      >
        <TextButtonFlex name={name} onClick={onUpdateModalOpen} />
        {/* <Flex justifyContent="flex-start"

                            overflow="auto"
                            textOverflow="ellipsis"
                            maxW="100%"
                            pr={8}
                        >
                            <Text
                                variant={"link"}
                                color="blue.500"
                                fontWeight={"semibold"}
                                onClick={onUpdateModalOpen}
                                whiteSpace="normal"
                                textOverflow="ellipsis"
                                cursor={"pointer"}
                                _hover={
                                    {
                                        textDecoration: "underline",
                                    }
                                }
                            >
                                {name ?? ""}
                            </Text>
                        </Flex> */}

        <Flex>
          <TextButtonFlex
            name={`${userData.first_name} ${userData.last_name}`}
            onClick={drawerFunction}
          />
        </Flex>
        <Flex justifyContent="flex-end" alignItems={"center"}>
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
              mr={4}
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
        <ModalContent bg={colorMode === "light" ? "white" : "gray.800"}>
          <ModalHeader>Delete Service</ModalHeader>
          <ModalBody>
            <Box>
              <Text fontSize="lg" fontWeight="semibold">
                Are you sure you want to delete this service?
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
      </Modal>{" "}
      <Modal
        isOpen={isUpdateaModalOpen}
        onClose={onUpdateModalClose}
        size={"xl"}
      >
        <ModalOverlay />
        <ModalHeader>Update Research Function</ModalHeader>
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
              onSubmit={handleSubmit(onUpdateSubmit)}
            >
              {/* <FormControl>
                <FormLabel>Name</FormLabel>
                <InputGroup>
                  <Input
                    autoComplete="off"
                    autoFocus
                    {...register("name", { required: true })}
                    required
                    type="text"
                    defaultValue={name} // Prefill
                  />
                </InputGroup>
              </FormControl> */}
              <UnboundStatefulEditor
                title="Service Name"
                helperText={"Name of Service"}
                showToolbar={false}
                showTitle={true}
                isRequired={true}
                value={nameData}
                setValueFunction={setNameData}
                setValueAsPlainText={true}
              />

              <FormControl>
                <UserSearchDropdown
                  {...register("director", { required: true })}
                  onlyInternal={false}
                  isRequired={true}
                  setUserFunction={setSelectedDirector}
                  label="Director"
                  placeholder="Search for a user..."
                  preselectedUserPk={director}
                  isEditable
                  helperText={<>The director of the Service</>}
                />
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
                isLoading={updateMutation.isLoading}
                color={"white"}
                background={colorMode === "light" ? "blue.500" : "blue.600"}
                _hover={{
                  background: colorMode === "light" ? "blue.400" : "blue.500",
                }}
                size="lg"
                onClick={() => {
                  console.log("clicked");
                  onUpdateSubmit({
                    pk: pk,
                    name: nameData,
                    director: selectedDirector,
                  });
                }}
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
