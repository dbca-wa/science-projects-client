import {
  Box,
  Button,
  Center,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerFooter,
  DrawerOverlay,
  Flex,
  FormControl,
  Grid,
  Input,
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
  Spinner,
  Text,
  VStack,
  useDisclosure,
  useToast,
  UnorderedList,
  ListItem,
  useColorMode,
} from "@chakra-ui/react";
import { IReport } from "../../../types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MdMoreVert } from "react-icons/md";
import { useForm } from "react-hook-form";
import { deleteReport, updateReport } from "../../../lib/api";
import { useFullUserByPk } from "../../../lib/hooks/useFullUserByPk";
import { UserProfile } from "../Users/UserProfile";
import { useFormattedDate } from "../../../lib/hooks/useFormattedDate";
import { AxiosError } from "axios";
import { useGetFullReport } from "../../../lib/hooks/useGetFullReport";
import { useGetReportMedia } from "../../../lib/hooks/useGetReportMedia";
import { useUser } from "../../../lib/hooks/useUser";
import { RichTextEditor } from "../../RichTextEditor/Editors/RichTextEditor";
import { TextButtonFlex } from "../../TextButtonFlex";
import { ReportMediaChanger } from "./ReportMediaChanger";

export const ReportItemDisplay = ({
  pk,
  year,
  date_closed,
  date_open,
  creator,
  modifier,
}: IReport) => {
  const { reportData, reportLoading } = useGetFullReport(pk);

  const { reportMediaData, refetchMedia } = useGetReportMedia(pk);
  // useEffect(() => {
  //   if (!reportMediaLoading) console.log(reportMediaData);
  // }, [reportMediaData, reportMediaLoading]);

  const { register, watch } = useForm<IReport>();
  const selectedDates = [date_open, date_closed];

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

  const partsClosed = formattedDateClosed.split("@");
  const firstPartDateClosed = partsClosed[0]?.trim();

  const { userLoading: modifierLoading, userData: modifierData } =
    useFullUserByPk(modifier);
  const { userLoading: creatorLoading, userData: creatorData } =
    useFullUserByPk(creator);

  const updateMutation = useMutation(updateReport, {
    onSuccess: () => {
      toast({
        status: "success",
        title: "Updated",
        position: "top-right",
      });
      onUpdateModalClose();
      queryClient.invalidateQueries(["reports"]);
    },
    onError: () => {
      toast({
        status: "error",
        title: "Failed",
        position: "top-right",
      });
    },
  });

  const deleteMutation = useMutation(deleteReport, {
    onSuccess: () => {
      toast({
        status: "success",
        title: "Deleted",
        position: "top-right",
      });
      onDeleteModalClose();
      queryClient.invalidateQueries(["reports"]);
    },
  });

  const deleteBtnClicked = () => {
    deleteMutation.mutate(pk);
  };

  const onUpdateSubmit = (formData: IReport) => {
    // console.log(formData);
    updateMutation.mutate(formData);
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
    // console.log(`${creatorData?.first_name} clicked`);
    onCreatorOpen();
  };
  const modifierDrawerFunction = () => {
    // console.log(`${modifierData?.first_name} clicked`);
    onModifierOpen();
  };

  const { colorMode } = useColorMode();

  const documentType = "annualreport";
  const editorKey = colorMode + documentType;

  const { userData } = useUser();

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
          <TextButtonFlex name={`${year}` ?? ""} onClick={onUpdateModalOpen} />
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
        {!modifierLoading && modifierData ? (
          <TextButtonFlex
            name={`${modifierData.first_name} ${modifierData.last_name}`}
            onClick={modifierDrawerFunction}
          />
        ) : (
          <TextButtonFlex />
        )}
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
        <ModalContent bg={colorMode === "light" ? "white" : "gray.800"}>
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

      {reportMediaData ? (
        <Modal
          isOpen={isUpdateMediaModalOpen}
          onClose={onUpdateMediaModalClose}
          size={"full"}
        >
          <ModalOverlay />

          <ModalBody>
            <ModalContent
              bg={colorMode === "light" ? "gray.100" : "gray.800"}
              p={4}
              pb={16}
              w={"100%"}
              h={"100%"}
              pos={"relative"}
            >
              <ModalHeader>Update {reportData?.year} Report Media</ModalHeader>
              <ModalCloseButton />

              <Grid
                h={"100%"}
                gridTemplateColumns={{
                  base: "repeat(3, 1fr)",
                  xl: "repeat(4, 1fr)",
                }}
                mt={4}
                gap={8}
                mx={6}
              >
                <ReportMediaChanger
                  reportMediaData={reportMediaData}
                  section={"cover"}
                  reportPk={pk}
                  refetchData={refetchMedia}
                />

                <ReportMediaChanger
                  reportMediaData={reportMediaData}
                  section={"sdchart"}
                  reportPk={pk}
                  refetchData={refetchMedia}
                />

                <ReportMediaChanger
                  reportMediaData={reportMediaData}
                  section={"service_delivery"}
                  reportPk={pk}
                  refetchData={refetchMedia}
                />

                <ReportMediaChanger
                  reportMediaData={reportMediaData}
                  section={"research"}
                  reportPk={pk}
                  refetchData={refetchMedia}
                />

                <ReportMediaChanger
                  reportMediaData={reportMediaData}
                  section={"partnerships"}
                  reportPk={pk}
                  refetchData={refetchMedia}
                />

                <ReportMediaChanger
                  reportMediaData={reportMediaData}
                  section={"collaborations"}
                  reportPk={pk}
                  refetchData={refetchMedia}
                />

                <ReportMediaChanger
                  reportMediaData={reportMediaData}
                  section={"student_projects"}
                  reportPk={pk}
                  refetchData={refetchMedia}
                />

                <ReportMediaChanger
                  reportMediaData={reportMediaData}
                  section={"publications"}
                  reportPk={pk}
                  refetchData={refetchMedia}
                />

                <ReportMediaChanger
                  reportMediaData={reportMediaData}
                  section={"rear_cover"}
                  reportPk={pk}
                  refetchData={refetchMedia}
                />
              </Grid>
            </ModalContent>
          </ModalBody>
        </Modal>
      ) : null}

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
                <VStack p={6} spacing={6}>
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

                  <FormControl>
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
                        // console.log("clicked");
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
