// For handling the sidebar on smaller screens on traditional version

import {
  Box,
  Button,
  Center,
  Flex,
  Icon,
  Text,
  TextProps,
} from "@chakra-ui/react";
import { useState } from "react";
import { IconType } from "react-icons";

interface ISidebarNavButtonProps extends TextProps {
  buttonName?: string;
  cScheme?: string;
  hoverColor?: string;
  fColor?: string;
  leftIcon?: IconType;
  onClick: () => void;
}

export const SidebarNavButton = ({
  buttonName,
  cScheme,
  leftIcon,
  fColor,
  hoverColor,
  onClick,
}: ISidebarNavButtonProps) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  const bgStyle = isHovered
    ? cScheme
      ? { bg: `${cScheme}.500` }
      : {}
    : cScheme
    ? `${cScheme}.500`
    : "transparent";

  const fontColorStyle = isHovered
    ? fColor
      ? { color: fColor }
      : "white"
    : fColor
    ? fColor
    : "whiteAlpha.700";

  return (
    <Box zIndex={1}>
      <Button
        colorScheme={cScheme}
        zIndex={1}
        bg={bgStyle}
        color={fontColorStyle}
        _hover={{
          bg: hoverColor ? hoverColor : "white",
          color: fColor ? fColor : "black",
        }}
        _active={{
          bg: hoverColor ? hoverColor : "white",
          color: fColor ? fColor : "black",
        }}
        as={Button}
        size={"lg"}
        w={"100%"}
        px={2}
        py={5}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={onClick}
      >
        <Flex w={"100%"}>
          {leftIcon ? (
            <Box display={"flex"} justifyContent={"space-between"} w={"100%"}>
              <Center mr={buttonName ? 1.5 : 0}>
                <Box justifyContent={"end"} boxSize={5}>
                  <Icon as={leftIcon} />
                </Box>
              </Center>

              <Center mr={buttonName ? 1.5 : 0}>
                <Text>{buttonName}</Text>
              </Center>
              <Center display={"hidden"}>
                <Icon as={leftIcon} display={"hidden"} opacity={0} />
              </Center>
            </Box>
          ) : (
            <Text>{buttonName}</Text>
          )}
        </Flex>
      </Button>
    </Box>
  );
};
