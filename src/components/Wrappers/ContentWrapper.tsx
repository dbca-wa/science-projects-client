// Simple wrapper to ensure content is padded and 100% of the height of the other wrappers

import { Box } from "@chakra-ui/react";
import { useLayoutSwitcher } from "../../lib/hooks/helper/LayoutSwitcherContext";

interface IPageWrapperProps {
  children: React.ReactNode;
}

export const ContentWrapper: React.FC<IPageWrapperProps> = ({ children }) => {
  const { layout } = useLayoutSwitcher();

  return (
    <Box
      p={4}
      px={layout === "traditional" ? 0 : 9}
      flex={1}
      style={{
        minHeight: "70vh",
        height: "100%",
      }}
    >
      <Box pb={4}>{children}</Box>
    </Box>
  );
};
