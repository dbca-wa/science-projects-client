// The traditional version of the dashboard

import { useCallback, useEffect, useState } from "react";
import { useUser } from "@/features/users/hooks/useUser";
import { TraditionalTasksAndProjects } from "./TraditionalTasksAndProjects";
import { CreateProjectPageModal } from "@/features/projects/components/modals/CreateProjectPageModal";
import { FaDatabase } from "react-icons/fa";
import { FaCirclePlus } from "react-icons/fa6";
import { TbWorldWww } from "react-icons/tb";
import { WelcomeBox } from "./WelcomeBox";
import { Button } from "@/shared/components/ui/button";
import { useTheme } from "next-themes";
import { cn } from "@/shared/utils";

export const TraditionalDashboard = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [shouldConcat, setShouldConcat] = useState(false);

  const { userData } = useUser();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const handleResize = useCallback(() => {
    // 1150 = the breakpoint at which issues occur with text overlaying
    if (window.innerWidth < 1150) {
      setShouldConcat(true);
    } else {
      setShouldConcat(false);
    }
  }, [userData?.first_name]);

  useEffect(() => {
    handleResize(); // call the handleResize function once after mounting
    window.addEventListener("resize", handleResize); // add event listener to window object
    return () => window.removeEventListener("resize", handleResize); // remove event listener when unmounting
  }, [handleResize]);

  return (
    <>
      <CreateProjectPageModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
      <WelcomeBox userData={userData} showNotes={false} />

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-10 my-5">
        <Button
          className={cn(
            "flex items-center gap-2 text-white",
            isDark 
              ? "bg-blue-600 hover:bg-blue-400" 
              : "bg-blue-500 hover:bg-blue-600"
          )}
          onClick={() => {
            window.open("https://data.bio.wa.gov.au/", "_blank");
          }}
        >
          <FaDatabase />
          {shouldConcat ? "Data" : "Data Catalogue"}
        </Button>

        <Button
          className={cn(
            "flex items-center gap-2 text-white",
            isDark 
              ? "bg-blue-600 hover:bg-blue-400" 
              : "bg-blue-500 hover:bg-blue-600"
          )}
          onClick={() =>
            window.open("https://scientificsites.dpaw.wa.gov.au/", "_blank")
          }
        >
          <TbWorldWww />
          {shouldConcat ? "Scientific Sites" : "Scientific Sites Register"}
        </Button>

        <Button
          className={cn(
            "flex items-center gap-2 text-white",
            isDark 
              ? "bg-green-600 hover:bg-green-400" 
              : "bg-green-500 hover:bg-green-600"
          )}
          onClick={() => setIsOpen(true)}
        >
          <FaCirclePlus />
          Create Project
        </Button>
      </div>

      <TraditionalTasksAndProjects />

      <div className="flex justify-center mt-6"></div>
    </>
  );
};
