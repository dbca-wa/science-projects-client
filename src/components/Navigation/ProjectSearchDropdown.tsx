// Dropdown search component for users. Displays 5 users below the search box.

import { Avatar, Box, Flex, FormControl, FormHelperText, FormLabel, IconButton, Input, InputGroup, Text, useQuery } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { IProjectData, IUserData } from "../../types";
import { getFullUser, getInternalUsersBasedOnSearchTerm, getMyProjects, getProjectsBasedOnSearchTerm } from "../../lib/api";
import { CloseIcon } from "@chakra-ui/icons";
import { useFullUserByPk } from "../../lib/hooks/useFullUserByPk";

interface IProjectSearchDropdown {
    allProjects: boolean;
    isRequired: boolean;
    setProjectFunction: (setUserPk: number) => void;
    user: number;
    label: string;
    placeholder: string;
    helperText: any;
}


export const ProjectSearchDropdown = ({
    allProjects = true,        // Default if not set
    isRequired,
    setProjectFunction,
    label,
    placeholder,
    helperText,
}: IProjectSearchDropdown) => {
    const [searchTerm, setSearchTerm] = useState(''); // Local state for search term
    const [filteredItems, setFilteredItems] = useState<IProjectData[]>([]); // Local state for filtered items
    const [isMenuOpen, setIsMenuOpen] = useState(true); // Stores the menu open state
    const [selectedProject, setSelectedProject] = useState<IProjectData | null>(); // New state to store the selected name

    // useEffect(() => {
    //     if (searchTerm.trim() !== '') {
    //         getMyProjectsBasedOnSearchTerm(searchTerm, userPk)
    //             .then((data) => {
    //                 console.log(data.projects);
    //                 setFilteredItems(data.projects);
    //             })
    //             .catch((error) => {
    //                 console.error('Error fetching users:', error);
    //                 setFilteredItems([]);
    //             });
    //     } else {
    //         const data = getMyProjects(); // Clear the filtered items when the search term is empty
    //         setFilteredItems(data.projects)
    //     }
    // }, [searchTerm]);

    // const { projectsLoading, projectData } = getProjectsByUserPk(user);

    // useEffect(() => {
    //     if (!projectsLoading && projectData) {
    //         setProjectFunction(projectData.pk);
    //         setIsMenuOpen(false);
    //         setSelectedProject(projectData); // Update the selected user
    //         setSearchTerm(''); // Clear the search term when a user is selected    
    //     }
    // }, [projectsLoading, projectData])

    const handleSelectProject = (project: IProjectData) => {
        setProjectFunction(project.pk);
        setIsMenuOpen(false);
        setSelectedProject(project); // Update the selected user
        setSearchTerm(''); // Clear the search term when a user is selected
    };

    const handleClearProject = () => {
        setProjectFunction(0); // Clear the selected user by setting the userPk to 0 (or any value that represents no user)
        setSelectedProject(null); // Clear the selected user state
        setIsMenuOpen(true); // Show the menu again when the user is cleared
    };


    return (
        <FormControl isRequired={isRequired} mb={4}
            // bg={"red"}
            w={"100%"}
            h={"100%"}
        >
            {/* <FormLabel>{label}</FormLabel>
            {selectedProject ? (
                <Box mb={2} color="blue.500">
                    <SelectedProjectInput user={selectedProject} onClear={handleClearProject} />
                </Box>
            ) : (
                <InputGroup>
                    <Input
                        type="text"
                        value={searchTerm}
                        onChange={(event) => setSearchTerm(event.target.value)}
                        placeholder={placeholder}
                        onFocus={() => setIsMenuOpen(true)}
                    />
                </InputGroup>
            )}

            {selectedProject ? null : (
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
};


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

const CustomMenuItem = ({ onClick, user, ...rest }: CustomMenuItemProps) => {
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
            <Avatar
                src={user?.image?.file ? user.image.file : user?.image?.old_file ? user.image.old_file : undefined}
            />
            <Box
                display="flex"
                alignItems="center"
                justifyContent="start"
                ml={3}
                h="100%"
            >
                <Text ml={2}
                    color={user.is_staff ? user.is_superuser ? "blue.500" : "green.500" : "gray.500"}
                >{`${user.first_name} ${user.last_name} ${user.is_staff ? user.is_superuser ? '(Admin)' : '(Staff)' : '(External)'}`}</Text>
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


interface SelectedUserInputProps {
    user: IUserData;
    onClear: () => void;
}

const SelectedUserInput = ({ user, onClear }: SelectedUserInputProps) => {
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
            <Avatar
                size="sm"
                src={user.image?.file ? user.image?.file : user.image?.old_file}
            />
            <Text ml={2}
                color={user.is_staff ? user.is_superuser ? "blue.500" : "green.500" : "gray.500"}
            >{`${user.first_name} ${user.last_name} ${user.is_staff ? user.is_superuser ? '(Admin)' : '(Staff)' : '(External)'}`}</Text>

            <IconButton
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
    );
};

