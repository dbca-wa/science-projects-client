import { ComponentPropsWithoutRef, useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/components/ui/popover";
import { Button } from "@/shared/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/shared/components/ui/calendar";
import { cn } from "@/shared/utils";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { format } from "date-fns";

export const DatePicker = ({
  ...props
}: ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>) => {
  const [date, setDate] = useState<Date>();
  return (
    <Popover {...props}>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground",
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PPP") : <span>Pick a date</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          // initialFocus
        />
      </PopoverContent>
    </Popover>
  );
};
