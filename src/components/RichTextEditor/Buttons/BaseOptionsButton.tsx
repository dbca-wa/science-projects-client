// A template for a RTE options bar - props fill out its icon and functionality

import { Button, Icon, useColorMode } from "@chakra-ui/react"
import { IconType } from "react-icons";

interface BaseOptionsButtonProps {
    colorScheme?: string;
    icon: IconType;
    onClick: () => void;
}

export const BaseOptionsButton = ({ colorScheme, icon: buttonIcon, onClick }: BaseOptionsButtonProps) => {
    const { colorMode } = useColorMode();

    return (
        <Button
            bg={
                colorMode === "light" ?
                    `${colorScheme}.500` : `${colorScheme}.600`
            }

            color={
                colorMode === "light" ?
                    "whiteAlpha.900" : "whiteAlpha.800"
            }

            _hover={
                colorMode === "light" ?
                    {
                        bg: `${colorScheme}.600`,
                        color: `white`
                    } :
                    {
                        bg: `${colorScheme}.500`,
                        color: `white`
                    }
            }
            onClick={onClick}
            rounded={"full"}
            w={"50px"}
            h={"50px"}
        >
            <Icon
                as={buttonIcon}
                boxSize={6}
            />
        </Button>
    );
};
