import EducationEntry from "./EducationEntry";
import EmploymentEntry from "./EmploymentEntry";

const CVSection = ({ isLoading }: { isLoading: boolean }) => {
  return (
    <>
      <div className="mb-6">
        <p className="font-bold">Employment</p>
        <EmploymentEntry
          order={0}
          positionTitle={"Web and Data Development Officer"}
          startYear={"2024"}
          endYear={"2024"}
          isPresent
          employer={"Department of Biodiversity, Conservation & Science"}
          section={"Directorate"}
        />
        <EmploymentEntry
          order={1}
          positionTitle={"Ecoinformatics Developer"}
          startYear={"2023"}
          endYear={"2024"}
          employer={"Department of Biodiversity, Conservation & Science"}
          section={"Ecoinformatics"}
        />
      </div>
      {/* {isLoading ? (
        <p>sdsd</p>
      ) : (
        <>
          <div className="mb-6">
            <p className="font-bold">Employment</p>
            <EducationEntry />
            <EducationEntry />
            <EducationEntry />
          </div>

          <div className="mb-6">
            <p className="font-bold">Awards / Grants</p>
            <EducationEntry />
            <EducationEntry />
            <EducationEntry />
          </div>

          <div className="mb-6">
            <p className="font-bold">Eductation</p>
            <EducationEntry />
            <EducationEntry />
            <EducationEntry />
          </div>
        </>
      )} */}

      <div className="mb-6">
        <p className="font-bold">Awards / Grants / Achievements</p>
        <EducationEntry />
        <EducationEntry />
        <EducationEntry />
      </div>

      <div className="mb-6">
        <p className="font-bold">Eductation</p>
        <EducationEntry />
        <EducationEntry />
        <EducationEntry />
      </div>
    </>
  );
};
export default CVSection;
