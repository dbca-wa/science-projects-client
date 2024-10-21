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
import EditStaffHeroContent from "../../Modals/EditStaffHeroContent";
import React from "react";
import useApiEndpoint from "@/lib/hooks/helper/useApiEndpoint";

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
                className="h-28 w-28 rounded-lg object-cover"
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
            <div
              className={`flex flex-col items-center justify-center ${staffHeroData?.keyword_tags.length > 0 && "mb-1 mt-1"}`}
            >
              <p
                className={`text-balance text-muted-foreground ${staffHeroData?.keyword_tags?.length > 0 && "mt-3"}`}
              >
                {staffHeroData?.keyword_tags?.map(
                  (tag: { pk: number; name: string }, idx: number) => {
                    return (
                      <React.Fragment key={tag.pk}>
                        {tag.name}
                        {(idx + 1) % 3 !== 0 &&
                          idx < staffHeroData.keyword_tags.length - 1 &&
                          " | "}
                        {(idx + 1) % 3 === 0 && <br />}
                      </React.Fragment>
                    );
                  },
                )}
              </p>
              {(String(viewingUser?.pk) === usersPk ||
                viewingUser?.is_superuser) &&
              buttonsVisible ? (
                <>
                  <div className="mt-4 flex">
                    {(staffHeroData?.keyword_tags?.length === 0 ||
                      !staffHeroData?.keyword_tags) && (
                      <p className="text-balance text-muted-foreground">
                        No keywords
                      </p>
                    )}
                    {isDesktop ? (
                      <EditKeywordsDialog
                        userPk={Number(usersPk)}
                        refetch={refetch}
                        staffHeroData={staffHeroData}
                      />
                    ) : (
                      <EditKeywordsDrawer
                        userPk={Number(usersPk)}
                        refetch={refetch}
                        staffHeroData={staffHeroData}
                      />
                    )}
                  </div>
                </>
              ) : null}
            </div>
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
                className="mr-4 h-44 w-44 flex-shrink-0 rounded-lg object-cover"
                onError={() => setIsImageError(true)}
              />
            )}
            {/* Name, Title and Tag, email, keywords */}
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
          {/* Keywords */}
          <div
            className={`pb-4 pt-0 ${staffHeroData?.keyword_tags.length > 0 && "max-w-full border-b-2 border-gray-100"}`}
          >
            <div className="flex items-center">
              <TagList staffHeroData={staffHeroData} />

              {buttonsVisible === true ? (
                String(viewingUser?.pk) === usersPk ||
                viewingUser?.is_superuser ? (
                  <div
                    className={`${staffHeroData?.keyword_tags?.length < 1 ? "mt-4" : ""}`}
                  >
                    <EditKeywordsDialog
                      userPk={Number(usersPk)}
                      refetch={refetch}
                      staffHeroData={staffHeroData}
                    />
                  </div>
                ) : (
                  <div
                    className={`${staffHeroData?.keyword_tags?.length < 1 ? "mt-4" : ""}`}
                  >
                    <EditKeywordsDrawer
                      userPk={Number(usersPk)}
                      refetch={refetch}
                      staffHeroData={staffHeroData}
                    />
                  </div>
                )
              ) : null}
            </div>
            {(String(viewingUser?.pk) === usersPk ||
              viewingUser?.is_superuser) &&
            buttonsVisible ? (
              <>
                <div className="mt-2 flex items-center">
                  {(staffHeroData?.keyword_tags?.length === 0 ||
                    !staffHeroData?.keyword_tags) && (
                    <p className="text-balance text-muted-foreground">
                      No keywords
                    </p>
                  )}
                  {/* {isDesktop &&
                  (String(viewingUser?.pk) === usersPk ||
                    viewingUser?.is_superuser) &&
                  buttonsVisible ? (
                    <EditKeywordsDialog
                      userPk={Number(usersPk)}
                      refetch={refetch}
                      staffHeroData={staffHeroData}
                    />
                  ) : (
                    <EditKeywordsDrawer
                      userPk={Number(usersPk)}
                      refetch={refetch}
                      staffHeroData={staffHeroData}
                    />
                  )} */}
                </div>
              </>
            ) : null}
          </div>
          {/*Keyword end */}
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

const EditKeywordsDialog = ({
  userPk,
  refetch,
  staffHeroData,
}: {
  userPk: number;
  refetch: () => void;
  staffHeroData: IStaffProfileHeroData;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // const handleOpen = () => setIsOpen(true);
  const handleClose = () => setIsOpen(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger
      // asChild
      >
        <span className="flex items-center">
          <AddItemButton
            ml={4}
            // mt={-3}
            icon={MdEdit}
            ariaLabel={"Edit Tags Button"}
            label={"Edit Tags"}
            onClick={() => {}}
            innerItemSize={"20px"}
            p={1}
          />
        </span>
      </DialogTrigger>
      <DialogContent className="max-h-[80vh] w-[700px] max-w-[700px] overflow-y-auto text-slate-800">
        <DialogHeader>
          <DialogTitle className="mb-2 mt-3">Edit Keywords</DialogTitle>
        </DialogHeader>
        <EditStaffHeroContent
          sectionKind="keyword_tags"
          staffHeroData={staffHeroData}
          usersPk={userPk}
          refetch={refetch}
          onClose={handleClose}
          kind={"dialog"}
        />{" "}
      </DialogContent>
    </Dialog>
  );
};

const EditKeywordsDrawer = ({
  userPk,
  refetch,
  staffHeroData,
}: {
  userPk: number;
  refetch: () => void;
  staffHeroData: IStaffProfileHeroData;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // const handleOpen = () => setIsOpen(true);
  const handleClose = () => setIsOpen(false);

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerTrigger>
        <span className="flex items-center">
          <AddItemButton
            ml={4}
            // mt={-3}
            icon={MdEdit}
            ariaLabel={"Edit Tags Button"}
            label={"Edit Tags"}
            onClick={() => {}}
            innerItemSize={"20px"}
            p={1}
            outline={"none"}
          />
        </span>
      </DrawerTrigger>
      <DrawerContent className="p-3">
        <div className="mx-auto w-full max-w-sm text-slate-800">
          <div className="no-scrollbar max-h-screen overflow-x-hidden overflow-y-scroll">
            <DrawerHeader>
              <DrawerTitle className="mb-2 mt-3">Edit Keywords</DrawerTitle>
            </DrawerHeader>
            <EditStaffHeroContent
              sectionKind="keyword_tags"
              staffHeroData={staffHeroData}
              usersPk={userPk}
              refetch={refetch}
              onClose={handleClose}
              kind={"drawer"}
            />{" "}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

const TagList = ({ staffHeroData }) => {
  const containerRef = useRef(null);

  return (
    <p
      ref={containerRef}
      className={`text-balance text-muted-foreground ${staffHeroData?.keyword_tags?.length > 0 && "mt-3"}`}
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "0.25rem",
        whiteSpace: "normal",
        wordBreak: "break-word",
      }}
    >
      {staffHeroData?.keyword_tags
        ?.sort((a, b) => a.name.localeCompare(b.name))
        ?.map((tag, idx) => {
          return (
            <React.Fragment key={tag.pk}>
              {/* Render the tag */}
              <span
                id={`tag-${idx}`}
                style={{
                  whiteSpace: "normal",
                  overflowWrap: "break-word",
                  display: "inline",
                }}
              >
                {tag.name}
              </span>

              {/* Render the separator, but ensure it doesn’t wrap onto a new line by using a non-breaking space */}
              {idx < staffHeroData.keyword_tags.length - 1 && (
                <span
                  className="separator"
                  style={{
                    marginLeft: "0.05rem",
                    marginRight: "0.05rem",
                  }}
                >
                  &nbsp;|&nbsp;
                </span>
              )}
            </React.Fragment>
          );
        })}
    </p>
  );
};
