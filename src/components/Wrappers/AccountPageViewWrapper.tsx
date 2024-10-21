// Wrapper for the Page view on Account page.

import { Box } from "@chakra-ui/react";

interface IPageViewProps {
  children: React.ReactNode;
}

export const AccountPageViewWrapper = ({ children }: IPageViewProps) => {
  return (
    <Box
      minH={"90vh"}
      height="100%"
      display="flex"
      flexDirection="column"
      flex={1}
      overflowX={"hidden"}
    >
      <Box overflowY="auto" flex="1" p={3} overflowX={"hidden"}>
        {children}
      </Box>
    </Box>
  );
};
