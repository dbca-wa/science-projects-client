import {
  Box,
  Button,
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
import { useForm } from "react-hook-form";
import { MdMoreVert } from "react-icons/md";
import { deleteAffiliation, updateAffiliation } from "../../../lib/api";
import { IAffiliation } from "../../../types";
import { TextButtonFlex } from "../../TextButtonFlex";

export const AffiliationItemDisplay = ({ pk, name }: IAffiliation) => {
  const { register, handleSubmit, watch, reset } = useForm<IAffiliation>();

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

  const nameData = watch("name");

  const updateMutation = useMutation(updateAffiliation, {
    onSuccess: () => {
      toast({
        status: "success",
        title: "Updated",
        position: "top-right",
      });
      onUpdateModalClose();
      queryClient.invalidateQueries(["affiliations"]);
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

  const deleteMutation = useMutation(deleteAffiliation, {
    onSuccess: () => {
      toast({
        status: "success",
        title: "Deleted",
        position: "top-right",
      });
      onDeleteModalClose();
      queryClient.invalidateQueries(["affiliations"]);
    },
  });

  const deleteBtnClicked = () => {
    deleteMutation.mutate(pk);
  };

  const onSubmitBranchUpdate = (formData: IAffiliation) => {
    updateMutation.mutate(formData);
  };

  const { colorMode } = useColorMode();

  return (
    <>
      <Grid
        gridTemplateColumns="9fr 3fr"
        width="100%"
        p={3}
        borderWidth={1}
        // bg={"red"}
      >
        <TextButtonFlex name={name} onClick={onUpdateModalOpen} />

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
        </Flex>
      </Grid>
      <Modal isOpen={isDeleteModalOpen} onClose={onDeleteModalClose}>
        <ModalOverlay />
        <ModalContent bg={colorMode === "light" ? "white" : "gray.800"}>
          <ModalHeader>Delete Affiliation</ModalHeader>
          <ModalBody>
            <Box>
              <Text fontSize="lg" fontWeight="semibold">
                Are you sure you want to delete this Affiliation?
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
        <ModalHeader>Update Affiliation</ModalHeader>
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
              <FormControl>
                <FormLabel>Affiliation Name</FormLabel>
                <Input
                  {...register("name", { required: true })}
                  defaultValue={name}
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
                onClick={() => {
                  onSubmitBranchUpdate({
                    pk: pk,
                    name: nameData,
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
  );
};
