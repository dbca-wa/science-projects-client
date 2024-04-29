// For handling the sidebar on smaller screens on traditional version

import {
  Flex,
  Menu,
  MenuButton,
  Text,
  TextProps,
  Button,
  Center,
  MenuList,
  Box,
} from "@chakra-ui/react";
import { useState } from "react";
import { GoTriangleDown } from "react-icons/go";

interface ISidebarNavMenuProps extends TextProps {
  menuName?: string;
  cScheme?: string;
  hoverColor?: string;
  fColor?: string;
  leftIcon?: React.ReactNode;
  children?: React.ReactNode;
  noChevron?: boolean;
}

export const SidebarNavMenu = ({
  menuName,
  cScheme,
  leftIcon,
  fColor,
  hoverColor,
  children,
  noChevron,
  textAlign,
}: ISidebarNavMenuProps) => {
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

  const bgStyle =
    isHovered || isOpen
      ? cScheme
        ? { bg: `${cScheme}.500` }
        : {}
      : cScheme
      ? `${cScheme}.500`
      : "transparent";

  const fontColorStyle =
    isHovered || isOpen
      ? fColor
        ? { color: fColor }
        : "white"
      : fColor
      ? fColor
      : "whiteAlpha.700";

  return (
    <Box zIndex={isOpen ? 2 : 1}>
      <Menu isOpen={isOpen}>
        <MenuButton
          colorScheme={cScheme}
          zIndex={isOpen ? 2 : 1}
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
        >
          <Flex justifyContent={"space-between"}>
            {leftIcon ? (
              <Box display={"flex"} justifyContent={"space-between"} w={"100%"}>
                <Center mr={menuName ? 1.5 : 0}>
                  <Box justifyContent={"end"} boxSize={5}>
                    {leftIcon}
                  </Box>
                </Center>

                <Center mr={menuName ? 1.5 : 0}>
                  <Text>{menuName}</Text>
                </Center>
                <Center></Center>
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
          onClick={handleItemClick}
          mt={"-7.5px"}
          w={"100%"}
          zIndex={isOpen ? 2 : 19}
        >
          {children}
        </MenuList>
      </Menu>
    </Box>
  );
};
