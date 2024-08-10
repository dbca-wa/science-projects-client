import SimpleSkeletonSection from "../../SimpleSkeletonSection";

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
      <p className="font-bold text-slate-700 dark:text-slate-400">{title}</p>
      <p className="font-semibold text-slate-500 dark:text-slate-600">
        {datesString}
      </p>
      <p className="mt-4 text-slate-600 dark:text-slate-500">{description}</p>
      <hr className="mt-8" />
    </div>
  );
};

const ProjectsSection = ({ isLoading }: { isLoading: boolean }) => {
  return (
    <>
      {isLoading ? (
        <SimpleSkeletonSection project />
      ) : (
        <>
          <ProjectItem
            title="Science Project Management System"
            datesString="2023-present"
            description="In collaboration with Kimberley Region staff, traditional owner groups a number of springs and spring groups have been surveyed for aquatic invertebrates and flora, starting with springs at Walyarta (Mandora Marsh in the Great Sandy Desert, organic springs in the western and eastern Kimberley, Nimalarragan wetland north of Broome and most recently Dragon Tree Soak, also in the Great Sandy Desert. The springs provide important aquatic habitat and reliable water for fauna and flora that would otherwise be absent from the region, including some species likely to be restricted to the springs. This research has been funded by BHP, Yaruwu Park Council, the Kimberley Science and Conservation Initiative and other DBCA funds and has been written up in several reports."
          />
          <ProjectItem
            title="Science Project Management System"
            datesString="2023-present"
            description="In collaboration with Kimberley Region staff, traditional owner groups a number of springs and spring groups have been surveyed for aquatic invertebrates and flora, starting with springs at Walyarta (Mandora Marsh in the Great Sandy Desert, organic springs in the western and eastern Kimberley, Nimalarragan wetland north of Broome and most recently Dragon Tree Soak, also in the Great Sandy Desert. The springs provide important aquatic habitat and reliable water for fauna and flora that would otherwise be absent from the region, including some species likely to be restricted to the springs. This research has been funded by BHP, Yaruwu Park Council, the Kimberley Science and Conservation Initiative and other DBCA funds and has been written up in several reports."
          />
        </>
      )}
    </>
  );
};

export default ProjectsSection;
