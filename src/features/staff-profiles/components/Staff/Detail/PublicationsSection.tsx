import { useUserPublications } from "@/features/staff-profiles/hooks/useUserPublications";
import { useMediaQuery } from "@/shared/utils/useMediaQuery";
import type { IUserMe } from "@/shared/types";
import SimpleSkeletonSection from "@/features/staff-profiles/components/SimpleSkeletonSection";
import LibraryPublications from "./LibraryPublications";

const PublicationsSection = ({
  userId,
  employee_id,
  buttonsVisible,
  viewingUser,
}: {
  userId: number;
  viewingUser: IUserMe;
  buttonsVisible: boolean;
  employee_id: string;
}) => {
  const { publicationData, isLoading, refetch } =
    useUserPublications(employee_id);

  // useEffect(() => {
  //   console.log("PublicationsSection", publicationData);
  // }, [publicationData]);

  const isDesktop = useMediaQuery("(min-width: 768px)");

  return (
    <>
      {isLoading ? (
        <>
          <SimpleSkeletonSection publication />
        </>
      ) : (
        <>
          {/* <CustomPublications
            publicationData={publicationData}
            userId={userId}
            viewingUser={viewingUser}
            buttonsVisible={buttonsVisible}
            refetch={refetch}
          /> */}
          <LibraryPublications libraryData={publicationData?.libraryData} />
        </>
      )}
    </>
  );
};

export default PublicationsSection;
