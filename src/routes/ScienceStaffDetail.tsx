import StaffContent from "@/components/Science/Staff/Detail/StaffContent";
import StaffHero from "@/components/Science/Staff/Detail/StaffHero";
import { useStaffProfile } from "@/lib/hooks/tanstack/useStaffProfile";
import React, { useEffect } from "react";
import { useParams } from "react-router-dom";

const ScienceStaffDetail = () => {
  const { staffProfilePk } = useParams();
  const { isLoading, staffProfileData, refetch } =
    useStaffProfile(staffProfilePk);

  useEffect(() => {
    console.log({ staffProfileData, isLoading });
  });

  return (
    <div className="flex flex-col">
      <StaffHero
        isLoading={isLoading}
        staffProfileData={staffProfileData}
        branchName={"Kensington"}
        positionTitle={"Web and Data Development Officer"}
        fullName={"Jarid Prince"}
        tags={["React", "Django", "Docker", "Kubernetes", "ETL"]}
      />
      <StaffContent isLoading={isLoading} staffProfileData={staffProfileData}/>
    </div>
  );
};

export default ScienceStaffDetail;
