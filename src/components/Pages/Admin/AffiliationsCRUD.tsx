import { AffiliationSearchDropdown } from "@/components/Navigation/AffiliationSearchDropdown";
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
  FormHelperText,
  FormLabel,
  Grid,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Spinner,
  Text,
  ToastId,
  VStack,
  useColorMode,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import {
  createAffiliation,
  getAllAffiliations,
  mergeAffiliations,
} from "../../../lib/api";
import { IAffiliation, IMergeAffiliation } from "../../../types";
import { AffiliationItemDisplay } from "./AffiliationItemDisplay";

export const AffiliationsCRUD = () => {
  const { register, handleSubmit, watch } = useForm<IAffiliation>();
  const [primaryAffiliation, setPrimaryAffiliation] =
    useState<IAffiliation | null>(null);
  const [secondaryAffiliations, setSecondaryAffiliations] = useState<
    IAffiliation[] | null
  >([]);

  const addSecondaryAffiliationPkToArray = (affiliation: IAffiliation) => {
    setSecondaryAffiliations((prev) => [...prev, affiliation]);
  };

  const removeSecondaryAffiliationPkFromArray = (affiliation: IAffiliation) => {
    setSecondaryAffiliations((prev) =>
      prev.filter((item) => item !== affiliation)
    );
  };

  const clearSecondaryAffiliationArray = () => {
    setSecondaryAffiliations([]);
  };

  // useEffect(() => {
  //   console.log({
  //     primaryAffiliation,
  //     secondaryAffiliations,
  //   });
  // }, [primaryAffiliation, secondaryAffiliations]);

  const toast = useToast();
  const {
    isOpen: addIsOpen,
    onOpen: onAddOpen,
    onClose: onAddClose,
  } = useDisclosure();

  const {
    isOpen: mergeIsOpen,
    onOpen: onMergeOpen,
    onClose: onMergeClose,
  } = useDisclosure();

  const queryClient = useQueryClient();
  const toastIdRef = useRef<ToastId>();
  const mergeToast = (data) => {
    toastIdRef.current = toast(data);
  };
  const addToast = (data) => {
    toastIdRef.current = toast(data);
  };
  const creationMutation = useMutation({
    mutationFn: createAffiliation,
    onMutate: () => {
      addToast({
        status: "loading",
        title: "Creating Affiliation...",
        position: "top-right",
      });
    },
    onSuccess: () => {
      if (toastIdRef.current) {
        toast.update(toastIdRef.current, {
          title: "Success",
          description: `Created`,
          status: "success",
          position: "top-right",
          duration: 3000,
          isClosable: true,
        });
      }
      onAddClose();
      queryClient.invalidateQueries({ queryKey: ["affiliations"] });
    },
    onError: () => {
      if (toastIdRef.current) {
        toast.update(toastIdRef.current, {
          title: "Failed",
          description: `Something went wrong!`,
          status: "error",
          position: "top-right",
          duration: 3000,
          isClosable: true,
        });
      }
    },
  });

  const mergeMutation = useMutation({
    mutationFn: mergeAffiliations,
    onMutate: () => {
      mergeToast({
        status: "loading",
        title: "Merging...",
        position: "top-right",
      });
    },
    onSuccess: () => {
      if (toastIdRef.current) {
        toast.update(toastIdRef.current, {
          title: "Merged!",
          description: `The affiliations are now one!`,
          status: "success",
          position: "top-right",
          duration: 3000,
          isClosable: true,
        });
      }
      clearSecondaryAffiliationArray();
      setPrimaryAffiliation(null);
      onMergeClose();
      queryClient.invalidateQueries({ queryKey: ["affiliations"] });
    },
    onError: () => {
      if (toastIdRef.current) {
        toast.update(toastIdRef.current, {
          title: "Failed",
          description: `Something went wrong!`,
          status: "error",
          position: "top-right",
          duration: 3000,
          isClosable: true,
        });
      }
    },
  });

  const onSubmitMerge = (formData: IMergeAffiliation) => {
    // console.log("SUBMISSION DATA:", formData);
    mergeMutation.mutate(formData);
  };

  const onSubmitCreate = (formData: IAffiliation) => {
    creationMutation.mutate(formData);
  };

  const { isLoading, data: slices } = useQuery<IAffiliation[]>({
    queryFn: getAllAffiliations,
    queryKey: ["affiliations"],
  });
  const [searchTerm, setSearchTerm] = useState("");

  const [filteredSlices, setFilteredSlices] = useState<IAffiliation[]>([]);
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

  const [createIsDisabled, setCreateIsDisabled] = useState(false);
  const nameValue = watch("name");
  const [alreadyPresentNames, setAlreadyPresentNames] = useState([]);

  useEffect(() => {
    // Initialize filteredSlices with all items when no filters are applied
    if (!searchTerm && slices) {
      setFilteredSlices(slices);
      setCountOfItems(slices.length);
      if (slices && alreadyPresentNames.length === 0) {
        setAlreadyPresentNames(
          Array.from(slices).map((slice) => slice.name.toLowerCase())
        );
      }
    }
  }, [searchTerm, slices, alreadyPresentNames]);

  const { colorMode } = useColorMode();

  useEffect(() => {
    if (!nameValue) {
      setCreateIsDisabled(true);
    } else {
      // console.log(nameValue);
      // console.log(alreadyPresentNames);
      if (nameValue.includes(',') || alreadyPresentNames.includes(nameValue.toLowerCase())) {
        setCreateIsDisabled(true);
      } else {
        setCreateIsDisabled(false);
      }
    }
  }, [nameValue, alreadyPresentNames]);

  return (
    <>
      {isLoading ? (
        <Center h={"200px"}>
          <Spinner />
        </Center>
      ) : (
        <>
          <Box maxW={"100%"} maxH={"100%"}>
            <Box>
              <Text fontWeight={"semibold"} fontSize={"lg"}>
                Affiliations ({countOfItems})
              </Text>
            </Box>
            <Flex width={"100%"} mt={4}>
              <Input
                type="text"
                placeholder="Search affiliation by name"
                value={searchTerm}
                onChange={handleSearchChange}
                w={"65%"}
              />

              <Flex justifyContent={"flex-end"} w={"100%"}>
                <Button
                  mr={4}
                  onClick={onMergeOpen}
                  color={"white"}
                  background={
                    colorMode === "light" ? "orange.500" : "orange.600"
                  }
                  _hover={{
                    background:
                      colorMode === "light" ? "orange.400" : "orange.500",
                  }}
                >
                  Merge
                </Button>
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
              gridTemplateColumns="9fr 3fr"
              mt={4}
              width="100%"
              p={3}
              borderWidth={1}
              borderBottomWidth={filteredSlices.length === 0 ? 1 : 0}
            >
              <Flex justifyContent="flex-start">
                <Text as="b">Affiliation</Text>
              </Flex>
              <Flex justifyContent="flex-end" mr={2}>
                <Text as="b">Change</Text>
              </Flex>
            </Grid>

            <Grid gridTemplateColumns={"repeat(1,1fr)"}>
              {filteredSlices
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((s) => (
                  <AffiliationItemDisplay key={s.pk} pk={s.pk} name={s.name} />
                ))}
            </Grid>
          </Box>

          <Drawer isOpen={addIsOpen} onClose={onAddClose} size={"lg"}>
            <DrawerOverlay />
            <DrawerContent>
              <DrawerCloseButton />
              <DrawerHeader>Add Affiliation</DrawerHeader>
              <DrawerBody>
                <VStack
                  spacing={10}
                  as="form"
                  id="add-form"
                  onSubmit={handleSubmit(onSubmitCreate)}
                >
                  <FormControl>
                    <FormLabel>Name</FormLabel>
                    <Input
                      autoFocus
                      autoComplete="off"
                      {...register("name", { required: true })}
                    />
                    <FormHelperText>
                      Note: Exclude "The" from the start of any names. For
                      example, "The University of Western Australia" should be
                      "University of Western Australia"
                    </FormHelperText>
                  </FormControl>
                  {creationMutation.isError ? (
                    <Text color={"red.500"}>Something went wrong</Text>
                  ) : null}
                </VStack>
              </DrawerBody>
              <DrawerFooter>
                <Button
                  form="add-form"
                  type="submit"
                  isLoading={creationMutation.isPending}
                  color={"white"}
                  background={colorMode === "light" ? "blue.500" : "blue.600"}
                  _hover={{
                    background: colorMode === "light" ? "blue.400" : "blue.500",
                  }}
                  size="lg"
                  width={"100%"}
                  isDisabled={createIsDisabled}
                >
                  Create
                </Button>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>

          <Modal isOpen={mergeIsOpen} onClose={onMergeClose}>
            <ModalOverlay />
            <ModalHeader>Merge Affiliations</ModalHeader>
            <ModalBody>
              <ModalContent
                bg={colorMode === "light" ? "white" : "gray.800"}
                p={4}
                px={6}
              >
                <VStack
                  spacing={4}
                // as="form"
                // id="merge-form"
                >
                  <Box justifyContent={"start"} w={"100%"}>
                    <Text>Combine similar affiliations into one!</Text>
                  </Box>
                  <FormControl>
                    <AffiliationSearchDropdown
                      autoFocus
                      isRequired
                      isEditable
                      setterFunction={setPrimaryAffiliation}
                      label="Primary Affiliation"
                      placeholder="Search for an affiliation"
                      helperText="The affiliation you would like to merge other affiliations into"
                    />
                  </FormControl>
                  <FormControl>
                    <AffiliationSearchDropdown
                      // autoFocus
                      isRequired
                      isEditable
                      array={secondaryAffiliations}
                      arrayAddFunction={addSecondaryAffiliationPkToArray}
                      arrayRemoveFunction={
                        removeSecondaryAffiliationPkFromArray
                      }
                      arrayClearFunction={clearSecondaryAffiliationArray}
                      label="Secondary Affiliation/s"
                      placeholder="Search for an affiliation"
                      helperText="The affiliation/s you would like to merge into the primary affiliation"
                    />
                  </FormControl>

                  {mergeMutation.isError ? (
                    <Text color={"red.500"}>Something went wrong</Text>
                  ) : null}
                </VStack>

                {secondaryAffiliations?.length >= 1 && (
                  <Box py={2}>
                    <Text color={"red.500"}>
                      Note: Users affiliated with the secondary affiliation/s,
                      will now become affiliated with the primary affiliation.
                      Each secondary affiliation you selected will also be
                      deleted.
                    </Text>
                  </Box>
                )}

                <Grid
                  w={"100%"}
                  justifyContent={"end"}
                  gridTemplateColumns={"repeat(2, 1fr)"}
                  gridGap={4}
                  mt={secondaryAffiliations ? 4 : undefined}
                >
                  <Button onClick={onMergeClose} size="lg">
                    Cancel
                  </Button>
                  <Button
                    // form="add-form"
                    // type="submit"

                    onClick={() => {
                      onSubmitMerge({
                        primaryAffiliation,
                        secondaryAffiliations,
                      });
                    }}
                    isLoading={mergeMutation.isPending}
                    color={"white"}
                    background={
                      colorMode === "light" ? "orange.500" : "orange.600"
                    }
                    _hover={{
                      background:
                        colorMode === "light" ? "orange.400" : "orange.500",
                    }}
                    size="lg"
                    isDisabled={
                      secondaryAffiliations?.length < 1 || !primaryAffiliation
                    }
                  >
                    Merge
                  </Button>
                </Grid>
              </ModalContent>
            </ModalBody>
          </Modal>
        </>
      )}
    </>
  );
};
