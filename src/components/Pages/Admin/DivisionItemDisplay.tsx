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
  InputGroup,
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
import { deleteDivision, updateDivision } from "../../../lib/api";
import { useFullUserByPk } from "../../../lib/hooks/tanstack/useFullUserByPk";
import { IDivision } from "../../../types";
import { UserSearchDropdown } from "../../Navigation/UserSearchDropdown";
import { TextButtonFlex } from "../../TextButtonFlex";
import { UserProfile } from "../Users/UserProfile";

export const DivisionItemDisplay = ({
  pk,
  slug,
  name,
  director,
  approver,
  old_id,
}: IDivision) => {
  const { register, handleSubmit, watch } = useForm<IDivision>();

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

  const { userLoading: directorLoading, userData: directorData } =
    useFullUserByPk(director);
  const { userLoading: approverLoading, userData: approverData } =
    useFullUserByPk(approver);

  const [selectedDirector, setSelectedDirector] = useState<number>(director);
  const [selectedApprover, setSelectedApprover] = useState<number>(approver);
  const slugData = watch("slug");
  const nameData = watch("name");
  const updateMutation = useMutation({
    mutationFn: updateDivision,
    onSuccess: () => {
      toast({
        status: "success",
        title: "Updated",
        position: "top-right",
      });
      onUpdateModalClose();
      queryClient.invalidateQueries({ queryKey: ["divisions"] });
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
    mutationFn: deleteDivision,
    onSuccess: () => {
      toast({
        status: "success",
        title: "Deleted",
        position: "top-right",
      });
      onDeleteModalClose();
      queryClient.invalidateQueries({ queryKey: ["divisions"] });
    },
  });

  const deleteBtnClicked = () => {
    deleteMutation.mutate(pk);
  };

  const onUpdateSubmit = (formData: IDivision) => {
    console.log(formData);
    updateMutation.mutate(formData);
  };

  const {
    isOpen: isDirectorOpen,
    onOpen: onDirectorOpen,
    onClose: onDirectorClose,
  } = useDisclosure();
  const {
    isOpen: isApproverOpen,
    onOpen: onApproverOpen,
    onClose: onApproverClose,
  } = useDisclosure();
  const directorDrawerFunction = () => {
    console.log(`${directorData?.first_name} clicked`);
    onDirectorOpen();
  };
  const approverDrawerFunction = () => {
    console.log(`${approverData?.first_name} clicked`);
    onApproverOpen();
  };

  const { colorMode } = useColorMode();

  return !directorLoading &&
    directorData &&
    !approverLoading &&
    approverData ? (
    <>
      <Drawer
        isOpen={isDirectorOpen}
        placement="right"
        onClose={onDirectorClose}
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

      <Drawer
        isOpen={isApproverOpen}
        placement="right"
        onClose={onApproverClose}
        size={"sm"} //by default is xs
      >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerBody>
            <UserProfile pk={approver} />
          </DrawerBody>

          <DrawerFooter></DrawerFooter>
        </DrawerContent>
      </Drawer>

      <Grid
        gridTemplateColumns="4fr 2fr 2fr 2fr 1fr"
        width="100%"
        p={3}
        borderWidth={1}
        // bg={"red"}
      >
        <TextButtonFlex name={name} onClick={onUpdateModalOpen} />

        <Flex alignItems={"center"}>
          <Text fontWeight={"semibold"}>{slug}</Text>
        </Flex>
        <TextButtonFlex
          name={`${directorData.first_name} ${directorData.last_name}`}
          onClick={directorDrawerFunction}
        />
        <TextButtonFlex
          name={`${approverData.first_name} ${approverData.last_name}`}
          onClick={approverDrawerFunction}
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
          {/* </Button> */}
        </Flex>
      </Grid>
      <Modal isOpen={isDeleteModalOpen} onClose={onDeleteModalClose}>
        <ModalOverlay />
        <ModalContent
          color={colorMode === "dark" ? "gray.400" : null}
          bg={colorMode === "light" ? "white" : "gray.800"}
        >
          <ModalHeader>Delete Division</ModalHeader>
          <ModalBody>
            <Box>
              <Text fontSize="lg" fontWeight="semibold">
                Are you sure you want to delete this division?
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
        <ModalHeader>Update Division</ModalHeader>
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
            <FormControl>
              {/* Hidden input to capture the old_id */}
              <input
                type="hidden"
                {...register("old_id")}
                defaultValue={old_id} // Prefill with the 'pk' prop
              />
            </FormControl>

            <VStack
              spacing={6}
              as="form"
              id="update-form"
              onSubmit={handleSubmit(onUpdateSubmit)}
            >
              <FormControl>
                <FormLabel>Name</FormLabel>
                <InputGroup>
                  {/* <InputLeftAddon children={<FaSign />} /> */}
                  <Input
                    {...register("name", { required: true })}
                    required
                    type="text"
                    defaultValue={name} // Prefill with the 'name' prop
                  />
                </InputGroup>
              </FormControl>
              <FormControl>
                <FormLabel>Slug</FormLabel>

                {/* Hidden input to capture the slug */}
                <Input
                  type="text"
                  {...register("slug")}
                  defaultValue={slug} // Prefill with the 'pk' prop
                />
              </FormControl>
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
                  helperText={"The director of the Division"}
                />
              </FormControl>
              <FormControl>
                <UserSearchDropdown
                  {...register("approver", { required: true })}
                  onlyInternal={false}
                  isRequired={true}
                  setUserFunction={setSelectedApprover}
                  label="Approver"
                  placeholder="Search for a user..."
                  preselectedUserPk={approver}
                  isEditable
                  helperText={"The approver of the Division"}
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
                isLoading={updateMutation.isPending}
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
                    slug: slugData,
                    director: selectedDirector,
                    approver: selectedApprover,
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
