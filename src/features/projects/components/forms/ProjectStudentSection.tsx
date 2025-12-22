// Tab data for Project External Project info on the creation page.

import { AffiliationCreateSearchDropdown } from "@/features/admin/components/AffiliationCreateSearchDropdown";
import type { IAffiliation } from "@/shared/types";
import { Button } from "@/shared/components/ui/button";
import { Label } from "@/shared/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { useColorMode } from "@/shared/utils/theme.utils";
import { useEffect, useState } from "react";
import { HiAcademicCap } from "react-icons/hi";
import { IoIosCreate } from "react-icons/io";
import type { ICreateProjectStudentDetails } from "@/features/projects/services/projects.service";
import "@/styles/modalscrollbar.css";

interface IProjectStudentProps {
  studentFilled: boolean;
  setStudentFilled: React.Dispatch<React.SetStateAction<boolean>>;
  studentData: ICreateProjectStudentDetails;
  setStudentData: React.Dispatch<
    React.SetStateAction<ICreateProjectStudentDetails>
  >;
  // (data) => void;
  createClick: () => void;
  onClose: () => void;
  backClick: () => void;
}

export const ProjectStudentSection = ({
  backClick,
  createClick,
  studentFilled,
  setStudentFilled,
  studentData,
  setStudentData,
}: IProjectStudentProps) => {
  const { colorMode } = useColorMode();

  const [hoveredTitle, setHoveredTitle] = useState(false);

  const titleBorderColor = `${
    colorMode === "light"
      ? hoveredTitle
        ? "border-gray-400"
        : "border-gray-300"
      : hoveredTitle
        ? "border-white/40"
        : "border-white/30"
  }`;

  const [level, setLevel] = useState<string>("");
  const [organisation, setOrganisation] = useState<string>("");

  const [collaboratingPartnersArray, setCollaboratingPartnersArray] = useState<
    IAffiliation[] | null
  >([]);

  useEffect(() => {
    console.log(collaboratingPartnersArray);
    console.log(organisation);
  }, [collaboratingPartnersArray, organisation]);
  const addCollaboratingPartnersPkToArray = (affiliation: IAffiliation) => {
    setOrganisation((prevString) => {
      let updatedString = prevString.trim(); // Remove any leading or trailing spaces

      // Add a comma and a space if not already present
      if (updatedString && !/,\s*$/.test(updatedString)) {
        updatedString += ", ";
      }

      // Append affiliation name
      updatedString += affiliation.name.trim();

      // Check if the first two characters are a space and comma, remove them
      if (updatedString?.startsWith(", ")) {
        updatedString = updatedString.substring(2);
      }

      return updatedString;
    });
    setCollaboratingPartnersArray((prev) => [...prev, affiliation]);
  };

  const removeCollaboratingPartnersPkFromArray = (
    affiliation: IAffiliation,
  ) => {
    console.log(affiliation);
    setOrganisation((prevString) => {
      const regex = new RegExp(`.{0,2}${affiliation.name.trim()}\\s*`, "g");
      let updatedString = prevString.replace(regex, "").trim();
      if (updatedString?.startsWith(", ")) {
        updatedString = updatedString.substring(2);
      }
      return updatedString;
    });

    setCollaboratingPartnersArray((prev) =>
      prev.filter((item) => item !== affiliation),
    );
  };

  const clearCollaboratingPartnersPkArray = () => {
    setOrganisation("");
    setCollaboratingPartnersArray([]);
  };

  useEffect(() => {
    setStudentData({
      level: level,
      organisation: organisation,
    });
  }, [level, organisation]);

  useEffect(() => {
    if (organisation.length > 0 && level.length > 0) {
      // console.log(studentData);
      setStudentFilled(true);
    } else {
      setStudentFilled(false);
    }
  }, [studentData, level, organisation, setStudentData]);

  return (
    <>
      <AffiliationCreateSearchDropdown
        autoFocus
        isRequired
        isEditable
        array={collaboratingPartnersArray}
        arrayAddFunction={addCollaboratingPartnersPkToArray}
        arrayRemoveFunction={removeCollaboratingPartnersPkFromArray}
        arrayClearFunction={clearCollaboratingPartnersPkArray}
        label="Organisation"
        placeholder="Enter the academic organisation..."
        helperText="The academic organisation of the student"
      />
      {organisation}

      <div className="pb-6 select-none">
        <Label
          onMouseEnter={() => setHoveredTitle(true)}
          onMouseLeave={() => setHoveredTitle(false)}
          className="required"
        >
          Level
        </Label>
        <div className="flex">
          <div
            className={`flex items-center justify-center px-4 z-[1] border border-r-0 rounded-l-md ${titleBorderColor} ${
              colorMode === "light" ? "bg-gray-100" : "bg-white/30"
            }`}
          >
            <HiAcademicCap className="w-5 h-5" />
          </div>

          <Select
            value={level}
            onValueChange={setLevel}
            onMouseEnter={() => setHoveredTitle(true)}
            onMouseLeave={() => setHoveredTitle(false)}
          >
            <SelectTrigger className="border-l-0 rounded-l-none pl-[2px] border-l-transparent">
              <SelectValue placeholder="Select a level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="phd">PhD</SelectItem>
              <SelectItem value="msc">MSc</SelectItem>
              <SelectItem value="honours">BSc Honours</SelectItem>
              <SelectItem value="fourth_year">Fourth Year</SelectItem>
              <SelectItem value="third_year">Third Year</SelectItem>
              <SelectItem value="undergrad">Undergradate</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <p className="text-sm text-gray-500 mt-1">
          The level of the student and the project
        </p>
      </div>
      <div className="w-full flex justify-end pb-4">
        <div className="grid grid-cols-2 gap-4">
          <Button variant="outline" onClick={backClick}>
            Back
          </Button>

          <Button
            className={`text-white ${
              colorMode === "light" 
                ? "bg-blue-500 hover:bg-blue-400" 
                : "bg-blue-600 hover:bg-blue-500"
            }`}
            disabled={!studentFilled}
            onClick={() => {
              createClick();
            }}
          >
            <IoIosCreate className="mr-2 h-4 w-4" />
            Create
          </Button>
        </div>
      </div>
    </>
  );
};
