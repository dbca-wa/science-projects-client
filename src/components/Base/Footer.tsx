// Component for Traditional version footer

import { Box, Center, Link, Text } from "@chakra-ui/react"
import { useCurrentYear } from "../../lib/hooks/useCurrentYear";
import { useLayoutSwitcher } from "../../lib/hooks/LayoutSwitcherContext";

export const Footer = () => {

    const currentYear = useCurrentYear();
    const { layout } = useLayoutSwitcher();
    const FooterText = layout === "traditional" ? "SPMS v6.0.0" : "Cycle v1.0.0"

    return (
        <Box
            position="absolute"
            bottom="0"
            width="100%"
            color="whiteAlpha.600"
            bgColor="blackAlpha.900"
            py={4}
            userSelect={"none"}
        >
            <Center fontSize="12px" textAlign="center">
                <Link color="whiteAlpha.800" href="https://github.com/dbca-wa/cycle">
                    {FooterText}
                </Link>
                &nbsp;
                <Text>© 2012-{currentYear} DBCA. All rights reserved.</Text>
            </Center>
        </Box>
    );

}