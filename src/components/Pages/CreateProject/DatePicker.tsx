// Stateful date picker.
// Returns a Date object whilst displaying a date string in desired format ('DD/MM/YYY')

import {
  ArrowLeftIcon,
  ArrowRightIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@chakra-ui/icons";
import {
  InputProps as ChakraInputProps,
  Menu,
  MenuButton,
  Button,
  MenuList,
  Input,
  InputGroup,
  InputRightElement,
  Text,
  Box,
  Grid,
  Center,
  HStack,
  IconButton,
  VStack,
  Heading,
  useColorModeValue,
  Flex,
  FormControl,
  FormLabel,
  Icon,
  useDisclosure,
  useColorMode,
} from "@chakra-ui/react";
import React, { useState, createRef, useEffect, useRef } from "react";
import dayjs from "dayjs";
import { BsFillCalendarEventFill } from "react-icons/bs";

/**
 *  Core
 */

export const daysMap = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
export const monthMap = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export const getDayDetails = (args: any) => {
  const date = args.index - args.firstDay;
  const day = args.index % 7;
  let prevMonth = args.month - 1;
  let prevYear = args.year;
  if (prevMonth < 0) {
    prevMonth = 11;
    prevYear--;
  }
  const prevMonthNumberOfDays = getNumberOfDays(prevYear, prevMonth);
  const _date =
    (date < 0 ? prevMonthNumberOfDays + date : date % args.numberOfDays) + 1;
  const month = date < 0 ? -1 : date >= args.numberOfDays ? 1 : 0;
  const timestamp = new Date(args.year, args.month, _date).getTime();
  return {
    date: _date,
    day,
    month,
    timestamp,
    dayString: daysMap[day],
  };
};

export const getNumberOfDays = (year: number, month: number) => {
  return 40 - new Date(year, month, 40).getDate();
};

export const getMonthDetails = (year: number, month: number) => {
  //
  const firstDay = new Date(year, month).getDay();
  const numberOfDays = getNumberOfDays(year, month);
  const monthArray = [];
  const rows = 6;
  let currentDay = null;
  let index = 0;
  const cols = 7;

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      currentDay = getDayDetails({
        index,
        numberOfDays,
        firstDay,
        year,
        month,
      });
      monthArray.push(currentDay);
      index++;
    }
  }
  return monthArray;
};

export const getDateFromDateString = (dateValue: string) => {
  const dateData = dateValue.split("-").map((d) => parseInt(d, 10));
  if (dateData.length < 3) return null;

  const year = dateData[0];
  const month = dateData[1];
  const date = dateData[2];
  return { year, month, date };
};

export const getMonthStr = (month: number) =>
  monthMap[Math.max(Math.min(11, month), 0)] || "Month";

const oneDay = 60 * 60 * 24 * 1000;
const todayTimestamp =
  Date.now() -
  (Date.now() % oneDay) +
  new Date().getTimezoneOffset() * 1000 * 60;

export interface IDatePickerProps extends Omit<ChakraInputProps, "onChange"> {
  label: string;
  required: boolean;
  dateFormat?: string;
  onChange?: (date: string) => void;
  selectedDate?: Date;
  setSelectedDate: (date: Date) => void; // Change the type of onChange
}

export const DatePicker = ({
  label,
  required,
  dateFormat,
  selectedDate,
  setSelectedDate,
  onChange,
  ...rest
}: IDatePickerProps) => {
  // const { onChange, dateFormat = 'DD/MM/YYYY', ...rest } = props;
  const date = new Date();
  const [year, setYear] = useState(date.getFullYear());
  const [month, setMonth] = useState(date.getMonth());
  const [monthDetails, setMonthDetails] = useState(
    getMonthDetails(year, month)
  );
  const [selectedDay, setSelectedDay] = useState<Date | undefined>(
    selectedDate ? selectedDate : undefined
  );
  const inputRef = createRef<HTMLInputElement>();
  const color = useColorModeValue("gray", "white");
  const menuRef = useRef<HTMLDivElement>();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const isCurrentDay = (day: any) => {
    return day.timestamp === todayTimestamp;
  };
  const isSelectedDay = (day: any) => {
    return day.timestamp === selectedDay;
  };

  const getDateStringFromTimestamp = (timestamp: number) => {
    const dateObject = new Date(timestamp);
    return dayjs(dateObject).format(dateFormat); // Use dayjs to format the date
  };

  const onDateClick = (day: any) => {
    setSelectedDay(day.timestamp);
    if (inputRef.current) {
      inputRef.current.value = getDateStringFromTimestamp(day.timestamp);
      setSelectedDate(new Date(day.timestamp));
    }

    onClose();
    // if (menuRef.current) {
    //     menuRef.current.onClose();
    // }
  };

  const setYearAction = (offset: number) => {
    setYear(year + offset);
    setMonthDetails(getMonthDetails(year + offset, month));
  };

  const setMonthAction = (offset: number) => {
    let _year = year;
    let _month = month + offset;
    if (_month === -1) {
      _month = 11;
      _year--;
    } else if (_month === 12) {
      _month = 0;
      _year++;
    }
    setYear(_year);
    setMonth(_month);
    setMonthDetails(getMonthDetails(_year, _month));
  };

  const { colorMode } = useColorMode();

  return (
    <Flex flexDir={"column"}>
      <FormControl isRequired={required}>
        <FormLabel>
          <Box
            display={"inline-flex"}
            justifyContent={"center"}
            alignItems={"center"}
          >
            <Icon as={BsFillCalendarEventFill} mr={2} />
            {label}
          </Box>
        </FormLabel>
      </FormControl>

      <Box
        display={"inline-flex"}
        justifyContent={"center"}
        alignItems={"center"}
      >
        <Menu
          {...rest}
          placement="bottom-end"
          isOpen={isOpen}
          onClose={onClose}

          // ref={menuRef}
        >
          <MenuButton w="100%" type="button" mr={2} onClick={onOpen}>
            <InputGroup>
              <Input
                // color={color}
                ref={inputRef}
                {...rest}
                borderColor={colorMode === "light" ? "gray.500" : "gray.400"}
                color={colorMode === "light" ? "gray.500" : "gray.300"}
              />
              <InputRightElement children={<ChevronDownIcon w={5} h={5} />} />
            </InputGroup>
          </MenuButton>
          <MenuList justifyContent={"end"} right={0}>
            <Center p={3}>
              <HStack>
                <IconButton
                  variant="ghost"
                  aria-label="datepicker left button"
                  onClick={() => setYearAction(-1)}
                  icon={<ArrowLeftIcon color={color} />}
                />
                <IconButton
                  variant="ghost"
                  aria-label="datepicker left button"
                  onClick={() => setMonthAction(-1)}
                  icon={<ChevronLeftIcon color={color} />}
                />
                <VStack align="center">
                  <Button variant="ghost" size="none">
                    <Heading color={color} m={0} fontWeight={200} as="h5">
                      {year}
                    </Heading>
                  </Button>
                  <Button
                    variant="ghost"
                    size="none"
                    py="0px"
                    color={color}
                    margin="0px !important"
                  >
                    {getMonthStr(month).toUpperCase()}
                  </Button>
                </VStack>
                <IconButton
                  variant="ghost"
                  aria-label="datepicker right button"
                  color={color}
                  onClick={() => setMonthAction(1)}
                  icon={<ChevronRightIcon />}
                />
                <IconButton
                  variant="ghost"
                  aria-label="datepicker right button"
                  color={color}
                  onClick={() => setYearAction(1)}
                  icon={<ArrowRightIcon />}
                />
              </HStack>
            </Center>
            <Box p={3}>
              <Grid templateColumns="repeat(7, 1fr)" gap={3}>
                {daysMap.map((d, i) => (
                  <Text color={color} key={i} w="100%" align="center">
                    {d.substring(0, 3).toLocaleUpperCase()}
                  </Text>
                ))}
              </Grid>
            </Box>
            <Box p={3}>
              <Grid templateColumns="repeat(7, 1fr)" gap={3}>
                {monthDetails.map((day, index) => {
                  const isCurrentMonth = day.month === 0;
                  return isCurrentMonth ? (
                    <Button
                      color={
                        isSelectedDay(day)
                          ? "white"
                          : isCurrentDay(day)
                          ? "white"
                          : color
                      }
                      backgroundColor={
                        isSelectedDay(day)
                          ? "blue.500"
                          : isCurrentDay(day)
                          ? "gray.400"
                          : ""
                      }
                      variant="ghost"
                      size="sm"
                      key={index}
                      onClick={() => onDateClick(day)}
                      _hover={{
                        color: isSelectedDay(day) ? "white" : "gray",
                        backgroundColor: isSelectedDay(day)
                          ? "blue.300"
                          : "gray.100",
                      }}
                    >
                      {day.date}
                    </Button>
                  ) : (
                    <Text key={index} w="100%" />
                  );
                })}
              </Grid>
            </Box>
          </MenuList>
        </Menu>
      </Box>
    </Flex>
  );
};

// const parseDateToString = (date: Date): string => {
//     if (!(date instanceof Date) || isNaN(date.getTime())) {
//         return ''; // Invalid date, return an empty string or throw an error
//     }

//     const day = date.getDate();
//     const month = date.getMonth() + 1; // Month is 0-based, so add 1
//     const year = date.getFullYear();

//     // Use template literals to format the string with leading zeros if needed
//     const formattedDate = `${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}/${year}`;

//     return formattedDate;
// };

// const parseStringToDate = (dateString: string) => {
//     if (!dateString || dateString === '' || dateString === undefined || !dateString.includes('/')) {
//         return undefined;
//     }
//     const [day, month, year] = dateString.split('/').map(Number);
//     if (isNaN(day) || isNaN(month) || isNaN(year)) {
//         return undefined;
//     }
//     return new Date(year, month - 1, day); // Month is 0-based in JavaScript Dates
// };
