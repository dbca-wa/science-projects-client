import { useColorMode } from "@chakra-ui/react";
import { useState } from "react";
import CVSection from "./CVSection";
import OverviewSection from "./OverviewSection";
import ProjectsSection from "./ProjectsSection";
import PublicationsSection from "./PublicationsSection";
import ScrollArea from "./ScrollArea";
import { IStaffProfileBaseData, IUserMe } from "@/types";
import { useMediaQuery } from "@/lib/utils/useMediaQuery";
import clsx from "clsx";

const NavMenuItemButton = ({
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
  return (
    <div>
      <button
        onClick={() => {
          // console.log(`Setting to ${title}`);
          setterFn(title);
        }}
        className={clsx(
          `-mb-[1px] mr-2 cursor-pointer appearance-none rounded-sm border-none py-2 text-lg outline-none hover:text-black/50 dark:hover:text-gray-100`,
          title === "Overview" && "pr-4",
          // title === "Publications" && "pl-4",
          (title === "Projects" ||
            title === "CV" ||
            title === "Publications") &&
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

const StaffContent = ({
  buttonsVisible,
  usersPk,
  viewingUser,
  refetchBaseData,
  baseData,
}: {
  buttonsVisible: boolean;
  usersPk: number;
  viewingUser: IUserMe;
  refetchBaseData: () => void;
  baseData: IStaffProfileBaseData;
}) => {
  const [selectedNav, setSelectedNav] = useState<string>("Overview");
  const { colorMode } = useColorMode();
  const isDesktop = useMediaQuery("(min-width: 768px)");

  return (
    <div className="mx-auto w-full dark:text-slate-300">
      {/* Scrollbar / Navigation */}
      <div className={`${!isDesktop ? "flex justify-center" : ""}`}>
        <div style={{ unicodeBidi: "isolate" }} className="mt-2 px-4">
          <ScrollArea
            hideScrollbar={true}
            showOverflowIndicator={true}
            showIndicatorButton={false}
            indicatorColor={
              colorMode === "light" ? "rgb(241 245 249)" : "black"
            }
          >
            <div className="relative flex pb-2">
              <NavMenuItemButton
                setterFn={setSelectedNav}
                selected={selectedNav}
                title={"Overview"}
              />
              <NavMenuItemButton
                setterFn={setSelectedNav}
                selected={selectedNav}
                title={"Projects"}
              />
              <NavMenuItemButton
                setterFn={setSelectedNav}
                selected={selectedNav}
                title={"CV"}
              />
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* Content */}
      <div className="w-full min-w-[360px]">
        {selectedNav === "Overview" ? (
          <OverviewSection
            userId={usersPk}
            buttonsVisible={buttonsVisible}
            viewingUser={viewingUser}
            refetchBaseData={refetchBaseData}
            baseData={baseData}
          />
        ) : selectedNav === "Projects" ? (
          <ProjectsSection userId={usersPk} buttonsVisible={buttonsVisible} />
        ) : selectedNav === "CV" ? (
          <CVSection
            userId={usersPk}
            buttonsVisible={buttonsVisible}
            viewingUser={viewingUser}
          />
        ) : (
          <PublicationsSection
            userId={usersPk}
            buttonsVisible={buttonsVisible}
          />
        )}
      </div>
    </div>
  );
};

export default StaffContent;
