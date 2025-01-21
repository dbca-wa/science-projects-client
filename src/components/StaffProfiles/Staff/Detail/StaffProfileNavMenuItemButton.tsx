import { useMediaQuery } from "@/lib/utils/useMediaQuery";
import clsx from "clsx";
import React from "react";

const StaffProfileNavMenuItemButton = ({
  title,
  setterFn,
  selected,
}: {
  title: string;
  setterFn: React.Dispatch<React.SetStateAction<string>>;
  selected?: string;
}) => {
  const colorDict = {
    Overview: "#2A6096",
    Projects: "#01A7B2",
    CV: "#1E5456",
    Publications: "#FFC530",
  };
  const borderColor = colorDict[title as keyof typeof colorDict];

  const isDesktop = useMediaQuery("(min-width: 768px)");

  return (
    <div>
      <button
        onClick={() => {
          // console.log(`Setting to ${title}`);
          setterFn(title);
        }}
        className={clsx(
          `-mb-[1px] mr-2 cursor-pointer appearance-none rounded-sm border-none py-2 text-lg outline-none hover:text-black/50 dark:hover:text-gray-100`,
          title === "Overview" && isDesktop && "pr-4",
          // title === "Publications" && "pl-4",
          (title === "Projects" ||
            title === "CV" ||
            title === "Publications" ||
            (!isDesktop && title === "Overview")) &&
            "px-4",
        )}
        // bg-[rgb(37,37,37)] text-white
        style={{ transition: "background 200ms ease-in-out 0s" }}
      >
        {title}
      </button>
      {selected?.toLocaleLowerCase() === title?.toLocaleLowerCase() && (
        <div
          // className={`border-b-2`}
          style={{ borderBottom: `4px solid ${borderColor}` }}
        />
      )}
    </div>
  );
};

export default StaffProfileNavMenuItemButton;
