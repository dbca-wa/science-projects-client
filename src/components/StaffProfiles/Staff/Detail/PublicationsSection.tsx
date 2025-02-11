import { useEffect } from "react";
import SimpleSkeletonSection from "../../SimpleSkeletonSection";
import Subsection from "./Subsection";
import ResponsivePopup from "./ResponsivePopup";
import { useUserPublications } from "@/lib/hooks/tanstack/useUserPublications";
import LogPublicationsButton from "./LogPublicationsButton";
import LibraryPublications from "./LibraryPublications";
import { IUserMe } from "@/types";
import { useMediaQuery } from "@/lib/utils/useMediaQuery";
import { PublicationDialog } from "../PublicationDialog";
import PublicationDrawer from "../PublicationDrawer";
import CustomPublications from "./CustomPublications";

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
          <CustomPublications
            publicationData={publicationData}
            userId={userId}
            viewingUser={viewingUser}
            buttonsVisible={buttonsVisible}
            refetch={refetch}
          />
          <LibraryPublications libraryData={publicationData?.libraryData} />
        </>
      )}
    </>
  );
};

export default PublicationsSection;
