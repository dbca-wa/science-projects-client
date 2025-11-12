import { useMediaQuery } from "@/shared/utils/useMediaQuery";
import clsx from "clsx";
import { type FC, type ReactNode } from "react";

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
    CV: "#FFC530",
    Background: "#FFC530",
    Experience: "#FFC530",
    Publications: "#1E5456",
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
          `mr-2 -mb-px cursor-pointer appearance-none rounded-sm border-none py-2 text-lg outline-hidden hover:text-black/90 dark:hover:text-gray-100`,
          title === "Overview" && isDesktop && "pr-4",
          // title === "Publications" && "pl-4",
          (title === "Projects" ||
            title === "CV" ||
            title === "Background" ||
            title === "Experience" ||
            title === "Publications" ||
            (!isDesktop && title === "Overview")) &&
            "px-4",
          selected?.toLocaleLowerCase() === title?.toLocaleLowerCase() &&
            "font-semibold",
        )}
        // bg-[rgb(37,37,37)] text-white
        style={{ transition: "background 200ms ease-in-out 0s" }}
      >
        {title}
      </button>
      {selected?.toLocaleLowerCase() === title?.toLocaleLowerCase() ? (
        <div
          className="pt-1"
          style={{ borderBottom: `6px solid ${borderColor}` }}
        />
      ) : (
        <div
          className="pt-[8px]"
          style={{ borderBottom: `2px solid ${borderColor}` }}
        />
      )}
    </div>
  );
};

export default StaffProfileNavMenuItemButton;
