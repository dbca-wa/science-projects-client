import { Button } from "@/components/ui/button";
import { Button as ChakraButton } from "@chakra-ui/react";
import { useUser } from "@/lib/hooks/tanstack/useUser";
import { IStaffProfileData } from "@/types";
import { Center, Spinner, useMediaQuery } from "@chakra-ui/react";
import { ChevronLeft } from "lucide-react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

interface IStaffHeroProps {
  staffProfileDataLoading: boolean;
  staffProfileData: IStaffProfileData;
  usersPk: number;
  fullName: string; // no titles
  positionTitle: string;
  branchName: string;
  tags: string[]; // make this max of 5
  buttonsVisible: boolean;
}

const StaffHero = ({
  staffProfileDataLoading,
  staffProfileData,
  usersPk,
  fullName,
  positionTitle,
  branchName,
  tags,
  buttonsVisible,
}: IStaffHeroProps) => {
  const navigate = useNavigate();
  const isDesktop = useMediaQuery("(min-width: 768px");

  const { userData, userLoading } = useUser();
  useEffect(() => {
    console.log({ staffProfileData, userData, userLoading });
  }, [staffProfileData, userData, userLoading]);

  const VITE_PRODUCTION_BASE_URL = import.meta.env.VITE_PRODUCTION_BASE_URL;

  const setHref = (url: string) => {
    window.location.href = url;
  };

  return !staffProfileDataLoading && !userLoading ? (
    isDesktop ? (
      <div className="flex flex-col">
        {/* Back button */}
        {!userLoading && userData?.pk && buttonsVisible ? (
          <div className="flex justify-center pt-5">
            <Button
              onClick={() => {
                if (process.env.NODE_ENV === "development") {
                  navigate("/users/me");
                } else {
                  setHref(`${VITE_PRODUCTION_BASE_URL}users/me`);
                }
              }}
              className="bg-blue-500 hover:bg-blue-400"
            >
              Back to SPMS
            </Button>
          </div>
        ) : null}
        <div className="flex justify-center py-5">
          <ChakraButton
            onClick={() => navigate("/staff")}
            variant={"link"}
            leftIcon={<ChevronLeft />}
          >
            Back to Search
          </ChakraButton>
        </div>

        {/* Name, Title and Tag */}
        <div className="flex w-full flex-col justify-center p-4 text-center">
          <p className="text-2xl font-bold">{fullName}</p>
          <p className="mt-4 text-balance font-semibold text-slate-700 dark:text-slate-400">
            {positionTitle}
            {branchName && `, ${branchName}`}
          </p>
          <div className="mt-4 flex items-center justify-center">
            <p className="text-balance text-muted-foreground">
              {tags?.map((word: string) => word).join(" | ")}
            </p>
            {userData?.pk === usersPk && buttonsVisible ? (
              <Button
                onClick={() => {}}
                className="ml-4 bg-blue-500 hover:bg-blue-400"
              >
                Edit
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    ) : (
      <div className="flex flex-col">
        {/* Back button */}
        <div
          className="flex cursor-pointer justify-center py-5 hover:underline"
          onClick={() => navigate("/staff")}
        >
          <ChevronLeft />
          <p className="font-semibold dark:text-slate-300">Back to Search</p>
        </div>

        {/* Name, Title and Tag */}
        <div className="flex w-full flex-col justify-center p-4 text-center dark:text-slate-300">
          <p className="text-2xl font-bold">{fullName}</p>
          <p className="mt-4 text-balance font-semibold text-slate-700 dark:text-slate-400">
            {positionTitle}
            {branchName && `, ${branchName}`}
          </p>
          <p className="mt-4 text-balance text-muted-foreground">
            {tags?.map((word: string) => word).join(" | ")}
          </p>
        </div>
      </div>
    )
  ) : (
    <Center p={4}>
      <Spinner />
    </Center>
  );
};
export default StaffHero;
