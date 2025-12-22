// Dropdown search component for affiliations. Displays 5 affiliations below the search box.

import { useAffiliation } from "@/features/admin/hooks/useAffiliation";
import { X, Trash2 } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Badge } from "@/shared/components/ui/badge";
import { Label } from "@/shared/components/ui/label";
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { getAffiliationsBasedOnSearchTerm } from "@/features/admin/services/admin.service";
import type { IAffiliation } from "@/shared/types";
import { useColorMode } from "@/shared/utils/theme.utils";

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
}

export const AffiliationSearchDropdown = forwardRef(
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
    }: IAffiliationSearchDropdown,
    ref,
  ) => {
    const { colorMode } = useColorMode();
    const inputRef = useRef(null);
    const [searchTerm, setSearchTerm] = useState(""); // Local state for search term
    const [filteredItems, setFilteredItems] = useState<IAffiliation[]>([]); // Local state for filtered items
    const [isMenuOpen, setIsMenuOpen] = useState(true); // Stores the menu open state
    const [selectedAffiliation, setSelectedAffiliation] =
      useState<IAffiliation | null>(); // New state to store the selected name

    useEffect(() => {
      if (searchTerm.trim() !== "") {
        getAffiliationsBasedOnSearchTerm(searchTerm, 1)
          .then((data) => {
            // console.log(data.affiliations);
            const filtr = data.affiliations.filter((item) => {
              return !array?.some((arrayItem) => arrayItem.pk === item.pk);
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
    }, [searchTerm]);

    const { affiliationLoading, affiliationData } = useAffiliation(
      preselectedAffiliationPk !== undefined ? preselectedAffiliationPk : 0,
    );

    useEffect(() => {
      if (!affiliationLoading && affiliationData) {
        setterFunction
          ? setterFunction(affiliationData?.pk)
          : arrayAddFunction(affiliationData?.pk);
        setIsMenuOpen(false);
        setterFunction &&
          affiliationData &&
          setSelectedAffiliation(affiliationData); // Update the selected affiliation
        setSearchTerm(""); // Clear the search term when a affiliation is selected
      }
    }, [affiliationLoading, affiliationData]);

    const handleSelectAffiliation = (affiliation: IAffiliation) => {
      setterFunction
        ? setterFunction(affiliation)
        : arrayAddFunction(affiliation);
      setIsMenuOpen(false);
      setterFunction && setSelectedAffiliation(affiliation); // Update the selected affiliation
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
      setterFunction?.(); // Clear the selected affiliation by setting the affiliationPk to 0 (or any value that represents no user)
      setSelectedAffiliation(null); // Clear the selected affiliation state
      setIsMenuOpen(true); // Show the menu again when the affiliation is cleared
    };

    useImperativeHandle(ref, () => ({
      focusInput: () => {
        inputRef.current && inputRef.current.focus();
      },
    }));

    return (
      <>
        <div className={`mb-4 ${isRequired ? 'required' : ''}`}>
          <Label className="block text-sm font-medium mb-2">{label}</Label>
          {selectedAffiliation ? (
            <div className="mb-2 text-blue-500">
              <SelectedAffiliationPk
                affiliation={selectedAffiliation}
                onClear={handleClearAffiliation}
                isEditable={isEditable}
              />
            </div>
          ) : (
            <div className="relative">
              <Input
                ref={inputRef}
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder={placeholder}
                autoComplete="off"
                onFocus={() => setIsMenuOpen(true)}
                className="w-full"
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
            </div>
          )}

          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{helperText}</p>
          {array?.length > 1 && (
            <Button
              onClick={() => {
                arrayClearFunction
                  ? arrayClearFunction()
                  : console.log("array clear function not defined");
              }}
              size="sm"
              variant="destructive"
              className="absolute -bottom-8 right-2 px-2"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Clear Secondary Affiliations
            </Button>
          )}
        </div>
        {array?.length > 0 && (
          <div className={`flex flex-wrap gap-2 ${array?.length > 1 ? 'pt-7' : ''} pb-2`}>
            {array?.map((aff, index) => (
              <Badge
                key={index}
                variant="default"
                className="bg-blue-500 hover:bg-blue-400 text-white px-3 py-1 rounded-full"
              >
                {aff?.name}
                <button
                  onClick={() => arrayRemoveFunction(aff)}
                  className="ml-2 hover:bg-blue-600 rounded-full p-1"
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
  },
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
      className={`absolute w-full shadow-md z-50 ${
        isOpen ? 'block' : 'hidden'
      } ${
        colorMode === "light" ? "bg-white border border-gray-200" : "bg-gray-700 border border-gray-600"
      }`}
      {...rest}
    >
      {children}
    </div>
  );
};

const CustomMenuItem = ({
  onClick,
  affiliation,
  ...rest
}: CustomMenuItemProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const { colorMode } = useColorMode();

  const handleClick = () => {
    onClick();
  };

  return (
    <button
      type="button"
      className={`w-full text-left p-2 flex items-center z-50 ${
        isHovered ? 'bg-gray-200 dark:bg-gray-600' : 'transparent'
      }`}
      onClick={handleClick}
      onMouseOver={() => setIsHovered(true)}
      onMouseOut={() => setIsHovered(false)}
      {...rest}
    >
      <div className="flex items-center justify-start ml-3 h-full">
        <span className={`ml-2 ${
          colorMode === "light" ? "text-green-500" : "text-green-300"
        }`}>
          {affiliation.name}
        </span>
      </div>
    </button>
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
    <div className={`flex items-center relative px-2 py-1 mr-2 rounded-md ${
      colorMode === "dark" ? "bg-gray-700" : "bg-gray-100"
    }`}>
      <span className={`ml-2 ${
        colorMode === "light" ? "text-green-500" : "text-green-400"
      }`}>
        {affiliation.name}
      </span>
      {isEditable && (
        <button
          aria-label="Clear selected affiliation"
          className="absolute top-1/2 right-2 transform -translate-y-1/2 p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
          onClick={onClear}
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </div>
  );
};
