// Component for handling hover opening of menus on Header/Nav

import {
  Box,
  Button,
  Center,
  Flex,
  Menu,
  MenuButton,
  MenuList,
  Text,
  TextProps,
} from "@chakra-ui/react";
import { useState } from "react";
import { GoTriangleDown } from "react-icons/go";

interface INavMenuProps extends TextProps {
  menuName?: string;
  cScheme?: string;
  hoverColor?: string;
  fColor?: string;
  leftIcon?: React.ReactNode;
  children?: React.ReactNode;
  noChevron?: boolean;
}

export const NavMenu = ({
  menuName,
  cScheme,
  leftIcon,
  fColor,
  hoverColor,
  children,
  noChevron,
  textAlign,
}: INavMenuProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleMouseEnter = () => {
    setIsHovered(true);
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setIsOpen(false);
  };

  const handleItemClick = () => {
    setIsOpen(false);
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
      <Menu isOpen={isOpen}>
        <MenuButton
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
          as={Button}
          size={"sm"}
          px={2}
          py={5}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          outline="none"
          _focus={{ boxShadow: "none" }}
          minW={"60px"}
        >
          <Flex>
            {leftIcon ? (
              <Box display={"flex"}>
                <Center mr={menuName ? 1.5 : 0}>{leftIcon}</Center>

                <Center mr={menuName ? 1.5 : 0}>
                  <Text>{menuName}</Text>
                </Center>
              </Box>
            ) : textAlign ? (
              <Text>{menuName}</Text>
            ) : (
              <Text>{menuName}</Text>
            )}

            {noChevron ? null : (
              <Center ml={1.5}>
                <GoTriangleDown size={"12px"} />
              </Center>
            )}
          </Flex>
        </MenuButton>

        <MenuList
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          mt={"-7.5px"}
          onClick={handleItemClick}
        >
          {children}
        </MenuList>
      </Menu>
    </Box>
  );
};
