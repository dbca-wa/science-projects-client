// Dropdown search component for users. Displays 5 users below the search box.

import useApiEndpoint from "@/shared/hooks/useApiEndpoint";
import { useNoImage } from "@/shared/hooks/useNoImage";
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import { getInternalUsersBasedOnSearchTerm } from "@/features/users/services/users.service";
import { useFullUserByPk } from "@/features/users/hooks/useFullUserByPk";
import type { IUserData } from "@/shared/types";
import { EmailSiteLinkModal } from "@/features/users/components/modals/EmailSiteLinkModal";
import { CreateUserModal } from "@/features/users/components/modals/CreateUserModal";
import { createPortal } from "react-dom";
import { useTheme } from "next-themes";
import { Label } from "@/shared/components/ui/label";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import { X } from "lucide-react";
import { cn } from "@/shared/utils";

interface IUserSearchDropdown {
  onlyInternal?: boolean;
  autoFocus?: boolean;
  isRequired: boolean;
  setUserFunction: (setUserPk: number) => void;
  setUserEmailFunction?: (setUserEmail: string) => void;
  setUserNameFunction?: (setUserName: string) => void;
  label: string;
  placeholder: string;
  helperText: string;
  preselectedUserPk?: number;
  isEditable?: boolean;
  projectPk?: number;
  isClosed?: boolean;
  ignoreArray?: number[];
  className?: string;
  hideCannotFind?: boolean;
  placeholderColor?: string;
}

export const UserSearchDropdown = forwardRef(
  (
    {
      onlyInternal = true,
      autoFocus,
      isRequired,
      setUserFunction,
      setUserEmailFunction,
      setUserNameFunction,
      label,
      placeholder,
      helperText,
      preselectedUserPk,
      isEditable,
      projectPk,
      isClosed,
      ignoreArray,
      className,
      hideCannotFind,
      placeholderColor,
    }: IUserSearchDropdown,
    ref,
  ) => {
    const inputRef = useRef(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [filteredItems, setFilteredItems] = useState<IUserData[]>([]);
    const [isMenuOpen, setIsMenuOpen] = useState(isClosed ? false : true);
    const [selectedUser, setSelectedUser] = useState<IUserData | null>();
    const [showAddUser, setShowAddUser] = useState<boolean>(false);

    // Replace useDisclosure with React state
    const [isEmailSiteLinkModalOpen, setIsEmailSiteLinkModalOpen] = useState(false);
    const [isCreateUserModalOpen, setIsCreateUserModalOpen] = useState(false);

    const { theme } = useTheme();
    const isDark = theme === "dark";

    useEffect(() => {
      if (projectPk || searchTerm.trim() !== "") {
        getInternalUsersBasedOnSearchTerm(
          searchTerm,
          onlyInternal,
          projectPk,
          ignoreArray,
        )
          .then((data) => {
            console.log(data.users);
            if (data.users.length === 0) {
              setShowAddUser(true);
            }
            setFilteredItems(data.users);
          })
          .catch((error) => {
            console.error("Error fetching users:", error);
            setFilteredItems([]);
          });
      } else {
        setShowAddUser(false);
        setFilteredItems([]); // Clear the filtered items when the search term is empty
      }
    }, [searchTerm]);

    const { userLoading, userData } = useFullUserByPk(
      preselectedUserPk !== undefined ? preselectedUserPk : null,
    );

    useEffect(() => {
      if (!userLoading && userData) {
        setUserFunction(userData.pk);
        if (setUserEmailFunction) {
          setUserEmailFunction(userData.email);
        }
        if (setUserNameFunction) {
          setUserNameFunction(
            `${userData.display_first_name ?? userData?.first_name} ${userData.display_last_name ?? userData?.last_name}`,
          );
        }
        setIsMenuOpen(false);
        setSelectedUser(userData); // Update the selected user
        setSearchTerm(""); // Clear the search term when a user is selected
      }
    }, [userLoading, userData, setUserEmailFunction]);

    const handleSelectUser = (user: IUserData) => {
      setUserFunction(user.pk);
      if (setUserEmailFunction) {
        setUserEmailFunction(user.email);
      }
      if (setUserNameFunction) {
        setUserNameFunction(
          `${user.display_first_name ?? user.first_name} ${user.display_last_name ?? user.last_name}`,
        );
      }
      setIsMenuOpen(false);
      setSelectedUser(user); // Update the selected user
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
      setUserFunction(null); // Clear the selected user by setting the userPk to 0 (or any value that represents no user)
      if (setUserEmailFunction) {
        setUserEmailFunction("");
      }
      if (setUserNameFunction) {
        setUserNameFunction("");
      }
      setSelectedUser(null); // Clear the selected user state
      setIsMenuOpen(isClosed ? false : true); // Show the menu again when the user is cleared
    };

    useImperativeHandle(ref, () => ({
      focusInput: () => {
        inputRef.current && inputRef.current.focus();
      },
    }));

    return (
      <div className={cn("mb-0 my-0 w-full h-full", isRequired && "required")}>
        <Label>{label}</Label>
        {selectedUser ? (
          <div className="mb-2 text-blue-500">
            <SelectedUserInput user={selectedUser} onClear={handleClearUser} />
          </div>
        ) : (
          <div className="relative">
            <Input
              ref={inputRef}
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder={placeholder}
              className={cn(
                className,
                "placeholder:ml-[-4px]",
                placeholderColor
                  ? `placeholder:text-[${placeholderColor}]`
                  : isDark
                    ? "placeholder:text-gray-300"
                    : "placeholder:text-gray-500"
              )}
              onFocus={() => setIsMenuOpen(true)}
              autoFocus={autoFocus ? true : false}
              autoComplete="off"
            />
          </div>
        )}
        {selectedUser ? null : (
          <div className="relative w-full">
            <CustomMenu
              isOpen={filteredItems.length > 0 && isMenuOpen}
              inputRef={inputRef}
            >
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
        <p className={cn("text-sm text-muted-foreground mt-2")}>
          {hideCannotFind !== true &&
          hideCannotFind !== undefined &&
          showAddUser
            ? "Can't find who you're looking for? Use the buttons below to add an external user or email a DBCA staff member with a link to create an account - they must click the link and login."
            : helperText}
        </p>
        {hideCannotFind !== true &&
          hideCannotFind !== undefined &&
          showAddUser && (
            <>
              {!ignoreArray ||
                (ignoreArray?.length < 1 && (
                  <>
                    <CreateUserModal
                      onClose={() => setIsCreateUserModalOpen(false)}
                      isOpen={isCreateUserModalOpen}
                    />
                    <EmailSiteLinkModal
                      onClose={() => setIsEmailSiteLinkModalOpen(false)}
                      isOpen={isEmailSiteLinkModalOpen}
                    />
                    <div className="flex mt-4 mb-2 justify-end gap-3">
                      <Button
                        className={cn(
                          "text-white",
                          isDark ? "bg-blue-600 hover:bg-blue-500" : "bg-blue-500 hover:bg-blue-400"
                        )}
                        onClick={() => setIsCreateUserModalOpen(true)}
                      >
                        Add New External User
                      </Button>
                      <Button
                        className={cn(
                          "text-white",
                          isDark ? "bg-green-600 hover:bg-green-500" : "bg-green-500 hover:bg-green-400"
                        )}
                        onClick={() => setIsEmailSiteLinkModalOpen(true)}
                      >
                        Send Link to DBCA Staff
                      </Button>
                    </div>
                  </>
                ))}
            </>
          )}
      </div>
    );
  },
);

// =========================================== ADDITIONAL COMPONENTS ====================================================

interface CustomMenuPortalProps {
  isOpen: boolean;
  children: ReactNode;
  referenceElement: HTMLElement | null;
  zIndex?: number;
}

const CustomMenuPortal = ({
  isOpen,
  children,
  referenceElement,
  zIndex = 9999,
}: CustomMenuPortalProps) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [portalNode, setPortalNode] = useState<HTMLDivElement | null>(null);
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });

  // Create portal element
  useEffect(() => {
    if (!portalNode) {
      const node = document.createElement("div");
      document.body.appendChild(node);
      setPortalNode(node);

      return () => {
        document.body.removeChild(node);
      };
    }
  }, [portalNode]);

  // Update position when reference element changes or when isOpen changes
  useEffect(() => {
    if (referenceElement && isOpen) {
      const updatePosition = () => {
        const rect = referenceElement.getBoundingClientRect();
        setPosition({
          top: rect.bottom + window.scrollY,
          left: rect.left + window.scrollX,
          width: rect.width,
        });
      };

      updatePosition();

      // Update position on scroll and resize
      window.addEventListener("scroll", updatePosition);
      window.addEventListener("resize", updatePosition);

      return () => {
        window.removeEventListener("scroll", updatePosition);
        window.removeEventListener("resize", updatePosition);
      };
    }
  }, [referenceElement, isOpen]);

  if (!isOpen || !portalNode) return null;

  return createPortal(
    <div
      className={cn(
        "fixed shadow-md rounded-md z-[9999]",
        isDark ? "bg-gray-700" : "bg-white"
      )}
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        width: `${position.width}px`,
        zIndex,
      }}
    >
      {children}
    </div>,
    portalNode,
  );
};

interface CustomMenuProps {
  isOpen: boolean;
  children: ReactNode;
  inputRef: RefObject<HTMLInputElement>; // Add inputRef to the interface
}

interface CustomMenuItemProps {
  onClick: () => void;
  user: IUserData;
}

interface CustomMenuListProps {
  minWidth: string;
  children: ReactNode;
}

const CustomMenu = ({
  isOpen,
  children,
  inputRef,
  ...rest
}: CustomMenuProps) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [portalElement, setPortalElement] = useState<HTMLElement | null>(null);
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });

  // Create portal element
  useEffect(() => {
    const el = document.createElement("div");
    el.style.position = "fixed";
    el.style.zIndex = "9999";
    document.body.appendChild(el);
    setPortalElement(el);

    return () => {
      document.body.removeChild(el);
    };
  }, []);

  // Update position when inputRef changes or when isOpen changes
  useEffect(() => {
    if (inputRef.current && isOpen) {
      const updatePosition = () => {
        const rect = inputRef.current.getBoundingClientRect();
        setPosition({
          top: rect.bottom + window.scrollY,
          left: rect.left + window.scrollX,
          width: rect.width,
        });
      };

      updatePosition();

      // Update position on scroll and resize
      window.addEventListener("scroll", updatePosition);
      window.addEventListener("resize", updatePosition);

      return () => {
        window.removeEventListener("scroll", updatePosition);
        window.removeEventListener("resize", updatePosition);
      };
    }
  }, [inputRef.current, isOpen]);

  if (!isOpen || !portalElement) return null;

  // Use createPortal to render the menu at the correct position
  return createPortal(
    <div
      className={cn(
        "fixed min-w-[200px] shadow-md z-[9999] rounded-md",
        isDark ? "bg-gray-700" : "bg-white"
      )}
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        width: `${position.width}px`,
      }}
      {...rest}
    >
      {children}
    </div>,
    portalElement,
  );
};

// const CustomMenu = ({ isOpen, children, ...rest }: CustomMenuProps) => {
//   const { colorMode } = useColorMode();
//   return (
//     <Box
//       pos="absolute"
//       w="100%"
//       bg={colorMode === "light" ? "white" : "gray.700"}
//       boxShadow="md"
//       zIndex={1}
//       display={isOpen ? "block" : "none"}
//       {...rest}
//     >
//       {children}
//     </Box>
//   );
// };

const CustomMenuItem = ({ onClick, user, ...rest }: CustomMenuItemProps) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = () => {
    onClick();
  };
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const serverUrl = useApiEndpoint();
  const noImage = useNoImage();
  return serverUrl ? (
    <button
      type="button"
      className={cn(
        "w-full text-left p-2 flex items-center transition-colors",
        isHovered ? "bg-gray-200" : "transparent"
      )}
      onClick={handleClick}
      onMouseOver={() => setIsHovered(true)}
      onMouseOut={() => setIsHovered(false)}
      {...rest}
    >
      <Avatar className="w-10 h-10">
        <AvatarImage
          src={
            user.image
              ? user.image?.file?.startsWith("http")
                ? `${user.image?.file}`
                : `${serverUrl}${user.image?.file}`
              : user.image?.old_file
                ? user.image?.old_file
                : noImage
          }
          alt={`${user?.display_first_name} ${user?.display_last_name}`}
        />
        <AvatarFallback>
          {user?.display_first_name?.[0]}{user?.display_last_name?.[0]}
        </AvatarFallback>
      </Avatar>
      <div className="flex items-center justify-start ml-3 h-full">
        <p className={cn(
          "ml-2",
          user.is_staff
            ? user.is_superuser
              ? isDark
                ? "text-blue-300"
                : "text-blue-500"
              : isDark
                ? "text-green-300"
                : "text-green-500"
            : isDark
              ? "text-gray-400"
              : "text-gray-500"
        )}>
          {`${user?.display_first_name === "None" ? user.username : (user?.display_first_name ?? user.first_name)} ${
            user?.display_last_name === "None"
              ? ""
              : (user?.display_last_name ?? user.last_name)
          } ${
            user.is_staff
              ? user.is_superuser
                ? "(Admin)"
                : "(Staff)"
              : "(External)"
          }`}
        </p>
      </div>
    </button>
  ) : null;
};

const CustomMenuList = ({
  minWidth,
  children,
  ...rest
}: CustomMenuListProps) => {
  return (
    <div className={cn("relative w-full")} style={{ minWidth }} {...rest}>
      {children}
    </div>
  );
};

interface SelectedUserInputProps {
  user: IUserData;
  onClear: () => void;
}

const SelectedUserInput = ({ user, onClear }: SelectedUserInputProps) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const serverUrl = useApiEndpoint();
  const noImage = useNoImage();

  return serverUrl ? (
    <div className={cn(
      "flex items-center relative px-2 rounded-md",
      isDark ? "bg-gray-700" : "bg-gray-100"
    )}>
      <Avatar className="w-8 h-8">
        <AvatarImage
          src={
            user.image
              ? user.image?.file?.startsWith("http")
                ? `${user.image?.file}`
                : `${serverUrl}${user.image?.file}`
              : user.image?.old_file
                ? user.image?.old_file
                : noImage
          }
          alt={`${user.first_name} ${user.last_name}`}
        />
        <AvatarFallback>
          {user.first_name?.[0]}{user.last_name?.[0]}
        </AvatarFallback>
      </Avatar>
      <p className={cn(
        "ml-2",
        user.is_staff
          ? user.is_superuser
            ? isDark
              ? "text-blue-400"
              : "text-blue-500"
            : isDark
              ? "text-green-400"
              : "text-green-500"
          : isDark
            ? "text-gray-200"
            : "text-gray-500"
      )}>
        {`${user.first_name === "None" ? user.username : user.first_name} ${
          user.last_name === "None" ? "" : user.last_name
        } ${
          user.is_staff
            ? user.is_superuser
              ? "(Admin)"
              : "(Staff)"
            : "(External)"
        }`}
      </p>

      <Button
        variant="ghost"
        size="sm"
        className="absolute top-1/2 right-2 transform -translate-y-1/2 h-6 w-6 p-0"
        onClick={onClear}
        tabIndex={-1}
        aria-label="Clear selected user"
      >
        <X className="h-3 w-3" />
      </Button>
    </div>
  ) : null;
};
