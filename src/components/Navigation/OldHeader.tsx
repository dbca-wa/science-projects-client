// Header for traditional layout

// Components
import { CgPlayListAdd, CgBrowse } from "react-icons/cg";
import { NavMenu } from "./NavMenu";

// Chakra
import {
    Box, Button, Center, Divider, Drawer, DrawerBody, DrawerCloseButton, DrawerContent, DrawerHeader,
    DrawerOverlay, Flex, Grid, HStack, MenuGroup, MenuItem, Text, VStack, useColorMode, useColorModeValue, useDisclosure
} from "@chakra-ui/react";


// React, Settings, & Nav
import { useEffect, useState } from "react";
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import theme from "../../theme";

// Icon imports
import { GiHamburgerMenu } from "react-icons/gi";
import { IoMdDocument } from "react-icons/io";
import { AiFillProject } from "react-icons/ai";
import { BsFillPeopleFill } from "react-icons/bs"
import { AiFillPrinter } from "react-icons/ai";
import { CgViewList } from "react-icons/cg";
import { ImBook, ImUsers } from "react-icons/im";
import { FaUserPlus } from "react-icons/fa";


import { Navitar } from "./Navitar";
import { SidebarNavMenu } from "./SidebarNavMenu";
import { CreateUserModal } from "../Modals/CreateUserModal";
import { SearchUsers } from "./SearchUsers";
import { SearchProjects } from "./SearchProjects";
import { ToggleLayout } from "../ToggleLayout";
import { ToggleDarkMode } from "../ToggleDarkMode";


const ProjectMenuContents = () => {
    const navigate = useNavigate();
    return (
        <>
            <MenuGroup
                title="Create or Browse" fontSize={"12px"}
                color={"gray.500"} textAlign={"center"}


            >
                <MenuItem
                    onClick={() => {
                        navigate('/projects/browse')
                    }}
                >
                    {<CgBrowse />}
                    <Text ml={2}
                    >
                        Browse Projects
                    </Text>
                </MenuItem>
                <MenuItem
                    onClick={() => {
                        navigate('/projects/add')
                    }}
                >
                    {<CgPlayListAdd />}
                    <Text ml={2}>
                        Create New Project
                    </Text>
                </MenuItem>
            </MenuGroup>
        </>

    )
}

const ReportMenuContents = () => {
    const navigate = useNavigate();
    const dividerColor = useColorModeValue("gray.400", "whiteAlpha.700");

    const arar_publications = [
        {
            fileUrl: "https://scienceprojects.dbca.wa.gov.au/media/ararreports/11/AnnualReport20212022_138.pdf",
            years: "2021-2022"
        },
        {
            fileUrl: "https://scienceprojects.dbca.wa.gov.au/static/files/arar-2017-2018.pdf",
            years: "2017-2018"
        },
        {
            fileUrl: "https://scienceprojects.dbca.wa.gov.au/static/files/arar-2016-2017.pdf",
            years: "2016-2017"
        },
        {
            fileUrl: "https://scienceprojects.dbca.wa.gov.au/static/files/arar-2015-2016.pdf",
            years: "2015-2016"
        },
    ]

    return (
        <>
            <MenuGroup
                title="Annual Research Activity Report" fontSize={"12px"}
                color={"gray.500"} textAlign={"center"}


            >

                <MenuItem
                    onClick={() => {
                        navigate('/reports')
                    }}
                >
                    {<CgViewList />}
                    <Text ml={2}
                    >
                        Overview
                    </Text>
                </MenuItem>
                <MenuItem
                    onClick={() => {
                        navigate('/reports/current')
                    }}
                >
                    {<AiFillPrinter />}
                    <Text ml={2}>
                        Print Preview
                    </Text>
                </MenuItem>
            </MenuGroup>
            <Divider
                borderColor={dividerColor}
                my={1}
            />
            <MenuGroup
                title="Published" fontSize={"12px"}
                color={"gray.500"} textAlign={"center"}
            >
                {
                    arar_publications.map(publication => {
                        return (
                            <MenuItem
                                key={publication.years}
                                onClick={() => {
                                    window.open(publication.fileUrl, "_blank");
                                }}
                            >
                                {<ImBook />}
                                <Text ml={2}>
                                    ARAR {publication.years}
                                </Text>
                            </MenuItem>
                        )
                    })
                }
            </MenuGroup>
        </>
    )
}

const UserMenuContents = () => {
    const navigate = useNavigate();
    const { isOpen: isCreateUserModalOpen, onOpen: onCreateUserOpen, onClose: onCreateUserClose } = useDisclosure();


    return (
        <>
            <CreateUserModal isOpen={isCreateUserModalOpen} onClose={onCreateUserClose} />

            <MenuGroup
                title="Users" fontSize={"12px"} color={"gray.500"} textAlign={"center"}

            >
                <MenuItem
                    onClick={() => {
                        navigate('/users')
                    }}
                >
                    {<ImUsers />}
                    <Text ml={2}
                    >
                        Browse SPMS Users
                    </Text>
                </MenuItem>

                <MenuItem
                    onClick={onCreateUserOpen}
                >
                    {<FaUserPlus />}
                    <Text ml={2}>
                        Add New User
                    </Text>
                </MenuItem>
            </MenuGroup>
        </>
    )
}

const OldHeader = () => {

    const navigate = useNavigate();

    const [shouldShowHamburger, setShouldShowHamburger] = useState(false);
    const [windowSizeValue, setWindowSizeValue] = useState<number>(480);

    const { isOpen: drawerIsOpen, onOpen: onDrawerOpen, onClose: onDrawerClose } = useDisclosure()
    const drawerBtnRef = React.useRef<HTMLButtonElement>(null);

    const handleResize = () => {
        if (window.innerWidth < parseFloat(theme.breakpoints.lg)) {
            setShouldShowHamburger(true);
        } else {
            setShouldShowHamburger(false);
        }
        setWindowSizeValue(window.innerWidth);
    };

    useEffect(() => {
        handleResize(); // initial check
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, [theme.breakpoints.lg]);



    const { colorMode } = useColorMode();
    const location = useLocation();
    const [shouldRenderUserSearch, setShouldRenderUserSearch] = useState(false);
    const [shouldRenderProjectSearch, setShouldRenderProjectSearch] = useState(false);
    useEffect(() => {
        if (location.pathname === "/users") {
            if (shouldRenderUserSearch === false)
                setShouldRenderUserSearch(true);
        } else {
            if (shouldRenderUserSearch === true)
                setShouldRenderUserSearch(false);
        }

        if (location.pathname === "/projects") {
            if (shouldRenderProjectSearch === false)
                setShouldRenderProjectSearch(true);
        } else {
            if (shouldRenderProjectSearch === true)
                setShouldRenderProjectSearch(false);
        }
    }, [location.pathname])

    return (
        <Box>
            {/* Nav background */}
            <HStack
                bg={colorMode === "light" ? "blackAlpha.800" : "gray.900"}
                py={{
                    base: 4,
                    md: 4,
                    lg: 1
                }}
                roundedBottom={6}
                alignItems="center" justifyContent="space-between"
            >
                <HStack spacing={2}
                    flexGrow={1}
                >

                    {/* SMPS Logo/Title */}
                    <Box>
                        <Button
                            px={5}
                            color={"whiteAlpha.700"}
                            size={"md"}
                            variant={"unstyled"}
                            onClick={() => {
                                navigate('/')
                            }}
                        >
                            <Text fontSize={18}>SPMS</Text>
                        </Button>

                    </Box>
                    {
                        shouldShowHamburger ?
                            <Box
                                flexGrow={1}
                                // bg={"red"}
                                justifyContent={"end"}
                                display={"flex"}
                            >
                                <Box
                                    mx={3}
                                >
                                    <Button
                                        ref={drawerBtnRef}
                                        onClick={onDrawerOpen}
                                        variant={"solid"}
                                        color={"white"}
                                        bg={"gray.600"}
                                        _hover={
                                            {
                                                bg: "white",
                                                color: "black"
                                            }
                                        }
                                    >
                                        <GiHamburgerMenu size={"22px"} />
                                    </Button>
                                    <Drawer
                                        isOpen={drawerIsOpen}
                                        placement="right"
                                        onClose={onDrawerClose}
                                        finalFocusRef={drawerBtnRef}
                                    >
                                        <DrawerOverlay />
                                        <DrawerContent
                                            bg={"blackAlpha.900"}
                                        >
                                            <DrawerCloseButton color={"white"} />

                                            <DrawerHeader
                                                borderBottomWidth="1px" color="white"
                                            >
                                                SPMS
                                            </DrawerHeader>
                                            <DrawerBody>
                                                <VStack
                                                    py={3}
                                                >
                                                    <HStack
                                                        w={"100%"}
                                                    >
                                                        <Flex
                                                            mr={"auto"}
                                                            justifyContent={"left"}
                                                            alignItems={"center"}
                                                            w={"100%"}
                                                        >
                                                            <Center
                                                            >
                                                                <Text
                                                                    alignItems={"center"}

                                                                    fontSize={"lg"}
                                                                    color={"whiteAlpha.800"}
                                                                >
                                                                    MENU
                                                                </Text>
                                                            </Center>
                                                        </Flex>
                                                        <Flex
                                                            ml={"auto"}
                                                            justifyContent={"right"}
                                                            alignItems={"center"}
                                                        >
                                                            <Center mr={4}>
                                                                {
                                                                    shouldRenderUserSearch === true && (
                                                                        <SearchUsers />
                                                                    )
                                                                }

                                                                {
                                                                    shouldRenderProjectSearch === true && (
                                                                        <SearchProjects />
                                                                    )
                                                                }
                                                                <ToggleLayout />
                                                                <ToggleDarkMode />
                                                            </Center>

                                                            <Navitar
                                                                isModern={false}
                                                                windowSize={windowSizeValue}
                                                            />
                                                        </Flex>
                                                    </HStack>


                                                    <Grid
                                                        w={"100%"}
                                                        py={2}
                                                    >
                                                        {/* Projects */}
                                                        <SidebarNavMenu
                                                            menuName="Projects"
                                                            leftIcon={<AiFillProject />}
                                                            children={
                                                                <ProjectMenuContents />
                                                            }

                                                        />

                                                        {/* Staff */}
                                                        <SidebarNavMenu
                                                            menuName="Users"
                                                            leftIcon={<BsFillPeopleFill />}
                                                            children={
                                                                <UserMenuContents />
                                                            }
                                                        />

                                                        {/* Reports */}
                                                        <SidebarNavMenu
                                                            menuName="Reports"
                                                            leftIcon={<IoMdDocument />}
                                                            children={
                                                                <ReportMenuContents />
                                                            }
                                                        />
                                                    </Grid>
                                                </VStack>
                                            </DrawerBody>
                                        </DrawerContent>
                                    </Drawer>
                                </Box>
                            </Box>

                            :
                            <Box
                                flexGrow={1}
                                justifyContent={"space-between"}
                                display={"flex"}
                            >
                                {/* Basic Navigation */}
                                <HStack>
                                    {/* Projects */}
                                    <NavMenu menuName="Projects" children={
                                        <ProjectMenuContents />
                                    } />


                                    {/* Staff */}
                                    <NavMenu menuName="Users" children={
                                        <UserMenuContents />
                                    } />

                                    {/* Reports */}
                                    <NavMenu menuName="Reports" children={
                                        <ReportMenuContents />
                                    } />
                                </HStack>

                                {/* RHS Items */}
                                <HStack
                                    px={3}
                                >
                                    {
                                        shouldRenderUserSearch === true && (
                                            <SearchUsers />
                                        )
                                    }

                                    {
                                        shouldRenderProjectSearch === true && (
                                            <SearchProjects />
                                        )
                                    }

                                    <Navitar shouldShowName
                                        windowSize={windowSizeValue} isModern={false} />
                                </HStack>
                            </Box>
                    }
                </HStack>
            </HStack>
        </Box>
    )
}

export default OldHeader;