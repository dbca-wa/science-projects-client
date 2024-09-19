import { useCurrentYear } from "@/lib/hooks/helper/useCurrentYear";
import { useMediaQuery } from "@/lib/utils/useMediaQuery";
import { IStaffEducationEntry } from "@/types";
import { useState } from "react";
import { EducationDialog, EducationDrawer } from "./CVSection";

interface EducationEntryProps extends IStaffEducationEntry {
  buttonsVisible: boolean;
  refetch: () => void;
}

const EducationEntry = ({
  pk,
  public_profile,
  // qualification_field,
  // qualification_kind,
  qualification_name,
  start_year,
  end_year,
  institution,
  location,
  buttonsVisible,
  refetch,
}: EducationEntryProps) => {
  const currentYear = useCurrentYear();

  const checkYearForPresent = (thisYear: number, value: number) => {
    if (thisYear <= value) {
      return "Present";
    }
    return value;
  };
  const isDesktop = useMediaQuery("(min-width: 768px)");

  // const qualificationKindOptions = [
  //   { value: "postdoc", label: "Postdoctoral in" },
  //   { value: "doc", label: "Doctor of" },
  //   { value: "master", label: "Master of" },
  //   { value: "graddip", label: "Graduate Diploma in" },
  //   { value: "bachelor", label: "Bachelor of" },
  //   { value: "assdegree", label: "Associate Degree in" },
  //   { value: "diploma", label: "Diploma in" },
  //   { value: "cert", label: "Certificate in" },
  //   { value: "nano", label: "Nanodegree in" },
  // ];

  // const selectedOption = qualificationKindOptions.find(
  //   (option) => option.value === qualification_kind,
  // );

  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="relative select-none py-3"
      style={{
        fontWeight: 400,
        fontSize: "16px",
        lineHeight: "24px",
        fontStyle: "normal",
        fontFamily: `"", blinkmacsystemfont, -apple-system, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Fira Sans", "Droid Sans", "Helvetica Neue", Helvetica, Arial, sans-serif`,
      }}
      onMouseOver={() => setIsHovered(true)}
      onMouseOut={() => setIsHovered(false)}
      // bg={isHovered ? "gray.200" : "transparent"}
    >
      {isHovered && buttonsVisible && (
        <div className="absolute right-0 top-0 z-40 flex py-3">
          {isDesktop ? (
            <>
              <EducationDialog
                itemPk={pk}
                staffProfilePk={public_profile}
                userPk={0}
                refetch={refetch}
                kind={"edit"}
                educationItem={{
                  pk,
                  public_profile,
                  // qualification_field,
                  // qualification_kind,
                  qualification_name,
                  start_year,
                  end_year,
                  institution,
                  location,
                }}
              />

              <EducationDialog
                itemPk={pk}
                staffProfilePk={public_profile}
                userPk={0}
                refetch={refetch}
                kind={"delete"}
                educationItem={{
                  pk,
                  public_profile,
                  // qualification_field,
                  // qualification_kind,
                  qualification_name,
                  start_year,
                  end_year,
                  institution,
                  location,
                }}
              />
            </>
          ) : (
            <>
              <EducationDrawer
                staffProfilePk={public_profile}
                userPk={0}
                refetch={refetch}
                kind={"edit"}
                educationItem={{
                  pk,
                  public_profile,
                  // qualification_field,
                  // qualification_kind,
                  qualification_name,
                  start_year,
                  end_year,
                  institution,
                  location,
                }}
              />
              <EducationDrawer
                staffProfilePk={public_profile}
                userPk={0}
                refetch={refetch}
                kind={"delete"}
                educationItem={{
                  pk,
                  public_profile,
                  // qualification_field,
                  // qualification_kind,
                  qualification_name,
                  start_year,
                  end_year,
                  institution,
                  location,
                }}
              />
            </>
          )}
        </div>
      )}

      {/* Name */}
      {/* <p
        style={{
          fontWeight: 600,
        }}
        className="text-balance"
      >
        {qualification_field}
      </p> */}

      {/* Details */}
      <div className="text-balance">
        <p>
          {start_year === end_year
            ? `${start_year}`
            : `${start_year} - ${checkYearForPresent(currentYear, Number(end_year))}`}
        </p>
        <p>
          {/* {selectedOption.label}  */}
          {qualification_name}
        </p>
        <p>
          {institution} ({location})
        </p>
      </div>
    </div>
  );
};

export default EducationEntry;
