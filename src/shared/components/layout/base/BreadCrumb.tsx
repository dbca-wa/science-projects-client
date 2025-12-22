// Component for displaying and quickly navigating related routes

import { useNavigate } from "react-router-dom";
import { useTheme } from "next-themes";
import { cn } from "@/shared/utils";
import type { IBreadCrumbProps } from "@/shared/types";

export const BreadCrumb = ({
  subDirOne,
  subDirTwo,
  subDirThree,
  rightSideElement,
}: IBreadCrumbProps) => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const handleUnderscores = (text: string) => {
    let updated = text;
    if (text.includes("_")) {
      updated = updated.replaceAll("_", " ");
    }
    return updated;
  };

  return (
    <>
      <div
        className={cn(
          "rounded-md px-4 py-2 relative flex justify-between select-none",
          isDark ? "bg-gray-700 text-gray-400" : "bg-gray-100"
        )}
      >
        <div className="flex">
          <button
            onClick={() => {
              navigate("/");
            }}
            className="text-blue-600 hover:text-blue-800 underline bg-transparent border-none cursor-pointer"
          >
            Home
          </button>
          &nbsp;/&nbsp;
          <button
            onClick={() => {
              navigate(subDirOne.link);
            }}
            className="text-blue-600 hover:text-blue-800 underline bg-transparent border-none cursor-pointer"
          >
            {handleUnderscores(subDirOne.title)}
          </button>
          {subDirTwo ? (
            <>
              &nbsp;/&nbsp;
              <button
                onClick={() => {
                  navigate(subDirTwo.link);
                }}
                className="text-blue-600 hover:text-blue-800 underline bg-transparent border-none cursor-pointer"
              >
                {handleUnderscores(subDirTwo.title)}
              </button>
              {subDirThree ? (
                <>
                  &nbsp;/&nbsp;
                  <button
                    onClick={() => {
                      navigate(subDirThree.link);
                    }}
                    className="text-blue-600 hover:text-blue-800 underline bg-transparent border-none cursor-pointer"
                  >
                    {handleUnderscores(subDirThree.title)}
                  </button>
                </>
              ) : null}
            </>
          ) : null}
        </div>
        {rightSideElement ? <div className="flex">{rightSideElement}</div> : null}
      </div>
    </>
  );
};
