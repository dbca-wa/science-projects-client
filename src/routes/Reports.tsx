// Route for reviewing all reports.
// NOTE: Currently used as a Lexical text editor page, until implemented.

import {
  Box,
  Button,
  Flex,
  Grid,
  useDisclosure,
  useColorMode,
  Spinner,
} from "@chakra-ui/react";
import { Head } from "../components/Base/Head";
import { AddReportPDFModal } from "../components/Modals/AddReportPDFModal";
import { useGetARARsWithPDF } from "../lib/hooks/tanstack/useGetARARsWithPDF";
import { motion } from "framer-motion";
import { AnnualReportPDFGridItem } from "../components/Pages/Reports/AnnualReportPDFGridItem";

export const Reports = () => {
  const {
    isOpen: isAddPDFOpen,
    onOpen: onAddPDFOpen,
    onClose: onAddPDFClose,
  } = useDisclosure();
  const { reportsWithPDFData, reportsWithPDFLoading, refetchReportsWithPDFs } =
    useGetARARsWithPDF();
  const { colorMode } = useColorMode();
  return (
    <>
      <Box mt={5}>
        <Head title={"Reports"} />
        <AddReportPDFModal
          isAddPDFOpen={isAddPDFOpen}
          onAddPDFClose={onAddPDFClose}
          refetchPDFs={refetchReportsWithPDFs}
        />
        <Flex justifyContent={"flex-end"} w={"100%"}>
          <Box justifySelf={"flex-end"}>
            <Button
              bg={colorMode === "dark" ? "green.500" : "green.400"}
              color={"white"}
              _hover={{
                bg: colorMode === "dark" ? "green.400" : "green.300",
              }}
              onClick={onAddPDFOpen}
            >
              Add PDF
            </Button>
          </Box>
        </Flex>

        {!reportsWithPDFLoading && reportsWithPDFData ? (
          <Grid
            gridTemplateColumns={{
              base: "repeat(1, 1fr)",
              lg: "repeat(2, 1fr)",
              xl: "repeat(4, 1fr)",
            }}
            mt={6}
            gridGap={4}
          >
            {reportsWithPDFData
              .sort((a, b) => b.year - a.year)
              .map((report, index) => (
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
                  <AnnualReportPDFGridItem
                    report={report}
                    refetchFunction={refetchReportsWithPDFs}
                  />
                </motion.div>
              ))}
          </Grid>
        ) : (
          <Spinner />
        )}
      </Box>
    </>
  );
};
