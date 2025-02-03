import { useEffect } from "react";
import SimpleSkeletonSection from "../../SimpleSkeletonSection";
import Subsection from "./Subsection";
import ResponsivePopup from "./ResponsivePopup";
import { useUserPublications } from "@/lib/hooks/tanstack/useUserPublications";
import LogPublicationsButton from "./LogPublicationsButton";
import LibraryPublications from "./LibraryPublications";

const PublicationsSection = ({
  userId,
  employee_id,
  buttonsVisible,
}: {
  userId: number;
  buttonsVisible: boolean;
  employee_id: string;
}) => {
  const { publicationData, isLoading, refetch } =
    useUserPublications(employee_id);

  useEffect(() => {
    console.log(
      "PublicationsSection",
      publicationData?.docs?.map((pub) => pub.title),
    );
  }, [publicationData]);

  return (
    <>
      {isLoading ? (
        <>
          <SimpleSkeletonSection publication />
        </>
      ) : (
        <LibraryPublications publicationData={publicationData} />
      )}
    </>
  );
};
export default PublicationsSection;
