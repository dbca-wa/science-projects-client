import { Skeleton } from "@/shared/components/ui/skeleton";
import { useMediaQuery } from "@/shared/utils/useMediaQuery";

export const StaffResultSkeleton = () => {
  const skeletonLight = `bg-gray-300`;
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const amountOfResults = 16;
  const resultsArray = Array.from({ length: amountOfResults });

  return (
    <div className="my-4 min-h-[450px] w-full min-w-[300px] px-4">
      <Skeleton className={`h-6 w-[230px] ${skeletonLight} `} />
      <div className="pb-2"></div>

      <div
        className={`grid gap-4 py-4 ${
          isDesktop
            ? "md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4"
            : "grid-cols-1"
        }`}
      >
        {resultsArray.map((_, index) => (
          <Skeleton key={index} className={`min-h-48 ${skeletonLight}`} />
        ))}
      </div>
    </div>
  );
};

export default StaffResultSkeleton;
