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
import { useState } from "react";
import { useForm } from "react-hook-form";
import { MdMoreVert } from "react-icons/md";
import { deleteAddress, updateAddress } from "@/shared/lib/api";
import type { IAddress, IBranch } from "@/shared/types/index.d";
import { BranchSearchDropdown } from "../../Navigation/BranchSearchDropdown";
import { TextButtonFlex } from "../../TextButtonFlex";

export const AddressItemDisplay = ({
  pk,
  street,
  city,
  zipcode,
  state,
  country,
  branch,
  pobox,
}: IAddress) => {
  const { register, handleSubmit, watch } = useForm<IAddress>();

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
  const { colorMode } = useColorMode();

  const branchObj = typeof branch === "object" ? (branch as IBranch) : null;
  const streetData = watch("street");
  const cityData = watch("city");
  const zipcodeData = watch("zipcode");
  const stateData = watch("state");
  const countryData = watch("country");
  const poboxData = watch("pobox");

  const updateMutation = useMutation({
    mutationFn: updateAddress,
    onSuccess: () => {
      toast({
        status: "success",
        title: "Updated",
        position: "top-right",
      });
      onUpdateModalClose();
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
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
    mutationFn: deleteAddress,
    onSuccess: () => {
      // console.log("success")
      toast({
        status: "success",
        title: "Deleted",
        position: "top-right",
      });
      onDeleteModalClose();
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
    },
  });

  const deleteBtnClicked = () => {
    deleteMutation.mutate(pk);
  };
  const onUpdateSubmit = (formData: IAddress) => {
    updateMutation.mutate(formData);
  };

  const [selectedBranch, setSelectedBranch] = useState<number>();

  return (
    <>
      <Grid
        gridTemplateColumns="2fr 4fr 2fr 2fr 1fr 1fr"
        width="100%"
        p={3}
        borderWidth={1}
        // bg={"red"}
      >
        <TextButtonFlex
          name={branchObj?.name ?? ""}
          onClick={onUpdateModalOpen}
        />
        <Flex alignItems={"center"}>
          <Text>{street}</Text>
        </Flex>
        <Flex alignItems={"center"}>
          <Text>{city}</Text>
        </Flex>
        <Flex alignItems={"center"}>
          <Text>{country}</Text>
        </Flex>
        <Flex alignItems={"center"}>
          <Text>{pobox ? pobox : "-"}</Text>
        </Flex>

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
              alignItems={"center"}
              justifyContent={"center"}
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
          <ModalHeader>Delete Address</ModalHeader>
          <ModalBody>
            <Box>
              <Text fontSize="lg" fontWeight="semibold">
                Are you sure you want to delete the address for this branch?
              </Text>

              <Text
                fontSize="lg"
                fontWeight="semibold"
                color={"blue.500"}
                mt={4}
              >
                "{branchObj?.name}"
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

      <Modal
        isOpen={isUpdateaModalOpen}
        onClose={onUpdateModalClose}
        size={"xl"}
      >
        <ModalOverlay />
        <ModalHeader>Update Address</ModalHeader>
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
              <input
                {...register("agency", { required: true })}
                type="hidden"
                defaultValue={1} // Prefill with the 'name' prop
              />
            </FormControl>
            <VStack
              spacing={6}
              as="form"
              id="update-form"
              onSubmit={handleSubmit(onUpdateSubmit)}
            >
              <BranchSearchDropdown
                {...register("branch", { required: true })}
                isRequired={true}
                setBranchFunction={setSelectedBranch}
                preselectedBranchPk={branchObj.pk}
                // isEditable
                label="Branch"
                placeholder="Search for a Branch"
                helperText={"The branch the address belongs to."}
              />
              <FormControl>
                <FormLabel>Street</FormLabel>
                <Input
                  {...register("street", { required: true })}
                  defaultValue={street} // Prefill
                />
              </FormControl>

              <FormControl>
                <FormLabel>Zip Code</FormLabel>
                <Input
                  {...register("zipcode", { required: true })}
                  defaultValue={zipcode}
                  type="number"
                />
              </FormControl>
              <FormControl>
                <FormLabel>City</FormLabel>
                <Input
                  {...register("city", { required: true })}
                  defaultValue={city}
                />
              </FormControl>
              <FormControl>
                <FormLabel>State</FormLabel>
                <Input
                  {...register("state", { required: true })}
                  defaultValue={state}
                />
              </FormControl>

              <FormControl>
                <FormLabel>Country</FormLabel>
                <Input
                  {...register("country", { required: true })}
                  defaultValue={country}
                />
              </FormControl>

              <FormControl>
                <FormLabel>PO Box</FormLabel>
                <Input
                  {...register("pobox", { required: true })}
                  defaultValue={pobox}
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
                  onUpdateSubmit({
                    // "old_id": 1, //default
                    pk: pk,
                    street: streetData,
                    city: cityData,
                    zipcode: zipcodeData,
                    state: stateData,
                    country: countryData,
                    pobox: poboxData,
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
  );
};
