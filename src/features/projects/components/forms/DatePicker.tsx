// Stateful date picker.
// Returns a Date object whilst displaying a date string in desired format ('DD/MM/YYY')

import { ChevronDown, ChevronLeft, ChevronRight, ArrowLeft, ArrowRight, Calendar } from "lucide-react";
import dayjs from "dayjs";
import { createRef, useState } from "react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/components/ui/popover";
import { useColorMode } from "@/shared/utils/theme.utils";

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

export interface IDatePickerProps {
  label: string;
  required: boolean;
  dateFormat?: string;
  selectedDate?: Date;
  setSelectedDate: (date: Date) => void;
}

export const DatePicker = ({
  label,
  required,
  dateFormat = 'DD/MM/YYYY',
  selectedDate,
  setSelectedDate,
}: IDatePickerProps) => {
  const date = new Date();
  const [year, setYear] = useState(date.getFullYear());
  const [month, setMonth] = useState(date.getMonth());
  const [monthDetails, setMonthDetails] = useState(
    getMonthDetails(year, month)
  );
  const [selectedDay, setSelectedDay] = useState<Date | undefined>(
    selectedDate ? selectedDate : undefined
  );
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = createRef<HTMLInputElement>();

  const isCurrentDay = (day: any) => {
    return day.timestamp === todayTimestamp;
  };
  const isSelectedDay = (day: any) => {
    return day.timestamp === selectedDay;
  };

  const getDateStringFromTimestamp = (timestamp: number) => {
    const dateObject = new Date(timestamp);
    return dayjs(dateObject).format(dateFormat);
  };

  const onDateClick = (day: any) => {
    setSelectedDay(day.timestamp);
    if (inputRef.current) {
      inputRef.current.value = getDateStringFromTimestamp(day.timestamp);
      setSelectedDate(new Date(day.timestamp));
    }
    setIsOpen(false);
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
    <div className="flex flex-col">
      <div className={required ? "required" : ""}>
        <Label className="flex items-center">
          <Calendar className="mr-2 h-4 w-4" />
          {label}
        </Label>
      </div>

      <div className="flex items-center">
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-between text-left font-normal"
              onClick={() => setIsOpen(true)}
            >
              <Input
                ref={inputRef}
                className={`border-0 p-0 ${
                  colorMode === "light" ? "text-gray-500" : "text-gray-300"
                }`}
                readOnly
              />
              <ChevronDown className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <div className="p-3">
              <div className="flex items-center justify-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setYearAction(-1)}
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setMonthAction(-1)}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="flex flex-col items-center">
                  <Button variant="ghost" size="sm">
                    <h5 className="font-light text-lg m-0">{year}</h5>
                  </Button>
                  <Button variant="ghost" size="sm" className="py-0 m-0">
                    {getMonthStr(month).toUpperCase()}
                  </Button>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setMonthAction(1)}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setYearAction(1)}
                >
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="p-3">
              <div className="grid grid-cols-7 gap-3">
                {daysMap.map((d, i) => (
                  <p key={i} className="w-full text-center text-sm">
                    {d.substring(0, 3).toLocaleUpperCase()}
                  </p>
                ))}
              </div>
            </div>
            <div className="p-3">
              <div className="grid grid-cols-7 gap-3">
                {monthDetails.map((day, index) => {
                  const isCurrentMonth = day.month === 0;
                  return isCurrentMonth ? (
                    <Button
                      key={index}
                      variant="ghost"
                      size="sm"
                      onClick={() => onDateClick(day)}
                      className={`
                        ${
                          isSelectedDay(day)
                            ? "bg-blue-500 text-white hover:bg-blue-300"
                            : isCurrentDay(day)
                            ? "bg-gray-400 text-white"
                            : "hover:bg-gray-100"
                        }
                      `}
                    >
                      {day.date}
                    </Button>
                  ) : (
                    <div key={index} className="w-full" />
                  );
                })}
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};
