// WIP Calendar to try and implement darkmode to react-calendar

import { Box, useColorMode } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import Calendar from "react-calendar";

interface IProps {
  onChange: (val: any) => void;
}

export const CalendarWithCSS = ({ onChange }: IProps) => {
  const { colorMode } = useColorMode();
  const [calendarStyles, setCalendarStyles] = useState("");

  const handleDateChange = (value: any) => {
    console.log("Dates changed placeholder")
    onChange(value);
  };

  useEffect(() => {
    const getCalendarStyles = () => {
      const disabledColor = colorMode === "light" ? "#A0AEC0" : "#718096";
      const hoverColor = colorMode === "light" ? "#CBD5E0" : "#4A5568";
      const styles = `
            .react-calendar {
              background: ${colorMode === "light" ? "#FFFFFF" : "#1A202C"};
              color: ${colorMode === "light" ? "#000000" : "#FFFFFF"};
            }
            .react-calendar__tile {
              border-bottom: 1px solid ${colorMode === "light" ? "#E2E8F0" : "#4A5568"};
            }
            .react-calendar__tile--now {
              background: ${colorMode === "light" ? "#E2E8F0" : "orange"};
              color: ${colorMode === "light" ? "#000000" : "#FFFFFF"};
            }
            .react-calendar__tile--now:hover {
                background: "pink" !important;
                color: ${colorMode === "light" ? "#000000" : "#FFFFFF"};
              }

            .react-calendar__month-view__days__day--weekend {
              color: ${colorMode === "light" ? "#B718A4" : "#A7F3D0"};
              // Color of weekend numbers
            }
            
            // .react-calendar__month-view__weekdays {
            //   background: ${colorMode === "light" ? "#E2E8F0" : "#2D3748"};
            // //   Color of days of the week background
            // }


            .react-calendar__tile:hover:not(.react-calendar__tile--disabled) {
                background: ${hoverColor};
                color: ${colorMode === "light" ? "#000000" : "#FFFFFF"};
              //   Hover color
              }
      

            .react-calendar__tile--disabled,
            .react-calendar__navigation button:disabled,
            .react-calendar__month-view__days__day--neighboringMonth {
              background: ${colorMode === "light" ? "#E2E8F0" : "#2D3748"};
              color: ${disabledColor};
            }
            
          `;
      return styles;

    };

    setCalendarStyles(getCalendarStyles());
  }, [colorMode]);


  return (
    <Box w="100%" h="100%" textAlign="center">
      <style>{calendarStyles}</style>
      <Calendar
        minDate={new Date()}
        selectRange
        minDetail="month"
        maxDate={new Date(Date.now() + 60 * 60 * 24 * 7 * 52 * 1000)} // One year from today max
        prev2Label={null}
        next2Label={null}
        onChange={handleDateChange}
      />
    </Box>
  );
};