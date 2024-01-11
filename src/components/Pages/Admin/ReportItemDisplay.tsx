import {
  Box,
  Image,
  Button,
  Center,
  Checkbox,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerFooter,
  DrawerOverlay,
  Flex,
  FormControl,
  FormHelperText,
  FormLabel,
  Grid,
  HStack,
  Input,
  InputGroup,
  InputLeftAddon,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  Spinner,
  Text,
  Textarea,
  VStack,
  useDisclosure,
  useToast,
  FormErrorMessage,
  UnorderedList,
  ListItem,
  useColorMode,
} from "@chakra-ui/react";
import { IReport, IResearchFunction } from "../../../types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MdMoreVert } from "react-icons/md";
import { useForm } from "react-hook-form";
import { FaSign } from "react-icons/fa";
import {
  deleteReport,
  deleteResearchFunction,
  updateReport,
  updateReportMedia,
  updateResearchFunction,
} from "../../../lib/api";
import { useFullUserByPk } from "../../../lib/hooks/useFullUserByPk";
import { UserProfile } from "../Users/UserProfile";
import { FcOk, FcCancel } from "react-icons/fc";
import { useFormattedDate } from "../../../lib/hooks/useFormattedDate";
import { UserSearchDropdown } from "../../Navigation/UserSearchDropdown";
import { useEffect, useState } from "react";
import { AxiosError } from "axios";
// import { CalendarWithCSS } from "../CreateProject/CalendarWithCSS";
import { useGetFullReport } from "../../../lib/hooks/useGetFullReport";
import { useNoImage } from "../../../lib/hooks/useNoImage";
import useApiEndpoint from "../../../lib/hooks/useApiEndpoint";
import { useGetReportMedia } from "../../../lib/hooks/useGetReportMedia";
import { StateRichTextEditor } from "../../RichTextEditor/Editors/StateRichTextEditor";
import { useUser } from "../../../lib/hooks/useUser";
import { RichTextEditor } from "../../RichTextEditor/Editors/RichTextEditor";
import { TextButtonFlex } from "../../TextButtonFlex";
import { ReportMediaChanger } from "./ReportMediaChanger";

export const ReportItemDisplay = ({
  pk,
  year,
  created_at,
  updated_at,
  date_closed,
  date_open,
  creator,
  modifier,
  dm,
  publications,
  research_intro,
  service_delivery_intro,
  student_intro,
}: IReport) => {
  // useEffect(() => {
  //     console.log("Data from API: ", {
  //         date_open, date_closed, creator, modifier, dm, publications, research_intro, student_intro, service_delivery_intro,
  //     })
  // })

  const NoImageFile = useNoImage();
  const apiEndpoint = useApiEndpoint();
  // console.log(`${apiEndpoint}/files/${image.file}`)
  const noImageLink = useNoImage();

  // cover
  const [coverpageImageLoadFailed, setCoverpageImageLoadFailed] =
    useState(false);
  const [selectedCoverpageFile, setSelectedCoverpageFile] =
    useState<File | null>(null);
  const [selectedCoverpageImageUrl, setSelectedCoverpageImageUrl] = useState<
    string | null
  >();

  // rear cover
  const [rearCoverpageImageLoadFailed, setRearCoverpageImageLoadFailed] =
    useState(false);
  const [selectedRearCoverpageFile, setSelectedRearCoverpageFile] =
    useState<File | null>(null);
  const [selectedRearCoverpageImageUrl, setSelectedRearCoverpageImageUrl] =
    useState<string | null>();

  // org chart
  const [
    serviceDeliveryOrgChartImageLoadFailed,
    setServiceDeliveryOrgChartImageLoadFailed,
  ] = useState(false);
  const [
    selectedServiceDeliveryOrgChartFile,
    setSelectedServiceDeliveryOrgChartFile,
  ] = useState<File | null>(null);
  const [
    selectedServiceDeliveryOrgChartImageUrl,
    setSelectedServiceDeliveryOrgChartImageUrl,
  ] = useState<string | null>();

  // service delivery
  const [
    serviceDeliveryChapterImageLoadFailed,
    setServiceDeliveryChapterImageLoadFailed,
  ] = useState(false);
  const [
    selectedServiceDeliveryChapterFile,
    setSelectedServiceDeliveryChapterFile,
  ] = useState<File | null>(null);
  const [
    selectedServiceDeliveryChapterImageUrl,
    setSelectedServiceDeliveryChapterImageUrl,
  ] = useState<string | null>();

  // research
  const [researchChapterImageLoadFailed, setResearchChapterImageLoadFailed] =
    useState(false);
  const [selectedResearchChapterFile, setSelectedResearchChapterFile] =
    useState<File | null>(null);
  const [selectedResearchChapterImageUrl, setSelectedResearchChapterImageUrl] =
    useState<string | null>();

  // partnerships
  const [
    partnershipsChapterImageLoadFailed,
    setPartnershipsChapterImageLoadFailed,
  ] = useState(false);
  const [selectedPartnershipsChapterFile, setSelectedPartnershipsChapterFile] =
    useState<File | null>(null);
  const [
    selectedPartnershipsChapterImageUrl,
    setSelectedPartnershipsChapterImageUrl,
  ] = useState<string | null>();

  // collaborations
  const [
    collaborationsChapterImageLoadFailed,
    setCollaborationsChapterImageLoadFailed,
  ] = useState(false);
  const [
    selectedCollaborationsChapterFile,
    setSelectedCollaborationsChapterFile,
  ] = useState<File | null>(null);
  const [
    selectedCollaborationsChapterImageUrl,
    setSelectedCollaborationsChapterImageUrl,
  ] = useState<string | null>();

  // student projects
  const [
    studentProjectsChapterImageLoadFailed,
    setStudentProjectsChapterImageLoadFailed,
  ] = useState(false);
  const [
    selectedStudentProjectsChapterFile,
    setSelectedStudentProjectsChapterFile,
  ] = useState<File | null>(null);
  const [
    selectedStudentProjectsChapterImageUrl,
    setSelectedStudentProjectsChapterImageUrl,
  ] = useState<string | null>();

  // publications
  const [
    publicationsChapterImageLoadFailed,
    setPublicationsChapterImageLoadFailed,
  ] = useState(false);
  const [selectedPublicationsChapterFile, setSelectedPublicationsChapterFile] =
    useState<File | null>(null);
  const [
    selectedPublicationsChapterImageUrl,
    setSelectedPublicationsChapterImageUrl,
  ] = useState<string | null>();

  const { reportData, reportLoading } = useGetFullReport(pk);

  const [dmValue, setDmValue] = useState(reportData?.dm);

  useEffect(() => {
    if (!reportLoading) console.log(reportData);
    setDmValue(reportData?.dm);
  }, [reportData, reportLoading]);

  const { reportMediaData, reportMediaLoading } = useGetReportMedia(pk);
  useEffect(() => {
    if (!reportMediaLoading) console.log(reportMediaData);
  }, [reportMediaData, reportMediaLoading]);

  const { register, handleSubmit, watch } = useForm<IReport>();
  // const [selectedCreator, setSelectedCreator] = useState<number>(creator);
  // const [selectedModifier, setSelectedModifier] = useState<number>(modifier);
  const [selectedDates, setSelectedDates] = useState([date_open, date_closed]);

  const dmData = watch("dm");
  const serviceDeliveryData = watch("service_delivery_intro");
  const researchIntroData = watch("research_intro");
  const studentIntroData = watch("student_intro");

  const publicationsData = watch("publications");

  const toast = useToast();
  const {
    isOpen: isDeleteModalOpen,
    onOpen: onDeleteModalOpen,
    onClose: onDeleteModalClose,
  } = useDisclosure();
  const {
    isOpen: isUpdateModalOpen,
    onOpen: onUpdateModalOpen,
    onClose: onUpdateModalClose,
  } = useDisclosure();
  const {
    isOpen: isUpdateMediaModalOpen,
    onOpen: onUpdateMediaModalOpen,
    onClose: onUpdateMediaModalClose,
  } = useDisclosure();

  const queryClient = useQueryClient();

  const formattedDateOpen = useFormattedDate(date_open);
  const formattedDateClosed = useFormattedDate(date_closed);

  const partsOpen = formattedDateOpen.split("@");
  const firstPartDateOpen = partsOpen[0]?.trim();
  const secondPartDateOpen = `@ ${partsOpen[1]?.trim()}`;

  const partsClosed = formattedDateClosed.split("@");
  const firstPartDateClosed = partsClosed[0]?.trim();
  const secondPartDateClosed = `@ ${partsClosed[1]?.trim()}`;

  const { userLoading: modifierLoading, userData: modifierData } =
    useFullUserByPk(modifier);
  const { userLoading: creatorLoading, userData: creatorData } =
    useFullUserByPk(creator);

  // useEffect(() => {
  //     console.log(leader, finance_admin, data_custodian);
  // }, [leader, finance_admin, data_custodian])

  const updateMutation = useMutation(updateReport, {
    onSuccess: () => {
      // console.log("success")
      toast({
        status: "success",
        title: "Updated",
        position: "top-right",
      });
      onUpdateModalClose();
      queryClient.invalidateQueries(["reports"]);
    },
    onError: () => {
      // console.log("error")
      toast({
        status: "error",
        title: "Failed",
        position: "top-right",
      });
    },
    onMutate: () => {
      // console.log("attempting update private")
    },
  });

  const updateMediaMutation = useMutation(updateReportMedia, {
    onSuccess: () => {
      // console.log("success")
      toast({
        status: "success",
        title: "Updated",
        position: "top-right",
      });
      onUpdateModalClose();
      queryClient.invalidateQueries(["reports"]);
    },
    onError: () => {
      // console.log("error")
      toast({
        status: "error",
        title: "Failed",
        position: "top-right",
      });
    },
    onMutate: () => {
      // console.log("attempting update private")
    },
  });

  const deleteMutation = useMutation(deleteReport, {
    onSuccess: () => {
      // console.log("success")
      toast({
        status: "success",
        title: "Deleted",
        position: "top-right",
      });
      onDeleteModalClose();
      queryClient.invalidateQueries(["reports"]);
    },
    onError: () => {
      // console.log("error")
    },
    onMutate: () => {
      // console.log("mutation")
    },
  });

  const deleteBtnClicked = () => {
    // console.log("deleted")
    deleteMutation.mutate(pk);
  };

  const onUpdateSubmit = (formData: IReport) => {
    console.log(formData);
    updateMutation.mutate(formData);
  };

  const onUpdateMediaSubmit = (formData: IReport) => {
    console.log(formData);
    updateMediaMutation.mutate(formData);
  };

  const {
    isOpen: isCreatorOpen,
    onOpen: onCreatorOpen,
    onClose: onCreatorClose,
  } = useDisclosure();
  const {
    isOpen: isModifierOpen,
    onOpen: onModifierOpen,
    onClose: onModifierClose,
  } = useDisclosure();
  const creatorDrawerFunction = () => {
    console.log(`${creatorData?.first_name} clicked`);
    onCreatorOpen();
  };
  const modifierDrawerFunction = () => {
    console.log(`${modifierData?.first_name} clicked`);
    onModifierOpen();
  };

  const { colorMode } = useColorMode();

  const documentType = "annualreport";
  const editorKey = colorMode + documentType;

  // useEffect(() => { console.log(document) }, [document])
  const { userData, userLoading } = useUser();
  const mePk = userData?.pk ? userData?.pk : userData?.id;

  return !creatorLoading && creatorData ? (
    <>
      <Drawer
        isOpen={isCreatorOpen}
        placement="right"
        onClose={onCreatorClose}
        size={"sm"} //by default is xs
      >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerBody>
            <UserProfile pk={creator} />
          </DrawerBody>

          <DrawerFooter></DrawerFooter>
        </DrawerContent>
      </Drawer>
      {!modifierLoading && modifierData && (
        <Drawer
          isOpen={isModifierOpen}
          placement="right"
          onClose={onModifierClose}
          size={"sm"} //by default is xs
        >
          <DrawerOverlay />
          <DrawerContent>
            <DrawerBody>
              <UserProfile pk={modifier} />
            </DrawerBody>

            <DrawerFooter></DrawerFooter>
          </DrawerContent>
        </Drawer>
      )}

      <Grid
        gridTemplateColumns="1fr 2fr 2fr 3fr 3fr 1fr"
        width="100%"
        p={3}
        borderWidth={1}
        // bg={"red"}
      >
        <Flex justifyContent="flex-start" alignItems={"center"}>
          <Button
            variant={"link"}
            colorScheme="blue"
            onClick={onUpdateModalOpen}
          >
            {year}
          </Button>
        </Flex>
        <Grid alignItems={"center"}>
          <Box>
            <Text>{firstPartDateOpen}</Text>
          </Box>
        </Grid>
        <Grid alignItems={"center"}>
          <Box>
            <Text>{firstPartDateClosed}</Text>
          </Box>
        </Grid>
        <TextButtonFlex
          name={`${creatorData.first_name} ${creatorData.last_name}`}
          onClick={creatorDrawerFunction}
        />
        {/* <Flex
                        alignItems={"center"}

                    >
                        <Button
                            variant={"link"}
                            colorScheme="blue"
                            onClick={creatorDrawerFunction}
                        >
                            {creatorData.first_name} {creatorData.last_name}
                        </Button>
                    </Flex> */}
        {!modifierLoading && modifierData ? (
          <TextButtonFlex
            name={`${modifierData.first_name} ${modifierData.last_name}`}
            onClick={modifierDrawerFunction}
          />
        ) : (
          <TextButtonFlex />
        )}
        {/* <Flex
                        alignItems={"center"}

                    >
                        {
                            !modifierLoading && (
                                modifierData ?
                                    <Button
                                        variant={"link"}
                                        colorScheme="blue"
                                        onClick={modifierDrawerFunction}
                                    >
                                        {`${modifierData.first_name} ${modifierData.last_name}`}
                                    </Button> :
                                    <Text>-</Text>

                            )
                        }
                    </Flex> */}

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
              <MenuItem onClick={onUpdateMediaModalOpen}>Edit Media</MenuItem>
              <MenuItem onClick={onDeleteModalOpen}>Delete</MenuItem>
            </MenuList>
          </Menu>
          {/* </Button> */}
        </Flex>
      </Grid>

      <Modal isOpen={isDeleteModalOpen} onClose={onDeleteModalClose}>
        <ModalOverlay />
        <ModalContent bg="white">
          <ModalHeader>Delete Division</ModalHeader>
          <ModalBody>
            <Box>
              <Text fontSize="lg" fontWeight="semibold">
                Are you sure you want to delete this report?
              </Text>

              <Text
                fontSize="lg"
                fontWeight="semibold"
                color={"blue.500"}
                mt={4}
              >
                "{year}"
              </Text>

              <Center my={6}>
                <UnorderedList>
                  <ListItem>
                    This will delete all progress reports and their related
                    document associated with the year
                  </ListItem>
                  <ListItem>
                    This will delete all images associated with the year
                  </ListItem>
                </UnorderedList>
              </Center>
            </Box>
          </ModalBody>
          <ModalFooter justifyContent="flex-end">
            <Flex>
              <Button onClick={onDeleteModalClose} colorScheme="red">
                No
              </Button>
              <Button onClick={deleteBtnClicked} colorScheme="green" ml={3}>
                Yes
              </Button>
            </Flex>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal
        isOpen={isUpdateMediaModalOpen}
        onClose={onUpdateMediaModalClose}
        size={"6xl"}
      >
        <ModalOverlay />
        <ModalBody
          h={"100%"}
          // bg={"red"}
        >
          <ModalContent bg={colorMode === "light" ? "white" : "gray.800"} p={4}>
            <ModalHeader>Update {reportData?.year} Report Media</ModalHeader>

            <ModalCloseButton />

            <FormControl>
              <input
                type="hidden"
                {...register("pk")}
                defaultValue={pk} // Prefill with the 'pk' prop
              />
            </FormControl>

            <Grid gridTemplateColumns={"repeat(3, 1fr)"} gap={4} px={6}>
              <ReportMediaChanger currentImage={null} section={"cover"} />
              <ReportMediaChanger currentImage={null} section={"sdschart"} />
              <ReportMediaChanger
                currentImage={null}
                section={"service_delivery"}
              />

              <ReportMediaChanger currentImage={null} section={"research"} />
              <ReportMediaChanger
                currentImage={null}
                section={"partnerships"}
              />
              <ReportMediaChanger
                currentImage={null}
                section={"collaborations"}
              />

              <ReportMediaChanger
                currentImage={null}
                section={"student_projects"}
              />
              <ReportMediaChanger
                currentImage={null}
                section={"publications"}
              />
              <ReportMediaChanger currentImage={null} section={"rear_cover"} />
            </Grid>
            <Center>
              {updateMediaMutation.isError ? (
                <Box mt={4}>
                  {Object.keys(
                    (updateMediaMutation.error as AxiosError).response.data
                  ).map((key) => (
                    <Box key={key}>
                      {(
                        (updateMediaMutation.error as AxiosError).response.data[
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
            </Center>

            <ModalFooter>
              <Grid
                // pos={"absolute"}
                // bottom={0}
                // bg={"red"}
                h={"100%"}
                mt={10}
                w={"100%"}
                justifyContent={"end"}
                gridTemplateColumns={"repeat(2, 1fr)"}
                gridGap={4}
              >
                <Button onClick={onUpdateMediaModalClose} size="lg">
                  Cancel
                </Button>
                <Button
                  // form="update-form"
                  // type="submit"
                  isLoading={updateMediaMutation.isLoading}
                  size="lg"
                  // onClick={() => {
                  //     console.log("clicked")
                  //     onUpdateMediaSubmit(
                  //         {
                  //             "pk": pk,
                  //             "coverpage": "",
                  //             "rearcoverpage": "",
                  //             "sdschapterimage": "",
                  //             "sdsorgchart": "",
                  //             "resarchchapterimage": "",
                  //             "partnershipschapterimage": "",
                  //             "collaborationschapterimage": "",
                  //             "studentprojectschapterimage": "",
                  //             "publicationschapterimage": ""
                  //         }
                  //     )
                  // }}
                  color={"white"}
                  background={colorMode === "light" ? "blue.500" : "blue.600"}
                  _hover={{
                    background: colorMode === "light" ? "blue.400" : "blue.500",
                  }}
                >
                  Update Media
                </Button>
              </Grid>
            </ModalFooter>
          </ModalContent>
        </ModalBody>
      </Modal>

      <Modal
        isOpen={isUpdateModalOpen}
        onClose={onUpdateModalClose}
        // size={"full"}
        // scrollBehavior="inside"
        size={"full"}
      >
        <ModalOverlay />
        <ModalBody>
          <ModalContent bg={colorMode === "light" ? "white" : "gray.800"} p={4}>
            <ModalHeader>Update {reportData?.year} Report</ModalHeader>

            <ModalCloseButton />

            {reportLoading ? (
              <Spinner />
            ) : (
              <>
                <VStack
                  // as="form" id="update-form" onSubmit={handleSubmit(onUpdateSubmit)}

                  // bg={"red"}
                  // h={"100%"}
                  p={6}
                  spacing={6}
                >
                  <input
                    type="hidden"
                    {...register("pk")}
                    defaultValue={pk} // Prefill with the 'pk' prop
                  />
                  <Input
                    {...register("year", { required: true })}
                    disabled
                    required
                    type="hidden"
                    defaultValue={reportData.year} // Prefill with the 'name' prop
                  />

                  {/* <FormControl
                                                isRequired
                                            >
                                                <FormLabel>Start and End Dates</FormLabel>
                                                <CalendarWithCSS onChange={setSelectedDates} preselectedDates={[date_open, date_closed]} />
                                                <FormHelperText>Select the period in which entries for this annual report are allowed. First day clicked is the open date, second is the close date.</FormHelperText>
                                            </FormControl> */}

                  <FormControl>
                    {/* <FormLabel>Director's Message</FormLabel> */}
                    {/* <Textarea
                                                    {...register("dm", { required: false })}
                                                    defaultValue={reportData.dm}
                                                /> */}
                    {/* <StateRichTextEditor
                                                    section="dm"
                                                    editorType="AnnualReport"
                                                    isUpdate={false}
                                                    value={dmValue}
                                                    setValueFunction={setDmValue}
                                                /> */}

                    <RichTextEditor
                      canEdit={userData?.is_superuser}
                      isUpdate={true}
                      editorType="AnnualReport"
                      key={`dm${editorKey}`} // Change the key to force a re-render
                      data={reportData?.dm}
                      section={"dm"}
                      writeable_document_kind={"Annual Report"}
                      writeable_document_pk={reportData?.pk}
                    />
                  </FormControl>

                  <FormControl>
                    {/* <FormLabel>Service Delivery Intro</FormLabel>
                                                <Textarea
                                                    {...register("service_delivery_intro", { required: false })}
                                                    defaultValue={reportData.service_delivery_intro}

                                                /> */}
                    <RichTextEditor
                      canEdit={userData?.is_superuser}
                      isUpdate={true}
                      editorType="AnnualReport"
                      key={`service_delivery_intro${editorKey}`} // Change the key to force a re-render
                      data={reportData?.service_delivery_intro}
                      section={"service_delivery_intro"}
                      writeable_document_kind={"Annual Report"}
                      writeable_document_pk={reportData?.pk}
                    />
                  </FormControl>
                  <FormControl>
                    {/* <FormLabel>Research Intro</FormLabel>
                                                <Textarea
                                                    {...register("research_intro", { required: false })}
                                                    defaultValue={reportData.research_intro}

                                                    
                                                /> */}
                    <RichTextEditor
                      canEdit={userData?.is_superuser}
                      isUpdate={true}
                      editorType="AnnualReport"
                      key={`research_intro${editorKey}`} // Change the key to force a re-render
                      data={reportData?.research_intro}
                      section={"research_intro"}
                      writeable_document_kind={"Annual Report"}
                      writeable_document_pk={reportData?.pk}
                    />
                  </FormControl>

                  <FormControl>
                    {/* <FormLabel>Student Intro</FormLabel>
                                                <Textarea
                                                    {...register("student_intro", { required: false })}
                                                    defaultValue={reportData.student_intro}

                                                />
                                                 */}
                    <RichTextEditor
                      canEdit={userData?.is_superuser}
                      isUpdate={true}
                      editorType="AnnualReport"
                      key={`student_intro${editorKey}`} // Change the key to force a re-render
                      data={reportData?.student_intro}
                      section={"student_intro"}
                      writeable_document_kind={"Annual Report"}
                      writeable_document_pk={reportData?.pk}
                    />
                  </FormControl>

                  <FormControl>
                    {/* <FormLabel>Publications</FormLabel>
                                                <Textarea
                                                    {...register("publications", { required: false })}
                                                    defaultValue={reportData.publications}

                                                /> */}
                    <RichTextEditor
                      canEdit={userData?.is_superuser}
                      isUpdate={true}
                      editorType="AnnualReport"
                      key={`publications${editorKey}`} // Change the key to force a re-render
                      data={reportData?.publications}
                      section={"publications"}
                      writeable_document_kind={"Annual Report"}
                      writeable_document_pk={reportData?.pk}
                    />
                  </FormControl>
                </VStack>

                <Center>
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
                </Center>

                <ModalFooter>
                  <Grid
                    // pos={"absolute"}
                    // bottom={0}
                    // bg={"red"}
                    h={"100%"}
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
                      isLoading={updateMutation.isLoading}
                      size="lg"
                      onClick={() => {
                        console.log("clicked");
                        onUpdateSubmit({
                          pk: pk,
                          year: year,
                          date_open: selectedDates[0],
                          date_closed: selectedDates[1],
                          dm: dmData,
                          publications: publicationsData,
                          research_intro: researchIntroData,
                          service_delivery_intro: serviceDeliveryData,
                          student_intro: studentIntroData,
                        });
                      }}
                      color={"white"}
                      background={
                        colorMode === "light" ? "blue.500" : "blue.600"
                      }
                      _hover={{
                        background:
                          colorMode === "light" ? "blue.400" : "blue.500",
                      }}
                    >
                      Update
                    </Button>
                  </Grid>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </ModalBody>
      </Modal>
    </>
  ) : null;
};
