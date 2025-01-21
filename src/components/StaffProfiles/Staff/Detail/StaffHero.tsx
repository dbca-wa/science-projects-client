import { useStaffProfileHero } from "@/lib/hooks/tanstack/useStaffProfileHero";
import { IStaffProfileBaseData, IStaffProfileHeroData, IUserMe } from "@/types";
import { Center, Button as ChakraButton, Spinner } from "@chakra-ui/react";
import { ChevronLeft } from "lucide-react";
import { MdEdit } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import {
  SendUserEmailDialog,
  SendUserEmailMobileDrawer,
} from "../All/ScienceStaffSearchResult";
import AddItemButton from "./AddItemButton";
import { useMediaQuery } from "@/lib/utils/useMediaQuery";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useEffect, useRef, useState } from "react";
import EditStaffHeroContent from "../../Modals/EditStaffKeywordsContent";
import React from "react";
import useApiEndpoint from "@/lib/hooks/helper/useApiEndpoint";
import { Button } from "@/components/ui/button";

interface IStaffHeroProp {
  viewingUser: IUserMe;
  usersPk: string;
  buttonsVisible: boolean;
  baseData: IStaffProfileBaseData;
  refetchBaseData: () => void;
}

const StaffHero = ({
  usersPk,
  buttonsVisible,
  viewingUser,
  baseData,
  refetchBaseData,
}: IStaffHeroProp) => {
  const navigate = useNavigate();
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const { staffHeroData, staffHeroLoading, refetch } =
    useStaffProfileHero(usersPk);

  // useEffect(() => console.log(staffHeroData), [staffHeroData]);
  const baseAPI = useApiEndpoint();
  const [isImageError, setIsImageError] = useState(false);

  return !staffHeroLoading ? (
    // MOBILE
    !isDesktop ? (
      <div className="mb-2">
        <div className="flex flex-col">
          {/* Back button */}
          <div className="mr-4 flex justify-center py-5">
            <ChakraButton
              onClick={() => navigate("/staff")}
              variant={"link"}
              // bg={"gray.500"}
              leftIcon={<ChevronLeft />}
              color={"black"}
            >
              Back
            </ChakraButton>
          </div>
          {/* Image (if exists) */}
          {staffHeroData?.user?.avatar && !isImageError && (
            <div className="flex justify-center">
              <img
                src={
                  staffHeroData?.user?.avatar
                    ? staffHeroData?.user?.avatar?.file?.startsWith("http")
                      ? `${staffHeroData?.user?.avatar?.file}`
                      : `${baseAPI}${staffHeroData?.user?.avatar?.file}`
                    : ""
                }
                alt={`Profile of ${staffHeroData?.name}`}
                className="size-28 rounded-lg object-cover"
                onError={() => setIsImageError(true)}
              />
            </div>
          )}
          {/* Name, Title and Tag */}
          <div className="flex w-full flex-col justify-center p-4 pb-2 text-center">
            <p className="text-2xl font-semibold">
              {staffHeroData?.title && `${staffHeroData?.title}. `}
              {staffHeroData?.name}
            </p>

            {staffHeroData?.it_asset_data && (
              <>
                <p className="mt-4 text-balance font-semibold text-slate-600 dark:text-slate-400">
                  {staffHeroData?.it_asset_data?.title
                    ? staffHeroData?.it_asset_data?.title
                    : "Staff Member"}
                </p>
                <p className="mt-2 text-balance text-sm font-medium text-slate-500 dark:text-slate-400">
                  {staffHeroData?.it_asset_data?.unit
                    ? `${staffHeroData?.it_asset_data?.unit}`
                    : ""}

                  {staffHeroData?.it_asset_data?.division
                    ? `, ${staffHeroData?.it_asset_data?.division}`
                    : ""}
                </p>
                <p className="mt-2 text-balance text-sm font-medium text-slate-500 dark:text-slate-400">
                  {staffHeroData?.it_asset_data?.location?.name
                    ? `${staffHeroData?.it_asset_data?.location?.name}`
                    : ""}
                </p>
              </>
            )}
          </div>
        </div>

        {!buttonsVisible ? (
          isDesktop ? (
            <div className="mt-2 flex justify-center">
              <SendUserEmailDialog
                name={`${staffHeroData?.user?.display_first_name} ${staffHeroData?.user?.display_last_name}`}
                pk={staffHeroData?.user?.pk}
              />
            </div>
          ) : (
            <div className="mt-2 flex justify-center">
              <SendUserEmailMobileDrawer
                name={`${staffHeroData?.user?.display_first_name} ${staffHeroData?.user?.display_last_name}`}
                pk={staffHeroData?.user?.pk}
              />
            </div>
          )
        ) : null}
      </div>
    ) : (
      // DESKTOP
      <div className="mb-2 px-4">
        <div className="mt-6 flex flex-col">
          {/* Back button */}
          <div className="">
            <ChakraButton
              onClick={() => navigate("/staff")}
              variant={"link"}
              // bg={"gray.500"}
              leftIcon={<ChevronLeft />}
              color={"black"}
            >
              Back to Search
            </ChakraButton>
          </div>

          {/* Main Content Container */}
          <div className="mt-4 flex">
            {/* Image (if exists and loads successfully) */}
            {staffHeroData?.user?.avatar && !isImageError && (
              <img
                src={
                  staffHeroData?.user?.avatar
                    ? staffHeroData?.user?.avatar?.file?.startsWith("http")
                      ? `${staffHeroData?.user?.avatar?.file}`
                      : `${baseAPI}${staffHeroData?.user?.avatar?.file}`
                    : ""
                }
                alt={`Profile of ${staffHeroData?.name}`}
                className="mr-4 size-[150px] flex-shrink-0 rounded-lg object-cover"
                onError={() => setIsImageError(true)}
              />
            )}
            {/* Name, Title and Tag, email */}
            <div className="flex w-full flex-col px-2">
              <p className="text-2xl font-semibold">
                {staffHeroData?.title && `${staffHeroData?.title}. `}
                {staffHeroData?.name}
              </p>
              {/* Division, Unit, Location */}
              {staffHeroData?.it_asset_data && (
                <>
                  <p className="mt-2 text-balance font-semibold text-slate-600 dark:text-slate-400">
                    {staffHeroData?.it_asset_data?.title
                      ? staffHeroData?.it_asset_data?.title
                      : "Staff Member"}
                  </p>
                  <p className="mt-2 text-balance text-sm font-medium text-slate-500 dark:text-slate-400">
                    {staffHeroData?.it_asset_data?.unit
                      ? `${staffHeroData?.it_asset_data?.unit}`
                      : ""}

                    {staffHeroData?.it_asset_data?.division
                      ? `, ${staffHeroData?.it_asset_data?.division}`
                      : ""}
                  </p>
                  <p className="mt-1 text-balance text-sm font-medium text-slate-500 dark:text-slate-400">
                    {staffHeroData?.it_asset_data?.location?.name
                      ? `${staffHeroData?.it_asset_data?.location?.name}`
                      : ""}
                  </p>
                </>
              )}
              {/* Email btn */}
              {!buttonsVisible ? (
                isDesktop ? (
                  <div className="mt-3">
                    <SendUserEmailDialog
                      name={`${staffHeroData?.user?.display_first_name} ${staffHeroData?.user?.display_last_name}`}
                      pk={staffHeroData?.user?.pk}
                    />
                  </div>
                ) : (
                  <div className="mt-4">
                    <SendUserEmailMobileDrawer
                      name={`${staffHeroData?.user?.display_first_name} ${staffHeroData?.user?.display_last_name}`}
                      pk={staffHeroData?.user?.pk}
                    />
                  </div>
                )
              ) : null}
            </div>
          </div>
        </div>
      </div>
    )
  ) : (
    // LOADING
    <Center p={4}>
      <Spinner />
    </Center>
  );
};
export default StaffHero;
