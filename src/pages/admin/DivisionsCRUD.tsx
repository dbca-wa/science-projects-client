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
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { createDivision, getAllDivisions } from "@/lib/api";
import _ from "lodash";
import { useQueryClient } from "@tanstack/react-query";
import { IDivision } from "@/types";
import { DivisionItemDisplay } from "@/components/Pages/Admin/DivisionItemDisplay";
import { UserSearchDropdown } from "@/components/Navigation/UserSearchDropdown";
import { Head } from "@/components/Base/Head";

export const DivisionsCRUD = () => {
  const { register, handleSubmit, watch } = useForm<IDivision>();

  const [selectedDirector, setSelectedDirector] = useState<number>();
  const [selectedApprover, setSelectedApprover] = useState<number>();
  const nameData = watch("name");
  const slugData = watch("slug");

  const toast = useToast();
  const {
    isOpen: addIsOpen,
    onOpen: onAddOpen,
    onClose: onAddClose,
  } = useDisclosure();
  const [searchLoading, setSearchLoading] = useState<boolean>(false);

  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: createDivision,
    onSuccess: (data: IDivision) => {
      // console.log("success")
      toast({
        status: "success",
        title: "Created",
        position: "top-right",
      });
      console.log(data);
      onAddClose();
      queryClient.invalidateQueries({ queryKey: ["divisions"] });
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

  const onSubmit = (formData: IDivision) => {
    console.log(formData);
    mutation.mutate(formData);
  };
  const { isLoading, data: slices } = useQuery<IDivision[]>({
    queryFn: getAllDivisions,
    queryKey: ["divisions"],
  });
  const [searchTerm, setSearchTerm] = useState("");

  const [filteredSlices, setFilteredSlices] = useState<IDivision[]>([]);
  const [countOfItems, setCountOfItems] = useState(0);

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
    // Initialize filteredSlices with all items when no filters are applied
    if (!searchTerm && slices) {
      setFilteredSlices(slices);
      setCountOfItems(slices.length);
    }
  }, [searchTerm, slices]);

  const debouncedHandleSearchChange = useRef(
    _.debounce((searchTerm: string, slices: IDivision[]) => {
      let filteredSlices: IDivision[] = [];

      if (searchTerm) {
        for (const slice in slices) {
          filteredSlices = filteredSlices.concat(
            slices.filter((sl) =>
              sl.name.toLowerCase().includes(searchTerm.toLowerCase()),
            ),
          );
        }
      } else {
        for (const slice in slices) {
          filteredSlices = filteredSlices.concat(slices);
        }
      }

      setFilteredSlices(filteredSlices);
      setSearchLoading(false);
    }, 100),
  ).current;

  // const handleSearchChange = (e: React.FormEvent<HTMLInputElement>) => {
  //     setSearchTerm(e.currentTarget.value);
  // };

  const handleSearchChange = (e: React.FormEvent<HTMLInputElement>) => {
    const newSearchTerm = e.currentTarget.value;
    setSearchTerm(newSearchTerm);
    setSearchLoading(true);

    if (slices) {
      debouncedHandleSearchChange(newSearchTerm, slices);
    }
  };

  const { colorMode } = useColorMode();

  return (
    <>
      <Head title="Divisions" />
      {isLoading ? (
        <Center h={"200px"}>
          <Spinner />
        </Center>
      ) : (
        <>
          <Box maxW={"100%"} maxH={"100%"}>
            <Box>
              <Text fontWeight={"semibold"} fontSize={"lg"}>
                Divisions ({countOfItems})
              </Text>
            </Box>
            <Flex width={"100%"} mt={4}>
              <Input
                type="text"
                placeholder="Search division by name"
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
            {countOfItems === 0 ? (
              <Box py={10} fontWeight={"bold"}>
                <Text>No results</Text>
              </Box>
            ) : (
              <>
                <Grid
                  gridTemplateColumns="4fr 2fr 2fr 2fr 1fr"
                  mt={4}
                  width="100%"
                  p={3}
                  borderWidth={1}
                  borderBottomWidth={0}
                >
                  <Flex justifyContent="flex-start">
                    <Text as="b">Division</Text>
                  </Flex>
                  <Flex>
                    <Text as="b">Slug</Text>
                  </Flex>
                  <Flex>
                    <Text as="b">Director</Text>
                  </Flex>
                  <Flex>
                    <Text as="b">Approver</Text>
                  </Flex>
                  <Flex justifyContent="flex-end" mr={2}>
                    <Text as="b">Change</Text>
                  </Flex>
                </Grid>

                {searchLoading ? (
                  <Center w={"100%"} minH="100px" pt={10}>
                    <Spinner size={"xl"} />
                  </Center>
                ) : (
                  <Grid gridTemplateColumns={"repeat(1,1fr)"}>
                    {filteredSlices
                      .sort((a, b) => a.name.localeCompare(b.name))
                      .map((s) => (
                        <DivisionItemDisplay
                          key={s.pk}
                          pk={s.pk}
                          name={s.name}
                          director={s.director}
                          approver={s.approver}
                          slug={s.slug}
                          old_id={s.old_id}
                        />
                      ))}
                  </Grid>
                )}
              </>
            )}
          </Box>

          <Drawer isOpen={addIsOpen} onClose={onAddClose} size={"lg"}>
            <DrawerOverlay />
            <DrawerContent>
              <DrawerCloseButton />
              <DrawerHeader>Add Division</DrawerHeader>
              <DrawerBody>
                <VStack
                  spacing={6}
                  as="form"
                  id="add-form"
                  onSubmit={handleSubmit(onSubmit)}
                >
                  <FormControl>
                    <FormLabel>Name</FormLabel>
                    <Input
                      autoComplete="off"
                      autoFocus
                      {...register("name", { required: true })}
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Slug</FormLabel>
                    <InputGroup>
                      <Input
                        {...register("slug", { required: true })}
                        required
                        type="text"
                        placeholder="eg. BCS"
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
                      helperText={"The approver of the Division"}
                    />
                  </FormControl>
                  {mutation.isError ? (
                    <Text color={"red.500"}>Something went wrong</Text>
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
                    console.log("clicked");
                    onSubmit({
                      old_id: 1,
                      name: nameData,
                      slug: slugData,
                      approver: selectedApprover,
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
