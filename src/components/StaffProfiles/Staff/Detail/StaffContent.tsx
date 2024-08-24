import { useColorMode } from "@chakra-ui/react";
import { useState } from "react";
import CVSection from "./CVSection";
import OverviewSection from "./OverviewSection";
import ProjectsSection from "./ProjectsSection";
import PublicationsSection from "./PublicationsSection";
import ScrollArea from "./ScrollArea";
import { IUserMe } from "@/types";

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
        className={`-mb-[1px] mr-2 cursor-pointer appearance-none rounded-sm border-none px-4 py-2 text-lg outline-none hover:text-black/50 dark:hover:text-gray-100`}
        // bg-[rgb(37,37,37)] text-white
        style={{ transition: "background 200ms ease-in-out 0s" }}
      >
        {title}
      </button>
      {selected?.toLocaleLowerCase() === title?.toLocaleLowerCase() && (
        <div
          className={`border-b-2`}
          style={{ borderBottom: `2px solid ${borderColor}` }}
        />
      )}
    </div>
  );
};

const StaffContent = ({
  buttonsVisible,
  usersPk,
  viewingUser,
}: {
  buttonsVisible: boolean;
  usersPk: number;
  viewingUser: IUserMe;
}) => {
  const [selectedNav, setSelectedNav] = useState<string>("Overview");
  const { colorMode } = useColorMode();

  return (
    <div className="mx-auto w-full max-w-[600px] bg-red-500 px-2 dark:text-slate-300">
      {/* Scrollbar / Navigation */}
      <div className="flex justify-center">
        <div
          style={{ unicodeBidi: "isolate" }}
          className="xs:w-[320px] mt-2 w-auto sm:w-[420px] md:w-auto"
        >
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
              {/* <NavMenuItemButton
                setterFn={setSelectedNav}
                selected={selectedNav}
                title={"Publications"}
              /> */}
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
