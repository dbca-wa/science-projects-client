// Component for changing the layout between modern and traditional

import { Box, IconButton, useColorModeValue } from "@chakra-ui/react";
import { AnimatePresence, motion } from "framer-motion";
import { RiLayoutTopFill, RiLayout3Fill } from "react-icons/ri";
import { useLayoutSwitcher } from "../lib/hooks/helper/LayoutSwitcherContext";

export const ToggleLayout = () => {
  const { layout, switchLayout } = useLayoutSwitcher();
  const iconColor = useColorModeValue("gray.400", "gray.500");
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

  return (
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
        <IconButton
          color={iconColor}
          size={"md"}
          icon={currentLayout.icon}
          onClick={currentLayout.onclick}
          variant={"ghost"}
          aria-label="Toggle Dark Mode"
        />
      </Box>
    </AnimatePresence>
  );
};
