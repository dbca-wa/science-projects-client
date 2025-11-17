import { Box, FormControl, FormHelperText, Grid, Text } from "@chakra-ui/react";
import { DatePicker } from "./DatePicker";

interface Props {
  startDate: Date;
  setStartDate: React.Dispatch<React.SetStateAction<Date>>;
  endDate: Date;
  setEndDate: React.Dispatch<React.SetStateAction<Date>>;
  helperText: string;
}

export const StartAndEndDateSelector = ({
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  helperText,
}: Props) => {
  return (
    <FormControl mb={4}>
      <Grid
        w="100%"
        h="100%"
        // textAlign="center"
        gridRowGap={4}
      >
        <Grid gridTemplateColumns={"repeat(2, 1fr)"} gridColumnGap={8}>
          <DatePicker
            label={"Start Date"}
            placeholder={startDate ? `${startDate}` : "Select Start Date"}
            required={true}
            dateFormat={"DD/MM/YYYY"}
            selectedDate={startDate}
            setSelectedDate={setStartDate}
          />
          <DatePicker
            label={"End Date"}
            placeholder={endDate ? `${endDate}` : "Select End Date"}
            required={true}
            // dateFormat={"dd/MM/yyyy"}
            dateFormat={"DD/MM/YYYY"}
            selectedDate={endDate}
            setSelectedDate={setEndDate}
          />
        </Grid>
      </Grid>
      <Box mt={"6px"} mb={4}>
        {startDate && endDate && startDate > endDate ? (
          <Text fontSize={"14px"} color={"red"}>
            The end date can't come before the start date!
          </Text>
        ) : (
          <FormHelperText
            fontSize={"14px"}
            // color={colorMode === "light" ? "gray.600" : "gray.400"}
          >
            {helperText}
          </FormHelperText>
        )}
      </Box>
    </FormControl>
  );
};
