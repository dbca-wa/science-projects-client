// Modern Header

import { Box, HStack } from "@chakra-ui/react"
import { Navitar } from "./Navitar";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import theme from "../../theme";
import { ModernBreadcrumb } from "./ModernBreadcrumb";
// import { SearchProjects } from "./SearchProjects";
// import { SearchUsers } from "./SearchUsers";

export const ModernHeader = () => {
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

    const [shouldShowHamburger, setShouldShowHamburger] = useState(false);
    const [windowSizeValue, setWindowSizeValue] = useState<number>(480);

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

    return (
        <Box
            display={"flex"}
            padding={"0.25rem"}
            // flexDir={"column"}
            // alignItems={"center"}
            sx={{
                '@media (min-width: 768px)': {
                    flexDirection: 'row',
                },
            }}
            position="sticky" top={0} zIndex={1}
            w={"100%"}
        >
            {/* Breadcrumb */}
            <Box
                display={"flex"}
                // flex={"1 1 0%"}
                justifyContent={"flex-start"}
                // alignItems={"center"}
                // w={"100%"}
                // px={6}
                padding={"0.25rem"}
            >
                <ModernBreadcrumb />
            </Box>

            {/* Search and Avatar */}
            <Box
                display={"flex"}
                flex={"1 1 0%"}
                justifyContent={"flex-end"}
                alignItems={"center"}
                w={"100%"}
                px={6}
                padding={"0.25rem"}
            >


                {/* {
                    shouldRenderUserSearch === true && (
                        <SearchUsers />
                    )
                } */}

                {/* {
                    shouldRenderProjectSearch === true && (
                        <SearchProjects />
                    )
                } */}
                <HStack
                    pl={6}
                    pr={3}
                >
                    <Navitar shouldShowName windowSize={windowSizeValue} isModern />
                </HStack>
            </Box>

        </Box>
    )
}