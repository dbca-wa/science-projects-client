// Used on the how to page to update the how to view with content based on what is clicked or searched via this component

import { Box, useColorMode } from "@chakra-ui/react"

export const HowToSidebar = () => {
    const { colorMode } = useColorMode();

    return (
        <Box
            borderLeftWidth="1px"
            borderLeftColor={colorMode === "light" ? "gray.300" : "whiteAlpha.400"}

            overflowY={"auto"}
            flexShrink={0}
            maxH={"100vh"}
            // w={"20%"}

            minW={250}
            maxW={250}
            // bg={colorMode === "light" ? "white" : "blackAlpha.500"}
            display={"flex"}
            flexDirection={"column"}
            py={1}
            px={2}
        >
            Sidebar
        </Box>
    )
}