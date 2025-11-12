import { Box, Text, useColorMode } from "@chakra-ui/react";
import { useEffect, useState } from "react";

interface ISidebarMenuButtonProps {
  selectedString: string;
  pageName: string;
  onClick: () => void;
}

export const GuideSidebarButton = ({
  selectedString,
  pageName,
  onClick,
}: ISidebarMenuButtonProps) => {
  const { colorMode } = useColorMode();
  const [selected, setSelected] = useState<boolean>(false);

  // Improved string normalization function
  const normalizeString = (str: string) => {
    return str
      .toLowerCase()
      .replace(/\s+/g, "_") // Replace all whitespace with single underscore
      .replace(/[^a-z0-9_]/g, ""); // Remove any non-alphanumeric characters except underscore
  };

  useEffect(() => {
    const cleanedSelectedString = normalizeString(selectedString);
    const cleanedPageName = normalizeString(pageName);

    console.log({
      cleanedPageName,
      cleanedSelectedString,
      isSelected: cleanedSelectedString === cleanedPageName,
    });

    setSelected(cleanedSelectedString === cleanedPageName);
  }, [selectedString, pageName]);

  return (
    <Box
      p={2}
      width={"100%"}
      bg={
        selected
          ? colorMode === "light"
            ? "blue.400"
            : "blue.500"
          : "transparent"
      }
      color={selected ? "white" : "inherit"}
      _hover={
        colorMode === "light"
          ? {
              bg: selected ? "blue.400" : "blue.100",
              color: selected ? "white" : "black",
            }
          : {
              bg: selected ? "blue.400" : "gray.300",
              color: selected ? "white" : "black",
            }
      }
      position={"relative"}
      display={"flex"}
      rounded={"lg"}
      cursor={"pointer"}
      transitionProperty={
        "background-color, border-color, color, fill, stroke, opacity, box-shadow, transform"
      }
      onClick={onClick}
    >
      <Box flex={1} width={"100%"}>
        <Box _focus={{ outline: "none" }} width={"100%"}>
          <Box textAlign={"center"} width={"100%"}>
            <Text textAlign={"center"} width={"100%"}>
              {pageName}
            </Text>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};
