import { BaseToggleOptionsButton } from "@/components/RichTextEditor/Buttons/BaseToggleOptionsButton";
import { ToolbarToggleBtn } from "@/components/RichTextEditor/Buttons/ToolbarToggleBtn";
import StaffContent from "@/components/StaffProfiles/Staff/Detail/StaffContent";
import StaffHero from "@/components/StaffProfiles/Staff/Detail/StaffHero";
import { useStaffProfile } from "@/lib/hooks/tanstack/useStaffProfile";
import { Button } from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { IconBaseProps } from "react-icons";
import { AiFillEdit, AiFillEye, AiFillEyeInvisible } from "react-icons/ai";
import { useParams } from "react-router-dom";

const ScienceStaffDetail = () => {
  const { staffProfilePk: usersPk } = useParams();
  const { staffProfileLoading, staffProfileData, refetch } =
    useStaffProfile(usersPk);

  useEffect(() => {
    console.log({ staffProfileData, staffProfileLoading });
    console.log(usersPk);
  });

  const [buttonsVisible, setButtonsVisible] = useState(true);

  return (
    <div className="relative">
      <div className="flex flex-col">
        <StaffHero
          staffProfileDataLoading={staffProfileLoading}
          staffProfileData={staffProfileData}
          usersPk={Number(usersPk)}
          branchName={"Kensington"}
          positionTitle={"Web and Data Development Officer"}
          fullName={"Jarid Prince"}
          tags={["React", "Django", "Docker", "Kubernetes", "ETL"]}
          buttonsVisible={buttonsVisible}
        />
        <StaffContent
          isLoading={staffProfileLoading}
          staffProfileData={staffProfileData}
          usersPk={Number(usersPk)}
          buttonsVisible={buttonsVisible}
        />
      </div>
      <div className="absolute right-0 top-3 overflow-hidden px-8 md:px-10 lg:px-11">
        <BaseToggleOptionsButton
          iconOne={AiFillEye}
          colorSchemeOne="green"
          iconTwo={AiFillEyeInvisible}
          colorSchemeTwo="blue"
          currentState={buttonsVisible}
          setCurrentState={setButtonsVisible}
          toolTipText={
            !buttonsVisible ? "Show Edit Buttons" : "Hide Edit Buttons"
          }
          //  editorIsOpen={editorIsOpen}
        />
      </div>
    </div>
  );
};

export default ScienceStaffDetail;
