import replaceDarkWithLight from "@/shared/utils/htmlHelpers";
import clsx from "clsx";
import { useNavigate } from "react-router-dom";
import EditStaffProjectDescrtiption from "./EditStaffProjectDescrtiption";
import hasMeaningfulContent from "@/shared/utils/hasMeaningfulContent";

interface IProjectItemProps {
  pk: number;
  title: string;
  datesString: string;
  description: string;
  role: string;
  buttonsVisible: boolean;
  kind: string;
  isOnly: boolean;
  isLast: boolean;
  // canEdit: boolean;
  refetch: () => void;
}

const StaffProjectItem = ({
  pk,
  title,
  datesString,
  description,
  role,
  buttonsVisible,
  kind,
  isOnly,
  isLast,
  // canEdit,
  refetch,
  // addSeparator,
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

    return doc.body.innerHTML.trim();
  };

  return (
    <div className="relative h-full pl-4">
      {/* Vertical line that spans full height */}
      <div
        className={clsx(
          "absolute top-6 left-0 -ml-0.5 w-px bg-gray-200",
          {
            // Style depending on the position of the item in the list

            // If it's the only item, have no height
            // "h-[0px]": isOnly,

            // If it's the last item, and doesn't have description
            "h-[calc(100%-1.75rem)]": isLast,
            //  && !isOnly,
            // hasMeaningfulContent(description) &&

            // If it's not the last/only item and has description
            "h-[calc(100%-1.5rem)] py-7":
              !isLast && !isOnly && hasMeaningfulContent(description),

            // If it's not the last/only item and doesn't have description
            "h-[calc(100%-1rem)] pb-6":
              !isLast && !isOnly && !hasMeaningfulContent(description),
          },
          "dark:bg-gray-700",
        )}
      />

      {/* Dot marker */}
      {/* <div className="absolute left-0 top-2 h-5 w-5 rounded-full border-2 border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-800" /> */}
      <div className="absolute -left-[1.3px] mt-[9px] mr-2 -ml-0.5 size-1 rounded-full bg-gray-500"></div>

      {/* Content container */}
      <div className={isLast ? "pb-0" : "mb-2 pb-2"}>
        {/* Title Role, Date date section */}
        <div className="mb-2 flex w-full items-start justify-between">
          <div className="flex w-fit flex-col">
            {/* Title */}
            <div className="w-fit">
              {buttonsVisible ? (
                <a
                  className="text-[14px] font-semibold text-blue-500 hover:cursor-pointer hover:underline dark:text-slate-400"
                  dangerouslySetInnerHTML={{
                    __html: sanitizeHtml(replaceDarkWithLight(title || "")),
                  }}
                  onClick={(e) => {
                    if (e.ctrlKey || e.metaKey) {
                      if (import.meta.env.MODE === "development") {
                        window.open(`/projects/${pk}/overview`, "_blank");
                      } else {
                        window.open(
                          `${VITE_PRODUCTION_BASE_URL}projects/${pk}/overview`,
                          "_blank",
                        );
                      }
                    } else {
                      if (import.meta.env.MODE === "development") {
                        navigate(`/projects/${pk}/overview`);
                      } else {
                        setHref(
                          `${VITE_PRODUCTION_BASE_URL}projects/${pk}/overview`,
                        );
                      }
                    }
                  }}
                />
              ) : (
                <p
                  className="text-[14px] font-semibold text-slate-700 dark:text-slate-400"
                  dangerouslySetInnerHTML={{
                    __html: sanitizeHtml(replaceDarkWithLight(title || "")),
                  }}
                />
              )}
            </div>

            {/* Role and Dates */}
            <div className="flex flex-col">
              <p className="text-[13px] font-semibold text-slate-500 dark:text-slate-600">
                {roleDict[role].string}
              </p>
              <p className="text-[13px] font-normal text-slate-500 dark:text-slate-600">
                {datesString}
              </p>
            </div>
            {(kind === "student" || kind === "external") && (
              <div className="flex">
                <p className="text-sm font-normal text-slate-400 dark:text-slate-600">
                  {kind === "student" ? "Student Project" : "External Project"}
                </p>
              </div>
            )}
          </div>

          {/* Edit Button (For Description) */}
          {roleDict[role].string === "Project Leader" && buttonsVisible && (
            <EditStaffProjectDescrtiption
              projectId={pk}
              projectDescription={description}
              refetch={refetch}
            />
          )}
        </div>

        {/* Description */}
        {hasMeaningfulContent(description) && (
          <p
            className="mt-2 text-sm text-slate-600 dark:text-slate-500"
            dangerouslySetInnerHTML={{
              __html: sanitizeHtml(replaceDarkWithLight(description || "")),
            }}
          />
        )}
      </div>
    </div>
  );
};

export default StaffProjectItem;
