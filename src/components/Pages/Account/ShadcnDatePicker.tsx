import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { useColorMode } from "@chakra-ui/react";

interface IDatePickProps {
  placeholder: string;
  date: Date | null;
  setDate: (date: Date) => void;
}

export const ShadcnDatePicker = ({
  placeholder,
  date,
  setDate,
}: IDatePickProps) => {
  const [isOpen, setIsOpen] = React.useState(false);

  const handleSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      setDate(selectedDate);
      setIsOpen(false); // Close the popover
    }
  };

  const { colorMode } = useColorMode();

  return (
    <Popover open={isOpen} onOpenChange={(open) => setIsOpen(open)}>
      <PopoverTrigger asChild className="z-9999">
        <Button
          variant={"outline-solid"}
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground",
            colorMode === "dark" && "bg-gray-800",
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PPP") : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="z-9999 w-auto p-0">
        <Calendar
          className="z-9999"
          mode="single"
          selected={date}
          onSelect={handleSelect}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
};
