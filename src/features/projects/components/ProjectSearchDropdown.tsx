// Dropdown search component for users. Displays 5 users below the search box.

import useApiEndpoint from "@/shared/hooks/useApiEndpoint";
import { CloseIcon } from "@chakra-ui/icons";
import {
  Avatar,
  Box,
  Flex,
  FormControl,
  FormHelperText,
  FormLabel,
  IconButton,
  Input,
  InputGroup,
  Skeleton,
  useColorMode,
} from "@chakra-ui/react";
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
      <FormControl
        isRequired={isRequired}
        mb={4}
        // bg={"red"}
        w={"100%"}
        h={"100%"}
      >
        <FormLabel>{label}</FormLabel>
        {selectedProject ? (
          <Box mb={2} color="blue.500">
            <SelectedProjectInput
              project={selectedProject}
              onClear={handleClearProject}
              isPreselected={
                preselectedProjectPk !== null &&
                preselectedProjectPk !== undefined
              }
            />
          </Box>
        ) : (
          <InputGroup>
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
          </InputGroup>
        )}

        {selectedProject
          ? null
          : filteredItems.length > 0 && (
              <Box pos="relative" w="100%">
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
              </Box>
            )}
        <FormHelperText>{helperText}</FormHelperText>
      </FormControl>
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
    <Box
      pos="absolute"
      w="100%"
      bg="white"
      boxShadow="md"
      zIndex={1}
      display={isOpen ? "block" : "none"}
      {...rest}
    >
      {children}
    </Box>
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
      <Flex
        as="button"
        type="button"
        w="100%"
        textAlign="left"
        p={2}
        onClick={handleClick}
        onMouseOver={() => setIsHovered(true)}
        onMouseOut={() => setIsHovered(false)}
        bg={isHovered ? "gray.200" : "transparent"}
        alignItems="center"
        {...rest}
      >
        {project?.image ? (
          <Skeleton
            isLoaded={imageLoaded}
            startColor="gray.200"
            endColor="gray.400"
            rounded={"full"}
          >
            <Avatar
              src={
                project.image
                  ? project.image?.file?.startsWith("http")
                    ? `${project.image?.file}`
                    : `${serverUrl}${project.image?.file}`
                  : noImage
              }
              onLoad={handleImageLoad}
            />
          </Skeleton>
        ) : (
          <Avatar src={noImage} onLoad={handleImageLoad} />
        )}

        <Box
          display="flex"
          alignItems="center"
          justifyContent="start"
          ml={3}
          h="100%"
        >
          <ExtractedHTMLTitle
            htmlContent={`${project?.title}`}
            color={"green.500"}
          />
        </Box>
      </Flex>
    ) : null
  ) : null;
};

const CustomMenuList = ({
  minWidth,
  children,
  ...rest
}: CustomMenuListProps) => {
  return (
    <Box pos="relative" w="100%" minWidth={minWidth} {...rest}>
      {children}
    </Box>
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

  // useEffect(() => {
  //   console.log(`proj image alone: ${project.image?.file}`)
  //   console.log(`proj image with serverurl: ${serverUrl}${project.image?.file}`,)
  // })
  return serverUrl ? (
    <Flex
      align="center"
      position="relative"
      bgColor={colorMode === "dark" ? "gray.700" : "gray.100"}
      borderRadius="md"
      px={2}
      py={1}
      mr={2}
    >
      <Avatar
        size="sm"
        src={
          project.image
            ? project.image?.file?.startsWith("http")
              ? `${project.image?.file}`
              : `${serverUrl}${project.image?.file}`
            : noImage
          // project?.image?.file
          //   ? project.image?.file
          //   : project.image?.old_file
          //     ? project.image.old_file
          //     : noImage
        }
      />
      <ExtractedHTMLTitle
        ml={2}
        htmlContent={`${project?.title}`}
        color={colorMode === "light" ? "green.500" : "green.400"}
      />
      <input
        // {...register("project", { required: true })}
        value={projectPk}
        onChange={() => {
          setProjectPk(project.pk);
        }}
        hidden
      />

      {!isPreselected && (
        <IconButton
          aria-label="Clear selected user"
          icon={<CloseIcon />}
          size="xs"
          position="absolute"
          top="50%"
          right={2}
          transform="translateY(-50%)"
          onClick={onClear}
        />
      )}
    </Flex>
  ) : null;
};
