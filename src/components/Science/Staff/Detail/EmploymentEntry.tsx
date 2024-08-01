interface IEmploymentEntryProps {
  order: number;
  positionTitle: string;
  startYear: string;
  endYear: string;
  isPresent?: boolean;
  employer: string;
  section?: string;
}

const EmploymentEntry = ({
  order,
  positionTitle,
  startYear,
  endYear,
  isPresent,
  employer,
  section,
}: IEmploymentEntryProps) => {
  return (
    <div className="py-4">
      <p className="font-semibold">{positionTitle}</p>
      <p>{`${startYear} - ${isPresent ? "Present" : endYear}`}</p>
      {section ? <p>{section}</p> : null}
      <p>{employer}</p>
    </div>
  );
};

export default EmploymentEntry;
