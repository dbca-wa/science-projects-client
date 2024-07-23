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
  Text,
  Center,
} from "@chakra-ui/react";
import { Head } from "../components/Base/Head";
import { AddReportPDFModal } from "../components/Modals/AddReportPDFModal";
import { useGetARARsWithPDF } from "../lib/hooks/tanstack/useGetARARsWithPDF";
import { motion } from "framer-motion";
import { AnnualReportPDFGridItem } from "../components/Pages/Reports/AnnualReportPDFGridItem";
import { useUser } from "@/lib/hooks/tanstack/useUser";
import { AddLegacyReportPDFModal } from "@/components/Modals/AddLegacyReportPDFModal";
import { useGetLegacyARPDFs } from "@/lib/hooks/tanstack/useGetLegacyARPDFs";

export const Reports = () => {
  const {
    isOpen: isAddPDFOpen,
    onOpen: onAddPDFOpen,
    onClose: onAddPDFClose,
  } = useDisclosure();
  const {
    isOpen: isAddLegacyPDFOpen,
    onOpen: onAddLegacyPDFOpen,
    onClose: onAddLegacyPDFClose,
  } = useDisclosure();

  const { reportsWithPDFData, reportsWithPDFLoading, refetchReportsWithPDFs } =
    useGetARARsWithPDF();
  const { legacyPDFData, legacyPDFDataLoading, refetchLegacyPDFs } =
    useGetLegacyARPDFs();
  const { colorMode } = useColorMode();
  const { userData, userLoading } = useUser();

  return (
    <>
      <Box mt={5}>
        <Head title={"Reports"} />
        {!userLoading && userData?.is_superuser && (
          <>
            <AddReportPDFModal
              isAddPDFOpen={isAddPDFOpen}
              onAddPDFClose={onAddPDFClose}
              refetchPDFs={refetchReportsWithPDFs}
            />
            {!legacyPDFDataLoading && legacyPDFData && (
              <AddLegacyReportPDFModal
                isAddLegacyPDFOpen={isAddLegacyPDFOpen}
                onAddLegacyPDFClose={onAddLegacyPDFClose}
                refetchLegacyPDFs={refetchReportsWithPDFs}
                legacyPDFData={legacyPDFData}
              />
            )}

            <Flex justifyContent={"flex-end"} w={"100%"}>
              <Box justifySelf={"flex-end"}>
                <Button
                  bg={colorMode === "dark" ? "blue.500" : "blue.400"}
                  color={"white"}
                  _hover={{
                    bg: colorMode === "dark" ? "blue.400" : "blue.300",
                  }}
                  onClick={onAddLegacyPDFOpen}
                  mr={2}
                >
                  Add Legacy PDF
                </Button>
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
          </>
        )}
        {!reportsWithPDFLoading &&
        !legacyPDFDataLoading &&
        legacyPDFData &&
        reportsWithPDFData ? (
          <>
            {reportsWithPDFData?.length > 0 && (
              <Box>
                <Text fontWeight={"bold"} fontSize={"larger"}>
                  Annual Report PDFs
                </Text>
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
                    .map((report, index) => {
                      if (report.is_published) {
                        return (
                          <motion.div
                            key={index}
                            initial={{ y: -10, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 10, opacity: 0 }}
                            transition={{
                              duration: 0.7,
                              delay: (index + 1) / 7,
                            }}
                            style={{
                              height: "100%",
                              animation: "oscillate 8s ease-in-out infinite",
                            }}
                          >
                            <AnnualReportPDFGridItem
                              isLegacy={false}
                              report={report}
                              refetchFunction={refetchReportsWithPDFs}
                              userData={userData}
                            />
                          </motion.div>
                        );
                      }
                    })}
                </Grid>
              </Box>
            )}

            {/*  */}
            {legacyPDFData?.length > 0 && (
              <Box mt={8}>
                <Text fontWeight={"bold"} fontSize={"larger"}>
                  Legacy AR PDFs
                </Text>
                <Grid
                  gridTemplateColumns={{
                    base: "repeat(1, 1fr)",
                    lg: "repeat(2, 1fr)",
                    xl: "repeat(4, 1fr)",
                  }}
                  mt={6}
                  gridGap={4}
                >
                  {legacyPDFData
                    .sort((a, b) => b.year - a.year)
                    .map((report, index) => {
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
                          <AnnualReportPDFGridItem
                            isLegacy={true}
                            report={report}
                            refetchFunction={refetchLegacyPDFs}
                            userData={userData}
                          />
                        </motion.div>
                      );
                    })}
                </Grid>
              </Box>
            )}
          </>
        ) : (
          <Center mt={20}>
            <Spinner size={"xl"} />
          </Center>
        )}
      </Box>
    </>
  );
};
