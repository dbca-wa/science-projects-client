// Dropdown search component for users. Displays 5 users below the search box.

import useApiEndpoint from "@/shared/hooks/useApiEndpoint";
import { useColorMode } from "@/shared/utils/theme.utils";
import { Avatar, AvatarImage } from "@/shared/components/ui/avatar";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Button } from "@/shared/components/ui/button";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { X } from "lucide-react";
import { useEffect, useState, type RefObject, type ReactNode } from "react";
import {
  getFullProjectSimple,
  getMyProjectsBasedOnSearchTerm,
} from "@/features/projects/services/projects.service";
import { useNoImage } from "@/shared/hooks/useNoImage";
import { useUser } from "@/features/users/hooks/useUser";
import type { IProjectData } from "@/shared/types";
import { ExtractedHTMLTitle } from "@/shared/components/ExtractedHTMLTitle";

interface IProjectSearchDropdown {
  allProjects: boolean;
  isRequired: boolean;
  setProjectFunction: (setProjectPk: number) => void;
  setProjectTitleFunction?: (setProjectTitle: string) => void;
  user: number;
  label: string;
  placeholder: string;
  helperText: string;
  preselectedProjectPk?: number;
  inputRef: RefObject<HTMLInputElement | null>;
  autoFocus?: boolean;
  isClosed?: boolean;
  // register: any;
}

export const ProjectSearchDropdown = ({
  isRequired,
  setProjectFunction,
  setProjectTitleFunction,
  label,
  placeholder,
  helperText,
  preselectedProjectPk,
  inputRef,
  autoFocus,
  isClosed,
}: IProjectSearchDropdown) => {
  const [searchTerm, setSearchTerm] = useState(""); // Local state for search term
  const [filteredItems, setFilteredItems] = useState<IProjectData[]>([]); // Local state for filtered items
  const [isMenuOpen, setIsMenuOpen] = useState(isClosed ? false : true); // Stores the menu open state
  const [selectedProject, setSelectedProject] = useState<IProjectData | null>(); // New state to store the selected name

  const { userLoading, userData } = useUser();

  useEffect(() => {
    if (!userLoading) {
      if (preselectedProjectPk === undefined || preselectedProjectPk === null) {
        if (searchTerm) {
          setIsMenuOpen(true);
          getMyProjectsBasedOnSearchTerm(searchTerm, userData.pk)
            .then((data) => {
              console.log(data.projects);
              setFilteredItems(data.projects);
            })
            .catch((error) => {
              console.error("Error fetching users:", error);
              setFilteredItems([]);
            });
        } else {
          if (!selectedProject) {
            handleClearProject();
            setIsMenuOpen(isClosed ? false : true);
          }
        }
      } else {
        console.log("Preselected Project PK:", preselectedProjectPk);
        getFullProjectSimple(preselectedProjectPk)
          .then((projectData) => {
            console.log(projectData.project);
            setProjectFunction(projectData.project.pk);
            setIsMenuOpen(false);
            setSelectedProject(projectData.project);
            setSearchTerm(""); // Clear the search term when a user is selected
            if (setProjectTitleFunction) {
              setProjectTitleFunction(projectData.project.title);
            }
          })
          .catch((error) => {
            console.error("Error fetching users:", error);
          });
      }
    }
  }, [searchTerm, userLoading, userData, preselectedProjectPk, isClosed]);

  const handleSelectProject = (project: IProjectData) => {
    setProjectFunction(project.pk);
    setIsMenuOpen(false);
    setSelectedProject(project); // Update the selected project
    setSearchTerm(""); // Clear the search term when a project is selected
    if (setProjectTitleFunction) {
      setProjectTitleFunction(project.title);
    }
  };

  const handleClearProject = () => {
    if (preselectedProjectPk !== null && preselectedProjectPk !== undefined) {
      return;
    }

    setProjectFunction(0); // Clear the selected project by setting the projectPk to 0 (or any value that represents no project)
    setSelectedProject(null); // Clear the selected project state
    setIsMenuOpen(false); // Show the menu again when the project is cleared
    if (setProjectTitleFunction) {
      setProjectTitleFunction("");
    }
  };

  return (
    // isLoading ||
    userLoading ? null : (
      <div className={`mb-4 w-full h-full ${isRequired ? 'required' : ''}`}>
        <Label>{label}</Label>
        {selectedProject ? (
          <div className="mb-2 text-blue-500">
            <SelectedProjectInput
              project={selectedProject}
              onClear={handleClearProject}
              isPreselected={
                preselectedProjectPk !== null &&
                preselectedProjectPk !== undefined
              }
            />
          </div>
        ) : (
          <div className="relative">
            <Input
              autoComplete="off"
              ref={inputRef}
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder={placeholder}
              onFocus={() => setIsMenuOpen(true)}
              autoFocus={autoFocus ? true : false}
            />
          </div>
        )}

        {selectedProject
          ? null
          : filteredItems.length > 0 && (
              <div className="relative w-full">
                <CustomMenu isOpen={filteredItems.length > 0 && isMenuOpen}>
                  <CustomMenuList minWidth="100%">
                    {filteredItems?.map((project) => (
                      <CustomMenuItem
                        key={project?.pk}
                        onClick={() => handleSelectProject(project)}
                        project={project}
                      />
                    ))}
                  </CustomMenuList>
                </CustomMenu>
              </div>
            )}
        <p className="text-sm text-muted-foreground mt-1">{helperText}</p>
      </div>
    )
  );
};

// =========================================== ADDITIONAL COMPONENTS ====================================================

interface CustomMenuProps {
  isOpen: boolean;
  children: ReactNode;
}

interface CustomMenuItemProps {
  onClick: () => void;
  project: IProjectData;
}

interface CustomMenuListProps {
  minWidth: string;
  children: ReactNode;
}

const CustomMenu = ({ isOpen, children, ...rest }: CustomMenuProps) => {
  return (
    <div
      className={`absolute w-full bg-background border border-border rounded-md shadow-lg z-10 ${isOpen ? 'block' : 'hidden'}`}
      {...rest}
    >
      {children}
    </div>
  );
};

const CustomMenuItem = ({ onClick, project, ...rest }: CustomMenuItemProps) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = () => {
    onClick();
  };

  const [imageLoaded, setImageLoaded] = useState(false);

  const handleImageLoad = () => {
    setImageLoaded(true);
  };
  const noImage = useNoImage();
  const serverUrl = useApiEndpoint();

  return project ? (
    serverUrl ? (
      <button
        type="button"
        className={`w-full text-left p-3 flex items-center hover:bg-accent hover:text-accent-foreground transition-colors ${isHovered ? 'bg-accent' : 'bg-transparent'}`}
        onClick={handleClick}
        onMouseOver={() => setIsHovered(true)}
        onMouseOut={() => setIsHovered(false)}
        {...rest}
      >
        {project?.image ? (
          <div className={`${!imageLoaded ? 'animate-pulse' : ''}`}>
            <Avatar className="w-8 h-8">
              <AvatarImage
                src={
                  project.image
                    ? project.image?.file?.startsWith("http")
                      ? `${project.image?.file}`
                      : `${serverUrl}${project.image?.file}`
                    : noImage
                }
                onLoad={handleImageLoad}
              />
            </Avatar>
          </div>
        ) : (
          <Avatar className="w-8 h-8">
            <AvatarImage src={noImage} onLoad={handleImageLoad} />
          </Avatar>
        )}

        <div className="flex items-center justify-start ml-3 h-full">
          <ExtractedHTMLTitle
            htmlContent={`${project?.title}`}
            color={"green.500"}
          />
        </div>
      </button>
    ) : null
  ) : null;
};

const CustomMenuList = ({
  minWidth,
  children,
  ...rest
}: CustomMenuListProps) => {
  return (
    <div className={`relative w-full`} style={{ minWidth }} {...rest}>
      {children}
    </div>
  );
};

interface SelectedProjectInputProps {
  project: IProjectData;
  onClear: () => void;
  isPreselected: boolean;
}

const SelectedProjectInput = ({
  project,
  onClear,
  isPreselected,
}: SelectedProjectInputProps) => {
  const noImage = useNoImage();

  const [projectPk, setProjectPk] = useState(project.pk);
  const { colorMode } = useColorMode();
  const serverUrl = useApiEndpoint();

  return serverUrl ? (
    <div className={`flex items-center relative px-3 py-2 mr-2 rounded-md border ${colorMode === "dark" ? "bg-muted border-border" : "bg-muted border-border"}`}>
      <Avatar className="w-8 h-8">
        <AvatarImage
          src={
            project.image
              ? project.image?.file?.startsWith("http")
                ? `${project.image?.file}`
                : `${serverUrl}${project.image?.file}`
              : noImage
          }
        />
      </Avatar>
      <div className="ml-2 flex-1">
        <ExtractedHTMLTitle
          htmlContent={`${project?.title}`}
          color={colorMode === "light" ? "green.500" : "green.400"}
        />
      </div>
      <input
        value={projectPk}
        onChange={() => {
          setProjectPk(project.pk);
        }}
        hidden
      />

      {!isPreselected && (
        <Button
          variant="ghost"
          size="sm"
          className="ml-2 h-6 w-6 p-0 hover:bg-destructive/10 hover:text-destructive"
          onClick={onClear}
        >
          <X className="h-3 w-3" />
        </Button>
      )}
    </div>
  ) : null;
};
