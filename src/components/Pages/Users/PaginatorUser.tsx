// Paginator for displaying data for users on Users page

import { Box, Button, Center, Grid, Spinner, Stack } from "@chakra-ui/react";
import { UserGridItem } from "./UserGridItem";
import { AnimatePresence, motion } from "framer-motion";

interface IPaginationProps {
    data: any;
    loading: boolean;
    currentUserResultsPage: number;
    setCurrentUserResultsPage: (page: number) => void;
    totalPages: number;
}

export const PaginatorUser = ({
    data,
    loading,
    currentUserResultsPage,
    setCurrentUserResultsPage,
    totalPages,
}: IPaginationProps) => {
    const handleClick = (pageNumber: number) => {
        setCurrentUserResultsPage(pageNumber);
    };

    const maxDisplayedPages = 8;

    // Calculate the start and end page numbers for rendering
    let startPage = Math.max(1, currentUserResultsPage - Math.floor(maxDisplayedPages / 2));
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
                        <Grid gridTemplateColumns={"repeat(1,1fr)"}>
                            {data.map((u: any, i: number) => (
                                <motion.div
                                    key={i}
                                    initial={{ y: -10, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    exit={{ y: 10, opacity: 0 }}
                                    transition={{ duration: 0.5, delay: (i + 1) / 10 }}
                                    style={{
                                        height: "100%",
                                        animation: "oscillate 8s ease-in-out infinite",
                                    }}
                                >
                                    <UserGridItem
                                        pk={u.pk}
                                        username={u.username}
                                        email={u.email}
                                        first_name={u.first_name}
                                        last_name={u.last_name}
                                        is_staff={u.is_staff}
                                        is_superuser={u.is_superuser}
                                        image={u.image}
                                        business_area={u.business_area}
                                        role={u.role}
                                        branch={u.branch}
                                        is_active={u.is_active}
                                        affiliation={u.affiliation}
                                    />
                                </motion.div>
                            ))}
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
                    disabled={currentUserResultsPage === 1}
                    onClick={() => handleClick(currentUserResultsPage - 1)}
                    mx={1}
                >
                    Prev
                </Button>
                {Array.from({ length: endPage - startPage + 1 }, (_, i) => (
                    <Button
                        key={startPage + i}
                        onClick={() => handleClick(startPage + i)}
                        mx={1}
                        colorScheme={startPage + i === currentUserResultsPage ? "blue" : "gray"}
                    >
                        {startPage + i}
                    </Button>
                ))}
                <Button
                    disabled={currentUserResultsPage === totalPages}
                    onClick={() => handleClick(currentUserResultsPage + 1)}
                    mx={1}
                >
                    Next
                </Button>
            </Box>
        </Box>
    );
};






