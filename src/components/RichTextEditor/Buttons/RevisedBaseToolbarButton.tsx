// A template for a RTE simple button - props fill out its icon, text and functionality

import { Box, Text, Button, useColorMode } from "@chakra-ui/react"
import { CSSProperties, ReactNode } from "react"

interface IBaseToolbarButtonProps {
    ariaLabel: string;
    variant?: string;

    isActive?: boolean;
    isDisabled?: boolean;
    onClick?: () => void;

    children: ReactNode;
}
import "../../../styles/texteditor.css"

export const RevisedBaseToolbarButton = ({ children, ariaLabel, isDisabled, variant, isActive, onClick }: IBaseToolbarButtonProps) => {

    // const styles = {
    //     base: {
    //         visibility: 'hidden',
    //         width: '120px',
    //         background: '#333',
    //         color: '#fff',
    //         textAlign: 'center',
    //         borderRadius: '5px',
    //         padding: '5px',
    //         position: 'absolute',
    //         zIndex: 1,
    //         bottom: '100%',
    //         left: '50%',
    //         transform: 'translateX(-50%)',
    //         opacity: 0,
    //         transition: 'opacity 0.3s',
    //         userSelect: 'none',
    //     } as CSSProperties,
    //     hover: {
    //         opacity: 1,
    //     } as CSSProperties,
    // };




    const { colorMode } = useColorMode();
    return (
        <Box
            // pos={"relative"}
            // display={"inline-block"}
            className="tooltip-container"
        >

            <Button
                aria-label={ariaLabel}
                variant={variant ? variant : "ghost"}
                isDisabled={isDisabled}
                bg={isActive ? colorMode === "light" ? "gray.200" : "gray.700" : undefined}
                onClick={onClick}
                tabIndex={-1}
                border={0}
                display={"flex"}
            >
                {children}
            </Button>
            {ariaLabel && (
                <Text className="tooltip-text"
                >
                    {ariaLabel}
                </Text>
            )
            }
        </Box>


    )
}
