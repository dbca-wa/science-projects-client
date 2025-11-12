import { Select } from "@chakra-ui/react";
import { IStudentReport } from "@/types";

// Similar component for Student Reports Tab
interface StudentReportsTabProps {
  documents: IStudentReport[];
  onYearSelect: (year: number) => void;
}

export const StudentReportsSelector: React.FC<StudentReportsTabProps> = ({
  documents,
  onYearSelect,
}) => {
  const years = Array.from(
    new Set(documents.map((report) => report.year)),
  ).sort((a, b) => b - a);

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedYear = parseInt(event.target.value, 10);
    onYearSelect(selectedYear);
  };

  // If there are no reports, do not render the dropdown
  if (years.length === 0) {
    return null;
  }

  // Set the default selected year to the latest year
  const defaultSelectedYear = years[0];

  return (
    <>
      <Select value={defaultSelectedYear} onChange={handleChange}>
        <option value="" disabled>
          Select a year
        </option>
        {years.map((year) => (
          <option key={year} value={year}>
            {`FY ${year - 1} - ${String(year).slice(2)}`}
          </option>
        ))}
      </Select>
    </>
  );
};
