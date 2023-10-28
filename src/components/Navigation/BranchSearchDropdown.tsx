// Dropdown search component for branches. Displays 5 branches below the search box.

// Dropdown search component for users. Displays 5 users below the search box.

import { Box, Flex, FormControl, FormHelperText, FormLabel, IconButton, Input, InputGroup, Text } from "@chakra-ui/react";
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { IBranch } from "../../types";
import { getBranchesBasedOnSearchTerm } from "../../lib/api";
import { CloseIcon } from "@chakra-ui/icons";

interface IBranchSearchDropdown {
    isRequired: boolean;
    setBranchFunction: (setBranchPk: number) => void;
    label: string;
    placeholder: string;
    helperText: any;
    preselectedBranchPk?: number;
    isEditable?: boolean;
}

export const BranchSearchDropdown = forwardRef(({
    isRequired,
    setBranchFunction,
    label,
    placeholder,
    helperText
}: IBranchSearchDropdown, ref) => {
    const inputRef = useRef(null);

    const [searchTerm, setSearchTerm] = useState(''); // Local state for search term
    const [filteredItems, setFilteredItems] = useState<IBranch[]>([]); // Local state for filtered items
    const [isMenuOpen, setIsMenuOpen] = useState(true); // Stores the menu open state
    const [selectedBranch, setSelectedBranch] = useState<IBranch | null>(); // New state to store the selected name

    useEffect(() => {
        if (searchTerm.trim() !== '') {
            getBranchesBasedOnSearchTerm(searchTerm, 1)
                .then((data) => {
                    console.log(data.branches);
                    setFilteredItems(data.branches);
                })
                .catch((error) => {
                    console.error('Error fetching branches:', error);
                    setFilteredItems([]);
                });
        } else {
            setFilteredItems([]); // Clear the filtered items when the search term is empty
        }
    }, [searchTerm]);

    const handleSelectBranch = (branch: IBranch) => {
        setBranchFunction(branch.pk);
        setIsMenuOpen(false);
        setSelectedBranch(branch); // Update the selected branch
        setSearchTerm(''); // Clear the search term when a branch is selected
    };

    const handleClearBranch = () => {
        setBranchFunction(0); // Clear the selected branch by setting the branchpk to 0 (or any value that represents no user)
        setSelectedBranch(null); // Clear the selected branch state
        setIsMenuOpen(true); // Show the menu again when the branch is cleared
    };


    return (
        <FormControl isRequired={isRequired} mb={4}>
            <FormLabel>{label}</FormLabel>
            {selectedBranch ? (
                <Box mb={2} color="blue.500">
                    <SelectedBranchInput branch={selectedBranch} onClear={handleClearBranch} />
                </Box>
            ) : (
                <InputGroup>
                    <Input
                        autoComplete="off"
                        ref={inputRef} // Attach the ref to the input element
                        type="text"
                        value={searchTerm}
                        onChange={(event) => setSearchTerm(event.target.value)}
                        placeholder={placeholder}
                        onFocus={() => setIsMenuOpen(true)}
                    />
                </InputGroup>
            )}

            {selectedBranch ? null : (
                <Box pos="relative" w="100%">
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
                </Box>
            )}

            <FormHelperText>{helperText}</FormHelperText>
        </FormControl>
    );
});



// =========================================== ADDITIONAL COMPONENTS ====================================================


interface CustomMenuProps {
    isOpen: boolean;
    children: React.ReactNode;
}

interface CustomMenuItemProps {
    onClick: () => void;
    branch: IBranch;
}

interface CustomMenuListProps {
    minWidth: string;
    children: React.ReactNode;
}

const CustomMenu = ({ isOpen, children, ...rest }: CustomMenuProps) => {
    return (
        <Box
            pos="absolute"
            w="100%"
            bg="white"
            boxShadow="md"
            zIndex={1}
            display={isOpen ? "block" : "none"}
            {...rest}
        >
            {children}
        </Box>
    );
};

const CustomMenuItem = ({ onClick, branch, ...rest }: CustomMenuItemProps) => {
    const [isHovered, setIsHovered] = useState(false);

    const handleClick = () => {

        onClick();
    }

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
            {/* <Avatar
                src={user.image?.file ? user.image?.file : user.image?.old_file}
            /> */}
            <Box
                display="flex"
                alignItems="center"
                justifyContent="start"
                ml={3}
                h="100%"
            >
                <Text ml={2}
                    color={"green.500"}
                >
                    {`${branch.name}`}
                </Text>
            </Box>
        </Flex>
    );
};

const CustomMenuList = ({ minWidth, children, ...rest }: CustomMenuListProps) => {
    return (
        <Box
            pos="relative"
            w="100%"
            minWidth={minWidth}
            {...rest}
        >
            {children}
        </Box>
    );
};


interface SelectedBranchInputProps {
    branch: IBranch;
    onClear: () => void;
}

const SelectedBranchInput = ({ branch, onClear }: SelectedBranchInputProps) => {
    return (
        <Flex
            align="center"
            position="relative"
            bgColor="gray.100"
            borderRadius="md"
            px={2}
            py={1}
            mr={2}
        >
            {/* <Avatar
                size="sm"
                src={branch.image?.file ? user.image?.file : user.image?.old_file}
            /> */}
            <Text ml={2}
                color={"green.500"}
            >
                {`${branch.name}`}
            </Text>
            <IconButton
                aria-label="Clear selected branch"
                icon={<CloseIcon />}
                size="xs"
                position="absolute"
                top="50%"
                right={2}
                transform="translateY(-50%)"
                onClick={onClear}
            />
        </Flex>
    );
};

