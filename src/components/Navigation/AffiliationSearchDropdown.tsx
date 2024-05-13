// Dropdown search component for affiliations. Displays 5 affiliations below the search box.

import { useAffiliation } from "@/lib/hooks/tanstack/useAffiliation";
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
import { getAffiliationsBasedOnSearchTerm } from "../../lib/api";
import { IAffiliation } from "../../types";

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
    ref
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
      preselectedAffiliationPk !== undefined ? preselectedAffiliationPk : 0
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
      setterFunction && setterFunction(); // Clear the selected affiliation by setting the affiliationPk to 0 (or any value that represents no user)
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
        <FormControl isRequired={isRequired} mb={4} zIndex={99}>
          <FormLabel>{label}</FormLabel>
          {selectedAffiliation ? (
            <Box mb={2} color="blue.500">
              <SelectedAffiliationPk
                affiliation={selectedAffiliation}
                onClear={handleClearAffiliation}
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

          {selectedAffiliation ? null : (
            <Box pos="relative" w="100%">
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
            </Box>
          )}

          <FormHelperText>{helperText}</FormHelperText>
          {array?.length > 1 && (
            <Button
              onClick={() => {
                arrayClearFunction
                  ? arrayClearFunction()
                  : console.log("array clear function not defined");
              }}
              size={"xs"}
              pos={"absolute"}
              bottom={-8}
              right={2}
              background={colorMode === "light" ? "red.500" : "red.800"}
              px={2}
              rightIcon={<FaTrash />}
            >
              Clear Secondary Affiliations
            </Button>
          )}
        </FormControl>
        {array?.length > 0 && (
          <Flex flexWrap="wrap" gap={2} pt={array?.length > 1 ? 7 : 0} pb={2}>
            {array?.map((aff, index) => (
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
                <TagLabel pl={1}>{aff?.name}</TagLabel>
                <TagCloseButton
                  onClick={() => arrayRemoveFunction(aff)}
                  userSelect={"none"}
                  tabIndex={-1}
                />
              </Tag>
            ))}
          </Flex>
        )}
      </>
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
  affiliation: IAffiliation;
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
      <Box
        display="flex"
        alignItems="center"
        justifyContent="start"
        ml={3}
        h="100%"
      >
        <Text ml={2} color={colorMode === "light" ? "green.500" : "green.300"}>
          {`${affiliation.name}`}
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
    <Flex
      align="center"
      position="relative"
      bgColor={colorMode === "dark" ? "gray.700" : "gray.100"}
      borderRadius="md"
      px={2}
      py={1}
      mr={2}
    >
      <Text ml={2} color={colorMode === "light" ? "green.500" : "green.400"}>
        {`${affiliation.name}`}
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
