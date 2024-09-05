import { useStaffProfileHero } from "@/lib/hooks/tanstack/useStaffProfileHero";
import { IStaffProfileHeroData, IUserMe } from "@/types";
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
import { useEffect, useState } from "react";
import EditStaffHeroContent from "../../Modals/EditStaffHeroContent";
import React from "react";

interface IStaffHeroProp {
  viewingUser: IUserMe;
  usersPk: string;
  buttonsVisible: boolean;
}

const StaffHero = ({
  usersPk,
  buttonsVisible,
  viewingUser,
}: IStaffHeroProp) => {
  const navigate = useNavigate();
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const { staffHeroData, staffHeroLoading, refetch } =
    useStaffProfileHero(usersPk);

  useEffect(() => console.log(staffHeroData), [staffHeroData]);

  return !staffHeroLoading ? (
    <>
      <div className="flex flex-col">
        {/* Back button */}

        <div className="flex justify-center py-5">
          <ChakraButton
            onClick={() => navigate("/staff")}
            variant={"link"}
            leftIcon={<ChevronLeft />}
            color={"black"}
          >
            Back to Search
          </ChakraButton>
        </div>

        {/* Name, Title and Tag */}
        <div className="flex w-full flex-col justify-center p-4 pb-2 text-center">
          <p className="text-2xl font-bold">
            {staffHeroData?.title && `${staffHeroData?.title}. `}
            {staffHeroData?.name}
          </p>

          {staffHeroData?.it_asset_data && (
            <>
              <p className="mt-4 text-balance font-semibold text-slate-700 dark:text-slate-400">
                {staffHeroData?.it_asset_data?.title
                  ? staffHeroData?.it_asset_data?.title
                  : "Staff Member"}
              </p>
              <p className="mt-2 text-balance text-sm font-semibold text-slate-700 dark:text-slate-400">
                {staffHeroData?.it_asset_data?.division
                  ? staffHeroData?.it_asset_data?.division
                  : ""}
                {staffHeroData?.it_asset_data?.unit
                  ? `, ${staffHeroData?.it_asset_data?.unit}`
                  : ""}
              </p>
              <p className="mt-2 text-balance text-sm font-semibold text-slate-600 dark:text-slate-400">
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
                      {(idx + 1) % 5 !== 0 &&
                        idx < staffHeroData.keyword_tags.length - 1 &&
                        " | "}
                      {(idx + 1) % 5 === 0 && <br />}
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
              name={`${staffHeroData?.user?.display_first_name ?? user?.first_name} ${staffHeroData?.user?.display_last_name}`}
              pk={staffHeroData?.user?.pk}
            />
          </div>
        ) : (
          <div className="mt-2 flex justify-center">
            <SendUserEmailMobileDrawer
              name={`${staffHeroData?.user?.display_first_name ?? user?.first_name} ${staffHeroData?.user?.display_last_name}`}
              pk={staffHeroData?.user?.pk}
            />
          </div>
        )
      ) : null}
    </>
  ) : (
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
