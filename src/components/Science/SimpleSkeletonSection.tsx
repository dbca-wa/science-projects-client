import { Skeleton } from "@/components/ui/skeleton";

export const SimpleSkeletonSection = ({
  education,
  project,
  publication,
}: {
  education?: boolean;
  project?: boolean;
  publication?: boolean;
}) => {
  const skeletonDark = `bg-gray-800`;
  const skeletonLight = `bg-gray-300`;
  return (
    <div className="my-4 space-y-2">
      {education ? (
        <>
          <Skeleton
            className={`h-6 w-[100px] ${skeletonLight} dark:${skeletonDark}`}
          />
          <div className="pb-2"></div>

          <Skeleton
            className={`h-4 w-[200px] ${skeletonLight} dark:${skeletonDark}`}
          />
          <Skeleton
            className={`h-4 w-[250px] ${skeletonLight} dark:${skeletonDark}`}
          />
          <Skeleton
            className={`h-4 w-[250px] ${skeletonLight} dark:${skeletonDark}`}
          />
          <div className="py-2"></div>

          <Skeleton
            className={`h-4 w-[200px] ${skeletonLight} dark:${skeletonDark}`}
          />
          <Skeleton
            className={`h-4 w-[250px] ${skeletonLight} dark:${skeletonDark}`}
          />
          <Skeleton
            className={`h-4 w-[250px] ${skeletonLight} dark:${skeletonDark}`}
          />
        </>
      ) : project ? (
        <>
          <div className=""></div>
          <Skeleton
            className={`h-5 w-[300px] ${skeletonLight} dark:${skeletonDark}`}
          />
          {/* <div className="pb-2"></div> */}

          <Skeleton
            className={`h-4 w-[125px] ${skeletonLight} dark:${skeletonDark}`}
          />
          <div className="py-1" />
          <Skeleton
            className={`h-4 w-[350px] ${skeletonLight} dark:${skeletonDark}`}
          />
          <Skeleton
            className={`h-4 w-[350px] ${skeletonLight} dark:${skeletonDark}`}
          />
          <Skeleton
            className={`h-4 w-[350px] ${skeletonLight} dark:${skeletonDark}`}
          />
          <Skeleton
            className={`h-4 w-[350px] ${skeletonLight} dark:${skeletonDark}`}
          />
          <Skeleton
            className={`h-4 w-[350px] ${skeletonLight} dark:${skeletonDark}`}
          />

          <div className="pb-4"></div>
          <hr className="" />
          <div className="pt-4"></div>
          <Skeleton
            className={`h-5 w-[300px] ${skeletonLight} dark:${skeletonDark}`}
          />
          {/* <div className="pb-2"></div> */}

          <Skeleton
            className={`h-4 w-[125px] ${skeletonLight} dark:${skeletonDark}`}
          />
          <div className="py-1" />
          <Skeleton
            className={`h-4 w-[350px] ${skeletonLight} dark:${skeletonDark}`}
          />
          <Skeleton
            className={`h-4 w-[350px] ${skeletonLight} dark:${skeletonDark}`}
          />
          <Skeleton
            className={`h-4 w-[350px] ${skeletonLight} dark:${skeletonDark}`}
          />
          <Skeleton
            className={`h-4 w-[350px] ${skeletonLight} dark:${skeletonDark}`}
          />
          <Skeleton
            className={`h-4 w-[350px] ${skeletonLight} dark:${skeletonDark}`}
          />

          <div className="pb-4"></div>
        </>
      ) : publication ? (
        <>
          <Skeleton
            className={`h-6 w-[60px] ${skeletonLight} dark:${skeletonDark}`}
          />
          <div className="pb-1"></div>

          <Skeleton
            className={`h-4 w-[350px] ${skeletonLight} dark:${skeletonDark}`}
          />
          <Skeleton
            className={`h-4 w-[350px] ${skeletonLight} dark:${skeletonDark}`}
          />
          <Skeleton
            className={`h-4 w-[350px] ${skeletonLight} dark:${skeletonDark}`}
          />
          <div className="pb-2"></div>
          <Skeleton
            className={`h-4 w-[350px] ${skeletonLight} dark:${skeletonDark}`}
          />
          <Skeleton
            className={`h-4 w-[350px] ${skeletonLight} dark:${skeletonDark}`}
          />
          <div className="pb-2"></div>
          <Skeleton
            className={`h-4 w-[350px] ${skeletonLight} dark:${skeletonDark}`}
          />
          <Skeleton
            className={`h-4 w-[350px] ${skeletonLight} dark:${skeletonDark}`}
          />
          <div className="pb-2"></div>
          <Skeleton
            className={`h-6 w-[60px] ${skeletonLight} dark:${skeletonDark}`}
          />
          <div className="pb-1"></div>

          <Skeleton
            className={`h-4 w-[350px] ${skeletonLight} dark:${skeletonDark}`}
          />
          <Skeleton
            className={`h-4 w-[350px] ${skeletonLight} dark:${skeletonDark}`}
          />
          <div className="pb-2"></div>
          <Skeleton
            className={`h-4 w-[350px] ${skeletonLight} dark:${skeletonDark}`}
          />
          <Skeleton
            className={`h-4 w-[350px] ${skeletonLight} dark:${skeletonDark}`}
          />
          <div className="pb-2"></div>
          <Skeleton
            className={`h-4 w-[350px] ${skeletonLight} dark:${skeletonDark}`}
          />
          <Skeleton
            className={`h-4 w-[350px] ${skeletonLight} dark:${skeletonDark}`}
          />
          <div className="pb-2"></div>
        </>
      ) : (
        <>
          <Skeleton
            className={`h-6 w-[90px] ${skeletonLight} dark:${skeletonDark}`}
          />
          {/* <div className="pb-2"></div> */}

          <Skeleton
            className={`h-4 w-[350px] ${skeletonLight} dark:${skeletonDark}`}
          />
          <Skeleton
            className={`h-4 w-[350px] ${skeletonLight} dark:${skeletonDark}`}
          />
          <Skeleton
            className={`h-4 w-[350px] ${skeletonLight} dark:${skeletonDark}`}
          />
          <Skeleton
            className={`h-4 w-[350px] ${skeletonLight} dark:${skeletonDark}`}
          />
          <div className="pb-2"></div>
        </>
      )}
    </div>
  );
};

export default SimpleSkeletonSection;
