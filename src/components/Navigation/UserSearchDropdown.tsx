// Dropdown search component for users. Displays 5 users below the search box.

import useApiEndpoint from "@/lib/hooks/helper/useApiEndpoint";
import { useNoImage } from "@/lib/hooks/helper/useNoImage";
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
import { getInternalUsersBasedOnSearchTerm } from "../../lib/api";
import { useFullUserByPk } from "../../lib/hooks/tanstack/useFullUserByPk";
import { IUserData } from "../../types";

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
}

export const UserSearchDropdown = forwardRef(
  (
    {
      onlyInternal = true, // Default if not set
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
    }: IUserSearchDropdown,
    ref
  ) => {
    const inputRef = useRef(null);
    const [searchTerm, setSearchTerm] = useState(""); // Local state for search term
    const [filteredItems, setFilteredItems] = useState<IUserData[]>([]); // Local state for filtered items
    const [isMenuOpen, setIsMenuOpen] = useState(isClosed ? false : true); // Stores the menu open state
    const [selectedUser, setSelectedUser] = useState<IUserData | null>(); // New state to store the selected name

    useEffect(() => {
      if (projectPk || searchTerm.trim() !== "") {
        getInternalUsersBasedOnSearchTerm(searchTerm, onlyInternal, projectPk)
          .then((data) => {
            console.log(data.users);
            setFilteredItems(data.users);
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
      preselectedUserPk !== undefined ? preselectedUserPk : 0
    );

    useEffect(() => {
      if (!userLoading && userData) {
        setUserFunction(userData.pk);
        if (setUserEmailFunction) {
          setUserEmailFunction(userData.email);
        }
        if (setUserNameFunction) {
          setUserNameFunction(`${userData.first_name} ${userData.last_name}`);
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
        setUserNameFunction(`${user.first_name} ${user.last_name}`);
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
      setUserFunction(0); // Clear the selected user by setting the userPk to 0 (or any value that represents no user)
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
      <FormControl
        isRequired={isRequired}
        mb={0}
        // bg={"red"}
        w={"100%"}
        h={"100%"}
      >
        <FormLabel>{label}</FormLabel>
        {selectedUser ? (
          <Box mb={2} color="blue.500">
            <SelectedUserInput user={selectedUser} onClear={handleClearUser} />
          </Box>
        ) : (
          <InputGroup>
            <Input
              ref={inputRef} // Attach the ref to the input element
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder={placeholder}
              onFocus={() => setIsMenuOpen(true)}
              autoFocus={autoFocus ? true : false}
              autoComplete="off"
            />
          </InputGroup>
        )}

        {selectedUser ? null : (
          <Box pos="relative" w="100%">
            <CustomMenu isOpen={filteredItems.length > 0 && isMenuOpen}>
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
        {/* <Box h="50px">
                {helperText}
            </Box> */}
        <FormHelperText>{helperText}</FormHelperText>
      </FormControl>
    );
  }
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
      zIndex={1}
      display={isOpen ? "block" : "none"}
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

  const serverUrl = useApiEndpoint();
  const noImage = useNoImage();
  return serverUrl ? (
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
      <Avatar
        src={
          user.image
            ? user.image?.file.startsWith("http")
              ? `${user.image?.file}`
              : `${serverUrl}${user.image?.file}`
            : user.image?.old_file
              ? user.image?.old_file
              : noImage
        }
      />
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
            user.is_staff
              ? user.is_superuser
                ? colorMode === "light"
                  ? "blue.500"
                  : "blue.300"
                : colorMode === "light"
                  ? "green.500"
                  : "green.300"
              : colorMode === "light"
                ? "gray.500"
                : "gray.400"
          }
        >
          {`${user.first_name === "None" ? user.username : user.first_name} ${
            user.last_name === "None" ? "" : user.last_name
          } ${
            user.is_staff
              ? user.is_superuser
                ? "(Admin)"
                : "(Staff)"
              : "(External)"
          }`}
        </Text>
      </Box>
    </Flex>
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

interface SelectedUserInputProps {
  user: IUserData;
  onClear: () => void;
}

const SelectedUserInput = ({ user, onClear }: SelectedUserInputProps) => {
  const { colorMode } = useColorMode();
  const serverUrl = useApiEndpoint();
  const noImage = useNoImage();

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
          user.image
            ? user.image?.file.startsWith("http")
              ? `${user.image?.file}`
              : `${serverUrl}${user.image?.file}`
            : user.image?.old_file
              ? user.image?.old_file
              : noImage
        }
      />
      <Text
        ml={2}
        color={
          user.is_staff
            ? user.is_superuser
              ? colorMode === "light"
                ? "blue.500"
                : "blue.400"
              : colorMode === "light"
                ? "green.500"
                : "green.400"
            : colorMode === "dark"
              ? "gray.200"
              : "gray.500"
        }
      >
        {`${user.first_name === "None" ? user.username : user.first_name} ${
          user.last_name === "None" ? "" : user.last_name
        } ${
          user.is_staff
            ? user.is_superuser
              ? "(Admin)"
              : "(Staff)"
            : "(External)"
        }`}
      </Text>

      <IconButton
        tabIndex={-1}
        aria-label="Clear selected user"
        icon={<CloseIcon />}
        size="xs"
        position="absolute"
        top="50%"
        right={2}
        transform="translateY(-50%)"
        onClick={onClear}
      />
    </Flex>
  ) : null;
};
