// Modal Component for editing the Project Details

import { useColorMode } from "@/shared/utils/theme.utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { useState } from "react";
import { useCurrentYear } from "@/shared/hooks/useCurrentYear";
import { IconType } from "react-icons";
import { ProjectDetailsSection } from "@/features/projects/components/forms/ProjectDetailsSection";
import { ProjectLocationSection } from "@/features/projects/components/forms/ProjectLocationSection";
import { ProjectBaseInformation } from "@/features/projects/components/forms/ProjectBaseInformation";
import "@/styles/modalscrollbar.css";
import {
  ICreateProjectBaseInfo,
  ICreateProjectDetails,
  ICreateProjectExternalDetails,
  ICreateProjectStudentDetails,
} from "@/features/projects/services/projects.service";
import { ProjectExternalSection } from "@/features/projects/components/forms/ProjectExternalSection";
import { ProjectStudentSection } from "@/features/projects/components/forms/ProjectStudentSection";
import type { IExtendedProjectDetails, IProjectData } from "@/shared/types";
import { useUser } from "@/features/users/hooks/useUser";
import { cn } from "@/shared/utils/component.utils";

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
    <Dialog open={isOpen} onOpenChange={controlledClose}>
      <DialogContent className={cn(
        "max-w-3xl max-h-[80vh] overflow-y-auto",
        colorMode === "dark" ? "text-gray-400 bg-gray-800" : "text-gray-900 bg-white"
      )}>
        <DialogHeader className="flex flex-row items-center">
          <div className={cn(
            "mr-3",
            projectType === "Core Function"
              ? "text-red-500"
              : projectType === "Science Project"
                ? "text-green-500"
                : projectType === "Student Project"
                  ? "text-blue-500"
                  : projectType === "External Project"
                    ? "text-gray-500"
                    : "text-gray-500"
          )}>
            <ButtonIcon />
          </div>
          <DialogTitle>{baseInformation.title}</DialogTitle>
        </DialogHeader>
        
        <Tabs value={activeTabIndex.toString()} onValueChange={(value) => setActiveTabIndex(parseInt(value))}>
          <TabsList className="grid w-full grid-cols-4 mb-4">
            <TabsTrigger value="0">Base Information</TabsTrigger>
            <TabsTrigger value="1" disabled={!baseInformationFilled}>Details</TabsTrigger>
            <TabsTrigger value="2" disabled={!baseInformationFilled || !projectDetailsFilled}>
              Location
            </TabsTrigger>
            {projectType.includes("External") && (
              <TabsTrigger value="3" disabled={!locationFilled}>External Details</TabsTrigger>
            )}
            {projectType === "Student Project" && (
              <TabsTrigger value="3" disabled={!locationFilled}>Student Details</TabsTrigger>
            )}
          </TabsList>
          
          <TabsContent value="0">
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
          
          <TabsContent value="1">
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
          </TabsContent>
          
          <TabsContent value="2">
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
          </TabsContent>
          
          {projectType.includes("External") && (
            <TabsContent value="3">
              <ProjectExternalSection
                setExternalData={setExternalData}
                onClose={onClose}
                backClick={goBack}
                createClick={kickOffMutation}
              />
            </TabsContent>
          )}

          {projectType.includes("Student") && (
            <TabsContent value="3">
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
  ) : null;
};
