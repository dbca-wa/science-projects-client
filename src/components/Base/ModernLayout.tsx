// Component for adjusting the layout to Modern

import { Outlet } from "react-router-dom"
import { ModernHeader } from "../Navigation/ModernHeader"
import { Sidebar } from "../Navigation/Sidebar"
import { ModernPageWrapper } from "../Wrappers/ModernPageWrapper"
import { Box, Spinner } from "@chakra-ui/react"
import { useLayoutSwitcher } from "../../lib/hooks/LayoutSwitcherContext"
import { motion } from "framer-motion"

export const ModernLayout = () => {

    const { loading } = useLayoutSwitcher();

    return (
        <Box
            display={"flex"}
            minH={"100vh"}
            maxH={"100vh"}
        >
            <Sidebar />
            <Box
                flex={1}
                h={"100vh"}
                overflow={"auto"}
                pos="relative"
            >
                <ModernHeader />
                <ModernPageWrapper>
                    {
                        loading ?
                            (
                                <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
                                    <Spinner size="xl" />
                                </Box>) :
                            (
                                <motion.div
                                    key={location.pathname}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 1 }}
                                    exit={{ opacity: 0 }}
                                    style={{
                                        height: "100%",
                                    }}
                                >
                                    <Outlet />
                                </motion.div>
                            )
                    }
                </ModernPageWrapper>
            </Box>
        </Box>
    )
}