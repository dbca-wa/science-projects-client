// A component for toggling the dark mode

import { Box, IconButton, useColorMode, useColorModeValue } from "@chakra-ui/react"
import { AnimatePresence, motion } from "framer-motion";
import { FaMoon, FaSun } from "react-icons/fa";

export const ToggleDarkMode = () => {
    const { toggleColorMode } = useColorMode();
    const colorToggleIcon = useColorModeValue(< FaMoon />, <FaSun />)
    const keyColorMode = useColorModeValue('light', 'dark')
    const iconButtonColorScheme = useColorModeValue('blue', 'orange');

    return (
        <AnimatePresence mode="wait" initial={false}>
            <Box
                as={motion.div}
                style={{ display: 'inline-block' }}
                key={keyColorMode}
                initial={{ x: -10, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 10, opacity: 0 }}
                sx={{ transitionDuration: 2.01 }}
            >
                <IconButton
                    size={"md"}
                    icon={colorToggleIcon}
                    onClick={() => {
                        toggleColorMode();

                    }}
                    colorScheme={iconButtonColorScheme}
                    variant={"ghost"}
                    aria-label='Toggle Dark Mode'
                />
            </Box>
        </AnimatePresence>
    )

}