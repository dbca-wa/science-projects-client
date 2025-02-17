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
import {
  createAffiliation,
  getAffiliationsBasedOnSearchTerm,
} from "../../lib/api";
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
}
const DropdownCreateAffiliationMenuItem = ({
  name,
  // refetchAffiliationsFn,
  array,
  setFilteredItems,
  ...rest
}: ICreateAffiliationProps) => {
  const [isHovered, setIsHovered] = useState(false);

  const toast = useToast();

  const queryClient = useQueryClient();
  const toastIdRef = useRef<ToastId | undefined>(undefined);
  const addToast = (data: UseToastOptions) => {
    toastIdRef.current = toast(data);
  };
  const createAffiliationMutation = useMutation({
    mutationFn: createAffiliation,
    onMutate: () => {
      addToast({
        status: "loading",
        title: "Creating Affiliation...",
        position: "top-right",
      });
    },
    onSuccess: () => {
      if (toastIdRef.current) {
        toast.update(toastIdRef.current, {
          title: "Success",
          description: `Created`,
          status: "success",
          position: "top-right",
          duration: 3000,
          isClosable: true,
        });
      }
      //   onAddClose();
      queryClient.invalidateQueries({ queryKey: ["affiliations"] });
      // refetchAffiliationsFn();
      getAffiliationsBasedOnSearchTerm(name, 1)
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
    },
    onError: () => {
      if (toastIdRef.current) {
        toast.update(toastIdRef.current, {
          title: "Failed",
          description: `Something went wrong!`,
          status: "error",
          position: "top-right",
          duration: 3000,
          isClosable: true,
        });
      }
    },
  });

  const onSubmit = (formData: IAffiliation) => {
    createAffiliationMutation.mutate(formData);
  };

  const { colorMode } = useColorMode();
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
      {/* <form onSubmit={handleS}></form> */}
      <Box
        display="flex"
        alignItems="center"
        justifyContent="start"
        ml={3}
        h="100%"
      >
        <Button
          onClick={() =>
            onSubmit({
              name: `${name[0].toLocaleUpperCase()}${name.slice(1)}`,
            })
          }
          isDisabled={name.includes(",")}
          leftIcon={<GrOrganization />}
          variant={"ghost"}
          color={
            name.includes(",")
              ? "red.500"
              : colorMode === "light"
                ? "green.500"
                : "green.300"
          }
        >
          {name.includes(",")
            ? `Can't add a name with commas`
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
