// Paginator for displaying data for users on Users page

import { IUserData } from "@/types";
import { Box, Button, Center, Flex, Grid, Spinner } from "@chakra-ui/react";
import { AnimatePresence, motion } from "framer-motion";
import { useBranches } from "../../../lib/hooks/tanstack/useBranches";
import { useBusinessAreas } from "../../../lib/hooks/tanstack/useBusinessAreas";
import { UserGridItem } from "./UserGridItem";

interface IPaginationProps {
  data: IUserData[];
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

  const { branchesLoading, branchesData } = useBranches();
  const { baLoading, baData } = useBusinessAreas();

  const maxDisplayedPages = 8;

  // Calculate the start and end page numbers for rendering
  let startPage = Math.max(
    1,
    currentUserResultsPage - Math.floor(maxDisplayedPages / 2),
  );
  const endPage = Math.min(totalPages, startPage + maxDisplayedPages - 1);
  if (endPage - startPage < maxDisplayedPages - 1) {
    startPage = Math.max(1, endPage - maxDisplayedPages + 1);
  }

  // useEffect(() => {
  //   console.log(data);
  // }, [data]);

  return (
    <Flex flexDir={"column"} minH={"64vh"}>
      <Box h={"100%"} flex={1}>
        {/* Render the current page's data */}
        {!loading ? (
          <AnimatePresence>
            <Grid gridTemplateColumns={"repeat(1,1fr)"}>
              {data.map((u: IUserData, i: number) => (
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
                    display_first_name={u.display_first_name}
                    display_last_name={u.display_last_name}
                    is_active={u.is_active}
                    is_staff={u.is_staff}
                    is_superuser={u.is_superuser}
                    image={u.image}
                    business_area={u.business_area}
                    role={u.role}
                    branch={u.branch}
                    affiliation={u.affiliation}
                    branches={!branchesLoading ? branchesData : undefined}
                    businessAreas={!baLoading ? baData : undefined}
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
      <Box h={"100%"} mt={8} display="flex" justifyContent="center">
        {/* Render the pagination buttons */}
        <Button
          isDisabled={currentUserResultsPage === 1}
          onClick={() => {
            handleClick(currentUserResultsPage - 1);
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
              startPage + i === currentUserResultsPage ? "blue" : "gray"
            }
          >
            {startPage + i}
          </Button>
        ))}
        <Button
          isDisabled={currentUserResultsPage === totalPages}
          onClick={() => {
            handleClick(currentUserResultsPage + 1);
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
