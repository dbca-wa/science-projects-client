// Handles creation of sidebar buttons on account page
import { Box, Text, useColorMode } from "@chakra-ui/react"
import { useEffect, useState } from "react";

interface ISidebarMenuButtonProps {
    selectedString: string;
    pageName: string;
    onClick: () => void;
}

export const SideMenuButton = ({ selectedString, pageName, onClick }: ISidebarMenuButtonProps) => {

    const { colorMode } = useColorMode();
    const handleOnClick = () => {
        onClick();
    }
    const [selected, setSelected] = useState<boolean>(false);

    useEffect(() => {
        setSelected(selectedString.toLowerCase() === pageName.toLowerCase());
    }, [selectedString, pageName])

    return (
        <Box
            p={2}
            width={"100%"}
            bg={selected ? (colorMode === "light" ? "blue.400" : "blue.500") : "transparent"}
            color={selected ? ("white") : "inherit"}
            _hover={
                colorMode === "light" ?
                    {
                        bg: selected ? "blue.400" : "blue.100",
                        color: selected ? "white" : "black",
                    } :
                    {
                        bg: selected ? "blue.400" : "gray.300",
                        color: selected ? "white" : "black",
                    }
            }

            position={"relative"}
            display={"flex"}
            rounded={"lg"}
            cursor={"pointer"}
            alignItems={"center"}
            transitionProperty={"background-color, border-color, color, fill, stroke, opacity, box-shadow, transform"}
            onClick={handleOnClick}
        >
            <Box
                minW={0}
                flex={1}
            >
                <Box
                    _focus={{ outline: "none" }}
                >
                    <Box
                        display={"flex"}
                        justifyContent={"space-between"}
                        alignItems={"center"}
                        mb={0.5}
                        pl={2}
                    >
                        <Text>
                            {pageName}
                        </Text>
                    </Box>
                </Box>

            </Box>
        </Box>
    )
}