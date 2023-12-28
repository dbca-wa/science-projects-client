// Wrapper for the Page view on Account page.

import { Box } from "@chakra-ui/react";

interface IPageViewProps {
  children: React.ReactNode;
}

export const AccountPageViewWrapper = ({ children }: IPageViewProps) => {
  return (
    <Box
      height="100%"
      display="flex"
      flexDirection="column"
      flex={1}
      //   bg={"pink"}
    >
      <Box overflowY="auto" flex="1" p={3}>
        {children}
      </Box>
    </Box>
  );
};
