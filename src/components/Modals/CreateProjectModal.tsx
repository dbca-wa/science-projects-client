// Modal for creating new projects

import {
  Text,
  Modal,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Box,
  useColorMode,
  useToast,
  ToastId,
  useDisclosure,
  UseToastOptions,
} from "@chakra-ui/react";
import { useRef, useState } from "react";
import { useCurrentYear } from "../../lib/hooks/helper/useCurrentYear";
import { IconType } from "react-icons";
import { ProjectDetailsSection } from "../Pages/CreateProject/ProjectDetailsSection";
import { ProjectLocationSection } from "../Pages/CreateProject/ProjectLocationSection";
import { ProjectBaseInformation } from "../Pages/CreateProject/ProjectBaseInformation";
import "../../styles/modalscrollbar.css";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ICreateProjectBaseInfo,
  ICreateProjectDetails,
  ICreateProjectExternalDetails,
  ICreateProjectStudentDetails,
  IProjectCreationVariables,
  MutationError,
  ProjectCreationMutationSuccess,
  createProject,
} from "../../lib/api";
import { useNavigate } from "react-router-dom";
import { ProjectExternalSection } from "../Pages/CreateProject/ProjectExternalSection";
import { ProjectStudentSection } from "../Pages/CreateProject/ProjectStudentSection";
import { useUser } from "../../lib/hooks/tanstack/useUser";
import { ExternalInternalSPConfirmationModal } from "./ExternalInternalSPConfirmationModal";

interface INewProjectModalProps {
  projectType: string;
  icon: IconType;
  isOpen: boolean;
  onClose: () => void;
}

export const CreateProjectModal = ({
  projectType,
  isOpen,
  onClose,
  icon,
}: INewProjectModalProps) => {
  const ButtonIcon = icon;

  const currentYear = useCurrentYear();

  const { colorMode } = useColorMode();

  const [baseInformationFilled, setBaseInformationFilled] =
    useState<boolean>(false);
  const [projectDetailsFilled, setProjectDetailsFilled] =
    useState<boolean>(false);
  const [locationFilled, setLocationFilled] = useState<boolean>(false);
  // const [externalFilled, setExternalFilled] = useState<boolean>(false);
  const [studentFilled, setStudentFilled] = useState<boolean>(false);
  const [activeTabIndex, setActiveTabIndex] = useState<number>(0);

  const [baseInformationData, setBaseInformationData] =
    useState<ICreateProjectBaseInfo>({} as ICreateProjectBaseInfo);
  const [detailsData, setDetailsData] = useState<ICreateProjectDetails>(
    {} as ICreateProjectDetails,
  );
  const [locationData, setLocationData] = useState([]);
  const [externalData, setExternalData] =
    useState<ICreateProjectExternalDetails>(
      {} as ICreateProjectExternalDetails,
    );
  const [studentData, setStudentData] = useState<ICreateProjectStudentDetails>(
    {} as ICreateProjectStudentDetails,
  );

  const goBack = () => {
    setActiveTabIndex(activeTabIndex !== 0 ? activeTabIndex - 1 : 0);
  };

  const controlledClose = () => {
    setActiveTabIndex(0);
    onClose();
  };

  const goToDetailsTab = (data) => {
    setBaseInformationData(data);
    setActiveTabIndex(1);
  };

  const goToLocationTab = (data) => {
    setDetailsData(data);
    setActiveTabIndex(2);
  };

  const goToFinalTab = (data) => {
    setLocationData(data);
    setLocationFilled(true);
    setActiveTabIndex(3);
  };

  const toast = useToast();
  const toastIdRef = useRef<ToastId | undefined>(undefined);
  const addToast = (data: UseToastOptions) => {
    toastIdRef.current = toast(data);
  };

  // Mutation, query client, onsubmit, and api function
  const queryClient = useQueryClient();

  const navigate = useNavigate();

  const { userData } = useUser();

  const {
    isOpen: isExternalOrInternalScienceConfirmationModalOpen,
    onOpen: onOpenExternalOrInternalScienceConfirmationModal,
    onClose: onCloseExternalOrInternalScienceConfirmationModal,
  } = useDisclosure();

  const [isExternalSP, setIsExternalSP] = useState(false);

  const kickOffMutation = () => {
    mutation.mutate({
      baseInformationData,
      detailsData,
      locationData,
      externalData,
      studentData,
      isExternalSP,
    });
  };

  const mutation = useMutation<
    ProjectCreationMutationSuccess,
    MutationError,
    IProjectCreationVariables
  >({
    // Start of mutation handling
    mutationFn: createProject,
    onMutate: () => {
      addToast({
        title: "Creating project...",
        description: "One moment!",
        status: "loading",
        position: "top-right",
        // duration: 3000
      });
    },
    // Success handling based on API-file-declared interface
    onSuccess: async (data) => {
      if (toastIdRef.current) {
        toast.update(toastIdRef.current, {
          title: "Success",
          description: `Project Created`,
          status: "success",
          position: "top-right",
          duration: 3000,
          isClosable: true,
        });
      }
      // Close the modal
      onClose?.();

      queryClient.refetchQueries({ queryKey: [`projects`] });
      navigate(`/projects/${data.pk}/overview`);
    },
    // Error handling based on API-file-declared interface
    onError: (error) => {
      let errorMessage = "";
      console.log(error);
      if (error.response?.data) {
        const errorKeys = Object.keys(error.response.data);
        if (errorKeys.length > 0) {
          errorMessage = error.response.data[errorKeys[0]][0];
        } else {
          errorMessage = "Unknown error occurred.";
        }
      } else {
        errorMessage = "Unknown error occurred.";
      }

      const capitalizedErrorMessage =
        errorMessage.charAt(0).toUpperCase() + errorMessage.slice(1);

      if (toastIdRef.current) {
        toast.update(toastIdRef.current, {
          title: "Could not create project",
          description: capitalizedErrorMessage,
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
      <ExternalInternalSPConfirmationModal
        isOpen={isExternalOrInternalScienceConfirmationModalOpen}
        onClose={onCloseExternalOrInternalScienceConfirmationModal}
        isExternalSP={isExternalSP}
        setIsExternalSP={setIsExternalSP}
        mutationFunction={kickOffMutation}
      />
      <Modal isOpen={isOpen} onClose={controlledClose} size={"6xl"}>
        <ModalOverlay />
        <ModalContent bg={colorMode === "light" ? "white" : "gray.800"}>
          <ModalHeader display={"inline-flex"} alignItems={"center"}>
            <Box
              color={
                projectType === "Core Function"
                  ? "red.500"
                  : projectType === "Science Project"
                    ? "green.500"
                    : projectType === "Student Project"
                      ? "blue.500"
                      : projectType === "External Project"
                        ? "gray.500"
                        : "gray.500"
              }
              mr={3}
            >
              <ButtonIcon />
            </Box>
            <Text>
              New {projectType} - {currentYear}
            </Text>
          </ModalHeader>
          <ModalCloseButton />
          <Tabs
            isFitted
            // variant='enclosed'
            index={activeTabIndex}
          >
            <TabList mb="1em">
              <Tab>Base Information</Tab>
              <Tab isDisabled={!baseInformationFilled}>Details</Tab>
              <Tab isDisabled={!baseInformationFilled || !projectDetailsFilled}>
                Location
              </Tab>
              {projectType.includes("External") && (
                <Tab isDisabled={!locationFilled}>External Details</Tab>
              )}

              {projectType === "Student Project" && (
                <Tab isDisabled={!locationFilled}>Student Details</Tab>
              )}
            </TabList>
            <TabPanels>
              <TabPanel h={"100%"} px={10}>
                <ProjectBaseInformation
                  projectKind={
                    projectType === "Core Function"
                      ? "core_function"
                      : projectType === "Student Project"
                        ? "student"
                        : projectType === "Science Project"
                          ? "science"
                          : "external"
                  }
                  nextClick={goToDetailsTab}
                  currentYear={currentYear}
                  onClose={onClose}
                  colorMode={colorMode}
                  baseInformationFilled={baseInformationFilled}
                  setBaseInformationFilled={setBaseInformationFilled}
                />
              </TabPanel>
              <TabPanel>
                <ProjectDetailsSection
                  thisUser={userData?.pk}
                  backClick={goBack}
                  nextClick={goToLocationTab}
                  onClose={onClose}
                  projectType={projectType}
                  colorMode={colorMode}
                  projectDetailsFilled={projectDetailsFilled}
                  setProjectDetailsFilled={setProjectDetailsFilled}
                />
              </TabPanel>
              <TabPanel>
                {projectType.includes("External") ||
                projectType.includes("Student") ? (
                  <ProjectLocationSection
                    locationFilled={locationFilled}
                    locationData={locationData}
                    setLocationData={setLocationData}
                    setLocationFilled={setLocationFilled}
                    onClose={onClose}
                    projectType={projectType}
                    currentYear={currentYear}
                    colorMode={colorMode}
                    backClick={goBack}
                    nextClick={goToFinalTab}
                    createClick={kickOffMutation}
                  />
                ) : (
                  <ProjectLocationSection
                    locationFilled={locationFilled}
                    locationData={locationData}
                    setLocationData={setLocationData}
                    setLocationFilled={setLocationFilled}
                    onClose={onClose}
                    projectType={projectType}
                    currentYear={currentYear}
                    colorMode={colorMode}
                    backClick={goBack}
                    createClick={
                      onOpenExternalOrInternalScienceConfirmationModal
                    } // kickOffMutation
                  />
                )}
              </TabPanel>
              {projectType.includes("External") && (
                <TabPanel>
                  <ProjectExternalSection
                    setExternalData={setExternalData}
                    onClose={onClose}
                    backClick={goBack}
                    createClick={kickOffMutation}
                  />
                </TabPanel>
              )}

              {projectType.includes("Student") && (
                <TabPanel>
                  <ProjectStudentSection
                    studentFilled={studentFilled}
                    studentData={studentData}
                    setStudentData={setStudentData}
                    setStudentFilled={setStudentFilled}
                    onClose={onClose}
                    backClick={goBack}
                    createClick={kickOffMutation}
                  />
                </TabPanel>
              )}
            </TabPanels>
          </Tabs>
        </ModalContent>
      </Modal>
    </>
  );
};
