// A paginator for the projects page

import { Box, Button, Center, Grid, Spinner } from "@chakra-ui/react";
import { AnimatePresence, motion } from "framer-motion";
import { ModernProjectCard } from "./ModernProjectCard";
import { useEffect } from "react";

interface IPaginationProps {
    loading: boolean;
    data: any;
    currentProjectResultsPage: number;
    setCurrentProjectResultsPage: (page: number) => void;
    totalPages: number;
}

export const PaginatorProject = ({
    loading,
    data,
    currentProjectResultsPage,
    setCurrentProjectResultsPage,
    totalPages,
}: IPaginationProps) => {
    const handleClick = (pageNumber: number) => {
        setCurrentProjectResultsPage(pageNumber);
    };

    const maxDisplayedPages = 8;

    // useEffect(() => {
    //     if (!loading)
    //         console.log(data)
    // }, [loading, data])

    // Calculate the start and end page numbers for rendering
    let startPage = Math.max(1, currentProjectResultsPage - Math.floor(maxDisplayedPages / 2));
    const endPage = Math.min(totalPages, startPage + maxDisplayedPages - 1);
    if (endPage - startPage < maxDisplayedPages - 1) {
        startPage = Math.max(1, endPage - maxDisplayedPages + 1);
    }

    return (
        <Box>
            <Box>
                {/* Render the current page's data */}
                {!loading ? (

                    <AnimatePresence>

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

                            {
                                data.map((project: any, index: number) => {
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
                                            }}

                                        >
                                            <ModernProjectCard
                                                pk={project.id}
                                                image={project.image}
                                                title={project.title}
                                                description={project.description}
                                                kind={project.kind}
                                                status={project.status}
                                                keywords={project.keywords}
                                                tagline={project.tagline}
                                                year={project.year}
                                                number={project.number}
                                                business_area_id={project.business_area_id}
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
                    </AnimatePresence>


                ) : (
                    // Render a loading spinner while fetching data
                    <Center height="200px">
                        <Spinner size="lg" />
                    </Center>
                )}
            </Box>
            <Box mt={8} display="flex" justifyContent="center">
                {/* Render the pagination buttons */}
                <Button
                    disabled={currentProjectResultsPage === 1}
                    onClick={() => handleClick(currentProjectResultsPage - 1)}
                    mx={1}
                >
                    Prev
                </Button>
                {Array.from({ length: endPage - startPage + 1 }, (_, i) => (
                    <Button
                        key={startPage + i}
                        onClick={() => handleClick(startPage + i)}
                        mx={1}
                        colorScheme={startPage + i === currentProjectResultsPage ? "blue" : "gray"}
                    >
                        {startPage + i}
                    </Button>
                ))}
                <Button
                    disabled={currentProjectResultsPage === totalPages}
                    onClick={() => handleClick(currentProjectResultsPage + 1)}
                    mx={1}
                >
                    Next
                </Button>
            </Box>
        </Box>
    );
};