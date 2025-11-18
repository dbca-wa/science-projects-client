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
  ToastId,
  useColorMode,
  useToast,
  UseToastOptions,
} from "@chakra-ui/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { FaTrash } from "react-icons/fa";
import { GrOrganization } from "react-icons/gr";
import { createAffiliation, getAffiliationsBasedOnSearchTerm } from "@/lib/api";
import { IAffiliation } from "@/types";

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

export const AffiliationCreateSearchDropdown = forwardRef(
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
            </Box>
          )}

          <FormHelperText>{helperText}</FormHelperText>
          {array?.length > 1 && !hideTags && (
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
              Clear Affiliations
            </Button>
          )}
        </FormControl>
        {!hideTags && array?.length > 0 && (
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
  },
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

interface ICreateAffiliationProps {
  name: string;
  // refetchAffiliationsFn: () => void;
  array: IAffiliation[];
  setFilteredItems: React.Dispatch<React.SetStateAction<IAffiliation[]>>;
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

  const toast = useToast();

  const queryClient = useQueryClient();
  const toastIdRef = useRef<ToastId | undefined>(undefined);
  const addToast = (data: UseToastOptions) => {
    toastIdRef.current = toast(data);
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

    addToast({
      status: "loading",
      title: `Processing ${affiliationNames.length} affiliation(s)...`,
      position: "top-right",
    });

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
    if (toastIdRef.current) {
      const messages = [];
      if (created > 0) messages.push(`${created} created`);
      if (added > 0) messages.push(`${added} added`);
      if (skipped > 0) messages.push(`${skipped} already in project`);
      if (failed > 0) messages.push(`${failed} failed`);

      toast.update(toastIdRef.current, {
        title: "Bulk Add Complete",
        description: messages.join(", "),
        status: failed > 0 ? "warning" : "success",
        position: "top-right",
        duration: 5000,
        isClosable: true,
      });
    }

    queryClient.invalidateQueries({ queryKey: ["affiliations"] });
    setFilteredItems([]);
    setIsProcessing(false);
  };

  // Single affiliation add handler
  const handleSingleAdd = async () => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    const capitalizedName = `${name[0].toLocaleUpperCase()}${name.slice(1)}`;

    addToast({
      status: "loading",
      title: "Creating Affiliation...",
      position: "top-right",
    });

    try {
      const newAffiliation = await createAffiliation({ name: capitalizedName });
      
      if (toastIdRef.current) {
        toast.update(toastIdRef.current, {
          title: "Success",
          description: `Created "${capitalizedName}"`,
          status: "success",
          position: "top-right",
          duration: 3000,
          isClosable: true,
        });
      }

      if (arrayAddFunction) {
        arrayAddFunction(newAffiliation);
      }

      queryClient.invalidateQueries({ queryKey: ["affiliations"] });
      setFilteredItems([]);
    } catch (error) {
      if (toastIdRef.current) {
        toast.update(toastIdRef.current, {
          title: "Failed",
          description: `Could not create affiliation`,
          status: "error",
          position: "top-right",
          duration: 3000,
          isClosable: true,
        });
      }
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
    <Flex
      as="button"
      type="button"
      w="100%"
      textAlign="left"
      p={2}
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
        <Button
          onClick={handleClick}
          isDisabled={isAlreadyAdded || isProcessing}
          isLoading={isProcessing}
          leftIcon={<GrOrganization />}
          variant={"ghost"}
          color={
            isAlreadyAdded
              ? "orange.500"
              : isBulkAdd
                ? "blue.500"
                : colorMode === "light"
                  ? "green.500"
                  : "green.300"
          }
        >
          {isAlreadyAdded
            ? `Already added`
            : isBulkAdd
              ? `Click to add ${name.split(";").filter((n) => n.trim()).length} affiliation(s)`
              : `Click to add "${name[0].toLocaleUpperCase()}${name.slice(1)}" as an organisation/affiliation`}
        </Button>
      </Box>
    </Flex>
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
