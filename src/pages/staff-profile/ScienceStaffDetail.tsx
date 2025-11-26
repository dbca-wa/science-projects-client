import { Head, type StaffUserData } from "@/shared/components/layout/base/Head";
import ToggleStaffProfileVisibilityModal from "@/features/staff-profiles/components/modals/ToggleStaffProfileVisibilityModal";
import { BaseToggleOptionsButton } from "@/shared/components/RichTextEditor/Buttons/BaseToggleOptionsButton";
import StaffContent from "@/features/staff-profiles/components/Staff/Detail/StaffContent";
import StaffHero from "@/features/staff-profiles/components/Staff/Detail/StaffHero";
import StaffNotFound from "@/features/staff-profiles/components/Staff/StaffNotFound";
import { Button } from "@/shared/components/ui/button";
import { useCheckStaffProfile } from "@/features/staff-profiles/hooks/useCheckStaffProfile";
import { useUser } from "@/features/users/hooks/useUser";
import { useMediaQuery } from "@/shared/utils/useMediaQuery";
import {
  Box,
  Center,
  Button as ChakraButton,
  Icon,
  Spinner,
  Tooltip,
  useDisclosure,
} from "@chakra-ui/react";
import { useState } from "react";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";
import { IoArrowBackCircle } from "react-icons/io5";
import { MdArrowBack } from "react-icons/md";
import { useNavigate, useParams } from "react-router-dom";

const ScienceStaffDetail = () => {
  const { staffProfilePk: usersPk } = useParams();
  const [buttonsVisible, setButtonsVisible] = useState(false);
  const isNumeric = /^[0-9]+$/.test(usersPk || "");
  const VITE_PRODUCTION_PROFILES_BASE_URL = import.meta.env
    .VITE_PRODUCTION_PROFILES_BASE_URL;
  const VITE_PRODUCTION_BASE_URL = import.meta.env.VITE_PRODUCTION_BASE_URL;
  const navigate = useNavigate();
  const setHref = (url: string) => {
    window.location.href = url;
  };
  const { userData: viewingUser, userLoading, refetchUser } = useUser();
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const { staffBaseDataLoading, staffBaseData, refetch } = useCheckStaffProfile(
    Number(usersPk),
  );

  // console.log(staffBaseData);

  const {
    isOpen: isToggleStaffProfileVisibilityModalOpen,
    onClose: onCloseToggleStaffProfileVisibilityModal,
    onOpen: onOpenToggleStaffProfileVisibilityModal,
  } = useDisclosure();

  // console.log(
  //   staffBaseData?.keyword_tags
  //     ?.map((word) =>
  //       word.name
  //         .split(" ")
  //         .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
  //         .join(" "),
  //     )
  //     .join(", "),
  // );
  const keyWordsString = staffBaseData?.keyword_tags
    ?.map((word) =>
      word.name
        .split(" ")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" "),
    )
    .join(", ");

  const userDataObject: StaffUserData = {
    name: `${staffBaseData?.user?.display_first_name || ""} ${staffBaseData?.user?.display_last_name || ""}`.trim(),
    position: staffBaseData?.title || "",
    ...(keyWordsString && { keywords: keyWordsString }), // Only include if defined
    ...(staffBaseData?.about && { about: staffBaseData.about }), // Only include if defined
  };

  if (staffBaseDataLoading) {
    return (
      <div className="relative flex h-full w-full justify-center">
        <Head
          title="DBCA | Staff Details"
          description="Staff Details"
          isStandalone
          isStaffProfile
          userData={userDataObject}
        />
        <Center my={24}>
          <Spinner />
        </Center>
      </div>
    );
  }

  return (
    <div className="relative flex h-full w-full justify-center">
      <Head
        title={`DBCA | ${staffBaseDataLoading ? "Staff Details" : `${staffBaseData?.user?.display_first_name} ${staffBaseData?.user?.display_last_name}`}`}
        description={
          staffBaseDataLoading
            ? "Staff Details"
            : `${staffBaseData?.user?.display_first_name} ${staffBaseData?.user?.display_last_name}'s staff profile. ${keyWordsString}}`
        }
        isStandalone
        isStaffProfile
        userData={userDataObject}
      />

      {((buttonsVisible && viewingUser?.is_superuser) ||
        (buttonsVisible &&
          viewingUser?.pk === Number(staffBaseData?.user?.pk))) && (
        <ToggleStaffProfileVisibilityModal
          isOpen={isToggleStaffProfileVisibilityModalOpen}
          userPk={staffBaseData?.user?.pk}
          onClose={onCloseToggleStaffProfileVisibilityModal}
          staffProfilePk={staffBaseData?.pk}
          profileIsHidden={staffBaseData?.is_hidden}
          refetch={() => {
            refetch();
            refetchUser();
          }}
        />
      )}

      {!isNumeric ||
      !staffBaseData ||
      (staffBaseData?.is_hidden &&
        viewingUser?.pk !== staffBaseData?.user?.pk &&
        !viewingUser?.is_superuser) ? (
        <div
          className={`flex h-full w-full flex-col items-center justify-center p-8`}
        >
          <p>
            {staffBaseData?.is_hidden
              ? "This profile is currently hidden."
              : `No matching user for ID ${usersPk}`}
          </p>
          <Button
            className="mt-8"
            onClick={() => {
              if (!VITE_PRODUCTION_BASE_URL) {
                navigate(`/staff`);
              } else {
                window.location.href = `${VITE_PRODUCTION_PROFILES_BASE_URL}`;
              }
            }}
          >
            {" "}
            <MdArrowBack className="mr-2" />
            Back to Listings
          </Button>
        </div>
      ) : !userLoading ? (
        <div className="sm: max-w-[600px] justify-center px-0 sm:px-12 md:max-w-[800px]">
          <div className="flex flex-col">
            {staffBaseDataLoading ? (
              <Center my={24}>
                <Spinner />
              </Center>
            ) : staffBaseData?.is_hidden &&
              viewingUser?.pk !== staffBaseData?.user?.pk &&
              !viewingUser?.is_superuser ? (
              <StaffNotFound />
            ) : (
              <>
                <StaffHero
                  usersPk={usersPk ?? ""}
                  buttonsVisible={buttonsVisible}
                  viewingUser={viewingUser}
                  refetchBaseData={refetch}
                  baseData={staffBaseData}
                />
                <StaffContent
                  usersPk={Number(usersPk)}
                  buttonsVisible={buttonsVisible}
                  viewingUser={viewingUser}
                  refetchBaseData={refetch}
                  baseData={staffBaseData}
                />
              </>
            )}
          </div>
          <div
            className={`absolute top-3 right-0 flex-col overflow-hidden px-8 md:px-10 lg:px-11 ${!isDesktop && "flex-col"}`}
          >
            <div className={`flex items-center justify-center gap-2`}>
              {(viewingUser?.pk === Number(staffBaseData?.user?.pk) ||
                viewingUser?.is_superuser) && (
                <Tooltip aria-label="toggle-tooltip" label="Toggle Edit/View">
                  <Box>
                    <BaseToggleOptionsButton
                      iconOne={AiFillEye}
                      colorSchemeOne="green"
                      iconTwo={AiFillEyeInvisible}
                      colorSchemeTwo="blue"
                      currentState={buttonsVisible}
                      setCurrentState={setButtonsVisible}
                    />
                  </Box>
                </Tooltip>
              )}
              {(buttonsVisible &&
                viewingUser?.pk === Number(staffBaseData?.user?.pk)) ||
              (viewingUser?.is_superuser && buttonsVisible) ? (
                <div className={`flex items-center justify-center`}>
                  <Tooltip aria-label="toggle-tooltip" label="Back to SPMS">
                    {isDesktop ? (
                      <ChakraButton
                        onClick={() => {
                          if (import.meta.env.MODE === "development") {
                            navigate("/users/me");
                          } else {
                            setHref(`${VITE_PRODUCTION_BASE_URL}users/me`);
                          }
                        }}
                        leftIcon={<IoArrowBackCircle />}
                        bg={"green.500"}
                        _hover={{ bg: "green.400" }}
                        color={"white"}
                        mr={2}
                      >
                        SPMS
                      </ChakraButton>
                    ) : (
                      <ChakraButton
                        onClick={() => {
                          if (import.meta.env.MODE === "development") {
                            navigate("/users/me");
                          } else {
                            setHref(`${VITE_PRODUCTION_BASE_URL}users/me`);
                          }
                        }}
                        // rightIcon={<MdScience />}
                        bg={"green.500"}
                        _hover={{ bg: "green.400" }}
                        color={"white"}
                        rounded={"full"}
                        p={0}
                        m={0}
                        // mt={2}
                      >
                        <Icon as={IoArrowBackCircle} boxSize={6} />
                      </ChakraButton>
                    )}
                  </Tooltip>
                </div>
              ) : null}
            </div>
            {(buttonsVisible && viewingUser?.is_superuser) ||
            (buttonsVisible &&
              viewingUser?.pk === Number(staffBaseData?.user?.pk)) ? (
              <div className={`flex w-full justify-center`}>
                <div className="mt-4 w-full">
                  <Button
                    className="w-full"
                    onClick={() => {
                      // console.log("clicked");
                      onOpenToggleStaffProfileVisibilityModal();
                    }}
                  >
                    {staffBaseData?.is_hidden ? "Show" : "Hide"} Profile
                  </Button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      ) : (
        <Center my={4}>
          <Spinner />
        </Center>
      )}
    </div>
  );
};

export default ScienceStaffDetail;
