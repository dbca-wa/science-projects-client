import { Head } from "@/shared/components/layout/base/Head";
import { AffiliationSearchDropdown } from "@/features/admin/components/AffiliationSearchDropdown";
import { AffiliationItemDisplay } from "@/features/admin/components/AffiliationItemDisplay";
import {
  cleanOrphanedAffiliations,
  createAffiliation,
  getAllAffiliations,
  mergeAffiliations,
} from "@/features/admin/services/admin.service";
import type { IAffiliation, IMergeAffiliation } from "@/shared/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/shared/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { useColorMode } from "@/shared/utils/theme.utils";

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
      prev.filter((item) => item !== affiliation),
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

  const [addIsOpen, setAddIsOpen] = useState(false);
  const [mergeIsOpen, setMergeIsOpen] = useState(false);
  const [cleanIsOpen, setCleanIsOpen] = useState(false);

  const queryClient = useQueryClient();

  const creationMutation = useMutation({
    mutationFn: createAffiliation,
    onMutate: () => {
      toast.loading("Creating Affiliation...");
    },
    onSuccess: () => {
      toast.success("Success", {
        description: "Created",
      });
      setAddIsOpen(false);
      queryClient.invalidateQueries({ queryKey: ["affiliations"] });
    },
    onError: () => {
      toast.error("Failed", {
        description: "Something went wrong!",
      });
    },
  });

  const mergeMutation = useMutation({
    mutationFn: mergeAffiliations,
    onMutate: () => {
      toast.loading("Merging...");
    },
    onSuccess: () => {
      toast.success("Merged!", {
        description: "The affiliations are now one!",
      });
      clearSecondaryAffiliationArray();
      setPrimaryAffiliation(null);
      setMergeIsOpen(false);
      queryClient.invalidateQueries({ queryKey: ["affiliations"] });
    },
    onError: () => {
      toast.error("Failed", {
        description: "Something went wrong!",
      });
    },
  });

  const cleanMutation = useMutation({
    mutationFn: cleanOrphanedAffiliations,
    onMutate: () => {
      toast.loading("Cleaning orphaned affiliations...");
    },
    onSuccess: (data) => {
      toast.success("Cleanup Complete!", {
        description: data.message,
      });
      setCleanIsOpen(false);
      queryClient.invalidateQueries({ queryKey: ["affiliations"] });
    },
    onError: () => {
      toast.error("Failed", {
        description: "Something went wrong!",
      });
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
          Array.from(slices).map((slice) => slice.name.toLowerCase()),
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
      if (
        nameValue.includes(",") ||
        alreadyPresentNames.includes(nameValue.toLowerCase())
      ) {
        setCreateIsDisabled(true);
      } else {
        setCreateIsDisabled(false);
      }
    }
  }, [nameValue, alreadyPresentNames]);

  return (
    <>
      <Head title="Affiliations" />

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
                  onClick={onCleanOpen}
                  color={"white"}
                  background={
                    colorMode === "light" ? "blue.500" : "blue.600"
                  }
                  _hover={{
                    background:
                      colorMode === "light" ? "blue.400" : "blue.500",
                  }}
                >
                  Clean
                </Button>
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
                color={colorMode === "dark" ? "gray.400" : null}
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
                      mergeMutation.isPending ||
                      secondaryAffiliations?.length < 1 ||
                      !primaryAffiliation
                    }
                  >
                    Merge
                  </Button>
                </Grid>
              </ModalContent>
            </ModalBody>
          </Modal>

          <Modal isOpen={cleanIsOpen} onClose={onCleanClose}>
            <ModalOverlay />
            <ModalHeader>Clean Orphaned Affiliations</ModalHeader>
            <ModalBody>
              <ModalContent
                color={colorMode === "dark" ? "gray.400" : null}
                bg={colorMode === "light" ? "white" : "gray.800"}
                p={4}
                px={6}
              >
                <VStack spacing={4}>
                  <Box justifyContent={"start"} w={"100%"}>
                    <Text>
                      This will remove all affiliations that have no links to any projects or users.
                    </Text>
                    <Text mt={2} color={"orange.500"}>
                      Warning: This action cannot be undone. Orphaned affiliations will be permanently deleted.
                    </Text>
                  </Box>

                  {cleanMutation.isError ? (
                    <Text color={"red.500"}>Something went wrong</Text>
                  ) : null}
                </VStack>

                <Grid
                  w={"100%"}
                  justifyContent={"end"}
                  gridTemplateColumns={"repeat(2, 1fr)"}
                  gridGap={4}
                  mt={4}
                >
                  <Button onClick={onCleanClose} size="lg">
                    Cancel
                  </Button>
                  <Button
                    onClick={() => cleanMutation.mutate()}
                    isLoading={cleanMutation.isPending}
                    color={"white"}
                    background={
                      colorMode === "light" ? "blue.500" : "blue.600"
                    }
                    _hover={{
                      background:
                        colorMode === "light" ? "blue.400" : "blue.500",
                    }}
                    size="lg"
                    isDisabled={cleanMutation.isPending}
                  >
                    Clean
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
