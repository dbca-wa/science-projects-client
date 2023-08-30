// A template for a RTE toggalable button - props fill out its icons, colorSchemes, states and functionality

import { Button, Icon, useColorMode } from "@chakra-ui/react"
import { IconType } from "react-icons";

interface BaseToggleOptionsButtonProps {
    colorSchemeOne?: string;
    colorSchemeTwo?: string;
    iconOne: IconType;
    iconTwo: IconType;
    currentState: boolean;
    setCurrentState: (state: boolean) => void;
}

export const BaseToggleOptionsButton = ({
    colorSchemeOne,
    colorSchemeTwo,
    iconOne: IconOne,
    iconTwo: IconTwo,
    currentState,
    setCurrentState
}: BaseToggleOptionsButtonProps) => {

    const handleClick = () => {
        setCurrentState(!currentState)
    }

    const { colorMode } = useColorMode();

    return (
        <Button
            bg={
                colorMode === "light" ?
                    colorSchemeOne && colorSchemeTwo ?
                        currentState === false ? `${colorSchemeOne}.500` : `${colorSchemeTwo}.500`
                        : `${colorSchemeOne}.500` // For if colorSchemeTwo not provided
                    : colorSchemeOne && colorSchemeTwo ? // For dark mode
                        currentState === false ? `${colorSchemeOne}.600` : `${colorSchemeTwo}.600`
                        : "gray.500" //default for if colorSchemeTwo not provided in dark mode
            }
            color={
                colorMode === "light" ?
                    "whiteAlpha.900" : "whiteAlpha.800"
            }
            _hover={
                colorMode === "light" ?
                    {
                        color: "white",
                        bg: colorSchemeOne && colorSchemeTwo ?
                            currentState === false ? `${colorSchemeOne}.600` : `${colorSchemeTwo}.600`
                            : "gray.500" //default for if colorSchemeTwo not provided in dark mode

                    } :
                    {
                        // For dark mode
                        color: "white",
                        bg: colorSchemeOne && colorSchemeTwo ?
                            currentState === false ? `${colorSchemeOne}.500` : `${colorSchemeTwo}.500`
                            : "gray.500" //default for if colorSchemeTwo not provided in dark mode
                    }
            }
            onClick={handleClick}
            rounded={"full"}
            w={"50px"}
            h={"50px"}
        >
            {currentState === false ?
                <Icon as={IconOne} boxSize={6} />
                :
                <Icon as={IconTwo} boxSize={6} />
            }
        </Button>
    );
};
