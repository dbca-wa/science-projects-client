// A template for a RTE menu button - props fill out its icon, text and functionality

import {
  Box,
  Button,
  Icon,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  useColorMode,
} from "@chakra-ui/react";
import React, { useEffect, useRef, useState } from "react";
import { IconType } from "react-icons";
import { FaCaretDown } from "react-icons/fa";

interface IMenuItem {
  leftIcon?: IconType;
  text?: string;
  component?: React.ReactNode;
  onClick?: () => void;
}

export interface IBaseToolbarMenuButtonProps {
  title?: string;
  menuIcon?: IconType;
  menuItems: IMenuItem[];
  onClick?: () => void;
  disableHoverBackground?: boolean;
}

export const BaseToolbarMenuButton = ({
  title,
  menuIcon: MenuIcon,
  menuItems,
  onClick,
  disableHoverBackground,
}: IBaseToolbarMenuButtonProps) => {
  const [buttonWidth, setButtonWidth] = useState(0);
  const buttonRef = useRef(null);

  useEffect(() => {
    const updateButtonWidth = () => {
      if (buttonRef.current) {
        // eslint-disable-next-line
        // @ts-ignore
        const width = buttonRef.current.offsetWidth;
        setButtonWidth(width);
      }
    };

    updateButtonWidth(); // Get initial width

    window.addEventListener("resize", updateButtonWidth); // Update width on window resize

    return () => {
      window.removeEventListener("resize", updateButtonWidth); // Clean up for optomisation
    };
  }, [buttonRef]);

  const { colorMode } = useColorMode();

  return (
    <Menu isLazy>
      <MenuButton
        as={Button}
        variant={"ghost"}
        leftIcon={MenuIcon ? <MenuIcon /> : undefined}
        rightIcon={<FaCaretDown />}
        // px={8}
        mx={1}
        flex={1}
        ref={buttonRef}
        tabIndex={-1}
        onClick={() => { onClick && onClick() }}
      >
        {title ? title : null}
      </MenuButton>
      <MenuList
        w={"fit-content"}
        // w={buttonWidth}
        // minW={"200px"}
        // maxW={"200px"}
        zIndex={9999999999999}
        pos={"absolute"}
      >
        {menuItems.map((item, index) => {
          return (
            <MenuItem
              key={index}
              onClick={item.onClick}
              w={"100%"}
              display={"inline-flex"}
              alignItems={"center"}
              zIndex={2}
              // pos={"absolute"}
              _hover={{ bg: disableHoverBackground ? undefined : colorMode === "light" ? "gray.100" : "gray.600" }}
            >
              {item.leftIcon ? <Icon as={item.leftIcon} /> : null}
              {item?.text && (
                <Box pl={4} zIndex={2}>
                  <span>{item.text}</span>
                </Box>
              )}
              {item?.component && (item?.component)}
            </MenuItem>
          );
        })}
      </MenuList>
    </Menu>
  );
};
