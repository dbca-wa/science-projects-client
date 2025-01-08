import {
  Box,
  Button,
  Center,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  Flex,
  FormControl,
  FormLabel,
  Grid,
  Input,
  Spinner,
  Text,
  VStack,
  useColorMode,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { createBranch, getAllBranches } from "../../../lib/api/api";
import { IBranch } from "../../../types";
import { UserSearchDropdown } from "../../Navigation/UserSearchDropdown";
import { BranchItemDisplay } from "./BranchItemDisplay";
import { Head } from "@/components/Base/Head";

export const BranchesCRUD = () => {
  const { register, handleSubmit, watch } = useForm<IBranch>();
  const toast = useToast();
  const {
    isOpen: addIsOpen,
    onOpen: onAddOpen,
    onClose: onAddClose,
  } = useDisclosure();
  const [selectedUser, setSelectedUser] = useState<number>();

  const nameData = watch("name");

  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: createBranch,
    onSuccess: () => {
      toast({
        status: "success",
        title: "Created",
        position: "top-right",
      });
      onAddClose();
      queryClient.invalidateQueries({ queryKey: ["branches"] });
    },
    onError: () => {
      toast({
        status: "error",
        title: "Failed",
        position: "top-right",
      });
    },
  });

  const onSubmitBranchCreation = (formData: IBranch) => {
    mutation.mutate(formData);
  };

  const onSubmit = (formData: IBranch) => {
    formData.manager = selectedUser;
    mutation.mutate(formData);
  };

  const { isLoading, data: slices } = useQuery<IBranch[]>({
    queryFn: getAllBranches,
    queryKey: ["branches"],
  });
  const [searchTerm, setSearchTerm] = useState("");

  const [filteredSlices, setFilteredSlices] = useState<IBranch[]>([]);
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
    // Initialize filteredSlices with all items when no filters are applied
    if (!searchTerm && slices) {
      setFilteredSlices(slices);
      setCountOfItems(slices.length);
    }
  }, [searchTerm, slices]);

  const { colorMode } = useColorMode();
  return (
    <>
      <Head title="Branches" />
      {isLoading ? (
        <Center h={"200px"}>
          <Spinner />
        </Center>
      ) : (
        <>
          <Box maxW={"100%"} maxH={"100%"}>
            <Box>
              <Text fontWeight={"semibold"} fontSize={"lg"}>
                Branches ({countOfItems})
              </Text>
            </Box>
            <Flex width={"100%"} mt={4}>
              <Input
                type="text"
                placeholder="Search branch by name"
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
              gridTemplateColumns="6fr 3fr 3fr"
              mt={4}
              width="100%"
              p={3}
              borderWidth={1}
              borderBottomWidth={filteredSlices.length === 0 ? 1 : 0}
            >
              <Flex justifyContent="flex-start">
                <Text as="b">Branch</Text>
              </Flex>
              <Flex>
                <Text as="b">Manager</Text>
              </Flex>
              <Flex justifyContent="flex-end" mr={2}>
                <Text as="b">Change</Text>
              </Flex>
            </Grid>

            <Grid gridTemplateColumns={"repeat(1,1fr)"}>
              {filteredSlices
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((s) => (
                  <BranchItemDisplay
                    key={s.pk}
                    pk={s.pk}
                    name={s.name}
                    manager={s.manager}
                    agency={s.agency}
                    old_id={s.old_id}
                  />
                ))}
            </Grid>
          </Box>

          <Drawer isOpen={addIsOpen} onClose={onAddClose} size={"lg"}>
            <DrawerOverlay />
            <DrawerContent>
              <DrawerCloseButton />
              <DrawerHeader>Add Branch</DrawerHeader>
              <DrawerBody>
                <VStack
                  spacing={10}
                  as="form"
                  id="add-form"
                  onSubmit={handleSubmit(onSubmit)}
                >
                  <Input
                    {...register("agency", { required: true })}
                    value={1}
                    required
                    type="hidden"
                  />
                  <FormControl>
                    <FormLabel>Name</FormLabel>
                    <Input
                      autoFocus
                      autoComplete="off"
                      {...register("name", { required: true })}
                    />
                  </FormControl>
                  <FormControl>
                    <UserSearchDropdown
                      {...register("manager", { required: true })}
                      onlyInternal={false}
                      isRequired={true}
                      setUserFunction={setSelectedUser}
                      label="Manager"
                      placeholder="Search for a user"
                      helperText={"The manager of the branch."}
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
                  onClick={() => {
                    console.log("clicked");
                    onSubmitBranchCreation({
                      old_id: 1, //default
                      agency: 1, // dbca
                      name: nameData,
                      manager: selectedUser,
                    });
                  }}
                  isLoading={mutation.isPending}
                  color={"white"}
                  background={colorMode === "light" ? "blue.500" : "blue.600"}
                  _hover={{
                    background: colorMode === "light" ? "blue.400" : "blue.500",
                  }}
                  size="lg"
                  width={"100%"}
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
