// Modal for creating new projects

import { useState } from "react";
import { toast } from "sonner";
import { useCurrentYear } from "@/shared/hooks/useCurrentYear";
import { type IconType } from "react-icons";
import { ProjectDetailsSection } from "@/features/projects/components/forms/ProjectDetailsSection";
import { ProjectLocationSection } from "@/features/projects/components/forms/ProjectLocationSection";
import { ProjectBaseInformation } from "@/features/projects/components/forms/ProjectBaseInformation";
import "@/styles/modalscrollbar.css";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  type ICreateProjectBaseInfo,
  type ICreateProjectDetails,
  type ICreateProjectExternalDetails,
  type ICreateProjectStudentDetails,
  type IProjectCreationVariables,
  createProject,
} from "@/features/projects/services/projects.service";
import {
  type MutationError,
  type ProjectCreationMutationSuccess,
} from "@/features/users/services/users.service";
import { useNavigate } from "react-router-dom";
import { ProjectExternalSection } from "@/features/projects/components/forms/ProjectExternalSection";
import { ProjectStudentSection } from "@/features/projects/components/forms/ProjectStudentSection";
import { useUser } from "@/features/users/hooks/useUser";
import { ExternalInternalSPConfirmationModal } from "./ExternalInternalSPConfirmationModal";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { useColorMode } from "@/shared/utils/theme.utils";

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

  // Mutation, query client, onsubmit, and api function
  const queryClient = useQueryClient();

  const navigate = useNavigate();

  const { userData } = useUser();

  const [isExternalOrInternalScienceConfirmationModalOpen, setIsExternalOrInternalScienceConfirmationModalOpen] = useState(false);
  const onOpenExternalOrInternalScienceConfirmationModal = () => setIsExternalOrInternalScienceConfirmationModalOpen(true);
  const onCloseExternalOrInternalScienceConfirmationModal = () => setIsExternalOrInternalScienceConfirmationModalOpen(false);

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
      toast.loading("Creating project...", {
        description: "One moment!",
      });
    },
    // Success handling based on API-file-declared interface
    onSuccess: async (data) => {
      toast.success("Success", {
        description: `Project Created`,
      });
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

      toast.error("Could not create project", {
        description: capitalizedErrorMessage,
      });
    },
  });

  const getProjectTypeColor = () => {
    switch (projectType) {
      case "Core Function":
        return "text-red-500";
      case "Science Project":
        return "text-green-500";
      case "Student Project":
        return "text-blue-500";
      case "External Project":
        return "text-gray-500";
      default:
        return "text-gray-500";
    }
  };

  const getTabValue = () => {
    switch (activeTabIndex) {
      case 0:
        return "base";
      case 1:
        return "details";
      case 2:
        return "location";
      case 3:
        return projectType.includes("External") ? "external" : "student";
      default:
        return "base";
    }
  };

  const handleTabChange = (value: string) => {
    switch (value) {
      case "base":
        setActiveTabIndex(0);
        break;
      case "details":
        if (baseInformationFilled) setActiveTabIndex(1);
        break;
      case "location":
        if (baseInformationFilled && projectDetailsFilled) setActiveTabIndex(2);
        break;
      case "external":
      case "student":
        if (locationFilled) setActiveTabIndex(3);
        break;
    }
  };

  return (
    <>
      <ExternalInternalSPConfirmationModal
        isOpen={isExternalOrInternalScienceConfirmationModalOpen}
        onClose={onCloseExternalOrInternalScienceConfirmationModal}
        isExternalSP={isExternalSP}
        setIsExternalSP={setIsExternalSP}
        mutationFunction={kickOffMutation}
      />
      <Dialog open={isOpen} onOpenChange={controlledClose}>
        <DialogContent 
          className={`max-w-6xl max-h-[90vh] overflow-y-auto ${
            colorMode === "dark" 
              ? "bg-gray-800 text-gray-400 border-gray-700" 
              : "bg-white text-gray-900 border-gray-200"
          }`}
        >
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <div className={`mr-3 ${getProjectTypeColor()}`}>
                <ButtonIcon />
              </div>
              <span>
                New {projectType} - {currentYear}
              </span>
            </DialogTitle>
          </DialogHeader>
          
          <Tabs value={getTabValue()} onValueChange={handleTabChange} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="base">Base Information</TabsTrigger>
              <TabsTrigger value="details" disabled={!baseInformationFilled}>
                Details
              </TabsTrigger>
              <TabsTrigger 
                value="location" 
                disabled={!baseInformationFilled || !projectDetailsFilled}
              >
                Location
              </TabsTrigger>
              {projectType.includes("External") && (
                <TabsTrigger value="external" disabled={!locationFilled}>
                  External Details
                </TabsTrigger>
              )}
              {projectType === "Student Project" && (
                <TabsTrigger value="student" disabled={!locationFilled}>
                  Student Details
                </TabsTrigger>
              )}
            </TabsList>
            
            <TabsContent value="base" className="h-full px-10">
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
            </TabsContent>
            
            <TabsContent value="details">
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
            </TabsContent>
            
            <TabsContent value="location">
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
            </TabsContent>
            
            {projectType.includes("External") && (
              <TabsContent value="external">
                <ProjectExternalSection
                  setExternalData={setExternalData}
                  onClose={onClose}
                  backClick={goBack}
                  createClick={kickOffMutation}
                />
              </TabsContent>
            )}

            {projectType.includes("Student") && (
              <TabsContent value="student">
                <ProjectStudentSection
                  studentFilled={studentFilled}
                  studentData={studentData}
                  setStudentData={setStudentData}
                  setStudentFilled={setStudentFilled}
                  onClose={onClose}
                  backClick={goBack}
                  createClick={kickOffMutation}
                />
              </TabsContent>
            )}
          </Tabs>
        </DialogContent>
      </Dialog>
    </>
  );
};
