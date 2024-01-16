import {
  Box,
  Button,
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
  Select,
  Text,
  VStack,
  useColorMode,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { IAddLocationForm, ISimpleLocationData } from "../../../types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MdMoreVert } from "react-icons/md";
import { useForm } from "react-hook-form";
import { deleteLocation, updateLocation } from "../../../lib/api";
import { AxiosError } from "axios";
import { TextButtonFlex } from "@/components/TextButtonFlex";

export const LocationItemDisplay = ({
  pk,
  name,
  area_type,
}: ISimpleLocationData) => {
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

  const { register, handleSubmit } = useForm<IAddLocationForm>();

  const toast = useToast();
  const queryClient = useQueryClient();

  const updateMutation = useMutation(updateLocation, {
    onSuccess: () => {
      toast({
        status: "success",
        title: "Updated",
        position: "top-right",
      });
      onUpdateModalClose();
      queryClient.invalidateQueries(["locations"]);
    },
    onError: () => {
      toast({
        status: "error",
        title: "Failed",
        position: "top-right",
      });
    },
  });

  const deleteMutation = useMutation(deleteLocation, {
    onSuccess: () => {
      toast({
        status: "success",
        title: "Deleted",
        position: "top-right",
      });
      onDeleteModalClose();
      queryClient.invalidateQueries(["locations"]);
    },
  });

  const deleteBtnClicked = () => {
    deleteMutation.mutate(pk);
  };

  const onUpdateSubmit = (formData: IAddLocationForm) => {
    updateMutation.mutate(formData);
  };

  const areaTypeMap: { [key: string]: string } = {
    dbcaregion: "DBCA Region",
    dbcadistrict: "DBCA District",
    ibra: "IBRA",
    imcra: "IMCRA",
    nrm: "NRM",
  };

  const { colorMode } = useColorMode();

  return (
    <>
      <Grid gridTemplateColumns={"1fr 3fr"} borderWidth={1} p={3}>
        <Flex
          // bg={"red"}
          // justifyContent={"center"}
          alignItems={"center"}
        >
          <TextButtonFlex name={name} onClick={onUpdateModalOpen} />
        </Flex>
        <Flex justifyContent={"space-between"} alignItems={"center"}>
          <Text>{areaTypeMap[area_type]}</Text>

          <Flex flexDir={"column"} alignItems={"center"}>
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
        </Flex>
      </Grid>
      <Modal isOpen={isDeleteModalOpen} onClose={onDeleteModalClose}>
        <ModalOverlay />
        <ModalContent bg={colorMode === "light" ? "white" : "gray.800"}>
          <ModalHeader>Delete Business Area</ModalHeader>
          <ModalBody>
            <Box>
              <Text fontSize="lg" fontWeight="semibold">
                Are you sure you want to delete this business area?
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
        <ModalHeader>Update Location</ModalHeader>
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
              <FormControl>
                <FormLabel>Name</FormLabel>
                <InputGroup>
                  {/* <InputLeftAddon children={<FaSign />} /> */}
                  <Input
                    {...register("name", { required: true })}
                    autoFocus
                    autoComplete="off"
                    required
                    type="text"
                    defaultValue={name} // Prefill with the 'name' prop
                  />
                </InputGroup>
              </FormControl>
              <FormControl>
                <FormLabel>Area Type</FormLabel>
                <Select
                  {...register("area_type", { required: true })}
                  defaultValue={area_type} // Prefill with the 'area_type' prop
                >
                  <option value={"dbcaregion"}>DBCA Region</option>
                  <option value={"dbcadistrict"}>DBCA District</option>
                  <option value={"ibra"}>
                    Interim Biogeographic Regionalisation of Australia
                  </option>
                  <option value={"imcra"}>
                    Integrated Marine and Coastal Regionisation of Australia
                  </option>
                  <option value={"nrm"}>
                    Natural Resource Management Region
                  </option>
                </Select>
              </FormControl>
              {updateMutation.isError ? (
                <Box mt={4}>
                  {Object.keys(
                    (updateMutation.error as AxiosError).response.data
                  ).map((key) => (
                    <Box key={key}>
                      {(
                        (updateMutation.error as AxiosError).response.data[
                          key
                        ] as string[]
                      ).map((errorMessage, index) => (
                        <Text key={`${key}-${index}`} color="red.500">
                          {`${key}: ${errorMessage}`}
                        </Text>
                      ))}
                    </Box>
                  ))}
                </Box>
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
                form="update-form"
                type="submit"
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
