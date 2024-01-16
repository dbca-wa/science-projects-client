import {
  Image,
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
  Textarea,
  useToast,
  FormHelperText,
  FormErrorMessage,
  useColorMode,
} from "@chakra-ui/react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { BusinessAreaItemDisplay } from "./BusinessAreaItemDisplay";
import { createBusinessArea, getAllBusinessAreas } from "../../../lib/api";
import { useQueryClient } from "@tanstack/react-query";
import { IBusinessArea } from "../../../types";
import { UserSearchDropdown } from "../../Navigation/UserSearchDropdown";
import { useNoImage } from "../../../lib/hooks/useNoImage";

export const BusinessAreasCRUD = () => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<IBusinessArea>();
  const toast = useToast();
  const {
    isOpen: addIsOpen,
    onOpen: onAddOpen,
    onClose: onAddClose,
  } = useDisclosure();

  const queryClient = useQueryClient();
  const mutation = useMutation(createBusinessArea, {
    onSuccess: () => {
      toast({
        status: "success",
        title: "Created",
        position: "top-right",
      });
      onAddClose();
      queryClient.invalidateQueries(["businessAreas"]);
    },
    onError: () => {
      toast({
        status: "error",
        title: "Failed",
        position: "top-right",
      });
    },
  });
  const onSubmit = (formData: IBusinessArea) => {
    mutation.mutate(formData);
  };
  const { isLoading, data: slices } = useQuery<IBusinessArea[]>({
    queryFn: getAllBusinessAreas,
    queryKey: ["businessAreas"],
  });

  useEffect(() => {
    if (!isLoading) console.log(slices);
  }, [isLoading, slices]);

  const [searchTerm, setSearchTerm] = useState("");

  const [filteredSlices, setFilteredSlices] = useState<IBusinessArea[]>([]);
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

  const nameData = watch("name");
  const slugData = watch("slug");
  const focusData = watch("focus");
  const introductionData = watch("introduction");
  const imageData = watch("image");
  const [selectedLeader, setSelectedLeader] = useState<number>();
  const [selectedFinanceAdmin, setSelectedFinanceAdmin] = useState<number>();
  const [selectedDataCustodian, setSelectedDataCustodian] = useState<number>();

  const onSubmitBusinessAreaCreation = (formData: IBusinessArea) => {
    const {
      agency,
      old_id,
      name,
      slug,
      leader,
      data_custodian,
      finance_admin,
      focus,
      introduction,
    } = formData;
    const image = selectedFile;

    // Create an object to pass as a single argument to mutation.mutate
    const payload = {
      agency,
      old_id,
      name,
      slug,
      leader,
      data_custodian,
      finance_admin,
      focus,
      introduction,
      image,
    };

    mutation.mutate(payload);
  };

  const noImageLink = useNoImage();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>();

  const { colorMode } = useColorMode();

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
                Business Areas ({countOfItems})
              </Text>
            </Box>
            <Flex width={"100%"} mt={4}>
              <Input
                type="text"
                placeholder="Search business area by name"
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
              gridTemplateColumns="2fr 4fr 3fr 3fr 3fr 1fr"
              mt={4}
              width="100%"
              p={3}
              borderWidth={1}
              borderBottomWidth={filteredSlices.length === 0 ? 1 : 0}
            >
              <Flex justifyContent="flex-start">
                <Text as="b">Image</Text>
              </Flex>
              <Flex>
                <Text as="b">Business Area</Text>
              </Flex>
              <Flex>
                <Text as="b">Leader</Text>
              </Flex>
              <Flex>
                <Text as="b">Finance Admin</Text>
              </Flex>
              <Flex>
                <Text as="b">Data Custodian</Text>
              </Flex>
              <Flex justifyContent="flex-end" mr={2}>
                <Text as="b">Change</Text>
              </Flex>
            </Grid>

            <Grid gridTemplateColumns={"repeat(1,1fr)"}>
              {filteredSlices
                .sort((a, b) => {
                  const parserA = new DOMParser();
                  const docA = parserA.parseFromString(a.name, "text/html");
                  const contentA = docA.body.textContent;

                  const parserB = new DOMParser();
                  const docB = parserB.parseFromString(b.name, "text/html");
                  const contentB = docB.body.textContent;

                  return contentA.localeCompare(contentB);
                })
                .map((s) => (
                  <BusinessAreaItemDisplay
                    key={s.pk}
                    pk={s.pk}
                    slug={s.slug}
                    name={s.name}
                    leader={s.leader}
                    finance_admin={s.finance_admin}
                    data_custodian={s.data_custodian}
                    focus={s.focus}
                    introduction={s.introduction}
                    image={s.image}
                  />
                ))}
            </Grid>
          </Box>

          <Drawer isOpen={addIsOpen} onClose={onAddClose} size={"lg"}>
            <DrawerOverlay />
            <DrawerContent>
              <DrawerCloseButton />
              <DrawerHeader>Add Business Area</DrawerHeader>
              <DrawerBody>
                <VStack
                  spacing={6}
                  as="form"
                  id="add-form"
                  onSubmit={handleSubmit(onSubmit)}
                >
                  <FormControl isRequired>
                    <FormLabel>Name</FormLabel>
                    <Input
                      autoComplete="off"
                      autoFocus
                      {...register("name", { required: true })}
                    />
                    <FormHelperText>Name of the Business Area</FormHelperText>
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel>Slug</FormLabel>
                    <InputGroup>
                      {/* <InputLeftAddon children={<FaSign />} /> */}
                      <Input
                        {...register("slug", { required: true })}
                        required
                        type="text"
                        autoComplete="off"
                      />
                    </InputGroup>
                    <FormHelperText>
                      Short text or acronym to quickly identify (e.g. BCS)
                    </FormHelperText>
                  </FormControl>
                  <FormControl isRequired>
                    <Grid
                      gridTemplateColumns={{ base: "3fr 10fr", md: "4fr 8fr" }}
                      pos="relative"
                      w="100%"
                      h="100%"
                    >
                      <Box>
                        <FormLabel>Image</FormLabel>
                        <Center
                          maxH={{ base: "200px", xl: "225px" }}
                          bg="gray.50"
                          mt={1}
                          rounded="lg"
                          overflow="hidden"
                        >
                          <Image
                            objectFit="cover"
                            src={
                              (selectedFile !== null && selectedImageUrl) ||
                              noImageLink
                            }
                            alt="Preview"
                            userSelect="none"
                            bg="gray.800"
                            // onLoad={handleImageLoadSuccess}
                            // onError={handleImageLoadError}
                          />
                        </Center>
                      </Box>
                      <FormControl ml={4} mt={10}>
                        <InputGroup>
                          <Grid gridGap={2} ml={4}>
                            <FormControl>
                              <Input
                                autoComplete="off"
                                {...register("image", { required: true })}
                                alignItems={"center"}
                                // type="file"
                                // accept="image/*"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    setSelectedFile(file);
                                    setSelectedImageUrl(
                                      URL.createObjectURL(file)
                                    );
                                  }
                                }}
                                sx={{
                                  "::file-selector-button": {
                                    background:
                                      colorMode === "light"
                                        ? "gray.100"
                                        : "gray.600",
                                    borderRadius: "8px",
                                    padding: "2px",
                                    paddingX: "8px",
                                    mt: "1px",
                                    border: "1px solid",
                                    borderColor:
                                      colorMode === "light"
                                        ? "gray.400"
                                        : "gray.700",
                                    outline: "none",
                                    mr: "15px",
                                    ml: "-16px",
                                    cursor: "pointer",
                                  },
                                  pt: "3.5px",
                                  color:
                                    colorMode === "light"
                                      ? "gray.800"
                                      : "gray.200",
                                }}
                              />
                            </FormControl>
                            <FormHelperText>
                              Select an image for the Business Area.
                            </FormHelperText>
                            {errors.image && (
                              <FormErrorMessage>
                                {errors.image.message}
                              </FormErrorMessage>
                            )}
                          </Grid>
                        </InputGroup>
                      </FormControl>
                    </Grid>

                    {/* <FormHelperText>Select an image for the Business Area</FormHelperText> */}
                  </FormControl>
                  <FormControl>
                    <UserSearchDropdown
                      {...register("leader", { required: true })}
                      onlyInternal={false}
                      isRequired={true}
                      setUserFunction={setSelectedLeader}
                      label="Leader"
                      placeholder="Search for a user..."
                      helperText={"The leader of the Business Area"}
                    />
                  </FormControl>
                  <FormControl>
                    {/* <FormLabel>Finance Admin</FormLabel> */}
                    <UserSearchDropdown
                      {...register("finance_admin", { required: true })}
                      onlyInternal={false}
                      isRequired={true}
                      setUserFunction={setSelectedFinanceAdmin}
                      label="Finance Admin"
                      placeholder="Search for a user..."
                      helperText={"The finance admin of the Business Area"}
                    />
                  </FormControl>
                  <FormControl>
                    <UserSearchDropdown
                      {...register("data_custodian", { required: true })}
                      onlyInternal={false}
                      isRequired={true}
                      setUserFunction={setSelectedDataCustodian}
                      label="Data Custodian"
                      placeholder="Search for a user..."
                      helperText={"The data custodian of the Business Area"}
                    />
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel>Focus</FormLabel>
                    <InputGroup>
                      <Textarea
                        {...register("focus", { required: true })}
                        required
                      />
                    </InputGroup>
                    <FormHelperText>
                      Primary concerns of the Business Area
                    </FormHelperText>
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel>Introduction</FormLabel>
                    <InputGroup>
                      <Textarea
                        {...register("introduction", { required: true })}
                        required
                      />
                    </InputGroup>
                    <FormHelperText>
                      A description of the Business Area
                    </FormHelperText>
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
                  isLoading={mutation.isLoading}
                  color={"white"}
                  background={colorMode === "light" ? "blue.500" : "blue.600"}
                  _hover={{
                    background: colorMode === "light" ? "blue.400" : "blue.500",
                  }}
                  size="lg"
                  width={"100%"}
                  onClick={() => {
                    onSubmitBusinessAreaCreation({
                      agency: 1,
                      old_id: 1,
                      name: nameData,
                      slug: slugData,
                      leader: selectedLeader,
                      data_custodian: selectedDataCustodian,
                      finance_admin: selectedFinanceAdmin,
                      focus: focusData,
                      introduction: introductionData,
                      image: imageData,
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
