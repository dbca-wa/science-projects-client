import { useCurrentYear } from "@/lib/hooks/helper/useCurrentYear";
import { useMediaQuery } from "@/lib/utils/useMediaQuery";
import { IProjectData } from "@/types";
import React from "react";
import StaffProjectItem from "./StaffProjectItem";

interface IProps {
  section: "current" | "closed";
  projects: IProjectData[];
  buttonsVisible: boolean;
}

const ProjectsSubsection = ({ section, projects, buttonsVisible }) => {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const currentYear = useCurrentYear();
  const checkYearForPresent = (thisYear: number, value: number) => {
    if (thisYear <= value) {
      return "Present";
    }
    return value;
  };

  return (
    <>
      <div className="mb-0 mt-2 flex items-center">
        <h3 className="text-xl font-bold text-slate-700 dark:text-slate-400">
          {section === "current" ? "Current Projects" : "Closed Projects"}
        </h3>
        {/* <hr className="ml-4 mt-[6px] flex-grow border-gray-300 dark:border-slate-600" /> */}
      </div>

      <div className="px-2 py-3">
        {projects?.map((proj, index) => {
          return (
            <StaffProjectItem
              pk={proj.pk}
              key={index}
              title={proj.title}
              datesString={
                proj.start_date === proj.end_date
                  ? `${proj.start_date}`
                  : `${proj.start_date} - ${checkYearForPresent(
                      currentYear,
                      Number(proj.end_date),
                    )}`
              }
              role={proj.role}
              description={proj.description}
              buttonsVisible={buttonsVisible}
              kind={proj.kind}
              isOnly={projects.length === 1}
              isLast={projects[projects.length - 1] === proj}
            />
          );
        })}
      </div>
    </>
  );
};

export default ProjectsSubsection;
