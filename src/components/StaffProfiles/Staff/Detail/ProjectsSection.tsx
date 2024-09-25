import replaceDarkWithLight from "@/lib/hooks/helper/replaceDarkWithLight";
import { useCurrentYear } from "@/lib/hooks/helper/useCurrentYear";
import { useInvolvedProjects } from "@/lib/hooks/tanstack/useInvolvedProjects";
import { useNavigate } from "react-router-dom";
import SimpleSkeletonSection from "../../SimpleSkeletonSection";
import { Separator } from "@/components/ui/separator";
import { useMediaQuery } from "@/lib/utils/useMediaQuery";

const ProjectsSection = ({
  userId,
  buttonsVisible,
}: {
  userId: number;
  buttonsVisible;
}) => {
  const { userProjectsLoading, userProjectsData } = useInvolvedProjects(userId);
  const currentYear = useCurrentYear();

  const sortByStartDate = (a, b) => {
    return Number(b.start_date) - Number(a.start_date); // Sort in descending order
  };

  const checkYearForPresent = (thisYear: number, value: number) => {
    if (thisYear <= value) {
      return "Present";
    }
    return value;
  };

  // Split into "Current" and "Prior" projects based on status
  const getCurrentAndPriorProjects = (projects) => {
    const priorStatuses = ["terminated", "suspended", "closed"];

    // Separate current and prior projects
    const currentProjects = projects.filter(
      (proj) => !priorStatuses.includes(proj.status),
    );
    const priorProjects = projects.filter((proj) =>
      priorStatuses.includes(proj.status),
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
    <div className="mt-4 w-full px-4">
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
                <>
                  {isDesktop ? (
                    <div className="my-6 flex items-center">
                      <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-400">
                        Current Projects
                      </h3>
                      <hr className="ml-4 mt-[6px] flex-grow border-gray-300 dark:border-slate-600" />
                    </div>
                  ) : (
                    <div className="my-6 flex items-center">
                      <hr className="mr-4 mt-[6px] flex-grow border-gray-300 dark:border-slate-600" />
                      <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-400">
                        Current Projects
                      </h3>

                      <hr className="ml-4 mt-[6px] flex-grow border-gray-300 dark:border-slate-600" />
                    </div>
                  )}

                  {currentProjects.map((proj, index) => {
                    return (
                      <ProjectItem
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
                        addSeparator={currentProjects.length - 1 !== index}
                      />
                    );
                  })}
                </>
              ) : null}

              {/* Prior Projects Section */}
              {priorProjects.length > 0 ? (
                <>
                  {isDesktop ? (
                    <div className="my-6 flex items-center">
                      <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-400">
                        {currentProjects?.length > 0
                          ? "Prior Projects"
                          : "Projects"}
                      </h3>
                      <hr className="ml-4 mt-[6px] flex-grow border-gray-300 dark:border-slate-600" />
                    </div>
                  ) : (
                    <div className="my-6 flex items-center">
                      <hr className="mr-4 mt-[6px] flex-grow border-gray-300 dark:border-slate-600" />
                      <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-400">
                        {currentProjects?.length > 0
                          ? "Prior Projects"
                          : "Projects"}
                      </h3>

                      <hr className="ml-4 mt-[6px] flex-grow border-gray-300 dark:border-slate-600" />
                    </div>
                  )}

                  {priorProjects.map((proj, index) => {
                    return (
                      <ProjectItem
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
                      />
                    );
                  })}
                </>
              ) : null}
            </>
          );
        })()
      ) : (
        <div className="w-full">
          <p>No projects registered.</p>
        </div>
      )}
    </div>
  );
};

interface IProjectItemProps {
  pk: number;
  title: string;
  datesString: string;
  description: string;
  role: string;
  buttonsVisible: boolean;
  kind: string;
  addSeparator: boolean;
}
const ProjectItem = ({
  pk,
  title,
  datesString,
  description,
  role,
  buttonsVisible,
  kind,
  addSeparator,
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
    <>
      <div className="text-balance pb-6 pt-2">
        {buttonsVisible ? (
          <a
            className="font-bold text-blue-500 hover:cursor-pointer hover:underline dark:text-slate-400"
            dangerouslySetInnerHTML={{
              __html: sanitizeHtml(replaceDarkWithLight(title || "")),
            }}
            onClick={(e) => {
              if (e.ctrlKey || e.metaKey) {
                if (process.env.NODE_ENV === "development") {
                  window.open(`/projects/${pk}/overview`, "_blank");
                } else {
                  window.open(
                    `${VITE_PRODUCTION_BASE_URL}projects/${pk}/overview`,
                    "_blank",
                  );
                }
              } else {
                if (process.env.NODE_ENV === "development") {
                  navigate(`/projects/${pk}/overview`);
                } else {
                  setHref(`${VITE_PRODUCTION_BASE_URL}projects/${pk}/overview`);
                }
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
        {(kind === "student" || kind === "external") && (
          <div className="flex">
            <p className="font-normal text-slate-400 dark:text-slate-600">
              {kind === "student" ? "Student Project" : "External Project"}
            </p>
          </div>
        )}
        <p
          className="mt-4 text-slate-600 dark:text-slate-500"
          dangerouslySetInnerHTML={{
            __html: sanitizeHtml(replaceDarkWithLight(description || "")),
          }}
        />
        {addSeparator && <Separator className="mt-8" />}
      </div>
    </>
  );
};

export default ProjectsSection;

// userProjectsData?.sort(sortByStartDate)?.map((proj, index) => {
//   return (
//     <ProjectItem
//       pk={proj.pk}
//       key={index}
//       title={proj.title}
//       datesString={
//         proj.start_date === proj.end_date
//           ? `${proj.start_date}`
//           : `${proj.start_date} - ${checkYearForPresent(currentYear, Number(proj.end_date))}`
//       }
//       role={proj.role}
//       description={proj.description}
//       buttonsVisible={buttonsVisible}
//     />
//   );
// })
