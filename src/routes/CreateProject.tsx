// Route for handling Project Creation

import { Box, Grid, GridItem, useColorMode } from "@chakra-ui/react"
import { AnimatePresence, motion } from "framer-motion"
import { NewProjectCard } from "../components/Pages/CreateProject/NewProjectCard"
import { Head } from "../components/Base/Head"
import { useLayoutSwitcher } from "../lib/hooks/LayoutSwitcherContext"
import { TypewriterText } from "../components/Animations/TypewriterText"
import { MdScience } from "react-icons/md"
import { GiMaterialsScience } from 'react-icons/gi'
import { RiBook3Fill } from 'react-icons/ri'
import { FaUserFriends } from 'react-icons/fa'


export const CreateProject = () => {
    const creationData = [
        {
            title: "Science Project",
            description: "A project with a defined period of scientific activities.",
            bulletPoints: [
                "Approval process to determine how it fits within Departmental stragegy and priorities.",
                "Formal Closure Process",
                "Requires Annual Reporting"
            ],
            colorScheme: "green",
            buttonIcon: MdScience,
        },
        {
            title: "Core Function",
            description: "An ongoing science function with an indefinite period of activity.",
            bulletPoints: [
                "No approval process",
                "Immediate closure process",
                "Requires Annual Reporting"
            ],
            colorScheme: "red",
            buttonIcon: GiMaterialsScience,
        },

        {
            title: "Student Project",
            description: "Supervision of a tertiary student.",
            bulletPoints: [
                "No formal approval process",
                "Immediate closure without formal process",
                "Requires Annual Reporting"
            ],
            colorScheme: "blue",
            buttonIcon: RiBook3Fill,
        },
        {
            title: "External Partnership",
            description: "Participation in an externally managed project.",
            bulletPoints: [
                "No formal approval process",
                "Immediate closure without formal process",
                "Project details automatically included in annual reporting"
            ],
            colorScheme: "gray",
            buttonIcon: FaUserFriends,
        },

    ]
    const { colorMode } = useColorMode();
    const { layout } = useLayoutSwitcher();

    return (
        <>
            <Head title={"Add Project"} />

            {
                (
                    <Box
                        bgColor={colorMode === "light" ? "gray.100" : "gray.700"}
                        rounded={6}
                        flexDir={"column"}
                        p={6}
                        pos={"relative"}
                        mt={5}
                        mb={7}
                        color={colorMode === "light" ? "blackAlpha.800" : "whiteAlpha.800"}
                        userSelect={"none"}
                    >
                        <TypewriterText text={"Projects differ by documentation structure, approval process, and reporting requirements. Make sure you choose the correct project type as you will not be able to change the project type after creation. If you need to change the project type, you need to have the project deleted by an admin and create a new project of the desired type."} />
                    </Box>
                )
            }

            <AnimatePresence>
                <Grid
                    my={5}
                    templateColumns={{
                        base: "repeat(1, 1fr)",
                        "768px": "repeat(2, 1fr)",
                        "1240px": layout === "modern" ? "repeat(4, 1fr)" : "repeat(2, 1fr)",
                        // "1500px": "repeat(4, 1fr)",
                        "1xl": "repeat(4, 1fr)",
                    }}
                    gap={6}
                    userSelect={"none"}

                >
                    {creationData.map((item, index) => {
                        return (
                            <GridItem alignSelf="stretch"
                                key={index}
                            >
                                <motion.div
                                    key={index}
                                    initial={{ y: -10, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    exit={{ y: 10, opacity: 0 }}
                                    transition={{ duration: 0.7, delay: 0.5 + (((index + 1) / 5)) }}
                                    style={{
                                        height: "100%",
                                        animation: "oscillate 8s ease-in-out infinite",
                                    }}

                                >
                                    <NewProjectCard
                                        title={item.title}
                                        description={item.description}
                                        buttonIcon={item.buttonIcon}
                                        bulletPoints={item.bulletPoints}
                                        colorScheme={item.colorScheme}
                                    />
                                </motion.div>
                            </GridItem>
                        )
                    })}
                </Grid>
            </AnimatePresence>
        </>
    )
}