// Component for changing the layout between modern and traditional

import {
  Box,
  Button,
  IconButton,
  MenuItem,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import { AnimatePresence, motion } from "framer-motion";
import { RiLayout3Fill, RiLayoutTopFill } from "react-icons/ri";
import { useLayoutSwitcher } from "../lib/hooks/helper/LayoutSwitcherContext";
import { useEditorContext } from "@/lib/hooks/helper/EditorBlockerContext";

interface IOptionalToggleLayoutProps {
  showText?: boolean;
  asMenuItem?: boolean;
}

export const ToggleLayout = ({
  showText,
  asMenuItem,
}: IOptionalToggleLayoutProps) => {
  const { manuallyCheckAndToggleDialog } = useEditorContext();

  const { layout, switchLayout } = useLayoutSwitcher();
  const iconColor = useColorModeValue("gray.400", "gray.300");
  const backgroundHoverColor = useColorModeValue(
    "whiteAlpha.400",
    "whiteAlpha.500",
  );
  const layouts = {
    traditional: {
      key: "traditional",
      icon: <RiLayout3Fill />,
      color: iconColor,
      onclick: switchLayout,
    },
    modern: {
      key: "modern",
      icon: <RiLayoutTopFill />,
      color: iconColor,
      onclick: switchLayout,
    },
  };
  const currentLayout = layouts[layout];

  const handleClick = () => {
    manuallyCheckAndToggleDialog(() => switchLayout());
  };

  return asMenuItem ? (
    <MenuItem onClick={handleClick} zIndex={2}>
      {layouts[layout].icon}
      <Text ml={2}>\ Toggle Layout</Text>
    </MenuItem>
  ) : (
    <AnimatePresence mode="wait" initial={false}>
      <Box
        color={iconColor}
        as={motion.div}
        style={{ display: "inline-block" }}
        key={currentLayout.key}
        initial={{ x: -10, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 10, opacity: 0 }}
        sx={{ transitionDuration: 2.01 }}
      >
        {showText ? (
          <Button
            // bg={"blue"}
            color={iconColor}
            size={"md"}
            rightIcon={currentLayout.icon}
            onClick={handleClick}
            variant={"ghost"}
            aria-label="Toggle Layout"
            _hover={{
              background: backgroundHoverColor,
              color: "white",
            }}
          >
            <Text pl={3}>{layout === "modern" ? "Traditional" : "Modern"}</Text>
          </Button>
        ) : (
          <IconButton
            color={iconColor}
            size={"md"}
            icon={currentLayout.icon}
            onClick={handleClick}
            variant={"ghost"}
            aria-label="Toggle Layout"
          />
        )}
      </Box>
    </AnimatePresence>
  );
};
