// Component for handling hover opening of menus on Header/Nav

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

interface INavButtonProps extends TextProps {
  buttonName?: string;
  cScheme?: string;
  hoverColor?: string;
  fColor?: string;
  leftIcon?: IconType;
  onClick: (e) => void;
}

export const NavButton = ({
  buttonName,
  cScheme,
  leftIcon,
  fColor,
  hoverColor,
  textAlign,
  onClick,
}: INavButtonProps) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  const handleItemClick = (e) => {
    onClick(e);
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
    <Box onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      <Button
        colorScheme={cScheme}
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
        size={"sm"}
        px={2}
        py={5}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        outline="none"
        _focus={{ boxShadow: "none" }}
        minW={"60px"}
        onClick={(e) => handleItemClick(e)}
      >
        <Flex>
          {leftIcon ? (
            <Box display={"flex"}>
              <Center mr={buttonName ? 1.5 : 0}>
                <Icon as={leftIcon} />
              </Center>
              <Center mr={buttonName ? 1.5 : 0}>
                <Text>{buttonName}</Text>
              </Center>
            </Box>
          ) : textAlign ? (
            <Text>{buttonName}</Text>
          ) : (
            <Text>{buttonName}</Text>
          )}
        </Flex>
      </Button>
    </Box>
  );
};
