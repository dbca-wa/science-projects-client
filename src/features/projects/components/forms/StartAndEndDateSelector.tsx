import { Label } from "@/shared/components/ui/label";
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
    <div className="mb-4">
      <div className="grid h-full w-full gap-4">
        <div className="grid grid-cols-2 gap-8">
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
        </div>
      </div>
      <div className="mb-4 mt-1.5">
        {startDate && endDate && startDate > endDate ? (
          <p className="text-sm text-red-500">
            The end date can't come before the start date!
          </p>
        ) : (
          <p className="text-sm text-gray-600">
            {helperText}
          </p>
        )}
      </div>
    </div>
  );
};
