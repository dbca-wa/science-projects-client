import { Box, useBreakpointValue } from "@chakra-ui/react";

export const SideMenuSectionDivider = () => {
  const isOver750 = useBreakpointValue({
    false: true,
    sm: false,
    md: false,
    "768px": true,
    mdlg: true,
    lg: true,
    xlg: true,
  });
  return (
    <Box
      w={"100%"}
      p={2}
      mb={4}
      position={"relative"}
      // display={"flex"}
      ml={isOver750 ? 4 : undefined}
    >
      <hr />
    </Box>
  );
};
