// Modern Breadcrumb component in header

import { Button, Center, Flex, Icon, useColorMode } from "@chakra-ui/react"
import { useUpdatePage } from "../../lib/hooks/useUpdatePage";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { AiFillHome } from "react-icons/ai";

export const ModernBreadcrumb = () => {
    const { currentPage, updatePageContext } = useUpdatePage();
    const { colorMode } = useColorMode();
    const updateHome = () => {
        updatePageContext("/");
    };

    const pages = currentPage.split("/").filter((page) => page !== "");
    const breadcrumbItems = pages.map((page, index) => {
        const isLast = index === pages.length - 1;
        const path = `/${pages.slice(0, index + 1).join("/")}`;
        const handleClick = () => updatePageContext(path);
        const capitalizedPage = page.charAt(0).toUpperCase() + page.slice(1);


        return (
            <React.Fragment key={page}>
                {!isLast && (
                    <Button
                        size="sm"
                        onClick={handleClick}
                        variant="link"
                        colorScheme="blue"
                    >
                        {capitalizedPage}
                    </Button>
                )}
                {!isLast && <span>&nbsp;&gt;</span>}
                {isLast && (
                    <Button
                        size="sm"
                        onClick={handleClick}
                        variant="link"
                        colorScheme="blue"
                        fontWeight="normal" // Set fontWeight to normal for the last breadcrumb item
                    >
                        {capitalizedPage}
                    </Button>
                )}
            </React.Fragment>
        );
    });

    const isBaseRoute = pages.length === 0;

    const [visible, setVisible] = useState(true);
    const [nextPage, setNextPage] = useState("");
    const [fadeDelay, setFadeDelay] = useState(0);
    const [shouldAnimate, setShouldAnimate] = useState(true); // New state variable

    useEffect(() => {
        if (currentPage !== nextPage) {
            if (!visible) {
                setShouldAnimate(false); // Disable animation when becoming invisible
            }
            setVisible(false);
            setFadeDelay(200);
            setTimeout(() => {
                setNextPage(currentPage);
                setVisible(true);
                setFadeDelay(100);
                setShouldAnimate(true); // Enable animation when becoming visible again
            }, 300);
        }
    }, [currentPage, nextPage]);

    return (
        <motion.div
            initial={{ opacity: 1, y: 0 }}
        >
            <Flex
                bgColor={colorMode === "dark" ? "gray.700" : "gray.100"}
                rounded={6}
                pos="relative"
                justifyContent="space-between"
                userSelect="none"
                ml="2.5rem"
                py={1}
                px={2}
            >
                {isBaseRoute ? (
                    <Center
                        color={colorMode === "light" ? "blue.500" : "blue.300"}
                        onClick={updateHome}
                    >
                        <Icon as={AiFillHome} />
                    </Center>
                ) : null}
                <Flex>{breadcrumbItems}</Flex>
            </Flex>
        </motion.div>
    );
};
