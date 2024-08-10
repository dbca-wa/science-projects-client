import StaffContent from "@/components/StaffProfiles/Staff/Detail/StaffContent";
import StaffHero from "@/components/StaffProfiles/Staff/Detail/StaffHero";
import { useStaffProfile } from "@/lib/hooks/tanstack/useStaffProfile";
import React, { useEffect } from "react";
import { useParams } from "react-router-dom";

const ScienceStaffDetail = () => {
  const { staffProfilePk } = useParams();
  const { staffProfileLoading, staffProfileData, refetch } =
    useStaffProfile(staffProfilePk);

  useEffect(() => {
    console.log({ staffProfileData, staffProfileLoading });
  });

  return (
    <div className="flex flex-col">
      <StaffHero
        isLoading={staffProfileLoading}
        staffProfileData={staffProfileData}
        branchName={"Kensington"}
        positionTitle={"Web and Data Development Officer"}
        fullName={"Jarid Prince"}
        tags={["React", "Django", "Docker", "Kubernetes", "ETL"]}
      />
      <StaffContent
        isLoading={staffProfileLoading}
        staffProfileData={staffProfileData}
      />
    </div>
  );
};

export default ScienceStaffDetail;
