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
    <div className="mt-4">
      {userProjectsLoading ? (
        <SimpleSkeletonSection project />
      ) : userProjectsData?.length > 0 ? (
        userProjectsData?.map((proj, index) => {
          return (
            <ProjectItem
              pk={proj.pk}
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
    </div>
  );
};

import DOMPurify from "dompurify";

interface IProjectItemProps {
  pk: number;
  title: string;
  datesString: string;
  description: string;
  role: string;
  buttonsVisible: boolean;
}
const ProjectItem = ({
  pk,
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

  const sanitizeHtml = (htmlString: string) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, "text/html");

    const elements = doc.body.querySelectorAll("*");

    elements.forEach((element) => {
      element.removeAttribute("class");
      element.removeAttribute("style");

      if (
        element.tagName.toLowerCase() === "b" ||
        element.tagName.toLowerCase() === "strong"
      ) {
        const parent = element.parentNode;
        while (element.firstChild) {
          parent.insertBefore(element.firstChild, element);
        }
        parent.removeChild(element);
      }
    });

    return doc.body.innerHTML;
  };

  return (
    <div className="text-balance pb-6 pt-2">
      {/* border border-x-0 border-b-[1px] border-t-0  */}

      {buttonsVisible ? (
        <a
          className="font-bold text-blue-500 hover:cursor-pointer hover:underline dark:text-slate-400"
          dangerouslySetInnerHTML={{
            __html: sanitizeHtml(replaceDarkWithLight(title || "")),
          }}
          onClick={() => {
            if (process.env.NODE_ENV === "development") {
              navigate(`/projects/${pk}/overview`);
            } else {
              setHref(`${VITE_PRODUCTION_BASE_URL}projects/${pk}/overview`);
            }
          }}
        />
      ) : (
        <p
          className="font-bold text-slate-700 dark:text-slate-400"
          dangerouslySetInnerHTML={{
            __html: sanitizeHtml(replaceDarkWithLight(title || "")),
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
          __html: sanitizeHtml(replaceDarkWithLight(description || "")),
        }}
      />
      <hr className="mt-8" />
    </div>
  );
};

export default ProjectsSection;
