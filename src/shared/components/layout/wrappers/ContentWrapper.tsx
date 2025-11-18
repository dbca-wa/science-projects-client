// Simple wrapper to ensure content is padded and 100% of the height of the other wrappers

import { Box, useColorMode } from "@chakra-ui/react";
import { useLayoutSwitcher } from "@/shared/hooks/LayoutSwitcherContext";

interface IPageWrapperProps {
  children: ReactNode;
}

export const ContentWrapper: FC<IPageWrapperProps> = ({ children }) => {
  const { layout } = useLayoutSwitcher();
  const { colorMode } = useColorMode();
  return (
    <Box
      p={4}
      px={layout === "traditional" ? 0 : 9}
      flex={1}
      style={{
        minHeight: "70vh",
        height: "100%",
      }}
      color={colorMode === "dark" ? "gray.400" : null}
    >
      <Box pb={4} h={"100%"}>
        {children}
      </Box>
    </Box>
  );
};
