// Simple wrapper to ensure content is padded and 100% of the height of the other wrappers

import { Box } from "@chakra-ui/react"

interface IPageWrapperProps {
    children: React.ReactNode;
}

export const ContentWrapper = ({ children }: IPageWrapperProps) => {

    return (
        <Box
            p={4}
            px={6}
            flex={1}
            style={{
                height: "100%",
            }}
        >
            <Box
                pb={4}
            >
                {children}
            </Box>
        </Box>
    )
}