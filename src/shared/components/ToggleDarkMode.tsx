// A component for toggling the dark mode

import { useEditorContext } from "@/shared/hooks/helper/EditorBlockerContext";
import {
  Box,
  Button,
  IconButton,
  useColorMode,
  useColorModeValue,
  Text,
  MenuItem,
} from "@chakra-ui/react";
import { AnimatePresence, motion } from "framer-motion";
import { FaMoon, FaSun } from "react-icons/fa";

interface IOptionalToggleDarkProps {
  showText?: boolean;
  asMenuItem?: boolean;
}

export const ToggleDarkMode = ({
  showText,
  asMenuItem,
}: IOptionalToggleDarkProps) => {
  const { toggleColorMode, colorMode } = useColorMode();
  const colorToggleIcon = useColorModeValue(<FaMoon />, <FaSun />);
  const keyColorMode = useColorModeValue("light", "dark");
  const iconButtonColorScheme = useColorModeValue("blue", "orange");
  const backgroundHoverColor = useColorModeValue(
    "whiteAlpha.400",
    "whiteAlpha.500",
  );

  const { manuallyCheckAndToggleDialog } = useEditorContext();

  const handleClick = () => {
    manuallyCheckAndToggleDialog(() => {
      toggleColorMode();
    });
  };

  return asMenuItem ? (
    <MenuItem
      onClick={handleClick}
      zIndex={2}
      color={colorMode === "dark" ? "gray.400" : null}
    >
      {colorToggleIcon}
      <Text ml={2}> Toggle Dark Mode</Text>
    </MenuItem>
  ) : (
    <AnimatePresence mode="wait" initial={false}>
      <Box
        as={motion.div}
        style={{ display: "inline-block" }}
        key={keyColorMode}
        initial={{ x: -10, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 10, opacity: 0 }}
        sx={{ transitionDuration: 2.01 }}
      >
        {showText ? (
          <Button
            // bg={"blue"}
            color={`${iconButtonColorScheme}.400`}
            size={"md"}
            rightIcon={colorToggleIcon}
            onClick={handleClick}
            variant={"ghost"}
            aria-label="Toggle Dark Mode"
            _hover={{
              bg: backgroundHoverColor,
              color: `${iconButtonColorScheme}.300`,
            }}
          >
            <Text>{keyColorMode === "dark" ? "Light" : "Dark"}</Text>
          </Button>
        ) : (
          <IconButton
            size={"md"}
            icon={colorToggleIcon}
            onClick={handleClick}
            colorScheme={iconButtonColorScheme}
            variant={"ghost"}
            aria-label="Toggle Dark Mode"
          />
        )}
      </Box>
    </AnimatePresence>
  );
};
