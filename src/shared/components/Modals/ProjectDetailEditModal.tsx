// Modal Component for editing the Project Details

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
} from "@chakra-ui/react";
import { useState } from "react";
import { useCurrentYear } from "@/shared/hooks/helper/useCurrentYear";
import { IconType } from "react-icons";
import { ProjectDetailsSection } from "../Pages/CreateProject/ProjectDetailsSection";
import { ProjectLocationSection } from "../Pages/CreateProject/ProjectLocationSection";
import { ProjectBaseInformation } from "../Pages/CreateProject/ProjectBaseInformation";
import "@/styles/modalscrollbar.css";
import {
  ICreateProjectBaseInfo,
  ICreateProjectDetails,
  ICreateProjectExternalDetails,
  ICreateProjectStudentDetails,
} from "@/shared/lib/api";
import { ProjectExternalSection } from "../Pages/CreateProject/ProjectExternalSection";
import { ProjectStudentSection } from "../Pages/CreateProject/ProjectStudentSection";
import type { IExtendedProjectDetails, IProjectData } from "@/shared/types/index.d";
import { useUser } from "@/shared/hooks/tanstack/useUser";

interface IEditProjectDetailsProps {
  projectType: string;
  isOpen: boolean;
  onClose: () => void;
  icon: IconType;
  baseInformation: IProjectData;
  details: IExtendedProjectDetails | null | undefined;
}

export const ProjectDetailEditModal = ({
  projectType,
  isOpen,
  onClose,
  icon,
  baseInformation,
  details,
}: IEditProjectDetailsProps) => {
  const ButtonIcon = icon;

  const currentYear = useCurrentYear();

  const { colorMode } = useColorMode();

  const [baseInformationFilled, setBaseInformationFilled] =
    useState<boolean>(false);
  const [projectDetailsFilled, setProjectDetailsFilled] =
    useState<boolean>(false);
  const [locationFilled, setLocationFilled] = useState<boolean>(false);
  const [externalFilled, setExternalFilled] = useState<boolean>(false);
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

  const kickOffMutation = () => {
    console.log("Mutation here");
  };

  const { userData: me } = useUser();

  return baseInformation && details ? (
    <Modal
      isOpen={isOpen}
      onClose={controlledClose}
      size={"3xl"}
      scrollBehavior="inside"
    >
      <ModalOverlay />
      <ModalContent
        color={colorMode === "dark" ? "gray.400" : null}
        bg={colorMode === "light" ? "white" : "gray.800"}
      >
        <ModalHeader
          display={"inline-flex"}
          // justifyContent={"center"}
          alignItems={"center"}
          // pb={6}
        >
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
          <Text>{baseInformation.title}</Text>
        </ModalHeader>
        <ModalCloseButton />
        <Tabs isFitted variant="enclosed" index={activeTabIndex}>
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
            <TabPanel>
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
                backClick={goBack}
                nextClick={goToLocationTab}
                thisUser={me?.pk}
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
                  createClick={kickOffMutation}
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
  ) : null;
};
