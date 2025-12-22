import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import type { IStudentReport } from "@/shared/types";
import { useState, type FC } from "react";

// Similar component for Student Reports Tab
interface StudentReportsTabProps {
  documents: IStudentReport[];
  onYearSelect: (year: number) => void;
}

export const StudentReportsSelector: FC<StudentReportsTabProps> = ({
  documents,
  onYearSelect,
}) => {
  const years = Array.from(
    new Set(documents.map((report) => report.year)),
  ).sort((a, b) => b - a);

  const [selectedYear, setSelectedYear] = useState<string>(years[0]?.toString() || "");

  const handleChange = (value: string) => {
    const selectedYear = parseInt(value, 10);
    setSelectedYear(value);
    onYearSelect(selectedYear);
  };

  // If there are no reports, do not render the dropdown
  if (years.length === 0) {
    return null;
  }

  return (
    <>
      <Select value={selectedYear} onValueChange={handleChange}>
        <SelectTrigger>
          <SelectValue placeholder="Select a year" />
        </SelectTrigger>
        <SelectContent>
          {years.map((year) => (
            <SelectItem key={year} value={year.toString()}>
              {`FY ${year - 1} - ${String(year).slice(2)}`}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </>
  );
};
