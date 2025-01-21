import replaceDarkWithLight from "@/lib/hooks/helper/replaceDarkWithLight";
import clsx from "clsx";
import { useNavigate } from "react-router-dom";

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

    return doc.body.innerHTML;
  };

  const hasMeaningfulContent = (
    description: string | null | undefined,
  ): boolean => {
    if (!description) return false; // Return false if description is null or undefined.

    // Create a temporary DOM element to parse the HTML string.
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = description;

    // Extract the text content and trim it to remove whitespace.
    const textContent = tempDiv.textContent?.trim() || "";

    // Return true if there is any non-empty text content.
    return textContent.length > 0;
  };

  return (
    <div className="relative h-full pl-6">
      {/* Vertical line that spans full height */}
      <div
        className={clsx(
          "absolute left-0 top-6 w-[1px] bg-gray-200",
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
            "h-[calc(100%-2rem)] pb-6":
              !isLast && !isOnly && !hasMeaningfulContent(description),
          },
          "dark:bg-gray-700",
        )}
      />

      {/* Dot marker */}
      {/* <div className="absolute left-0 top-2 h-5 w-5 rounded-full border-2 border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-800" /> */}
      <div className="absolute -left-[1.3px] mr-2 mt-[9px] size-1 rounded-full bg-gray-500"></div>

      {/* Content container */}
      <div className="mb-2">
        {/* Title Role, Date date section */}
        <div className="mb-2">
          {buttonsVisible ? (
            <a
              className="text-[14px] font-semibold text-blue-500 hover:cursor-pointer hover:underline dark:text-slate-400"
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

          {/* Role and Dates */}
          <div className="flex">
            <p className="text-[13px] font-semibold text-slate-500 dark:text-slate-600">
              {roleDict[role].string} | {datesString}
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
