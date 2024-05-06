// A subcomponent only used in ModernLayout for setting the base padding for the ModernLayout

import { Box, Flex } from "@chakra-ui/react";

interface IPageWrapperProps {
  children: React.ReactNode;
}

export const ModernPageWrapper: React.FC<IPageWrapperProps> = ({
  children,
}) => {
  return (
    <Box
      h="calc(100vh - 3rem)"
      overflowY="auto"
      // minW={"210mm"}
    >
      <Flex flex={1} flexDir={"column"} maxH={"100vh"} h={"100%"}>
        <Box pb={4} h={"100%"}>
          {children}
        </Box>
      </Flex>
    </Box>
  );
};
