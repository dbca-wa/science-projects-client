// Dropdown search component for affiliations. Displays 5 affiliations below the search box.

import { useAffiliation } from "@/features/admin/hooks/useAffiliation";
import { X } from "lucide-react";
import { useColorMode } from "@/shared/utils/theme.utils";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Badge } from "@/shared/components/ui/badge";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
  type ReactNode,
} from "react";
import { FaTrash } from "react-icons/fa";
import { GrOrganization } from "react-icons/gr";
import {
  createAffiliation,
  getAffiliationsBasedOnSearchTerm,
} from "@/features/admin/services/admin.service";
import type { IAffiliation } from "@/shared/types";

interface IAffiliationSearchDropdown {
  isRequired: boolean;
  setterFunction?: (setAffiliationPk?: IAffiliation) => void;
  array?: IAffiliation[];
  arrayAddFunction?: (setAffiliationPk: IAffiliation) => void;
  arrayRemoveFunction?: (setAffiliationPk: IAffiliation) => void;
  arrayClearFunction?: () => void;
  label: string;
  placeholder: string;
  helperText: string;
  preselectedAffiliationPk?: number;
  isEditable?: boolean;
  autoFocus?: boolean;
  hideTags?: boolean;
}

export const AffiliationCreateSearchDropdown = forwardRef<
  HTMLInputElement,
  IAffiliationSearchDropdown
>(
  (
    {
      isRequired,
      setterFunction,
      array,
      arrayAddFunction,
      arrayRemoveFunction,
      arrayClearFunction,
      label,
      placeholder,
      helperText,
      preselectedAffiliationPk,
      isEditable,
      hideTags,
    },
    ref,
  ) => {
    const { colorMode } = useColorMode();
    const inputRef = useRef(null);
    const [searchTerm, setSearchTerm] = useState(""); // Local state for search term
    const [filteredItems, setFilteredItems] = useState<IAffiliation[]>([]); // Local state for filtered items
    const [isMenuOpen, setIsMenuOpen] = useState(true); // Stores the menu open state
    const [selectedAffiliation, setSelectedAffiliation] =
      useState<IAffiliation | null>(); // New state to store the selected name

    // const { refetchAffiliations } = useAffiliations();

    useEffect(() => {
      if (searchTerm.trim() !== "") {
        getAffiliationsBasedOnSearchTerm(searchTerm, 1)
          .then((data) => {
            // console.log(data.affiliations);
            // Filter out affiliations that are already selected (by PK or by name)
            const filtr = data.affiliations.filter((item) => {
              return !array?.some((arrayItem) => 
                arrayItem.pk === item.pk || 
                arrayItem.name?.trim().toLowerCase() === item.name?.trim().toLowerCase()
              );
            });
            console.log(filtr);
            setFilteredItems(filtr);

            // setFilteredItems(data.affiliations);
          })
          .catch((error) => {
            console.error("Error fetching affiliations:", error);
            setFilteredItems([]);
          });
      } else {
        setFilteredItems([]); // Clear the filtered items when the search term is empty
      }
    }, [searchTerm, array]);

    const { affiliationLoading, affiliationData } = useAffiliation(
      preselectedAffiliationPk !== undefined ? preselectedAffiliationPk : 0,
    );

    useEffect(() => {
      if (!affiliationLoading && affiliationData) {
        if (setterFunction) {
          setterFunction(affiliationData?.pk);
        } else if (arrayAddFunction) {
          arrayAddFunction(affiliationData?.pk);
        }
        setIsMenuOpen(false);
        if (setterFunction && affiliationData) {
          setSelectedAffiliation(affiliationData);
        }
        setSearchTerm(""); // Clear the search term when a affiliation is selected
      }
    }, [affiliationLoading, affiliationData]);

    const handleSelectAffiliation = (affiliation: IAffiliation) => {
      if (setterFunction) {
        setterFunction(affiliation);
      } else if (arrayAddFunction) {
        arrayAddFunction(affiliation);
      }
      setIsMenuOpen(false);
      if (setterFunction) {
        setSelectedAffiliation(affiliation); // Update the selected affiliation
      }
      setSearchTerm(""); // Clear the search term when a affiliation is selected
    };

    const handleClearAffiliation = () => {
      if (
        preselectedAffiliationPk !== null &&
        preselectedAffiliationPk !== undefined &&
        isEditable !== true
      ) {
        return;
      }

      if (setterFunction) {
        setterFunction(undefined); // Clear the selected affiliation in the parent form
      }

      setSelectedAffiliation(null); // Clear the selected affiliation state
      setIsMenuOpen(true); // Show the menu again
    };
    useImperativeHandle(ref, () => ({
      focusInput: () => {
        inputRef?.current?.focus?.();
      },
    }));

    return (
      <>
        <div className={`mb-4 z-50 ${isRequired ? 'required' : ''}`}>
          <Label>{label}</Label>
          {selectedAffiliation ? (
            <div className="mb-2 text-blue-500">
              <SelectedAffiliationPk
                affiliation={selectedAffiliation}
                onClear={handleClearAffiliation}
                isEditable={isEditable}
              />
            </div>
          ) : (
            <div>
              <Input
                ref={inputRef} // Attach the ref to the input element
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder={placeholder}
                autoComplete="off"
                onFocus={() => setIsMenuOpen(true)}
              />
            </div>
          )}

          {selectedAffiliation ? null : (
            <div className="relative w-full">
              <CustomMenu isOpen={filteredItems?.length > 0 && isMenuOpen}>
                <CustomMenuList minWidth="100%">
                  {filteredItems.map((affiliation) => (
                    <CustomMenuItem
                      key={affiliation.pk}
                      onClick={() => handleSelectAffiliation(affiliation)}
                      affiliation={affiliation}
                    />
                  ))}
                </CustomMenuList>
              </CustomMenu>
              {!(filteredItems?.length > 0) &&
                isMenuOpen &&
                searchTerm.length >= 2 && (
                  <CustomMenu isOpen={isMenuOpen}>
                    <CustomMenuList minWidth="100%">
                      <DropdownCreateAffiliationMenuItem
                        name={searchTerm}
                        // refetchAffiliationsFn={refetchAffiliations}
                        setFilteredItems={setFilteredItems}
                        array={array}
                        arrayAddFunction={arrayAddFunction}
                      />
                    </CustomMenuList>
                  </CustomMenu>
                )}
            </div>
          )}

          <p className="text-sm text-muted-foreground mt-1">{helperText}</p>
          {array?.length > 1 && !hideTags && (
            <Button
              onClick={() => {
                arrayClearFunction?.();
              }}
              size="sm"
              className={`absolute -bottom-8 right-2 px-2 text-white ${
                colorMode === "light" ? "bg-red-500" : "bg-red-800"
              }`}
            >
              <FaTrash className="mr-1" />
              Clear Affiliations
            </Button>
          )}
        </div>
        {!hideTags && array?.length > 0 && (
          <div className={`flex flex-wrap gap-2 pb-2 ${array?.length > 1 ? 'pt-7' : ''}`}>
            {array?.map((aff, index) => (
              <Badge
                key={index}
                variant="secondary"
                className={`text-white ${
                  colorMode === "light" 
                    ? "bg-blue-500 hover:bg-blue-400" 
                    : "bg-blue-600 hover:bg-blue-500"
                }`}
              >
                <span className="pl-1">{aff?.name}</span>
                <button
                  onClick={() => arrayRemoveFunction(aff)}
                  className="ml-1 hover:bg-blue-700 rounded-full p-0.5"
                  tabIndex={-1}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </>
    );
  }
);

// =========================================== ADDITIONAL COMPONENTS ====================================================

interface CustomMenuProps {
  isOpen: boolean;
  children: ReactNode;
}

interface CustomMenuItemProps {
  onClick: () => void;
  affiliation: IAffiliation;
}

interface CustomMenuListProps {
  minWidth: string;
  children: ReactNode;
}

const CustomMenu = ({ isOpen, children, ...rest }: CustomMenuProps) => {
  const { colorMode } = useColorMode();
  return (
    <div
      className={`absolute w-full ${colorMode === "light" ? "bg-white" : "bg-gray-700"} shadow-md z-10 ${isOpen ? "block" : "hidden"}`}
      {...rest}
    >
      {children}
    </div>
  );
};

interface ICreateAffiliationProps {
  name: string;
  // refetchAffiliationsFn: () => void;
  array: IAffiliation[];
  setFilteredItems: Dispatch<SetStateAction<IAffiliation[]>>;
  arrayAddFunction?: (setAffiliationPk: IAffiliation) => void;
}
const DropdownCreateAffiliationMenuItem = ({
  name,
  // refetchAffiliationsFn,
  array,
  setFilteredItems,
  arrayAddFunction,
  ...rest
}: ICreateAffiliationProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const queryClient = useQueryClient();
  let toastId: string | number | undefined = undefined;
  const addToast = (message: string, type: 'loading' | 'success' | 'error' | 'warning' = 'loading') => {
    if (type === 'loading') {
      toastId = toast.loading(message);
    } else {
      if (toastId) {
        toast.dismiss(toastId);
      }
      if (type === 'success') toast.success(message);
      else if (type === 'error') toast.error(message);
      else if (type === 'warning') toast.warning(message);
    }
  };

  const { colorMode } = useColorMode();
  
  // Check if input contains semicolons (bulk add mode)
  const isBulkAdd = name.includes(";");
  
  // Check if affiliation is already in the array (case-insensitive)
  const isAlreadyAdded = !isBulkAdd && array?.some(
    (item) => item.name?.trim().toLowerCase() === name.trim().toLowerCase()
  );

  // Smart bulk add handler
  const handleBulkAdd = async () => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    
    // Split by semicolons and clean up
    const affiliationNames = name
      .split(";")
      .map((n) => n.trim())
      .filter((n) => n.length > 0);

    let created = 0;
    let added = 0;
    let skipped = 0;
    let failed = 0;

    addToast(`Processing ${affiliationNames.length} affiliation(s)...`, 'loading');

    for (const affiliationName of affiliationNames) {
      const capitalizedName = `${affiliationName[0].toLocaleUpperCase()}${affiliationName.slice(1)}`;
      
      // Check if already in project
      const alreadyInProject = array?.some(
        (item) => item.name?.trim().toLowerCase() === affiliationName.toLowerCase()
      );

      if (alreadyInProject) {
        skipped++;
        continue;
      }

      try {
        // Search for existing affiliation
        const searchResult = await getAffiliationsBasedOnSearchTerm(affiliationName, 1);
        const exactMatch = searchResult.affiliations.find(
          (aff) => aff.name.toLowerCase() === affiliationName.toLowerCase()
        );

        if (exactMatch) {
          // Affiliation exists, just add it to project
          if (arrayAddFunction) {
            arrayAddFunction(exactMatch);
          }
          added++;
        } else {
          // Create new affiliation
          const newAffiliation = await createAffiliation({ name: capitalizedName });
          if (arrayAddFunction) {
            arrayAddFunction(newAffiliation);
          }
          created++;
        }
      } catch (error) {
        console.error(`Failed to process ${affiliationName}:`, error);
        failed++;
      }
    }

    // Show summary toast
    const messages = [];
    if (created > 0) messages.push(`${created} created`);
    if (added > 0) messages.push(`${added} added`);
    if (skipped > 0) messages.push(`${skipped} already in project`);
    if (failed > 0) messages.push(`${failed} failed`);

    const summaryMessage = `Bulk Add Complete: ${messages.join(", ")}`;
    addToast(summaryMessage, failed > 0 ? 'warning' : 'success');

    queryClient.invalidateQueries({ queryKey: ["affiliations"] });
    setFilteredItems([]);
    setIsProcessing(false);
  };

  // Single affiliation add handler
  const handleSingleAdd = async () => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    const capitalizedName = `${name[0].toLocaleUpperCase()}${name.slice(1)}`;

    addToast("Creating Affiliation...", 'loading');

    try {
      const newAffiliation = await createAffiliation({ name: capitalizedName });
      
      addToast(`Created "${capitalizedName}"`, 'success');

      if (arrayAddFunction) {
        arrayAddFunction(newAffiliation);
      }

      queryClient.invalidateQueries({ queryKey: ["affiliations"] });
      setFilteredItems([]);
    } catch (error) {
      addToast("Could not create affiliation", 'error');
    }
    
    setIsProcessing(false);
  };

  const handleClick = () => {
    if (isAlreadyAdded || isProcessing) return;
    
    if (isBulkAdd) {
      handleBulkAdd();
    } else {
      handleSingleAdd();
    }
  };

  return (
    <div
      className={`w-full text-left p-2 flex items-center cursor-pointer ${isHovered ? "bg-gray-200" : "bg-transparent"}`}
      onMouseOver={() => setIsHovered(true)}
      onMouseOut={() => setIsHovered(false)}
    >
      <div className="flex items-center justify-start ml-3 h-full">
        <Button
          onClick={handleClick}
          disabled={isAlreadyAdded || isProcessing}
          variant="ghost"
          className={`${
            isAlreadyAdded
              ? "text-orange-500"
              : isBulkAdd
                ? "text-blue-500"
                : colorMode === "light"
                  ? "text-green-500"
                  : "text-green-300"
          }`}
        >
          <GrOrganization className="mr-2" />
          {isAlreadyAdded
            ? `Already added`
            : isBulkAdd
              ? `Click to add ${name.split(";").filter((n) => n.trim()).length} affiliation(s)`
              : `Click to add "${name[0].toLocaleUpperCase()}${name.slice(1)}" as an organisation/affiliation`}
        </Button>
      </div>
    </div>
  );
};

const CustomMenuItem = ({
  onClick,
  affiliation,
  ...rest
}: CustomMenuItemProps) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = () => {
    onClick();
  };
  const { colorMode } = useColorMode();

  return (
    <div
      className={`w-full text-left p-2 flex items-center cursor-pointer ${isHovered ? "bg-gray-200" : "bg-transparent"}`}
      onClick={handleClick}
      onMouseOver={() => setIsHovered(true)}
      onMouseOut={() => setIsHovered(false)}
      {...rest}
    >
      <div className="flex items-center justify-start ml-3 h-full">
        <p className={`ml-2 ${colorMode === "light" ? "text-green-500" : "text-green-300"}`}>
          {`${affiliation.name}`}
        </p>
      </div>
    </div>
  );
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

interface SelectedAffiliationPkProps {
  affiliation: IAffiliation;
  onClear: () => void;
  isEditable: boolean;
}

const SelectedAffiliationPk = ({
  affiliation,
  onClear,
  isEditable,
}: SelectedAffiliationPkProps) => {
  const { colorMode } = useColorMode();

  return (
    <div
      className={`flex items-center relative px-2 py-1 mr-2 rounded-md ${
        colorMode === "dark" ? "bg-gray-700" : "bg-gray-100"
      }`}
    >
      <p className={`ml-2 ${colorMode === "light" ? "text-green-500" : "text-green-400"}`}>
        {`${affiliation.name}`}
      </p>
      {isEditable ? (
        <button
          aria-label="Clear selected affiliation"
          className="absolute top-1/2 right-2 transform -translate-y-1/2 p-1 hover:bg-gray-300 rounded"
          onClick={onClear}
        >
          <X className="h-3 w-3" />
        </button>
      ) : null}
    </div>
  );
};
