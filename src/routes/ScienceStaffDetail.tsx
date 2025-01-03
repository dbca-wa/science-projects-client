import { Head } from "@/components/Base/Head";
import { BaseToggleOptionsButton } from "@/components/RichTextEditor/Buttons/BaseToggleOptionsButton";
import StaffContent from "@/components/StaffProfiles/Staff/Detail/StaffContent";
import StaffHero from "@/components/StaffProfiles/Staff/Detail/StaffHero";
import StaffNotFound from "@/components/StaffProfiles/Staff/StaffNotFound";
import { Button } from "@/components/ui/button";
import { useCheckStaffProfile } from "@/lib/hooks/tanstack/useCheckStaffProfile";
import { useUser } from "@/lib/hooks/tanstack/useUser";
import { useMediaQuery } from "@/lib/utils/useMediaQuery";
import {
  Box,
  Center,
  Button as ChakraButton,
  Icon,
  Spinner,
  Tooltip,
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
  const { userData: viewingUser, userLoading } = useUser();
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const { staffBaseDataLoading, staffBaseData, refetch } = useCheckStaffProfile(
    Number(usersPk),
  );

  return (
    <div className="relative flex h-full w-full justify-center">
      <Head title={`DBCA | Staff Details`} isStandalone />

      {!isNumeric ? (
        <div
          className={`flex h-full w-full flex-col items-center justify-center p-8`}
        >
          <p>No user matching "{usersPk}"</p>
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
            ) : !staffBaseData?.is_hidden && staffBaseData?.user?.is_active ? (
              <>
                <StaffHero
                  usersPk={usersPk}
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
            ) : (
              <StaffNotFound />
            )}
          </div>
          <div
            className={`absolute right-0 top-3 flex overflow-hidden px-8 md:px-10 lg:px-11 ${!isDesktop && "flex-col"}`}
          >
            {!isDesktop &&
              (viewingUser?.pk === Number(usersPk) ||
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
            {!userLoading &&
            (viewingUser?.pk === Number(usersPk) ||
              viewingUser?.is_superuser) &&
            buttonsVisible ? (
              <div className={`flex justify-center`}>
                <Tooltip aria-label="toggle-tooltip" label="Back to SPMS">
                  {isDesktop ? (
                    <ChakraButton
                      onClick={() => {
                        if (process.env.NODE_ENV === "development") {
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
                        if (process.env.NODE_ENV === "development") {
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
                      mt={2}
                    >
                      <Icon as={IoArrowBackCircle} boxSize={6} />
                    </ChakraButton>
                  )}
                </Tooltip>
              </div>
            ) : null}
            {isDesktop &&
              (viewingUser?.pk === Number(usersPk) ||
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
