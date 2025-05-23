// Dropdown search component for users. Displays 5 users below the search box.

import { CloseIcon } from "@chakra-ui/icons";
import {
  Box,
  Button,
  Flex,
  FormControl,
  FormHelperText,
  FormLabel,
  IconButton,
  Input,
  InputGroup,
  Tag,
  TagCloseButton,
  TagLabel,
  Text,
  useColorMode,
} from "@chakra-ui/react";
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { FaTrash } from "react-icons/fa";
import { getUsersBasedOnSearchTerm } from "../../lib/api";
import { IUserData, EmailListPerson } from "../../types";
import { useFullUserByPk } from "@/lib/hooks/tanstack/useFullUserByPk";

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
        <FormControl isRequired={isRequired} mb={4}>
          <FormLabel>{label}</FormLabel>
          {selectedUser ? (
            <Box mb={2} color="blue.500">
              <SelectedUserPk
                user={selectedUser}
                onClear={handleClearUser}
                isEditable={isEditable}
              />
            </Box>
          ) : (
            <InputGroup>
              <Input
                ref={inputRef} // Attach the ref to the input element
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder={placeholder}
                autoComplete="off"
                onFocus={() => setIsMenuOpen(true)}
              />
            </InputGroup>
          )}

          {selectedUser ? null : (
            <Box pos="relative" w="100%">
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
            </Box>
          )}

          <FormHelperText>{helperText}</FormHelperText>
          {array?.length > 1 && (
            <Button
              onClick={() => {
                arrayClearFunction?.();
              }}
              size={"xs"}
              pos={"absolute"}
              bottom={-8}
              right={2}
              background={colorMode === "light" ? "red.500" : "red.800"}
              px={2}
              rightIcon={<FaTrash />}
              color={"white"}
            >
              Clear list
            </Button>
          )}
        </FormControl>
        {array?.length > 0 && (
          <Flex flexWrap="wrap" gap={2} pt={array?.length > 1 ? 7 : 0} pb={2}>
            {array?.map((u, index) => (
              <Tag
                key={index}
                size="md"
                borderRadius="full"
                variant="solid"
                color={"white"}
                background={colorMode === "light" ? "blue.500" : "blue.600"}
                _hover={{
                  background: colorMode === "light" ? "blue.400" : "blue.500",
                }}
              >
                <TagLabel pl={1}>
                  {" "}
                  {/* Handle different object structures */}
                  {
                    isIUserData(u)
                      ? `${u.display_first_name} ${u.display_last_name}${u.is_superuser ? " (Superuser)" : u.is_staff ? " (Staff)" : ""}`
                      : u.name /* For IEmailListUser which has a name property */
                  }
                </TagLabel>
                <TagCloseButton
                  onClick={() => arrayRemoveFunction(u)}
                  userSelect={"none"}
                  tabIndex={-1}
                />
              </Tag>
            ))}
          </Flex>
        )}
      </>
    );
  },
);

// =========================================== ADDITIONAL COMPONENTS ====================================================

interface CustomMenuProps {
  isOpen: boolean;
  children: React.ReactNode;
}

interface CustomMenuItemProps {
  onClick: () => void;
  user: IUserData;
}

interface CustomMenuListProps {
  minWidth: string;
  children: React.ReactNode;
}

const CustomMenu = ({ isOpen, children, ...rest }: CustomMenuProps) => {
  const { colorMode } = useColorMode();
  return (
    <Box
      pos="absolute"
      w="100%"
      bg={colorMode === "light" ? "white" : "gray.700"}
      boxShadow="md"
      display={isOpen ? "block" : "none"}
      zIndex={99}
      {...rest}
    >
      {children}
    </Box>
  );
};

const CustomMenuItem = ({ onClick, user, ...rest }: CustomMenuItemProps) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = () => {
    onClick();
  };
  const { colorMode } = useColorMode();

  return (
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
      zIndex={99}
      {...rest}
    >
      <Box
        display="flex"
        alignItems="center"
        justifyContent="start"
        ml={3}
        h="100%"
      >
        <Text
          ml={2}
          color={
            user?.is_superuser
              ? colorMode === "light"
                ? "blue.500"
                : "blue.300"
              : user?.is_staff
                ? colorMode === "light"
                  ? "green.500"
                  : "green.300"
                : colorMode === "light"
                  ? "gray.500"
                  : "gray.300"
          }
        >
          {`${user.display_first_name} ${user.display_last_name}${user.is_superuser ? " (Superuser)" : user.is_staff ? " (Staff)" : ""}`}
        </Text>
      </Box>
    </Flex>
  );
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

interface selectedUserPkProps {
  user: IUserData;
  onClear: () => void;
  isEditable: boolean;
}

const SelectedUserPk = ({ user, onClear, isEditable }: selectedUserPkProps) => {
  const { colorMode } = useColorMode();

  return (
    <Flex
      align="center"
      position="relative"
      bgColor={colorMode === "dark" ? "gray.700" : "gray.100"}
      borderRadius="md"
      px={2}
      py={1}
      mr={2}
    >
      <Text
        ml={2}
        color={
          user?.is_superuser
            ? colorMode === "light"
              ? "blue.500"
              : "blue.300"
            : user?.is_staff
              ? colorMode === "light"
                ? "green.500"
                : "green.300"
              : colorMode === "light"
                ? "gray.500"
                : "gray.300"
        }
      >
        {`${user.display_first_name} ${user.display_last_name}${user.is_superuser ? " (Superuser)" : user.is_staff ? " (Staff)" : ""}`}
      </Text>
      {isEditable ? (
        <IconButton
          aria-label="Clear selected affiliation"
          icon={<CloseIcon />}
          size="xs"
          position="absolute"
          top="50%"
          right={2}
          transform="translateY(-50%)"
          onClick={onClear}
        />
      ) : null}
    </Flex>
  );
};
