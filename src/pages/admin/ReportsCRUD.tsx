import { AddReportModal } from "@/components/Modals/AddReportModal";
import {
  Box,
  Button,
  Center,
  Flex,
  Grid,
  Spinner,
  Text,
  useColorMode,
  useDisclosure,
} from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { getAllReports } from "@/lib/api";
import { IReport } from "@/types";
import { ReportItemDisplay } from "@/components/Pages/Admin/ReportItemDisplay";
import { Head } from "@/components/Base/Head";

export const ReportsCRUD = () => {
  const {
    isOpen: addIsOpen,
    onOpen: onAddOpen,
    onClose: onAddClose,
  } = useDisclosure();

  const { isLoading, data: slices } = useQuery<IReport[]>({
    queryFn: getAllReports,
    queryKey: ["reports"],
  });

  const [countOfItems, setCountOfItems] = useState(0);

  useEffect(() => {
    if (slices) {
      setCountOfItems(slices.length);
    }
  }, [slices]);

  const { colorMode } = useColorMode();

  return (
    <>
      <Head title="Reports" />
      {isLoading ? (
        <Center h={"200px"}>
          <Spinner />
        </Center>
      ) : (
        <>
          <Box maxW={"100%"} maxH={"100%"} w={"100%"}>
            <Flex width={"100%"} mt={4} justifyContent={"space-between"}>
              <Box alignItems={"center"} display={"flex"} flex={1} ml={1}>
                <Text fontWeight={"semibold"} fontSize={"lg"}>
                  Reports ({countOfItems})
                </Text>
              </Box>
              <Flex>
                <Button
                  onClick={onAddOpen}
                  color={"white"}
                  background={colorMode === "light" ? "green.500" : "green.600"}
                  _hover={{
                    background:
                      colorMode === "light" ? "green.400" : "green.500",
                  }}
                >
                  Create Report Info
                </Button>
              </Flex>
            </Flex>
            <Grid
              gridTemplateColumns="2fr 3fr 3fr 1fr"
              mt={4}
              width="100%"
              p={3}
              borderWidth={1}
              borderBottomWidth={slices.length === 0 ? 1 : 0}
            >
              <Flex justifyContent="flex-start">
                <Text as="b">Year</Text>
              </Flex>
              {/* <Flex>
                <Text as="b">Open Date</Text>
              </Flex>
              <Flex>
                <Text as="b">Closing Date</Text>
              </Flex> */}
              <Flex>
                <Text as="b">Creator</Text>
              </Flex>
              <Flex>
                <Text as="b">Modifier</Text>
              </Flex>
              <Flex justifyContent="flex-end" mr={2}>
                <Text as="b">Change</Text>
              </Flex>
            </Grid>
            <Grid gridTemplateColumns={"repeat(1,1fr)"}>
              {slices &&
                slices
                  .sort((a, b) => b.year - a.year) // Sort in descending order based on the year
                  .map((s) => (
                    <ReportItemDisplay
                      key={s.pk}
                      pk={s.pk}
                      year={s.year}
                      date_open={s.date_open}
                      date_closed={s.date_closed}
                      created_at={s.created_at}
                      updated_at={s.updated_at}
                      creator={s.creator}
                      modifier={s.modifier}
                      dm={s.dm}
                      publications={s.publications}
                      research_intro={s.research_intro}
                      service_delivery_intro={s.service_delivery_intro}
                      student_intro={s.student_intro}
                    />
                  ))}
            </Grid>
          </Box>

          <AddReportModal isOpen={addIsOpen} onClose={onAddClose} />
        </>
      )}
    </>
  );
};
