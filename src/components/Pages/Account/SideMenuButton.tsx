// Handles creation of sidebar buttons on account page
import { Box, Text, useBreakpointValue, useColorMode } from "@chakra-ui/react";
import { useEffect, useState } from "react";

interface ISidebarMenuButtonProps {
  selectedString: string;
  pageName: string;
  onClick: () => void;
}

export const SideMenuButton = ({
  selectedString,
  pageName,
  onClick,
}: ISidebarMenuButtonProps) => {
  const { colorMode } = useColorMode();
  const handleOnClick = () => {
    onClick();
  };
  const [selected, setSelected] = useState<boolean>(false);

  useEffect(() => {
    const cleanedSelectedString = selectedString
      .toLowerCase()
      .replace(/\s/g, "");
    const cleanedPageName = pageName.toLowerCase().replace(/\s/g, "");
    setSelected(cleanedSelectedString === cleanedPageName);
  }, [selectedString, pageName]);

  const isOver750 = useBreakpointValue({
    false: true,
    sm: false,
    md: false,
    "768px": true,
    mdlg: true,
    lg: true,
    xlg: true,
  });

  return (
    <Box
      w={"100%"}
      p={2}
      mb={4}
      // width={"100%"}
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
      onClick={handleOnClick}
      ml={isOver750 ? 4 : undefined}
    >
      <Box flex={1}>
        <Box _focus={{ outline: "none" }}>
          <Box textAlign={"center"}>
            <Text textAlign={"center"}>{pageName}</Text>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};
