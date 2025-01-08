import {
  Text,
  Box,
  Button,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerFooter,
  Flex,
  FormControl,
  Input,
  InputGroup,
  VStack,
  useDisclosure,
  Center,
  Spinner,
  Grid,
  DrawerOverlay,
  DrawerCloseButton,
  DrawerHeader,
  FormLabel,
  useToast,
  useColorMode,
} from "@chakra-ui/react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import {
  createDepartmentalService,
  getAllDepartmentalServices,
} from "../../../lib/api/api";
import { useQueryClient } from "@tanstack/react-query";
import { IDepartmentalService } from "../../../types";
import { ServiceItemDisplay } from "./ServiceItemDisplay";
import { AxiosError } from "axios";
import { UserSearchDropdown } from "../../Navigation/UserSearchDropdown";
import { Head } from "@/components/Base/Head";

export const ServicesCRUD = () => {
  const { register, handleSubmit, watch } = useForm<IDepartmentalService>();
  const [selectedDirector, setSelectedDirector] = useState<number>();
  const nameData = watch("name");

  const toast = useToast();
  const {
    isOpen: addIsOpen,
    onOpen: onAddOpen,
    onClose: onAddClose,
  } = useDisclosure();

  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: createDepartmentalService,
    onSuccess: () => {
      toast({
        status: "success",
        title: "Created",
        position: "top-right",
      });
      onAddClose();
      queryClient.invalidateQueries({ queryKey: ["departmentalServices"] });
    },
    onError: () => {
      console.log("error");
      toast({
        status: "error",
        title: "Failed",
        position: "top-right",
      });
    },
    onMutate: () => {
      console.log("mutation");
    },
  });
  const onSubmit = (formData: IDepartmentalService) => {
    mutation.mutate(formData);
  };
  const { isLoading, data: slices } = useQuery<IDepartmentalService[]>({
    queryFn: getAllDepartmentalServices,
    queryKey: ["departmentalServices"],
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredSlices, setFilteredSlices] = useState<IDepartmentalService[]>(
    [],
  );
  const [countOfItems, setCountOfItems] = useState(0);

  const handleSearchChange = (e: React.FormEvent<HTMLInputElement>) => {
    setSearchTerm(e.currentTarget.value);
  };

  useEffect(() => {
    if (slices) {
      const filtered = slices.filter((s) => {
        const nameMatch = s.name
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
        return nameMatch;
      });

      setFilteredSlices(filtered);
      setCountOfItems(filtered.length);
    }
  }, [slices, searchTerm]);

  useEffect(() => {
    // Initialize filteredSlices with all items
    if (!searchTerm && slices) {
      setFilteredSlices(slices);
      setCountOfItems(slices.length);
    }
  }, [searchTerm, slices]);

  const { colorMode } = useColorMode();
  return (
    <>
      <Head title="Services" />

      {isLoading ? (
        <Center h={"200px"}>
          <Spinner />
        </Center>
      ) : (
        <>
          <Box maxW={"100%"} maxH={"100%"}>
            <Box>
              <Text fontWeight={"semibold"} fontSize={"lg"}>
                Departmental Services ({countOfItems})
              </Text>
            </Box>
            <Flex width={"100%"} mt={4}>
              <Input
                type="text"
                placeholder="Search service by name"
                value={searchTerm}
                onChange={handleSearchChange}
                w={"65%"}
              />

              <Flex justifyContent={"flex-end"} w={"100%"}>
                <Button
                  onClick={onAddOpen}
                  color={"white"}
                  background={colorMode === "light" ? "green.500" : "green.600"}
                  _hover={{
                    background:
                      colorMode === "light" ? "green.400" : "green.500",
                  }}
                >
                  Add
                </Button>
              </Flex>
            </Flex>
            <Grid
              gridTemplateColumns="5fr 4fr 1fr"
              mt={4}
              width="100%"
              p={3}
              borderWidth={1}
              borderBottomWidth={filteredSlices.length === 0 ? 1 : 0}
            >
              <Flex justifyContent="flex-start">
                <Text as="b">Service</Text>
              </Flex>
              <Flex>
                <Text as="b">Executive Director</Text>
              </Flex>
              <Flex justifyContent="flex-end" mr={2}>
                <Text as="b">Change</Text>
              </Flex>
            </Grid>

            <Grid gridTemplateColumns={"repeat(1,1fr)"}>
              {filteredSlices
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((s) => (
                  <ServiceItemDisplay
                    key={s.pk}
                    pk={s.pk}
                    name={s.name}
                    director={s.director}
                  />
                ))}
            </Grid>
          </Box>

          <Drawer isOpen={addIsOpen} onClose={onAddClose} size={"lg"}>
            <DrawerOverlay />
            <DrawerContent>
              <DrawerCloseButton />
              <DrawerHeader>Add Service</DrawerHeader>
              <DrawerBody>
                <VStack
                  spacing={10}
                  as="form"
                  id="add-form"
                  onSubmit={handleSubmit(onSubmit)}
                >
                  <FormControl>
                    <FormLabel>Name</FormLabel>
                    <InputGroup>
                      {/* <InputLeftAddon children={<FaSign />} /> */}
                      <Input
                        autoComplete="off"
                        autoFocus
                        {...register("name", { required: true })}
                        required
                        type="text"
                      />
                    </InputGroup>
                  </FormControl>

                  <FormControl>
                    <UserSearchDropdown
                      {...register("director", { required: true })}
                      onlyInternal={false}
                      isRequired={true}
                      setUserFunction={setSelectedDirector}
                      label="Director"
                      placeholder="Search for a user..."
                      isEditable
                      helperText={"The director of the Service"}
                    />
                  </FormControl>
                  {mutation.isError ? (
                    <Box mt={4}>
                      {Object.keys(
                        (mutation.error as AxiosError).response.data,
                      ).map((key) => (
                        <Box key={key}>
                          {(
                            (mutation.error as AxiosError).response.data[
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
              </DrawerBody>
              <DrawerFooter>
                <Button
                  // form="add-form"
                  // type="submit"
                  isLoading={mutation.isPending}
                  color={"white"}
                  background={colorMode === "light" ? "blue.500" : "blue.600"}
                  _hover={{
                    background: colorMode === "light" ? "blue.400" : "blue.500",
                  }}
                  size="lg"
                  width={"100%"}
                  onClick={() => {
                    onSubmit({
                      old_id: 1,
                      name: nameData,
                      director: selectedDirector,
                    });
                  }}
                >
                  Create
                </Button>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>
        </>
      )}
    </>
  );
};
