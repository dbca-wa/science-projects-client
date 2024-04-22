// Dropdown search component for users. Displays 5 users below the search box.

import {
    // Avatar,
    Box,
    Flex,
    FormControl,
    FormHelperText,
    FormLabel,
    IconButton,
    Input,
    InputGroup,
    // Skeleton,
    useColorMode,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { IMidDoc } from "../../types";
import {
    getFullProjectSimple,
    getMyProjectsBasedOnSearchTerm,
} from "../../lib/api";
import { CloseIcon } from "@chakra-ui/icons";
import { useUser } from "../../lib/hooks/useUser";
// import { useNoImage } from "../../lib/hooks/useNoImage";
import { ExtractedHTMLTitle } from "../ExtractedHTMLTitle";
import useApiEndpoint from "@/lib/hooks/useApiEndpoint";

interface IProjectDocumentDropdown {
    selectedProject: boolean;
    isRequired: boolean;

    preselectedProjectDocumentPk?: number;
    setProjectDocumentFunction: (setProjectDocumentPk: number) => void;
    setProjectDocumentTypeFunction: (setProjectDocumentTypeString: string) => void;
    setDocTypePk?: (docTypePk: number) => void;

    user: number;
    label: string;
    placeholder: string;
    helperText: string;
    inputRef: React.RefObject<HTMLInputElement | null>;
    autoFocus?: boolean;
    isClosed?: boolean;
    // register: any;
}

export const ProjectDocumentDropdown = ({
    isRequired,
    setProjectDocumentFunction,
    setProjectDocumentTypeFunction,
    setDocTypePk,
    label,
    placeholder,
    helperText,
    preselectedProjectDocumentPk,
    inputRef,
    autoFocus,
    isClosed
}: IProjectDocumentDropdown) => {
    const [searchTerm, setSearchTerm] = useState(""); // Local state for search term
    const [filteredItems, setFilteredItems] = useState<IMidDoc[]>(); // Local state for filtered items
    const [isMenuOpen, setIsMenuOpen] = useState(isClosed ? false : true); // Stores the menu open state
    const [selectedProjectDocument, setSelectedProjectDocument] = useState<IMidDoc>(); // New state to store the selected name

    const { userLoading, userData } = useUser();

    useEffect(() => {
        if (!userLoading) {
            if (preselectedProjectDocumentPk === undefined || preselectedProjectDocumentPk === null) {
                if (searchTerm) {
                    setIsMenuOpen(true);
                    getMyProjectsBasedOnSearchTerm(searchTerm, userData.pk)
                        .then((data) => {
                            console.log(data.projects);
                            setFilteredItems(data.projects);
                        })
                        .catch((error) => {
                            console.error("Error fetching users:", error);
                            setFilteredItems([]);
                        });
                } else {
                    if (!selectedProjectDocument) {
                        handleClearProject();
                        setIsMenuOpen(isClosed ? false : true);
                    }
                }
            } else {
                console.log("Preselected Project PK:", preselectedProjectDocumentPk);
                getFullProjectSimple(preselectedProjectDocumentPk)
                    .then((projectData) => {
                        console.log(projectData.project);
                        setProjectDocumentFunction(projectData.project.pk);
                        setIsMenuOpen(false);
                        setSelectedProjectDocument(projectData.project);
                        setSearchTerm(""); // Clear the search term when a user is selected
                        if (setProjectDocumentTypeFunction) {
                            setProjectDocumentTypeFunction(projectData.project.title);
                        }
                        if (setDocTypePk) {
                            setDocTypePk(projectData.project.pk)
                        }
                    })
                    .catch((error) => {
                        console.error("Error fetching users:", error);
                    });
            }
        }
    }, [searchTerm, userLoading, userData, preselectedProjectDocumentPk, isClosed]);

    const handleSelectDocument = (document: IMidDoc) => {
        setProjectDocumentTypeFunction(document.kind);
        setIsMenuOpen(false);
        setSelectedProjectDocument(document); // Update the selected project
        setSearchTerm(""); // Clear the search term when a project is selected
        if (setDocTypePk) {
            setDocTypePk(document.referenced_doc.pk);
        }
    };

    const handleClearProject = () => {
        if (preselectedProjectDocumentPk !== null && preselectedProjectDocumentPk !== undefined) {
            return;
        }

        setProjectDocumentFunction(0); // Clear the selected project by setting the projectPk to 0 (or any value that represents no project)
        setSelectedProjectDocument(null); // Clear the selected project state
        setIsMenuOpen(false); // Show the menu again when the project is cleared
        if (setProjectDocumentTypeFunction) {
            setProjectDocumentTypeFunction(null);
        }
        if (setDocTypePk) {
            setDocTypePk(0);
        }

    };

    return (
        // isLoading ||
        userLoading ? null : (
            <FormControl
                isRequired={isRequired}
                mb={4}
                // bg={"red"}
                w={"100%"}
                h={"100%"}
            >
                <FormLabel>{label}</FormLabel>
                {selectedProjectDocument ? (
                    <Box mb={2} color="blue.500">
                        <SelectedDocumentInput
                            document={selectedProjectDocument}
                            onClear={handleClearProject}
                            isPreselected={
                                preselectedProjectDocumentPk !== null &&
                                preselectedProjectDocumentPk !== undefined
                            }
                        />
                    </Box>
                ) : (
                    <InputGroup>
                        <Input
                            autoComplete="off"
                            ref={inputRef}
                            type="text"
                            value={searchTerm}
                            onChange={(event) => setSearchTerm(event.target.value)}
                            placeholder={placeholder}
                            onFocus={() => setIsMenuOpen(true)}
                            autoFocus={autoFocus ? true : false}
                        />
                    </InputGroup>
                )}

                {selectedProjectDocument
                    ? null
                    : filteredItems.length > 0 && (
                        <Box pos="relative" w="100%">
                            <CustomMenu isOpen={filteredItems.length > 0 && isMenuOpen}>
                                <CustomMenuList minWidth="100%">
                                    {filteredItems?.map((document) => (
                                        <CustomMenuItem
                                            key={document?.pk}
                                            onClick={() => handleSelectDocument(document)}
                                            document={document}
                                        />
                                    ))}
                                </CustomMenuList>
                            </CustomMenu>
                        </Box>
                    )}
                <FormHelperText>{helperText}</FormHelperText>
            </FormControl>
        )
    );
};

// =========================================== ADDITIONAL COMPONENTS ====================================================

interface CustomMenuProps {
    isOpen: boolean;
    children: React.ReactNode;
}

interface CustomMenuItemProps {
    onClick: () => void;
    document: IMidDoc
    // | IProjectData
    ;
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

const CustomMenuItem = ({ onClick, document, ...rest }: CustomMenuItemProps) => {
    const [isHovered, setIsHovered] = useState(false);

    const handleClick = () => {
        onClick();
    };

    // const [imageLoaded, setImageLoaded] = useState(false);

    // const handleImageLoad = () => {
    //     setImageLoaded(true);
    // };
    // const noImage = useNoImage();
    const serverUrl = useApiEndpoint();

    return document ? (
        serverUrl ?
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
                {/* {document?.project?.image ? (
                    <Skeleton
                        isLoaded={imageLoaded}
                        startColor="gray.200"
                        endColor="gray.400"
                        rounded={"full"}
                    >
                        <Avatar
                            src={
                                document?.project.image ?
                                    document?.project.image?.file.startsWith("http") ?
                                        `${document?.project.image?.file}` : `${serverUrl}${document?.project.image?.file}` :
                                    noImage
                            }
                            onLoad={handleImageLoad}
                        />
                    </Skeleton>
                ) : (
                    <Avatar
                        src={noImage}
                        onLoad={handleImageLoad}
                    />
                )} */}

                <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="start"
                    ml={3}
                    h="100%"
                >
                    <ExtractedHTMLTitle
                        htmlContent={`(${document?.kind}) ${document?.project?.title}`}
                        color={"green.500"}
                    />
                </Box>
            </Flex> : null
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

interface SelectedDocumentInputProps {
    document: IMidDoc;
    onClear: () => void;
    isPreselected: boolean;
}

const SelectedDocumentInput = ({
    document,
    onClear,
    isPreselected,
}: SelectedDocumentInputProps) => {
    // const noImage = useNoImage();

    const [documentPk, setDocumentPk] = useState(document.pk);
    const { colorMode } = useColorMode();
    const serverUrl = useApiEndpoint();

    // useEffect(() => {
    //   console.log(`proj image alone: ${project.image?.file}`)
    //   console.log(`proj image with serverurl: ${serverUrl}${project.image?.file}`,)
    // })
    return (
        serverUrl ? (
            <Flex
                align="center"
                position="relative"
                bgColor={colorMode === "dark" ? "gray.700" : "gray.100"}
                borderRadius="md"
                px={2}
                py={1}
                mr={2}
            >
                {/* <Avatar
                    size="sm"
                    src={
                        document?.project.image ?
                            document?.project.image?.file.startsWith("http") ?
                                `${document?.project.image?.file}` : `${serverUrl}${document?.project.image?.file}` :
                            noImage
                    }
                /> */}
                <ExtractedHTMLTitle
                    ml={2}
                    htmlContent={`(${document?.kind}) ${document?.project?.title}`}
                    color={colorMode === "light" ? "green.500" : "green.400"}
                />
                <input
                    // {...register("project", { required: true })}
                    value={documentPk}
                    onChange={() => {
                        setDocumentPk(document?.pk);
                    }}
                    hidden
                />

                {!isPreselected && (
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
                )}
            </Flex>
        ) : null
    );
};
