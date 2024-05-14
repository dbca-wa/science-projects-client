import { UnboundStatefulEditor } from "@/components/RichTextEditor/Editors/UnboundStatefulEditor";
import { useGetDivisions } from "@/lib/hooks/tanstack/useGetDivisions";
import {
  Box,
  Button,
  Center,
  Flex,
  FormControl,
  FormHelperText,
  FormLabel,
  Grid,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  Spinner,
  Stack,
  Text,
  useColorMode,
  useDisclosure,
  useToast
} from "@chakra-ui/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { createBusinessArea, getAllBusinessAreas } from "../../../lib/api";
import { IBusinessArea, IBusinessAreaCreate } from "../../../types";
import { UserSearchDropdown } from "../../Navigation/UserSearchDropdown";
import { BusinessAreaItemDisplay } from "./BusinessAreaItemDisplay";
import { StatefulMediaChanger } from "./StatefulMediaChanger";

export const BusinessAreasCRUD = () => {
  const {
    register,
    handleSubmit,
    watch,
    reset,
    // formState: { errors },
  } = useForm<IBusinessAreaCreate>();
  const toast = useToast();
  const {
    isOpen: addIsOpen,
    onOpen: onAddOpen,
    onClose: onAddClose,
  } = useDisclosure();

  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: createBusinessArea,
    onSuccess: () => {
      toast({
        status: "success",
        title: "Created",
        position: "top-right",
      });
      queryClient.invalidateQueries({ queryKey: ["businessAreas"] });
      clearFields();
      onAddClose();
    },
    onError: () => {
      toast({
        status: "error",
        title: "Failed",
        position: "top-right",
      });
    },
  });
  const onSubmit = (formData: IBusinessAreaCreate) => {
    mutation.mutate(formData);
  };
  const { isLoading, data: slices } = useQuery<IBusinessArea[]>({
    queryFn: getAllBusinessAreas,
    queryKey: ["businessAreas"],
  });

  // useEffect(() => {
  //   if (!isLoading) console.log(slices);
  // }, [isLoading, slices]);

  const [searchTerm, setSearchTerm] = useState("");
  const [canSubmit, setCanSubmit] = useState(false);

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
      // console.log(filtered)

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
  // const slugData = watch("slug");
  // const focusData = watch("focus");
  const [focus, setFocus] = useState("");
  const [introduction, setIntroduction] = useState("");
  // const introductionData = watch("introduction");
  const imageData = watch("image");
  const [selectedLeader, setSelectedLeader] = useState<number>();
  const [selectedFinanceAdmin, setSelectedFinanceAdmin] = useState<number>();
  const [selectedDataCustodian, setSelectedDataCustodian] = useState<number>();
  const [division, setDivision] = useState<number>();

  const clearFields = () => {
    reset();
    setSelectedDataCustodian(undefined);
    setSelectedFinanceAdmin(undefined);
    setSelectedLeader(undefined);
    setSelectedFile(null);
    setSelectedImageUrl(null);
  };

  useEffect(() => {
    if (
      division &&
      introduction?.length >= 5 &&
      focus?.length >= 5 &&
      nameData?.length >= 5
    ) {
      setCanSubmit(true);
    } else {
      setCanSubmit(false);
    }
  }, [nameData, focus, introduction, division]);


  const onSubmitBusinessAreaCreation = (formData: IBusinessAreaCreate) => {
    const {
      // old_id,
      // slug,
      agency,
      is_active,
      name,
      leader,
      data_custodian,
      finance_admin,
      focus,
      introduction,
    } = formData;
    const image = selectedFile;

    // Create an object to pass as a single argument to mutation.mutate
    const payload = {
      // old_id,
      // slug,
      agency,
      is_active,
      name,
      leader,
      data_custodian,
      finance_admin,
      focus,
      introduction,
      image,
      division,
    };
    console.log(payload);
    mutation.mutate(payload);
  };

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>();

  const { colorMode } = useColorMode();

  const { divsData, divsLoading } = useGetDivisions();

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
              // gridTemplateColumns="2fr 2fr 3fr 2fr 2fr 2fr 1fr"
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
              {/* <Flex>
                <Text as="b">Active</Text>
              </Flex> */}
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
                    is_active={s.is_active}
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
                    division={s.division}
                  />
                ))}
            </Grid>
          </Box>

          <Modal isOpen={addIsOpen} onClose={onAddClose} size={"2xl"}>
            <ModalOverlay />
            <ModalContent>
              <ModalCloseButton onClick={onAddClose} />
              <ModalHeader>Add Business Area</ModalHeader>
              <ModalBody>
                <Stack
                  spacing={6}
                  as="form"
                  id="add-form"
                  onSubmit={handleSubmit(onSubmit)}
                >
                  {/* <FormControl isRequired>
                    <FormLabel>Name</FormLabel>
                    <Input
                      autoComplete="off"
                      autoFocus
                      {...register("division", { required: true })}
                    />
                    <FormHelperText>Name of the Business Area</FormHelperText>
                  </FormControl> */}
                  {!divsLoading && (
                    <Select
                      onChange={(e) => setDivision(Number(e.target.value))}
                      value={division}
                      defaultValue={division}
                    // {...register("division", { required: true })}

                    >
                      <option value={1}>Select a Division</option>
                      {divsData?.map((divi) => <option value={divi.pk}>[{divi.slug}] {divi.name}</option>)}
                    </Select>
                  )}


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
                    <FormLabel>Focus</FormLabel>
                    {/* <InputGroup>
                      <Textarea
                        {...register("focus", { required: true })}
                        required
                      />
                    </InputGroup> */}

                    <UnboundStatefulEditor
                      title={"Focus"}
                      showTitle={false}
                      isRequired={false}
                      showToolbar={true}
                      setValueAsPlainText={false}
                      value={focus}
                      setValueFunction={setFocus}
                    />
                    <FormHelperText>
                      Primary concerns of the Business Area
                    </FormHelperText>
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel>Introduction</FormLabel>
                    {/* <InputGroup>
                      <Textarea
                        {...register("introduction", { required: true })}
                        required
                      />
                    </InputGroup> */}

                    <UnboundStatefulEditor
                      title={"Introduction"}
                      showTitle={false}
                      isRequired={false}
                      showToolbar={true}
                      setValueAsPlainText={false}
                      value={introduction}
                      setValueFunction={setIntroduction}
                    />
                    <FormHelperText>
                      A description of the Business Area
                    </FormHelperText>
                  </FormControl>
                  <FormControl isRequired>
                    <StatefulMediaChanger
                      helperText={
                        "Upload an image that represents the Business Area."
                      }
                      selectedImageUrl={selectedImageUrl}
                      setSelectedImageUrl={setSelectedImageUrl}
                      selectedFile={selectedFile}
                      setSelectedFile={setSelectedFile}
                    />
                  </FormControl>
                  <FormControl>
                    <UserSearchDropdown
                      {...register("leader", { required: true })}
                      onlyInternal={false}
                      isRequired={false}
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
                      isRequired={false}
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
                      isRequired={false}
                      setUserFunction={setSelectedDataCustodian}
                      label="Data Custodian"
                      placeholder="Search for a user..."
                      helperText={"The data custodian of the Business Area"}
                    />
                  </FormControl>

                  {mutation.isError ? (
                    <Box mt={4}>
                      {Object.keys(
                        (mutation.error as AxiosError)?.response?.data
                      ).map((key) => (
                        <Box key={key}>
                          {(
                            (mutation.error as AxiosError)?.response?.data[
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
                </Stack>
              </ModalBody>
              <ModalFooter>
                <Button
                  // form="add-form"
                  // type="submit"
                  isDisabled={!canSubmit}
                  isLoading={mutation.isPending}
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
                      is_active: true,
                      name: nameData,
                      focus: focus,
                      introduction: introduction,
                      image: imageData,
                      leader: selectedLeader,
                      data_custodian: selectedDataCustodian,
                      finance_admin: selectedFinanceAdmin,
                    });
                  }}
                >
                  Create
                </Button>
              </ModalFooter>
            </ModalContent>
          </Modal>
        </>
      )}
    </>
  );
};
