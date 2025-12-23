// Dropdown search component for users. Displays 5 users below the search box.

import { useColorMode } from "@/shared/utils/theme.utils";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { X } from "lucide-react";
import { useEffect, useState, type RefObject, type ReactNode } from "react";
import {
  getFullProjectSimple,
  getMyProjectsBasedOnSearchTerm,
} from "@/features/projects/services/projects.service";
import { useUser } from "@/features/users/hooks/useUser";
import type { IMidDoc } from "@/shared/types";
import useApiEndpoint from "@/shared/hooks/useApiEndpoint";
import { ExtractedHTMLTitle } from "@/shared/components/ExtractedHTMLTitle";
import { cn } from "@/shared/utils";

interface IProjectDocumentDropdown {
  selectedProject: boolean;
  isRequired: boolean;

  preselectedProjectDocumentPk?: number;
  setProjectDocumentFunction: (setProjectDocumentPk: number) => void;
  setProjectDocumentTypeFunction: (
    setProjectDocumentTypeString: string,
  ) => void;
  setDocTypePk?: (docTypePk: number) => void;

  user: number;
  label: string;
  placeholder: string;
  helperText: string;
  inputRef: RefObject<HTMLInputElement | null>;
  autoFocus?: boolean;
  isClosed?: boolean;
  // register: any;
}

export const ProjectDocumentDropdown = ({
  isRequired,
  setProjectDocumentFunction,
  setProjectDocumentTypeFunction,
  setDocTypePk,
  label,
  placeholder,
  helperText,
  preselectedProjectDocumentPk,
  inputRef,
  autoFocus,
  isClosed,
}: IProjectDocumentDropdown) => {
  const [searchTerm, setSearchTerm] = useState(""); // Local state for search term
  const [filteredItems, setFilteredItems] = useState<IMidDoc[]>([]); // Local state for filtered items
  const [isMenuOpen, setIsMenuOpen] = useState(isClosed ? false : true); // Stores the menu open state
  const [selectedProjectDocument, setSelectedProjectDocument] =
    useState<IMidDoc | null>(null); // New state to store the selected name

  const { userLoading, userData } = useUser();

  useEffect(() => {
    if (!userLoading) {
      if (
        preselectedProjectDocumentPk === undefined ||
        preselectedProjectDocumentPk === null
      ) {
        if (searchTerm && userData?.pk) {
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
          if (!selectedProjectDocument) {
            handleClearProject();
            setIsMenuOpen(isClosed ? false : true);
          }
        }
      } else {
        console.log("Preselected Project PK:", preselectedProjectDocumentPk);
        getFullProjectSimple(preselectedProjectDocumentPk)
          .then((projectData) => {
            console.log(projectData.project);
            setProjectDocumentFunction(projectData.project.pk);
            setIsMenuOpen(false);
            setSelectedProjectDocument(projectData.project);
            setSearchTerm(""); // Clear the search term when a user is selected
            if (setProjectDocumentTypeFunction) {
              setProjectDocumentTypeFunction(projectData.project.title);
            }
            if (setDocTypePk) {
              setDocTypePk(projectData.project.pk);
            }
          })
          .catch((error) => {
            console.error("Error fetching users:", error);
          });
      }
    }
  }, [
    searchTerm,
    userLoading,
    userData,
    preselectedProjectDocumentPk,
    isClosed,
  ]);

  const handleSelectDocument = (document: IMidDoc) => {
    setProjectDocumentTypeFunction(document.kind);
    setIsMenuOpen(false);
    setSelectedProjectDocument(document); // Update the selected project
    setSearchTerm(""); // Clear the search term when a project is selected
    if (setDocTypePk) {
      setDocTypePk(document.referenced_doc.pk);
    }
  };

  const handleClearProject = () => {
    if (
      preselectedProjectDocumentPk !== null &&
      preselectedProjectDocumentPk !== undefined
    ) {
      return;
    }

    setProjectDocumentFunction(0); // Clear the selected project by setting the projectPk to 0 (or any value that represents no project)
    setSelectedProjectDocument(null); // Clear the selected project state
    setIsMenuOpen(false); // Show the menu again when the project is cleared
    if (setProjectDocumentTypeFunction) {
      setProjectDocumentTypeFunction("");
    }
    if (setDocTypePk) {
      setDocTypePk(0);
    }
  };

  return (
    userLoading ? null : (
      <div className={cn("mb-4 w-full h-full", isRequired && "required")}>
        <Label>{label}</Label>
        {selectedProjectDocument ? (
          <div className="mb-2 text-blue-500">
            <SelectedDocumentInput
              document={selectedProjectDocument}
              onClear={handleClearProject}
              isPreselected={
                preselectedProjectDocumentPk !== null &&
                preselectedProjectDocumentPk !== undefined
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

        {selectedProjectDocument
          ? null
          : filteredItems && filteredItems.length > 0 && (
              <div className="relative w-full">
                <CustomMenu isOpen={filteredItems && filteredItems.length > 0 && isMenuOpen}>
                  <CustomMenuList minWidth="100%">
                    {filteredItems?.map((document) => (
                      <CustomMenuItem
                        key={document?.pk}
                        onClick={() => handleSelectDocument(document)}
                        document={document}
                      />
                    ))}
                  </CustomMenuList>
                </CustomMenu>
              </div>
            )}
        <p className="text-sm text-muted-foreground mt-2">{helperText}</p>
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
  document: IMidDoc;
  // | IProjectData
}

interface CustomMenuListProps {
  minWidth: string;
  children: ReactNode;
}

const CustomMenu = ({ isOpen, children, ...rest }: CustomMenuProps) => {
  const { colorMode } = useColorMode();
  return (
    <div
      className={cn(
        "absolute w-full shadow-md z-10",
        isOpen ? "block" : "hidden",
        colorMode === "light" ? "bg-white" : "bg-gray-700"
      )}
      {...rest}
    >
      {children}
    </div>
  );
};

const CustomMenuItem = ({
  onClick,
  document,
  ...rest
}: CustomMenuItemProps) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = () => {
    onClick();
  };

  const serverUrl = useApiEndpoint();

  return document ? (
    serverUrl ? (
      <button
        type="button"
        className={cn(
          "w-full text-left p-2 flex items-center transition-colors",
          isHovered ? "bg-gray-200 dark:bg-gray-600" : "transparent"
        )}
        onClick={handleClick}
        onMouseOver={() => setIsHovered(true)}
        onMouseOut={() => setIsHovered(false)}
        {...rest}
      >
        <div className="flex items-center justify-start ml-3 h-full">
          <ExtractedHTMLTitle
            htmlContent={`(${document?.kind}) ${document?.project?.title}`}
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
    <div className="relative w-full" style={{ minWidth }} {...rest}>
      {children}
    </div>
  );
};

interface SelectedDocumentInputProps {
  document: IMidDoc;
  onClear: () => void;
  isPreselected: boolean;
}

const SelectedDocumentInput = ({
  document,
  onClear,
  isPreselected,
}: SelectedDocumentInputProps) => {
  const [documentPk, setDocumentPk] = useState(document.pk);
  const { colorMode } = useColorMode();
  const serverUrl = useApiEndpoint();

  return serverUrl ? (
    <div
      className={cn(
        "flex items-center relative px-2 py-1 mr-2 rounded-md",
        colorMode === "dark" ? "bg-gray-700" : "bg-gray-100"
      )}
    >
      <ExtractedHTMLTitle
        className="ml-2"
        htmlContent={`(${document?.kind}) ${document?.project?.title}`}
        color={colorMode === "light" ? "green.500" : "green.400"}
      />
      <input
        value={documentPk}
        onChange={() => {
          setDocumentPk(document?.pk);
        }}
        hidden
      />

      {!isPreselected && (
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-1/2 right-2 transform -translate-y-1/2 h-6 w-6 p-0"
          onClick={onClear}
          aria-label="Clear selected document"
        >
          <X className="h-3 w-3" />
        </Button>
      )}
    </div>
  ) : null;
};
