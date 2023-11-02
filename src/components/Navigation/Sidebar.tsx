// Sidebar for modern version

import { Box, Button, Center, Divider, Flex, Grid, Icon, useColorMode } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { AiOutlineLeft, AiOutlineFundProjectionScreen } from "react-icons/ai";
import { TbLayoutGridAdd } from "react-icons/tb";
import { IoMdDocument } from "react-icons/io";
import { ImUsers } from "react-icons/im";
import { motion } from "framer-motion";
import { useUpdatePage } from "../../lib/hooks/useUpdatePage";
import { useCurrentYear } from "../../lib/hooks/useCurrentYear";
import { FiUserPlus } from "react-icons/fi";
import { HiDocumentDuplicate } from "react-icons/hi"
import { AnimatedToggleButton } from "./AnimatedToggleButton";
import { ToggleLayout } from "../ToggleLayout";
import { ToggleDarkMode } from "../ToggleDarkMode";
import { useLocation } from "react-router-dom";

const buttonWidthVariants = {
    open: {
        width: "100%",
        transition: { duration: 0.5 }
    },
    closed: {
        width: "100%",
        transition: { duration: 0.5 }
    }
};

const textVariants = {
    open: {
        opacity: 1,
        width: "auto",
        marginLeft: "3rem",
        transition: {
            duration: 0.3,
            delay: 0.2
        }
    },
    closed: {
        opacity: 0,
        width: 0,
        marginLeft: "3rem",
        transition: {
            duration: 0
        },
        display: "none"
    },
};

const sidebarVariants = {
    open: { width: "12.5rem", transition: { duration: 0.5 } },
    closed: { width: "5rem", transition: { duration: 0.5 } }
};

export const Sidebar = () => {
    const [buttonTransition, setButtonTransition] = useState("closed");

    const { updatePageContext, currentPage } = useUpdatePage();
    const [open, setOpen] = useState(true);

    const { colorMode } = useColorMode();

    const currentYear = useCurrentYear();

    const [activeMenu, setActiveMenu] = useState<string>("");
    const location = useLocation();

    // Sets the initial value of activeMenu based on the current page
    const getMenuTitleByRoute = (route: string) => {
        const menu = Menus.find((menu) => menu.route === route);
        return menu ? menu.title : "";
    };

    useEffect(() => {
        setActiveMenu(getMenuTitleByRoute(currentPage));
    }, [currentPage]);


    const Menus = [
        // { title: "Dashboard", img: AiFillHome, route: "/", section: "Daily" },
        // { title: "Tasks", img: BsFillKanbanFill, route: "/tasks" },
        // { title: "Chat", img: HiChatAlt2, route: "/chat" },

        { title: "Projects", img: AiOutlineFundProjectionScreen, route: "/projects", section: "Projects" },
        { title: "Add Project", img: TbLayoutGridAdd, route: "/projects/add" },

        { title: "Users", img: ImUsers, route: "/users", section: "Users" },
        { title: "Add user", img: FiUserPlus, route: "/users/add" },

        { title: `${currentYear} Report`, img: IoMdDocument, route: "/reports/current", section: "ARAR" },
        { title: "Reports", img: HiDocumentDuplicate, route: "/reports" },


    ];

    const handleToggleSidebar = () => {
        setOpen(!open);
    };

    const handleTextAnimationComplete = () => {
        if (!open) {
            setButtonTransition("open");
        }
    };

    return (
        <Box
            as={motion.div}
            initial={false}
            variants={sidebarVariants}
            animate={open ? "open" : "closed"}
            pos={"relative"}
            p={"1.25rem"}
            pt={"0.5rem"}

            maxW={"12.5rem"}
            minH={"100vh"}
            display={"flex"}
            flexDir={"column"}

            borderRightWidth="1px"
            borderRightColor={colorMode === "light" ? "gray.300" : "whiteAlpha.400"}
            bg={colorMode === "light" ? "white" : "blackAlpha.400"}
        >
            <Box
                w={5}
                h={5}
                pos={"absolute"}
                cursor={"pointer"}
                rounded={"full"}
                top={"0.75rem"}
                right={"-2rem"}
                zIndex={2}
                transitionDuration={"500ms"}
                transform={!open ? "rotate(-180deg)" : undefined}
                onClick={handleToggleSidebar}
                color={colorMode === "light" ? "black" : "whiteAlpha.900"}
                borderColor={colorMode === "light" ? "gray.400" : "whiteAlpha.600"}
                borderWidth="1px"
            >
                <Center rounded={"full"} ml={"-1.25px"} mt={"-1px"} w={5} h={5}>
                    <Icon as={AiOutlineLeft} boxSize={"2"} />
                </Center>
            </Box>

            <Flex
                flexDirection={open ? "row" : "column"}
                transitionDuration={"500ms"}
                w={"100%"}
                alignItems={"center"}
            >
                <Button
                    flex={1}
                    textColor={colorMode === "light" ? "blackAlpha.900" : "whiteAlpha.900"}
                    transformOrigin={"bottom"}
                    fontWeight={"500"}
                    fontSize={"xl"}
                    transitionDuration={"300ms"}
                    textAlign={"center"}
                    variant={"unstyled"}
                    onClick={() => {
                        setActiveMenu("Home");
                        updatePageContext('/');
                    }}
                >
                    SPMS
                </Button>
            </Flex>

            <Grid pt={2} flexDirection={"column"} transitionDuration={"500ms"}>
                {Menus.map((menu, index) => (
                    <Box key={index} width={"100%"}>
                        {menu.section && (
                            <Divider
                                mt={"1rem"}
                                mb={"1rem"}
                                dir="horizontal"
                                color={"white"}
                            />
                        )}
                        <Button
                            as={motion.div}
                            variants={buttonWidthVariants}
                            initial={false}
                            animate={buttonTransition}
                            position={"relative"}
                            display="block"
                            overflow={"hidden"}
                            fontSize={"0.875rem"}
                            lineHeight={"1.25rem"}
                            borderRadius={"0.375rem"}
                            cursor={"pointer"}
                            mt={"0.5rem"}
                            variant={"unstyled"}
                            p={"0.5rem"}
                            bg={
                                colorMode === "light"
                                    ? activeMenu === menu.title
                                        ? "blue.500"
                                        : undefined
                                    : activeMenu === menu.title
                                        ? "blue.500"
                                        : undefined
                            }
                            color={
                                colorMode === "light"
                                    ? activeMenu === menu.title
                                        ? "white"
                                        : "blackAlpha.800"
                                    : activeMenu === menu.title
                                        ? "whiteAlpha.800"
                                        : "whiteAlpha.800"

                            }

                            _hover={
                                colorMode === "light"
                                    ? activeMenu === menu.title
                                        ? {
                                            color: "white",
                                            bg: "blue.500"
                                        }
                                        : {
                                            color: "black",
                                            bg: "gray.100"
                                        }
                                    : activeMenu === menu.title
                                        ? {
                                            color: "whiteAlpha.800",
                                            bg: "blue.400"
                                        }
                                        : {
                                            color: "whiteAlpha.800",
                                            bg: "blue.400"
                                        }
                            }
                            onClick={() => {
                                setActiveMenu(menu.title);
                                updatePageContext(menu.route);
                            }}
                        >
                            <Icon
                                color={
                                    colorMode === "light" ?
                                        activeMenu === menu.title ?
                                            "whiteAlpha.900" : "blackAlpha.700"
                                        :
                                        "whiteAlpha.800"
                                }
                                as={menu.img}
                                boxSize={5}
                                position="absolute"
                                left={open ? "1rem" : "50%"}
                                transform={open ? "none" : "translateX(-50%)"}
                            />
                            <motion.span

                                variants={textVariants}
                                initial={false}
                                animate={open ? "open" : "closed"}
                                style={{
                                    display: "inline-block",
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    marginLeft: open ? "1rem" : 0
                                }}
                                onAnimationComplete={handleTextAnimationComplete}
                            >
                                {menu.title}
                            </motion.span>
                        </Button>
                    </Box>
                ))}
            </Grid>

            <Grid
                mt={"auto"}
                alignSelf={"end"}
                justifyContent={"end"}
                gridTemplateColumns={open ? "repeat(2, 1fr)" : "repeat(1, 1fr)"}
                w="100%"
                gap={open ? 4 : 0}
                justifyItems="center"
            >
                <ToggleLayout />
                <AnimatedToggleButton open={open} buttonComponent={<ToggleDarkMode />} delay={200} />
            </Grid>
        </Box>
    );
};