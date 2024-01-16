// WIP tab contents for participating projects. Features some additional info and the projects via AnnualReportProjectDisplay

import { Box, Flex, Text } from "@chakra-ui/react";
import { useEffect } from "react";
import { AnnualReportProjectDisplay } from "./AnnualReportProjectDisplay";

interface IParticipatingProjectProps {
  dateOpen: Date | null;
  dateClosed: Date | null;
}

export const ParticipatingProjects = ({
  dateOpen,
  dateClosed,
}: IParticipatingProjectProps) => {
  const formatDate = (date: Date | null) => {
    if (date !== null) {
      const newDate = new Date(date).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "2-digit",
      });
      return newDate;
    }
    return "";
  };

  // const formattedDateOpen = formatDate(dateOpen);
  const formattedDateClosed = formatDate(dateClosed);

  useEffect(() => {
    // Additional logic can be added here if needed
  }, [dateOpen, dateClosed]);

  return (
    <Box>
      <Flex justifyContent={"space-between"}>
        <Text fontSize={"md"} fontWeight={"normal"} color={"blue.400"}>
          Open for submissions until {formattedDateClosed}
        </Text>
        {/* <SearchProjectsInReport /> */}
      </Flex>
      <AnnualReportProjectDisplay />
    </Box>
  );
};
