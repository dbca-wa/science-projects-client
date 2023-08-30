// A template for a RTE menu button - props fill out its icon, text and functionality

import { Menu, MenuButton, MenuItem, MenuList, Icon, Box, Button } from "@chakra-ui/react"
import { useEffect, useRef, useState } from "react";
import { IconType } from "react-icons";
import { FaCaretDown } from "react-icons/fa";


interface IMenuItem {
    leftIcon?: IconType;
    text: string;
    onClick: () => void;
}

export interface IBaseToolbarMenuButtonProps {
    title?: string;
    menuIcon?: IconType;
    menuItems: IMenuItem[];
}

export const BaseToolbarMenuButton = ({ title, menuIcon: MenuIcon, menuItems }: IBaseToolbarMenuButtonProps) => {
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

        window.addEventListener('resize', updateButtonWidth); // Update width on window resize

        return () => {
            window.removeEventListener('resize', updateButtonWidth);    // Clean up for optomisation
        };
    }, [buttonRef])

    return (
        <Menu isLazy
        >
            <MenuButton
                as={Button}
                variant={"ghost"}
                leftIcon={
                    MenuIcon ?
                        <MenuIcon />
                        : undefined
                }
                rightIcon={<FaCaretDown />}
                // px={8}
                mx={1}
                flex={1}
                ref={buttonRef}
            >
                {title ? title : null}
            </MenuButton>
            <MenuList
                w={buttonWidth}
                minW={"200px"}
            >
                {menuItems.map((item, index) => {
                    return (
                        <MenuItem
                            key={index}
                            onClick={item.onClick}
                            w={"100%"}
                            display={"inline-flex"}
                            alignItems={"center"}
                        >
                            {
                                item.leftIcon ?
                                    (
                                        <Icon as={item.leftIcon} />
                                    ) :
                                    null
                            }
                            <Box pl={4}>
                                <span
                                >{item.text}</span>
                            </Box>
                        </MenuItem>
                    )
                })}
            </MenuList>
        </Menu>
    )
}
