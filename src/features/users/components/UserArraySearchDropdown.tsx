// Dropdown search component for users. Displays 5 users below the search box.

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { FaTrash } from "react-icons/fa";
import { getUsersBasedOnSearchTerm } from "@/features/users/services/users.service";
import type { IUserData, EmailListPerson } from "@/shared/types";
import { useFullUserByPk } from "@/features/users/hooks/useFullUserByPk";
import { Label } from "@/shared/components/ui/label";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { useColorMode } from "@/shared/utils/theme.utils";
import { X } from "lucide-react";

interface IUserArraySearchDropdown {
  isRequired: boolean;
  setterFunction?:
    | ((setUserPk?: EmailListPerson) => void)
    | ((setUserPk?: IUserData) => void);
  array?: EmailListPerson[];
  arrayAddFunction?: (setUserPk: EmailListPerson) => void;
  arrayRemoveFunction?: (setUserPk: EmailListPerson) => void;
  arrayClearFunction?: () => void;
  ignoreUserPks?: number[];
  label: string;
  placeholder: string;
  helperText: string;
  preselectedUserPk?: number;
  isEditable?: boolean;
  autoFocus?: boolean;
  internalOnly?: boolean;
  hideInput?: boolean;
}

export const UserArraySearchDropdown = forwardRef(
  (
    {
      isRequired,
      setterFunction,
      array,
      arrayAddFunction,
      arrayRemoveFunction,
      arrayClearFunction,
      ignoreUserPks = [],
      label,
      placeholder,
      helperText,
      preselectedUserPk,
      isEditable,
      internalOnly,
      hideInput,
    }: IUserArraySearchDropdown,
    ref,
  ) => {
    const { colorMode } = useColorMode();
    const inputRef = useRef(null);
    const [searchTerm, setSearchTerm] = useState(""); // Local state for search term
    const [filteredItems, setFilteredItems] = useState<IUserData[]>([]); // Local state for filtered items
    const [isMenuOpen, setIsMenuOpen] = useState(true); // Stores the menu open state
    const [selectedUser, setSelectedUser] = useState<IUserData | null>(); // New state to store the selected name

    useEffect(() => {
      if (searchTerm.trim() !== "") {
        getUsersBasedOnSearchTerm(searchTerm, 1, {
          onlySuperuser: false,
          onlyExternal: false,
          onlyStaff: internalOnly || false,
          businessArea: "All",
        })
          .then((data) => {
            // console.log(data.users);
            const filtr = data.users.filter((item) => {
              // Filter out the users that are already in the array then filter out the users that are in the ignoreUserPks array
              const list = array?.map((item) => item.pk);
              return (
                !list?.includes(item.pk) && !ignoreUserPks.includes(item.pk)
              );
              // return !array?.some((arrayItem) => arrayItem.pk === item.pk);
            });
            console.log(filtr);
            setFilteredItems(filtr);

            // setFilteredItems(data.users);
          })
          .catch((error) => {
            console.error("Error fetching users:", error);
            setFilteredItems([]);
          });
      } else {
        setFilteredItems([]); // Clear the filtered items when the search term is empty
      }
    }, [searchTerm]);

    const { userLoading, userData } = useFullUserByPk(
      preselectedUserPk !== undefined ? preselectedUserPk : 0,
    );

    useEffect(() => {
      if (!userLoading && userData) {
        if (setterFunction) {
          setterFunction(userData?.pk);
        } else {
          arrayAddFunction(userData?.pk);
        }
        setIsMenuOpen(false);
        if (setterFunction && userData) {
          setSelectedUser(userData);
        }
        setSearchTerm(""); // Clear the search term when a user is selected
      }
    }, [userLoading, userData]);

    const handleSelectUser = (user: IUserData) => {
      if (setterFunction) {
        setterFunction(user);
      } else {
        arrayAddFunction(user);
      }
      setIsMenuOpen(false);
      // Update the selected user
      if (setterFunction) {
        setSelectedUser(user);
      }
      setSearchTerm(""); // Clear the search term when a user is selected
    };

    const handleClearUser = () => {
      if (
        preselectedUserPk !== null &&
        preselectedUserPk !== undefined &&
        isEditable !== true
      ) {
        return;
      }
      setterFunction?.(); // Clear the selected user by setting the userPk to 0 (or any value that represents no user)
      setSelectedUser(null); // Clear the selected user state
      setIsMenuOpen(true); // Show the menu again when the user is cleared
    };

    useImperativeHandle(ref, () => ({
      focusInput: () => {
        if (inputRef.current) inputRef.current.focus();
      },
    }));

    function isIUserData(user: EmailListPerson): user is IUserData {
      return "display_first_name" in user && "display_last_name" in user;
    }

    return (
      <>
        <div className="mb-4">
          <Label className={isRequired ? "after:content-['*'] after:ml-0.5 after:text-red-500" : ""}>
            {label}
          </Label>
          {selectedUser ? (
            <div className="mb-2 text-blue-500">
              <SelectedUserPk
                user={selectedUser}
                onClear={handleClearUser}
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

          {selectedUser ? null : (
            <div className="relative w-full">
              <CustomMenu isOpen={filteredItems?.length > 0 && isMenuOpen}>
                <CustomMenuList minWidth="100%">
                  {filteredItems.map((user) => (
                    <CustomMenuItem
                      key={user.pk}
                      onClick={() => handleSelectUser(user)}
                      user={user}
                    />
                  ))}
                </CustomMenuList>
              </CustomMenu>
            </div>
          )}

          <p className="text-sm text-muted-foreground mt-2">{helperText}</p>
          {array?.length > 1 && (
            <Button
              onClick={() => {
                arrayClearFunction?.();
              }}
              size="sm"
              className={`absolute -bottom-8 right-2 px-2 text-white ${
                colorMode === "light" ? "bg-red-500 hover:bg-red-600" : "bg-red-800 hover:bg-red-700"
              }`}
            >
              <FaTrash className="mr-2 h-3 w-3" />
              Clear list
            </Button>
          )}
        </div>
        {array?.length > 0 && (
          <div className={`flex flex-wrap gap-2 ${array?.length > 1 ? "pt-7" : "pt-0"} pb-2`}>
            {array?.map((u, index) => (
              <Badge
                key={index}
                variant="secondary"
                className={`rounded-full text-white ${
                  colorMode === "light" 
                    ? "bg-blue-500 hover:bg-blue-400" 
                    : "bg-blue-600 hover:bg-blue-500"
                }`}
              >
                <span className="pl-1">
                  {" "}
                  {/* Handle different object structures */}
                  {
                    isIUserData(u)
                      ? `${u.display_first_name} ${u.display_last_name}${u.is_superuser ? " (Superuser)" : u.is_staff ? " (Staff)" : ""}`
                      : u.name /* For IEmailListUser which has a name property */
                  }
                </span>
                <button
                  onClick={() => arrayRemoveFunction(u)}
                  className="ml-2 hover:bg-black/20 rounded-full p-0.5"
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
  user: IUserData;
}

interface CustomMenuListProps {
  minWidth: string;
  children: ReactNode;
}

const CustomMenu = ({ isOpen, children, ...rest }: CustomMenuProps) => {
  const { colorMode } = useColorMode();
  return (
    <div
      className={`absolute w-full shadow-md z-[99] ${
        colorMode === "light" ? "bg-white" : "bg-gray-700"
      } ${isOpen ? "block" : "hidden"}`}
      {...rest}
    >
      {children}
    </div>
  );
};

const CustomMenuItem = ({ onClick, user, ...rest }: CustomMenuItemProps) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = () => {
    onClick();
  };
  const { colorMode } = useColorMode();

  return (
    <button
      type="button"
      className={`w-full text-left p-2 flex items-center z-[99] ${
        isHovered ? "bg-gray-200" : "bg-transparent"
      }`}
      onClick={handleClick}
      onMouseOver={() => setIsHovered(true)}
      onMouseOut={() => setIsHovered(false)}
      {...rest}
    >
      <div className="flex items-center justify-start ml-3 h-full">
        <p
          className={`ml-2 ${
            user?.is_superuser
              ? colorMode === "light"
                ? "text-blue-500"
                : "text-blue-300"
              : user?.is_staff
                ? colorMode === "light"
                  ? "text-green-500"
                  : "text-green-300"
                : colorMode === "light"
                  ? "text-gray-500"
                  : "text-gray-300"
          }`}
        >
          {`${user.display_first_name} ${user.display_last_name}${user.is_superuser ? " (Superuser)" : user.is_staff ? " (Staff)" : ""}`}
        </p>
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

interface selectedUserPkProps {
  user: IUserData;
  onClear: () => void;
  isEditable: boolean;
}

const SelectedUserPk = ({ user, onClear, isEditable }: selectedUserPkProps) => {
  const { colorMode } = useColorMode();

  return (
    <div
      className={`flex items-center relative rounded-md px-2 py-1 mr-2 ${
        colorMode === "dark" ? "bg-gray-700" : "bg-gray-100"
      }`}
    >
      <p
        className={`ml-2 ${
          user?.is_superuser
            ? colorMode === "light"
              ? "text-blue-500"
              : "text-blue-300"
            : user?.is_staff
              ? colorMode === "light"
                ? "text-green-500"
                : "text-green-300"
              : colorMode === "light"
                ? "text-gray-500"
                : "text-gray-300"
        }`}
      >
        {`${user.display_first_name} ${user.display_last_name}${user.is_superuser ? " (Superuser)" : user.is_staff ? " (Staff)" : ""}`}
      </p>
      {isEditable ? (
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-1/2 right-2 -translate-y-1/2 h-6 w-6 p-0"
          onClick={onClear}
          aria-label="Clear selected affiliation"
        >
          <X className="h-3 w-3" />
        </Button>
      ) : null}
    </div>
  );
};
