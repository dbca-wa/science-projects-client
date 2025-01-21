import { useCurrentYear } from "@/lib/hooks/helper/useCurrentYear";
import { useMediaQuery } from "@/lib/utils/useMediaQuery";
import { IProjectData } from "@/types";
import React from "react";
import StaffProjectItem from "./StaffProjectItem";
import Subsection from "./Subsection";

interface IProps {
  section: "current" | "closed";
  projects: IProjectData[];
  buttonsVisible: boolean;
  userId: number;
  refetch: () => void;
}

const ProjectsSubsection = ({
  section,
  projects,
  buttonsVisible,
  userId,
  refetch,
}) => {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const currentYear = useCurrentYear();
  const checkYearForPresent = (thisYear: number, value: number) => {
    if (thisYear <= value) {
      return "Present";
    }
    return value;
  };

  return (
    <Subsection
      title={section === "current" ? "Current Projects" : "Closed Projects"}
      divider={true}
    >
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
              // canEdit={proj.role === "leader" || proj.role === "member"}
              refetch={refetch}
            />
          );
        })}
      </div>
    </Subsection>
  );
};

export default ProjectsSubsection;
