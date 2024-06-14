// Modern Breadcrumb component in header

import { Button, Center, Flex, Icon, useColorMode } from "@chakra-ui/react";
import { motion } from "framer-motion";
import React from "react";
import { AiFillHome } from "react-icons/ai";
import { useUpdatePage } from "../../lib/hooks/helper/useUpdatePage";

export const ModernBreadcrumb = () => {
  const { currentPage, updatePageContext } = useUpdatePage();
  const { colorMode } = useColorMode();
  const updateHome = () => {
    updatePageContext("/");
  };

  const handleUnderscores = (text: string) => {
    let updated = text;
    if (text.includes('_')) {
      updated = updated.replaceAll('_', ' ');
    }
    return updated;
  }


  const pages = currentPage.split("/").filter((page) => page !== "");
  const breadcrumbItems = pages.map((page, index) => {
    const isLast = index === pages.length - 1;
    const path = `/${pages.slice(0, index + 1).join("/")}`;
    const handleClick = () => updatePageContext(path);
    const capitalizedPage = handleUnderscores(page.charAt(0).toUpperCase() + page.slice(1));

    return (
      <React.Fragment key={page}>
        {!isLast && (
          <Button
            size="sm"
            onClick={handleClick}
            variant="link"
            color={colorMode === "light" ? "blue.500" : "blue.300"}
            _hover={{
              color: colorMode === "light" ? "blue.400" : "blue.200",
            }}
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
            color={colorMode === "light" ? "blue.500" : "blue.300"}
            _hover={{
              color: colorMode === "light" ? "blue.400" : "blue.200",
            }}
            fontWeight="normal" // Set fontWeight to normal for the last breadcrumb item
          >
            {capitalizedPage}
          </Button>
        )}
      </React.Fragment>
    );
  });

  const isBaseRoute = pages.length === 0;

  return (
    <motion.div initial={{ opacity: 1, y: 0 }}>
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
