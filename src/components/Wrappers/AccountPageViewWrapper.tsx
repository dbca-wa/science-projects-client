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
      w={"full"}
      display="flex"
      flexDirection="column"
      flex={1}
      overflowX={"hidden"}
      flexShrink={0}
    >
      <Box overflowY="auto" flex="1" p={3} overflowX={"hidden"} w={"full"}>
        {children}
      </Box>
    </Box>
  );
};
