// A subcomponent only used in the TraditionalLayout for setting padding etc.

import { Box } from "@chakra-ui/react";

interface IPageWrapperProps {
  children: React.ReactNode;
}

export const TraditionalPageWrapper: React.FC<IPageWrapperProps> = ({
  children,
}) => {
  return (
    <Box
      mx={{
        base: 4,
        sm: 6,
        md: "10%",
        lg: "15%",
      }}
      py={2}
      // minW={"250mm"}
      flex="1"
      display="flex"
      flexDirection="column"
      overscrollBehaviorY={"none"}
    >
      {children}
    </Box>
  );
};
