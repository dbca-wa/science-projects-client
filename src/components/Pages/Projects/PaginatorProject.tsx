// A paginator for the projects page

import { IProjectData } from "@/types";
import { Box, Button, Center, Flex, Grid, Spinner } from "@chakra-ui/react";
import { AnimatePresence, motion } from "framer-motion";
import { useLayoutSwitcher } from "@/lib/hooks/helper/LayoutSwitcherContext";
import { ModernProjectCard } from "./ModernProjectCard";

interface IPaginationProps {
  loading: boolean;
  data: IProjectData[];
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

  // useEffect(() => console.log(currentProjectResultsPage));
  const maxDisplayedPages = 8;

  // Calculate the start and end page numbers for rendering
  let startPage = Math.max(
    1,
    currentProjectResultsPage - Math.floor(maxDisplayedPages / 2),
  );
  const endPage = Math.min(totalPages, startPage + maxDisplayedPages - 1);
  if (endPage - startPage < maxDisplayedPages - 1) {
    startPage = Math.max(1, endPage - maxDisplayedPages + 1);
  }

  const { layout } = useLayoutSwitcher();

  return (
    <Flex
      minH={"69vh"}
      // bg={"pink"}
      pos={"relative"}
      flexDir={"column"}
    >
      <Box h={"100%"} flex={1}>
        {/* Render the current page's data */}
        {!loading ? (
          <AnimatePresence>
            <Grid
              mt={8}
              gridTemplateColumns={
                layout === "modern"
                  ? {
                      base: "repeat(1, 1fr)",
                      "740px": "repeat(2, 1fr)",
                      lg: "repeat(3, 1fr)",
                      xl: "repeat(4, 1fr)",
                      "3xl": "repeat(6, 1fr)",
                    }
                  : {
                      base: "repeat(1, 1fr)",
                      "740px": "repeat(2, 1fr)",
                      lg: "repeat(2, 1fr)",
                      xl: "repeat(3, 1fr)",
                      "2xl": "repeat(4, 1fr)",
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
                    transition={{ duration: 0.7, delay: (index + 1) / 7 }}
                    style={{
                      height: "100%",
                      animation: "oscillate 8s ease-in-out infinite",
                    }}
                  >
                    <ModernProjectCard
                      pk={project.id}
                      areas={project.areas}
                      image={project.image}
                      title={project?.title}
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
                      deletion_requested={project.deletion_requested}
                      deletion_request_id={project.deletion_request_id}
                    />
                  </motion.div>
                );
              })}
            </Grid>
          </AnimatePresence>
        ) : (
          // Render a loading spinner while fetching data
          <Center height="200px">
            <Spinner size="lg" />
          </Center>
        )}
      </Box>
      <Box
        h={"100%"}
        mt={8}
        display="flex"
        justifyContent="center"
        // bottom={0}
        // bg={"red"}
      >
        {/* Render the pagination buttons */}
        <Button
          isDisabled={currentProjectResultsPage === 1}
          onClick={() => {
            handleClick(currentProjectResultsPage - 1);
            window.scrollTo(0, 0);
          }}
          mx={1}
        >
          Prev
        </Button>
        {Array.from({ length: endPage - startPage + 1 }, (_, i) => (
          <Button
            key={startPage + i}
            onClick={() => {
              handleClick(startPage + i);
              window.scrollTo(0, 0);
            }}
            mx={1}
            colorScheme={
              startPage + i === currentProjectResultsPage ? "blue" : "gray"
            }
          >
            {startPage + i}
          </Button>
        ))}
        <Button
          isDisabled={currentProjectResultsPage === totalPages}
          onClick={() => {
            handleClick(currentProjectResultsPage + 1);
            window.scrollTo(0, 0);
          }}
          mx={1}
        >
          Next
        </Button>
      </Box>
    </Flex>
  );
};
