// A template for a RTE options bar - props fill out its icon and functionality

import { Button, Icon, useColorMode } from "@chakra-ui/react"
import { IconType } from "react-icons";
import ReactTooltip from "react-tooltip";

import "../../../styles/texteditor.css"

interface BaseOptionsButtonProps {
    colorScheme?: string;
    icon: IconType;
    onClick: () => void;
    toolTipText: string;
}

export const BaseOptionsButton = ({ colorScheme, icon: buttonIcon, onClick, toolTipText }: BaseOptionsButtonProps) => {
    const { colorMode } = useColorMode();

    return (
        <div className="tooltip-container">
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
                w={"45px"}
                h={"45px"}
                data-tip="Click to Save"
            >
                <Icon
                    as={buttonIcon}
                    boxSize={6}
                />
            </Button>
            <span className="tooltip-text">{toolTipText}</span>
        </div>

    );
};
