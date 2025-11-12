import { Skeleton } from "@/shared/components/ui/skeleton";
import { useMediaQuery } from "@/shared/utils/useMediaQuery";
import { Grid } from "@chakra-ui/react";

export const StaffResultSkeleton = () => {
  const skeletonLight = `bg-gray-300`;
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const amountOfResults = 16;
  const resultsArray = Array.from({ length: amountOfResults });

  return (
    <div className="my-4 min-h-[450px] w-full min-w-[300px] px-4">
      <Skeleton className={`h-6 w-[230px] ${skeletonLight} `} />
      <div className="pb-2"></div>

      <Grid
        gridTemplateColumns={
          isDesktop
            ? {
                md: "repeat(2, 4fr)",
                lg: "repeat(4, 4fr)",
                xl: "repeat(4, 4fr)",
              }
            : "repeat(1, 1fr)"
        }
        gridGap={4}
        py={4}
      >
        {resultsArray.map((_, index) => (
          <Skeleton key={index} className={`min-h-48 ${skeletonLight}`} />
        ))}
      </Grid>
    </div>
  );
};

export default StaffResultSkeleton;
