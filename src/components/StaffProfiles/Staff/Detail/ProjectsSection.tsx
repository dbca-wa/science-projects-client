import { useInvolvedProjects } from "@/lib/hooks/tanstack/useInvolvedProjects";
import SimpleSkeletonSection from "../../SimpleSkeletonSection";
import { useEffect } from "react";
import replaceDarkWithLight from "@/lib/hooks/helper/replaceDarkWithLight";
import { useCurrentYear } from "@/lib/hooks/helper/useCurrentYear";

const ProjectsSection = ({ userId }: { userId: number }) => {
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
    <>
      {userProjectsLoading ? (
        <SimpleSkeletonSection project />
      ) : (
        userProjectsData?.map((proj, index) => (
          <ProjectItem
            key={index}
            title={proj.title}
            datesString={`${proj.start_date}-${checkYearForPresent(currentYear, Number(proj.end_date))}`}
            description={proj.description}
          />
        ))
        // <>
        //   <ProjectItem
        //     title="Science Project Management System"
        //     datesString="2023-present"
        //     description="In collaboration with Kimberley Region staff, traditional owner groups a number of springs and spring groups have been surveyed for aquatic invertebrates and flora, starting with springs at Walyarta (Mandora Marsh in the Great Sandy Desert, organic springs in the western and eastern Kimberley, Nimalarragan wetland north of Broome and most recently Dragon Tree Soak, also in the Great Sandy Desert. The springs provide important aquatic habitat and reliable water for fauna and flora that would otherwise be absent from the region, including some species likely to be restricted to the springs. This research has been funded by BHP, Yaruwu Park Council, the Kimberley Science and Conservation Initiative and other DBCA funds and has been written up in several reports."
        //   />
        //   <ProjectItem
        //     title="Science Project Management System"
        //     datesString="2023-present"
        //     description="In collaboration with Kimberley Region staff, traditional owner groups a number of springs and spring groups have been surveyed for aquatic invertebrates and flora, starting with springs at Walyarta (Mandora Marsh in the Great Sandy Desert, organic springs in the western and eastern Kimberley, Nimalarragan wetland north of Broome and most recently Dragon Tree Soak, also in the Great Sandy Desert. The springs provide important aquatic habitat and reliable water for fauna and flora that would otherwise be absent from the region, including some species likely to be restricted to the springs. This research has been funded by BHP, Yaruwu Park Council, the Kimberley Science and Conservation Initiative and other DBCA funds and has been written up in several reports."
        //   />
        // </>
      )}
    </>
  );
};

interface IProjectItemProps {
  title: string;
  datesString: string;
  description: string;
}
const ProjectItem = ({
  title,
  datesString,
  description,
}: IProjectItemProps) => {
  return (
    <div className="text-balance pb-6 pt-2">
      {/* border border-x-0 border-b-[1px] border-t-0  */}
      <p
        className="font-bold text-slate-700 dark:text-slate-400"
        dangerouslySetInnerHTML={{ __html: replaceDarkWithLight(title || "") }}
      />
      <p className="font-semibold text-slate-500 dark:text-slate-600">
        {datesString}
      </p>
      <p
        className="mt-4 text-slate-600 dark:text-slate-500"
        dangerouslySetInnerHTML={{
          __html: replaceDarkWithLight(description || ""),
        }}
      />
      <hr className="mt-8" />
    </div>
  );
};

export default ProjectsSection;
