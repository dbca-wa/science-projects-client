import { useCurrentYear } from "@/shared/hooks/helper/useCurrentYear";
import { useMediaQuery } from "@/shared/utils/useMediaQuery";
import type { IStaffEmploymentEntry } from "@/shared/types/index.d";
import { useState } from "react";
import { EmploymentDialog, EmploymentDrawer } from "./CVSection";
import clsx from "clsx";

interface EmploymentEntryProps extends IStaffEmploymentEntry {
  buttonsVisible: boolean;
  isLast: boolean;
  refetch: () => void;
}

const EmploymentEntry = ({
  pk,
  public_profile,
  position_title,
  start_year,
  end_year,
  section,
  employer,
  buttonsVisible,
  isLast,
  refetch,
}: EmploymentEntryProps) => {
  const currentYear = useCurrentYear();

  const checkYearForPresent = (thisYear: number, value: number) => {
    if (!value || thisYear <= value) {
      return "Present";
    }
    return value;
  };
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const [isHovered, setIsHovered] = useState(false);
  return (
    <>
      <div
        className={clsx("relative select-none", isLast ? "py-4" : "pt-4 pb-0")}
        onMouseOver={() => setIsHovered(true)}
        onMouseOut={() => setIsHovered(false)}
      >
        {isHovered && buttonsVisible && (
          <div className="absolute top-0 right-0 z-40 flex py-3">
            {isDesktop ? (
              <>
                <EmploymentDialog
                  itemPk={pk}
                  staffProfilePk={public_profile}
                  userPk={0}
                  refetch={refetch}
                  kind={"edit"}
                  employmentItem={{
                    pk,
                    public_profile,
                    position_title,
                    start_year,
                    end_year,
                    section,
                    employer,
                  }}
                />

                <EmploymentDialog
                  itemPk={pk}
                  staffProfilePk={public_profile}
                  userPk={0}
                  refetch={refetch}
                  kind={"delete"}
                  employmentItem={{
                    pk,
                    public_profile,
                    position_title,
                    start_year,
                    end_year,
                    section,
                    employer,
                  }}
                />
              </>
            ) : (
              <>
                <EmploymentDrawer
                  staffProfilePk={public_profile}
                  userPk={0}
                  refetch={refetch}
                  kind={"edit"}
                  employmentItem={{
                    pk,
                    public_profile,
                    position_title,
                    start_year,
                    end_year,
                    section,
                    employer,
                  }}
                />
                <EmploymentDrawer
                  staffProfilePk={public_profile}
                  userPk={0}
                  refetch={refetch}
                  kind={"delete"}
                  employmentItem={{
                    pk,
                    public_profile,
                    position_title,
                    start_year,
                    end_year,
                    section,
                    employer,
                  }}
                />
              </>
            )}
          </div>
        )}

        <p className="text-[15px] font-semibold text-slate-700 dark:text-slate-400">
          {position_title}
        </p>
        {section ? <p>{section}</p> : null}
        <p className="text-[13px] font-semibold text-slate-500 dark:text-slate-600">
          {employer}
        </p>
        <p className="text-sm text-slate-600 dark:text-slate-500">
          {start_year === end_year
            ? `${start_year}`
            : `${start_year} - ${checkYearForPresent(currentYear, Number(end_year))}`}
        </p>
      </div>
    </>
  );
};

export default EmploymentEntry;
