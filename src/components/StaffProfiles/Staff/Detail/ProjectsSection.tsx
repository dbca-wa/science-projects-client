import replaceDarkWithLight from "@/lib/hooks/helper/replaceDarkWithLight";
import { useCurrentYear } from "@/lib/hooks/helper/useCurrentYear";
import { useInvolvedProjects } from "@/lib/hooks/tanstack/useInvolvedProjects";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SimpleSkeletonSection from "../../SimpleSkeletonSection";

const ProjectsSection = ({
  userId,
  buttonsVisible,
}: {
  userId: number;
  buttonsVisible;
}) => {
  const { userProjectsLoading, userProjectsData } = useInvolvedProjects(userId);
  useEffect(() => {
    console.log(userProjectsData);
  }, [userProjectsData, userProjectsLoading]);
  const currentYear = useCurrentYear();

  const checkYearForPresent = (thisYear: number, value: number) => {
    if (thisYear <= value) {
      return "Present";
    }
    return value;
  };

  return (
    <>
      {userProjectsLoading ? (
        <SimpleSkeletonSection project />
      ) : userProjectsData?.length > 0 ? (
        userProjectsData?.map((proj, index) => {
          return (
            <ProjectItem
              key={index}
              title={proj.title}
              datesString={
                proj.start_date === proj.end_date
                  ? `${proj.start_date}`
                  : `${proj.start_date} - ${checkYearForPresent(currentYear, Number(proj.end_date))}`
              }
              role={proj.role}
              description={proj.description}
              buttonsVisible={buttonsVisible}
            />
          );
        })
      ) : (
        <div>
          <p>No projects registered.</p>
        </div>
      )}
    </>
  );
};

interface IProjectItemProps {
  title: string;
  datesString: string;
  description: string;
  role: string;
  buttonsVisible: boolean;
}
const ProjectItem = ({
  title,
  datesString,
  description,
  role,
  buttonsVisible,
}: IProjectItemProps) => {
  const roleDict = {
    supervising: {
      color: "orange",
      string: "Project Leader",
    },
    research: {
      color: "green",
      string: "Science Support",
    },
    technical: {
      color: "brown",
      string: "Technical Support",
    },
    academicsuper: {
      color: "blue",
      string: "Academic Supervisor",
    },
    student: {
      color: "blue",
      string: "Supervised Student",
    },
    group: {
      color: "gray",
      string: "Involved Group",
    },
    externalcol: {
      color: "gray",
      string: "External Collaborator",
    },
    externalpeer: {
      color: "gray",
      string: "External Peer",
    },
    consulted: {
      color: "gray",
      string: "Consulted Peer",
    },
  };
  const VITE_PRODUCTION_BASE_URL = import.meta.env.VITE_PRODUCTION_BASE_URL;

  const setHref = (url: string) => {
    window.location.href = url;
  };
  const navigate = useNavigate();

  return (
    <div className="text-balance pb-6 pt-2">
      {/* border border-x-0 border-b-[1px] border-t-0  */}

      {buttonsVisible ? (
        <a
          className="font-bold text-blue-500 hover:cursor-pointer hover:underline dark:text-slate-400"
          dangerouslySetInnerHTML={{
            __html: replaceDarkWithLight(title || ""),
          }}
          onClick={() => {
            if (process.env.NODE_ENV === "development") {
              navigate("/users/me");
            } else {
              setHref(`${VITE_PRODUCTION_BASE_URL}users/me`);
            }
          }}
        />
      ) : (
        <p
          className="font-bold text-slate-700 dark:text-slate-400"
          dangerouslySetInnerHTML={{
            __html: replaceDarkWithLight(title || ""),
          }}
        />
      )}
      <div className="flex">
        <p className="font-semibold text-slate-500 dark:text-slate-600">
          {roleDict[role].string} | {datesString}
        </p>
      </div>

      <p
        className="mt-4 text-slate-600 dark:text-slate-500"
        dangerouslySetInnerHTML={{
          __html: replaceDarkWithLight(description || ""),
        }}
      />
      <hr className="mt-8" />
    </div>
  );
};

export default ProjectsSection;
