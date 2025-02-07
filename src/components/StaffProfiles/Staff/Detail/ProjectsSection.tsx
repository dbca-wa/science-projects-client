import replaceDarkWithLight from "@/lib/hooks/helper/replaceDarkWithLight";
import { useCurrentYear } from "@/lib/hooks/helper/useCurrentYear";
import { useInvolvedProjects } from "@/lib/hooks/tanstack/useInvolvedProjects";
import { useNavigate } from "react-router-dom";
import SimpleSkeletonSection from "../../SimpleSkeletonSection";
import { Separator } from "@/components/ui/separator";
import { useMediaQuery } from "@/lib/utils/useMediaQuery";
import StaffProjectItem from "./StaffProjectItem";
import ProjectsSubsection from "./ProjectsSubsection";
import { useInvolvedStaffProfileProjects } from "@/lib/hooks/tanstack/useInvolvedStaffProfileProjects";

const ProjectsSection = ({
  userId,
  buttonsVisible,
}: {
  userId: number;
  buttonsVisible;
}) => {
  const { userProjectsLoading, userProjectsData, refetchUserProjects } =
    useInvolvedStaffProfileProjects(userId);

  // getUsersProjectsForStaffProfile

  const sortByStartDate = (a, b) => {
    return Number(b.start_date) - Number(a.start_date); // Sort in descending order
  };

  // Split into "Current" and "Prior" projects based on status
  const getCurrentAndPriorProjects = (projects) => {
    const priorStatuses = ["terminated", "suspended", "closed"];

    // Separate current and prior projects and remove student and external projects
    const currentProjects = projects.filter(
      (proj) =>
        !priorStatuses.includes(proj.status) &&
        proj.kind !== "student" &&
        proj.kind !== "external",
    );
    const priorProjects = projects.filter(
      (proj) =>
        priorStatuses.includes(proj.status) &&
        proj.kind !== "student" &&
        proj.kind !== "external",
    );

    // Sort both arrays by start date (descending order)
    return {
      currentProjects: currentProjects.sort(sortByStartDate),
      priorProjects: priorProjects.sort(sortByStartDate),
    };
  };

  // useEffect(() => console.log(userProjectsData), [userProjectsData]);

  const isDesktop = useMediaQuery("(min-width: 768px)");

  return (
    <div className="w-full">
      {userProjectsLoading ? (
        <SimpleSkeletonSection project />
      ) : userProjectsData?.length > 0 ? (
        (() => {
          const { currentProjects, priorProjects } =
            getCurrentAndPriorProjects(userProjectsData);

          return (
            <>
              {/* Current Projects Section */}
              {currentProjects.length > 0 ? (
                <ProjectsSubsection
                  section="current"
                  projects={currentProjects}
                  buttonsVisible={buttonsVisible}
                  userId={userId}
                  refetch={refetchUserProjects}
                />
              ) : null}

              {/* Prior Projects Section */}
              {priorProjects.length > 0 ? (
                <>
                  <ProjectsSubsection
                    section="closed"
                    projects={priorProjects}
                    buttonsVisible={buttonsVisible}
                    userId={userId}
                    refetch={refetchUserProjects}
                  />
                </>
              ) : null}
            </>
          );
        })()
      ) : (
        <div className="w-full p-4">
          <p>No projects registered.</p>
        </div>
      )}
    </div>
  );
};

export default ProjectsSection;
