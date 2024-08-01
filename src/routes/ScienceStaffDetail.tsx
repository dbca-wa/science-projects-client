import StaffContent from "@/components/Science/Staff/Detail/StaffContent";
import StaffHero from "@/components/Science/Staff/Detail/StaffHero";
import React from "react";

const ScienceStaffDetail = () => {
  return (
    <div className="flex flex-col">
      <StaffHero
        branchName={"Kensington"}
        positionTitle={"Web and Data Development Officer"}
        fullName={"Jarid Prince"}
        tags={["React", "Django", "Docker", "Kubernetes", "ETL"]}
      />
      <StaffContent />
    </div>
  );
};

export default ScienceStaffDetail;
