// Component for displaying the projects the user is involved in on the dashboard (modern)

import { Box, Center, Flex, Grid, Spinner, Text } from "@chakra-ui/react"
import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";
import { IProjectData } from "../../../types";
import { ModernProjectCard } from "../Projects/ModernProjectCard";


interface IProjectSection {
    data: any;
    loading: boolean;
}

export const MyProjectsSection = ({ data, loading }: IProjectSection) => {

    // useEffect(() => {
    //     if (!loading && data) {
    //         console.log(data)
    //     }
    // }, [loading, data])


    // Combine the arrays in the desired order: inprogress, todo, done
    return (
        loading === true ?
            (
                <Center height="200px">
                    <Spinner size="lg" />
                </Center>
            ) :
            (
                <AnimatePresence>
                    {data.length === 0 ?
                        (
                            <Box
                                w={"100%"}
                                h={"100%"}
                            >
                                <Text>Your projects will be shown here...</Text>
                            </Box>
                        )
                        :
                        (
                            <Grid
                                mt={8}
                                gridTemplateColumns={
                                    {
                                        base: "repeat(1, 1fr)",
                                        "740px": "repeat(2, 1fr)",
                                        lg: "repeat(3, 1fr)",
                                        xl: "repeat(4, 1fr)",

                                    }
                                }
                                gridGap={8}
                            >
                                {data.map((project: IProjectData, index: number) => {
                                    return (
                                        <motion.div
                                            key={index}
                                            initial={{ y: -10, opacity: 0 }}
                                            animate={{ y: 0, opacity: 1 }}
                                            exit={{ y: 10, opacity: 0 }}
                                            transition={{ duration: 0.7, delay: (((index + 1) / 7)) }}
                                            style={{
                                                height: "100%",
                                                animation: "oscillate 8s ease-in-out infinite",
                                                // backgroundColor: "pink"
                                            }}

                                        >
                                            <ModernProjectCard
                                                pk={project.pk !== undefined ? project.pk : project.id}
                                                image={project.image}
                                                title={project.title}
                                                description={project.description}
                                                kind={project.kind}
                                                status={project.status}
                                                keywords={project.keywords}
                                                tagline={project.tagline}
                                                year={project.year}
                                                number={project.number}
                                                business_area={project.business_area}
                                                start_date={project.start_date}
                                                end_date={project.end_date}
                                                created_at={project.created_at}
                                                updated_at={project.updated_at}
                                            />
                                        </motion.div>
                                    )
                                })
                                }

                            </Grid>
                        )
                    }

                </AnimatePresence>)
    )
}