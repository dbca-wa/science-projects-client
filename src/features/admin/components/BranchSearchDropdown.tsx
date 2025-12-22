// Dropdown search component for branches. Displays 5 branches below the search box.

import { X } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { useColorMode } from "@/shared/utils/theme.utils";
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { getBranchesBasedOnSearchTerm } from "@/features/admin/services/admin.service";
import { useBranch } from "@/features/admin/hooks/useBranch";
import type { IBranch } from "@/shared/types";

interface IBranchSearchDropdown {
  isRequired: boolean;
  setBranchFunction: (setBranchPk: number) => void;
  label: string;
  placeholder: string;
  helperText: string;
  preselectedBranchPk?: number;
  isEditable?: boolean;
  autoFocus?: boolean;
}

export const BranchSearchDropdown = forwardRef(
  (
    {
      isRequired,
      setBranchFunction,
      label,
      placeholder,
      helperText,
      preselectedBranchPk,
      isEditable,
    }: IBranchSearchDropdown,
    ref,
  ) => {
    const inputRef = useRef(null);
    const [searchTerm, setSearchTerm] = useState(""); // Local state for search term
    const [filteredItems, setFilteredItems] = useState<IBranch[]>([]); // Local state for filtered items
    const [isMenuOpen, setIsMenuOpen] = useState(true); // Stores the menu open state
    const [selectedBranch, setSelectedBranch] = useState<IBranch | null>(); // New state to store the selected name

    useEffect(() => {
      if (searchTerm.trim() !== "") {
        getBranchesBasedOnSearchTerm(searchTerm, 1)
          .then((data) => {
            console.log(data.branches);
            setFilteredItems(data.branches);
          })
          .catch((error) => {
            console.error("Error fetching branches:", error);
            setFilteredItems([]);
          });
      } else {
        setFilteredItems([]); // Clear the filtered items when the search term is empty
      }
    }, [searchTerm]);

    const { branchLoading, branchData } = useBranch(
      preselectedBranchPk !== undefined ? preselectedBranchPk : 0,
    );

    useEffect(() => {
      if (!branchLoading && branchData) {
        setBranchFunction(branchData.pk);
        setIsMenuOpen(false);
        setSelectedBranch(branchData); // Update the selected branch
        setSearchTerm(""); // Clear the search term when a branch is selected
      }
    }, [branchLoading, branchData]);

    const handleSelectBranch = (branch: IBranch) => {
      setBranchFunction(branch.pk);
      setIsMenuOpen(false);
      setSelectedBranch(branch); // Update the selected branch
      setSearchTerm(""); // Clear the search term when a branch is selected
    };

    const handleClearBranch = () => {
      if (
        preselectedBranchPk !== null &&
        preselectedBranchPk !== undefined &&
        isEditable !== true
      ) {
        return;
      }
      setBranchFunction(0); // Clear the selected branch by setting the branchpk to 0 (or any value that represents no user)
      setSelectedBranch(null); // Clear the selected branch state
      setIsMenuOpen(true); // Show the menu again when the branch is cleared
    };

    useImperativeHandle(ref, () => ({
      focusInput: () => {
        inputRef.current && inputRef.current.focus();
      },
    }));

    return (
      <div className={`mb-4 ${isRequired ? 'required' : ''}`}>
        <Label>{label}</Label>
        {selectedBranch ? (
          <div className="mb-2 text-blue-500">
            <SelectedBranchInput
              branch={selectedBranch}
              onClear={handleClearBranch}
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

        {selectedBranch ? null : (
          <div className="relative w-full">
            <CustomMenu isOpen={filteredItems?.length > 0 && isMenuOpen}>
              <CustomMenuList minWidth="100%">
                {filteredItems.map((branch) => (
                  <CustomMenuItem
                    key={branch.pk}
                    onClick={() => handleSelectBranch(branch)}
                    branch={branch}
                  />
                ))}
              </CustomMenuList>
            </CustomMenu>
          </div>
        )}

        <p className="text-sm text-muted-foreground mt-1">{helperText}</p>
      </div>
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
  branch: IBranch;
}

interface CustomMenuListProps {
  minWidth: string;
  children: ReactNode;
}

const CustomMenu = ({ isOpen, children, ...rest }: CustomMenuProps) => {
  const { colorMode } = useColorMode();
  return (
    <div
      className={`absolute w-full ${
        colorMode === "light" ? "bg-white" : "bg-gray-700"
      } shadow-md z-10 ${isOpen ? "block" : "hidden"}`}
      {...rest}
    >
      {children}
    </div>
  );
};

const CustomMenuItem = ({ onClick, branch, ...rest }: CustomMenuItemProps) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = () => {
    onClick();
  };
  const { colorMode } = useColorMode();

  return (
    <button
      type="button"
      className={`w-full text-left p-2 flex items-center ${
        isHovered ? "bg-gray-200" : "bg-transparent"
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
          {`${branch.name}`}
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

interface SelectedBranchInputProps {
  branch: IBranch;
  onClear: () => void;
  isEditable: boolean;
}

const SelectedBranchInput = ({
  branch,
  onClear,
  isEditable,
}: SelectedBranchInputProps) => {
  const { colorMode } = useColorMode();

  return (
    <div className={`flex items-center relative ${
      colorMode === "dark" ? "bg-gray-700" : "bg-gray-100"
    } rounded-md px-2 py-1 mr-2`}>
      <span className={`ml-2 ${
        colorMode === "light" ? "text-green-500" : "text-green-400"
      }`}>
        {`${branch.name}`}
      </span>
      {isEditable ? (
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-1/2 right-2 transform -translate-y-1/2 h-6 w-6 p-0"
          onClick={onClear}
          aria-label="Clear selected branch"
        >
          <X className="h-3 w-3" />
        </Button>
      ) : null}
    </div>
  );
};
