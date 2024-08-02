import Subsection from "@/components/Science/Staff/Detail/Subsection";

const EditableStaffOverview = () => {
  return (
    <>
      <AboutMeEditable />
      <ExpertiseEditable />
    </>
  );
};

const AboutMeEditable = () => {
  return (
    <Subsection title="About Me">
      <p>sdasd</p>
    </Subsection>
  );
};

const ExpertiseEditable = () => {
  return (
    <Subsection title="Expertise">
      <p>sdasd</p>
    </Subsection>
  );
};

export default EditableStaffOverview;
