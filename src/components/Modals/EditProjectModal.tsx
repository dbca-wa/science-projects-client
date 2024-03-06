import {
  Flex,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  ToastId,
  useToast,
  useColorMode,
  FormControl,
  InputGroup,
  ModalFooter,
  Grid,
  Button,
  FormLabel,
  Text,
  VisuallyHiddenInput,
  FormHelperText,
  Box,
  Select,
  InputLeftAddon,
  Icon,
  Center,
} from "@chakra-ui/react";
import { IEditProject, updateProjectDetails } from "../../lib/api";
import { useEffect, useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  IBusinessArea,
  IDepartmentalService,
  IExtendedProjectDetails,
  IExternalProjectDetails,
  ISimpleLocationData,
  ISmallService,
  IStudentProjectDetails,
  ProjectImage,
} from "../../types";
import { useForm } from "react-hook-form";
import TagInput from "../Pages/CreateProject/TagInput";
import { useDepartmentalServices } from "../../lib/hooks/useDepartmentalServices";
import { useBusinessAreas } from "../../lib/hooks/useBusinessAreas";
import { useGetLocations } from "../../lib/hooks/useGetLocations";
import { AreaCheckAndMaps } from "../Pages/CreateProject/AreaCheckAndMaps";
import { UserSearchDropdown } from "../Navigation/UserSearchDropdown";
import { StartAndEndDateSelector } from "../Pages/CreateProject/StartAndEndDateSelector";
import { UnboundStatefulEditor } from "../RichTextEditor/Editors/UnboundStatefulEditor";
import { StatefulMediaChanger } from "../Pages/Admin/StatefulMediaChanger";
import { HiAcademicCap } from "react-icons/hi";
import { FaArrowLeft } from "react-icons/fa";

interface Props {
  // thisUser: IUserMe;
  // leaderPk: number;
  projectPk: string | number;
  currentTitle: string;
  currentKeywords: string[];
  currentDates: Date[];
  currentBa: IBusinessArea;
  currentService: ISmallService;
  currentDataCustodian: number;
  details: IExtendedProjectDetails | null | undefined;

  isOpen: boolean;
  onClose: () => void;
  refetchData: () => void;

  currentAreas: ISimpleLocationData[];
  currentImage: ProjectImage;
}

export const EditProjectModal = ({
  projectPk,
  currentTitle,
  currentKeywords,
  currentDates,
  currentBa,
  currentService,
  currentAreas,
  currentImage,
  currentDataCustodian,
  details,
  isOpen,
  onClose,
  refetchData,
}: Props) => {
  const { colorMode } = useColorMode();

  const { dbcaRegions, dbcaDistricts, nrm, ibra, imcra, locationsLoading } =
    useGetLocations();
  const [locationData, setLocationData] = useState<number[]>(
    currentAreas.map((area) => area.pk)
  );

  useEffect(() => {
    if (locationData.length === 0) {
      setLocationData(currentAreas.map((area) => area.pk));
    }
  }, []);

  const [businessAreaList, setBusinessAreaList] = useState<IBusinessArea[]>([]);
  const { baData: businessAreaDataFromAPI, baLoading } = useBusinessAreas();
  const [baSet, setBaSet] = useState(false);

  useEffect(() => {
    if (!baLoading && baSet === false) {
      const alphabetisedBA = [...businessAreaDataFromAPI];
      alphabetisedBA.sort((a, b) => a.name.localeCompare(b.name));
      setBusinessAreaList(alphabetisedBA);
      setBaSet(true);
    }
  }, [baLoading, businessAreaDataFromAPI, baSet]);

  const [servicesList, setServicesList] = useState<IDepartmentalService[]>([]);
  const { dsData: servicesDataFromAPI, dsLoading } = useDepartmentalServices();
  const [dsSet, setDsSet] = useState(false);
  useEffect(() => {
    if (!dsLoading && dsSet === false) {
      const alphabetisedDS = [...servicesDataFromAPI];
      alphabetisedDS.sort((a, b) => a.name.localeCompare(b.name));
      setServicesList(alphabetisedDS);
      setDsSet(true);
    }
  }, [dsLoading, servicesDataFromAPI, dsSet]);

  // id/pk
  const [projectTitle, setProjectTitle] = useState(currentTitle);

  const [aims, setAims] = useState(
    (details?.external as IExternalProjectDetails)?.aims
  );
  const [externalDescription, setExternalDescription] = useState(
    (details?.external as IExternalProjectDetails)?.description
  );
  const [budget, setBudget] = useState(
    (details?.external as IExternalProjectDetails)?.budget
  );
  const [collaborationWith, setCollaborationWith] = useState(
    (details?.external as IExternalProjectDetails)?.collaboration_with
  );
  const [organisation, setOrganisation] = useState(
    (details?.student as IStudentProjectDetails)?.organisation
  );
  const [level, setLevel] = useState(
    (details?.student as IStudentProjectDetails)?.level
  );
  const [hoveredTitle, setHoveredTitle] = useState(false);
  const titleBorderColor = `${colorMode === "light"
    ? hoveredTitle
      ? "blackAlpha.300"
      : "blackAlpha.200"
    : hoveredTitle
      ? "whiteAlpha.400"
      : "whiteAlpha.300"
    }`;

  const [keywords, setKeywords] = useState(currentKeywords);
  const [startDate, setStartDate] = useState(currentDates[0]);
  const [endDate, setEndDate] = useState(currentDates[1]);
  const [businessArea, setBusinessArea] = useState(currentBa);
  const [service, setService] = useState<ISmallService | IDepartmentalService>(
    currentService
  );
  const [dataCustodian, setDataCustodian] = useState(currentDataCustodian);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(
    currentImage?.file
  );

  const [canUpdate, setCanUpdate] = useState(false);

  const getPlainTextFromHTML = (htmlString) => {
    const wrapper = document.createElement("div");
    wrapper.innerHTML = htmlString;

    // Find the first 'p' or 'span' tag and get its text content
    const tag = wrapper.querySelector("p, span");
    return tag ? tag.textContent : "";
  };

  // useEffect(() => {
  //   console.log({ organisation, projectTitle })
  // }, [organisation, projectTitle])

  useEffect(() => {
    const plainTitle = getPlainTextFromHTML(projectTitle);
    if (
      plainTitle === "" ||
      plainTitle.length === 0 ||
      startDate === null ||
      endDate === null ||
      startDate === undefined ||
      endDate === undefined ||
      startDate > endDate ||
      businessArea === null ||
      businessArea === undefined ||
      dataCustodian === null ||
      dataCustodian === 0 ||
      dataCustodian === undefined ||
      keywords.length === 0
    ) {
      setCanUpdate(false);
    } else {
      if ((details?.external as IExternalProjectDetails)?.description) {
        // HANDLE EXTERNAL FIELDS
        const parser = new DOMParser();
        const descriptionDoc = parser.parseFromString(
          externalDescription,
          "text/html"
        );
        const descriptionContent = descriptionDoc.body.textContent;
        const aimsDoc = parser.parseFromString(aims, "text/html");
        const aimsContent = aimsDoc.body.textContent;
        const collaborationDoc = parser.parseFromString(
          collaborationWith,
          "text/html"
        );
        const collaborationContent = collaborationDoc.body.textContent;
        console.log({ budget, collaborationContent, aims, descriptionContent });

        if (
          descriptionContent.length > 0 &&
          aimsContent.length > 0 &&
          collaborationContent.length > 0 &&
          budget.length > 0
        ) {
          setCanUpdate(true);
        } else {
          setCanUpdate(false);
        }
      } else if ((details?.student as IStudentProjectDetails)?.level) {
        // HANDLE STUDENT FIELDS
        const parser = new DOMParser();
        const organisationDoc = parser.parseFromString(
          organisation,
          "text/html"
        );
        const organisationContent = organisationDoc.body.textContent;
        console.log({
          level,
          organisation,
          length: organisationContent.length,
        });

        if (level && organisationContent.length > 0) {
          setCanUpdate(true);
        } else {
          setCanUpdate(false);
        }
      } else {
        setCanUpdate(true);
      }
    }
  }, [
    aims,
    budget,
    collaborationWith,
    organisation,
    level,
    externalDescription,
    details,
    projectTitle,
    keywords,
    startDate,
    endDate,
    businessArea,
    service,
    dataCustodian,
    locationData,
    selectedFile,
    currentImage,
  ]);

  const { register } = useForm<IEditProject>();
  const queryClient = useQueryClient();
  const toast = useToast();
  const toastIdRef = useRef<ToastId>();
  const addToast = (data) => {
    toastIdRef.current = toast(data);
  };

  const updateProject = async (formData: IEditProject) => {
    console.log("updating project");
    console.log(formData);
    await updateProjectMutation.mutate(formData);
  };

  const updateProjectMutation = useMutation(updateProjectDetails, {
    onMutate: () => {
      addToast({
        status: "loading",
        title: `Updating Project`,
        position: "top-right",
      });
    },
    onSuccess: async () => {
      if (toastIdRef.current) {
        toast.update(toastIdRef.current, {
          title: "Success",
          description: `Project Updated`,
          status: "success",
          position: "top-right",
          duration: 3000,
          isClosable: true,
        });
      }

      setTimeout(() => {
        queryClient.invalidateQueries(["projects", projectPk]);
        refetchData();
        onClose();
      }, 350);
    },
    onError: (error) => {
      if (toastIdRef.current) {
        toast.update(toastIdRef.current, {
          title: `Could Not udpate project`,
          description: `${error}`,
          status: "error",
          position: "top-right",
          duration: 3000,
          isClosable: true,
        });
      }
    },
  });

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} size={"full"}>
        <ModalOverlay />
        <Flex>
          <ModalContent bg={colorMode === "light" ? "white" : "gray.800"}>
            <ModalHeader>
              <Flex
                alignItems={"center"}
                w={"100%"}
                justifyContent={"flex-start"}
              >
                <Center cursor={"pointer"} pr={4} onClick={onClose}>
                  <Box mr={3}>
                    <FaArrowLeft />
                  </Box>
                  <Text>Go Back</Text>
                </Center>
              </Flex>
            </ModalHeader>
            <ModalCloseButton />

            <ModalBody>
              <VisuallyHiddenInput
                type="text"
                placeholder="pk"
                value={projectPk}
                readOnly
              />
              <Grid gridTemplateColumns={"repeat(2, 1fr)"} gridGap={8}>
                <Box>
                  <UnboundStatefulEditor
                    title="Project Title"
                    placeholder="Enter the project't title..."
                    // helperText={"The academic organisation of the student"}
                    showToolbar={true}
                    showTitle={true}
                    isRequired={true}
                    value={projectTitle}
                    setValueFunction={setProjectTitle}
                    setValueAsPlainText={false}
                  />
                  {(details?.external as IExternalProjectDetails).aims ? (
                    <Grid
                      gridTemplateColumns={"repeat(1, 1fr)"}
                      gridGap={2}
                      mt={2}
                      pb={2}
                    >
                      <UnboundStatefulEditor
                        title="Description"
                        isRequired={true}
                        helperText={
                          "Description specific to this external project."
                        }
                        showToolbar={true}
                        showTitle={true}
                        value={externalDescription}
                        setValueFunction={setExternalDescription}
                        setValueAsPlainText={false}
                      />
                      <UnboundStatefulEditor
                        title="Collaboration With"
                        isRequired={true}
                        placeholder="Enter collaborating entities..."
                        helperText={
                          "The entity/s this project is in collaboration with, separated by commas"
                        }
                        showToolbar={false}
                        showTitle={true}
                        value={collaborationWith}
                        setValueFunction={setCollaborationWith}
                        setValueAsPlainText={true}
                      />
                    </Grid>
                  ) : (details?.student as IStudentProjectDetails)
                    ?.organisation ? (
                    <Grid
                      gridTemplateColumns={"repeat(1, 1fr)"}
                      gridGap={2}
                      mt={2}
                      pb={2}
                    >
                      <UnboundStatefulEditor
                        title="Organisation"
                        placeholder="Enter the academic organisation..."
                        helperText={"The academic organisation of the student"}
                        showToolbar={false}
                        showTitle={true}
                        isRequired={true}
                        value={organisation}
                        setValueFunction={setOrganisation}
                        setValueAsPlainText={true}
                      />
                    </Grid>
                  ) : null}

                  <Box w={"100%"} h={"100%"} mt={2} mx={2}>
                    <StartAndEndDateSelector
                      startDate={startDate}
                      endDate={endDate}
                      setStartDate={setStartDate}
                      setEndDate={setEndDate}
                      helperText={"These can be changed at any time"}
                    />

                    <StatefulMediaChanger
                      helperText={
                        "Upload an image that represents the project."
                      }
                      selectedImageUrl={selectedImageUrl}
                      setSelectedImageUrl={setSelectedImageUrl}
                      selectedFile={selectedFile}
                      setSelectedFile={setSelectedFile}
                    />
                  </Box>
                </Box>

                <Flex flexDir={"column"}>
                  <TagInput
                    setTagFunction={setKeywords}
                    preExistingTags={keywords}
                  />

                  {(details?.external as IExternalProjectDetails).aims ? (
                    <Grid
                      gridTemplateColumns={"repeat(1, 1fr)"}
                      gridGap={2}
                      mt={2}
                      pb={2}
                    >
                      <UnboundStatefulEditor
                        title="Aims"
                        value={aims}
                        allowInsertButton
                        helperText={"List out the aims of your project."}
                        showToolbar={true}
                        showTitle={true}
                        isRequired={true}
                        setValueFunction={setAims}
                        setValueAsPlainText={false}
                      />
                      <UnboundStatefulEditor
                        title="Budget"
                        isRequired={true}
                        placeholder="The estimated operating budget in dollars..."
                        helperText={
                          "The estimated budget for the project in dollars"
                        }
                        showToolbar={false}
                        showTitle={true}
                        value={budget}
                        setValueFunction={setBudget}
                        setValueAsPlainText={true}
                      />
                    </Grid>
                  ) : (details?.student as IStudentProjectDetails)?.level ? (
                    <Grid
                      gridTemplateColumns={"repeat(1, 1fr)"}
                      gridGap={2}
                      mt={6}
                      pb={6}
                    >
                      <FormControl isRequired userSelect={"none"}>
                        <FormLabel
                          onMouseEnter={() => setHoveredTitle(true)}
                          onMouseLeave={() => setHoveredTitle(false)}
                        >
                          Level
                        </FormLabel>
                        <InputGroup>
                          <InputLeftAddon
                            left={0}
                            bg={
                              colorMode === "light"
                                ? "gray.100"
                                : "whiteAlpha.300"
                            }
                            px={4}
                            zIndex={1}
                            borderColor={titleBorderColor}
                            borderTopRightRadius={"none"}
                            borderBottomRightRadius={"none"}
                            borderRight={"none"}
                          // boxSize={10}
                          >
                            <Icon as={HiAcademicCap} boxSize={5} />
                          </InputLeftAddon>

                          <Select
                            placeholder={"Select a level"}
                            borderLeft={"none"}
                            borderTopLeftRadius={"none"}
                            borderBottomLeftRadius={"none"}
                            pl={"2px"}
                            borderLeftColor={"transparent"}
                            onMouseEnter={() => setHoveredTitle(true)}
                            onMouseLeave={() => setHoveredTitle(false)}
                            // {...register("title", {
                            //     value: data?.title,
                            // })}
                            onChange={(e) => {
                              setLevel(e.target.value);
                            }}
                            value={level}
                          >
                            <option value="phd">PhD</option>
                            <option value="msc">MSc</option>
                            <option value="honours">BSc Honours</option>
                            <option value="fourth_year">Fourth Year</option>
                            <option value="third_year">Third Year</option>
                            <option value="undergrad">Undergradate</option>
                          </Select>
                        </InputGroup>

                        <FormHelperText>
                          The level of the student and the project
                        </FormHelperText>
                      </FormControl>
                    </Grid>
                  ) : null}

                  <Box py={2}>
                    <UserSearchDropdown
                      {...register("dataCustodian", { required: true })}
                      onlyInternal={false}
                      isRequired={true}
                      setUserFunction={setDataCustodian}
                      isEditable
                      preselectedUserPk={currentDataCustodian}
                      label="Data Custodian"
                      placeholder="Search for a user"
                      helperText={"The user you would like to handle data."}
                    />
                  </Box>

                  {!baLoading && baSet && (
                    <>
                      <FormControl isRequired>
                        <FormLabel>Business Area</FormLabel>

                        <InputGroup>
                          <Select
                            variant="filled"
                            placeholder="Select a Business Area"
                            onChange={(event) => {
                              const pkVal = event.target.value;
                              const relatedBa = businessAreaList.find(
                                (ba) => Number(ba.pk) === Number(pkVal)
                              );
                              if (relatedBa !== undefined) {
                                setBusinessArea(relatedBa);
                              }
                            }}
                            value={businessArea?.pk}
                          >
                            {businessAreaList.map((ba, index) => {
                              const checkIsHtml = (data: string) => {
                                // Regular expression to check for HTML tags
                                const htmlRegex = /<\/?[a-z][\s\S]*>/i;

                                // Check if the string contains any HTML tags
                                return htmlRegex.test(data);
                              };

                              const isHtml = checkIsHtml(ba.name);
                              let baName = ba?.name;
                              if (isHtml === true) {
                                const parser = new DOMParser();
                                const dom = parser.parseFromString(
                                  ba.name,
                                  "text/html"
                                );
                                const content = dom.body.textContent;
                                baName = content;
                              }
                              return (
                                <option key={index} value={ba.pk}>
                                  {baName}
                                </option>
                              );
                            })}
                          </Select>
                        </InputGroup>
                        <FormHelperText>
                          The Business Area / Program that this project belongs
                          to.
                        </FormHelperText>
                      </FormControl>



                      <FormControl mb={4}>
                        <FormLabel>Departmental Service</FormLabel>
                        <InputGroup>
                          <Select
                            variant="filled"
                            placeholder="Select a Departmental Service"
                            onChange={(event) => {
                              const pkVal = event.target.value;
                              const depService = servicesList.find(
                                (serv) => Number(serv.pk) === Number(pkVal)
                              );
                              if (depService !== undefined) {
                                setService(depService);
                              }
                            }}
                            value={service?.pk}
                          >
                            {servicesList.map((service, index) => {
                              const checkIsHtml = (data: string) => {
                                // Regular expression to check for HTML tags
                                const htmlRegex = /<\/?[a-z][\s\S]*>/i;

                                // Check if the string contains any HTML tags
                                return htmlRegex.test(data);
                              };

                              const isHtml = checkIsHtml(service.name);
                              let serviceName = service?.name;
                              if (isHtml === true) {
                                const parser = new DOMParser();
                                const dom = parser.parseFromString(
                                  service.name,
                                  "text/html"
                                );
                                const content = dom.body.textContent;
                                serviceName = content;
                              }

                              return (
                                <option key={index} value={service.pk}>
                                  {serviceName}
                                </option>
                              );
                            })}
                          </Select>
                        </InputGroup>
                        <FormHelperText>
                          The DBCA service that this project delivers outputs
                          to.
                        </FormHelperText>
                      </FormControl>
                    </>
                  )}
                </Flex>
              </Grid>

              <Grid gridTemplateColumns={"repeat(1, 1fr)"} gridGap={4} mt={4}>
                {!locationsLoading && (
                  <>
                    <Grid
                      gridTemplateColumns={"repeat(2, 1fr)"}
                      gridColumnGap={4}
                      px={4}
                      w={"100%"}
                    >
                      {dbcaDistricts && dbcaDistricts.length > 0 && (
                        <AreaCheckAndMaps
                          title="DBCA Districts"
                          areas={dbcaDistricts}
                          // required={false}
                          selectedAreas={locationData}
                          setSelectedAreas={setLocationData}
                        />
                      )}

                      {imcra && imcra.length > 0 && (
                        <AreaCheckAndMaps
                          title="IMCRAs"
                          areas={imcra}
                          // required={false}
                          selectedAreas={locationData}
                          setSelectedAreas={setLocationData}
                        />
                      )}
                      {dbcaRegions && dbcaRegions.length > 0 && (
                        <AreaCheckAndMaps
                          title="DBCA Regions"
                          areas={dbcaRegions}
                          // required={false}
                          selectedAreas={locationData}
                          setSelectedAreas={setLocationData}
                        />
                      )}
                      {nrm && nrm.length > 0 && (
                        <AreaCheckAndMaps
                          title="Natural Resource Management Regions"
                          areas={nrm}
                          // required={false}
                          selectedAreas={locationData}
                          setSelectedAreas={setLocationData}
                        />
                      )}
                      {ibra && ibra.length > 0 && (
                        <AreaCheckAndMaps
                          title="IBRAs"
                          areas={ibra}
                          // required={false}
                          selectedAreas={locationData}
                          setSelectedAreas={setLocationData}
                        />
                      )}
                    </Grid>
                  </>
                )}
              </Grid>
            </ModalBody>
            <ModalFooter>
              <Grid gridTemplateColumns={"repeat(2, 1fr)"} gridGap={4}>
                <Button colorScheme="gray" onClick={onClose}>
                  Cancel
                </Button>
                <Button
                  color={"white"}
                  background={colorMode === "light" ? "green.500" : "green.600"}
                  _hover={{
                    background:
                      colorMode === "light" ? "green.400" : "green.500",
                  }}
                  isLoading={updateProjectMutation.isLoading}
                  type="submit"
                  ml={3}
                  isDisabled={!canUpdate}
                  onClick={async () => {
                    updateProject({
                      projectPk: projectPk,
                      title: projectTitle,
                      image: selectedFile,
                      dataCustodian: dataCustodian,
                      keywords: keywords,
                      startDate: startDate,
                      endDate: endDate,
                      departmentalService: service?.pk,
                      businessArea: businessArea?.pk,
                      locations: locationData,
                      selectedImageUrl: selectedImageUrl,
                      externalDescription: externalDescription,
                      aims: aims,
                      budget: budget,
                      collaborationWith: collaborationWith,
                      level: level,
                      organisation: organisation,
                    });
                  }}
                >
                  Update
                </Button>
              </Grid>
            </ModalFooter>
          </ModalContent>
        </Flex>
      </Modal>
    </>
  );
};
