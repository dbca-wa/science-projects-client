import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { useStaffOverview } from "@/lib/hooks/tanstack/useStaffOverview";
import { useMediaQuery } from "@/lib/utils/useMediaQuery";
import { useEffect, useRef, useState } from "react";
import { MdEdit } from "react-icons/md";
import EditStaffOverviewContent from "../../Modals/EditStaffOverviewContent";
import SimpleSkeletonSection from "../../SimpleSkeletonSection";
import AddItemButton from "./AddItemButton";
import Subsection from "./Subsection";
import {
  IStaffOverviewData,
  IStaffProfileBaseData,
  IStaffProfileHeroData,
  IUserMe,
} from "@/types";
import DatabaseRichTextEditor from "../../Editor/DatabaseRichTextEditor";
import React from "react";
import EditStaffKeywordsContent from "../../Modals/EditStaffKeywordsContent";
import hasMeaningfulContent from "@/lib/utils/hasMeaningfulContent";

const OverviewSection = ({
  viewingUser,
  userId,
  buttonsVisible,
  // refetchBaseData,
  // baseData,
}: {
  viewingUser: IUserMe;
  userId: number;
  buttonsVisible: boolean;
  // refetchBaseData: () => void;
  // baseData: IStaffProfileBaseData;
}) => {
  const { staffOverviewLoading, staffOverviewData, refetch } =
    useStaffOverview(userId);

  const isDesktop = useMediaQuery("(min-width: 768px)");

  return (
    <div className="w-full">
      {" "}
      {/* Ensure full width */}
      {staffOverviewLoading ? (
        <>
          <SimpleSkeletonSection />
          <SimpleSkeletonSection />
        </>
      ) : staffOverviewData ? (
        <>
          {/* About */}
          <Subsection
            title="About"
            divider
            button={
              (viewingUser?.pk === userId || viewingUser?.is_superuser) &&
              buttonsVisible ? (
                isDesktop ? (
                  <EditAboutDialog
                    userPk={userId}
                    refetch={refetch}
                    staffOverviewData={staffOverviewData}
                  />
                ) : (
                  <EditAboutDrawer
                    userPk={userId}
                    refetch={refetch}
                    staffOverviewData={staffOverviewData}
                  />
                )
              ) : undefined
            }
          >
            {hasMeaningfulContent(staffOverviewData?.about) ? (
              <div className="w-full pt-2">
                <DatabaseRichTextEditor
                  label={"About"}
                  htmlFor={"about"}
                  populationData={staffOverviewData?.about}
                />
              </div>
            ) : (
              <div className="mt-2 flex w-full items-center">
                <p className="text-balance text-muted-foreground">
                  No information available.
                </p>
              </div>
            )}
          </Subsection>

          {/* Expertise */}
          <Subsection
            title="Expertise"
            divider
            button={
              (viewingUser?.pk === userId || viewingUser?.is_superuser) &&
              buttonsVisible ? (
                isDesktop ? (
                  <EditExpertiseDialog
                    userPk={userId}
                    refetch={refetch}
                    staffOverviewData={staffOverviewData}
                  />
                ) : (
                  <EditExpertiseDrawer
                    userPk={userId}
                    refetch={refetch}
                    staffOverviewData={staffOverviewData}
                  />
                )
              ) : undefined
            }
          >
            {hasMeaningfulContent(staffOverviewData?.expertise) ? (
              <div className="mt-2 flex w-full items-center">
                <DatabaseRichTextEditor
                  label={"Expertise"}
                  htmlFor={"expertise"}
                  populationData={staffOverviewData?.expertise}
                />
              </div>
            ) : (
              <div className="w-full">
                <p className="text-balance text-muted-foreground">
                  No information available.
                </p>
              </div>
            )}
          </Subsection>

          {/* Keywords */}
          <Subsection
            title="Fields"
            divider
            button={
              (viewingUser?.pk === userId || viewingUser?.is_superuser) &&
              buttonsVisible ? (
                isDesktop ? (
                  <EditKeywordsDialog
                    userPk={userId}
                    refetch={refetch}
                    staffOverviewData={staffOverviewData}
                  />
                ) : (
                  <EditKeywordsDrawer
                    userPk={userId}
                    refetch={refetch}
                    staffOverviewData={staffOverviewData}
                  />
                )
              ) : undefined
            }
          >
            <div
              className={`pb-4 pt-0 ${staffOverviewData?.keyword_tags.length > 0 && "max-w-full border-gray-100"}`}
            >
              <div className="flex items-center">
                <TagList staffOverviewData={staffOverviewData} />
              </div>
              <div className="mt-1 flex w-full items-center">
                {(staffOverviewData?.keyword_tags?.length === 0 ||
                  !staffOverviewData?.keyword_tags) && (
                  <p className="text-balance text-muted-foreground">
                    No information available.
                  </p>
                )}
              </div>
            </div>
          </Subsection>
        </>
      ) : null}
    </div>
  );
};

export default OverviewSection;

const EditAboutDialog = ({
  userPk,
  refetch,
  staffOverviewData,
}: {
  userPk: number;
  refetch: () => void;
  staffOverviewData: IStaffOverviewData;
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
            icon={MdEdit}
            as={"div"}
            ariaLabel={"Edit About Button"}
            label={"Click to edit your About"}
            onClick={() => {}}
            innerItemSize={"20px"}
            p={1}
          />
        </span>
      </DialogTrigger>
      <DialogContent
        className="max-h-[80vh] w-[700px] max-w-[700px] overflow-y-auto text-slate-800"
        // aria-describedby="edit-about-dialog-description"
        aria-description="Edit your About to provide more information about yourself."
      >
        <DialogHeader>
          <DialogTitle className="mb-2 mt-3">Edit About</DialogTitle>
          <DialogDescription
            id="edit-about-dialog-description"
            className="sr-only"
          >
            Edit your About to provide more information about yourself.
          </DialogDescription>
        </DialogHeader>

        <EditStaffOverviewContent
          sectionKind="about"
          staffOverviewData={staffOverviewData}
          usersPk={userPk}
          refetch={refetch}
          onClose={handleClose}
          kind={"dialog"}
        />
      </DialogContent>
    </Dialog>
  );
};

const EditAboutDrawer = ({
  userPk,
  refetch,
  staffOverviewData,
}: {
  userPk: number;
  refetch: () => void;
  staffOverviewData: IStaffOverviewData;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // const handleOpen = () => setIsOpen(true);
  const handleClose = () => setIsOpen(false);

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerTrigger>
        <span className="flex items-center">
          <AddItemButton
            icon={MdEdit}
            as={"div"}
            ariaLabel={"Edit About Button"}
            label={"Click to edit your About"}
            onClick={() => {}}
            innerItemSize={"20px"}
            p={1}
          />
        </span>
      </DrawerTrigger>
      <DrawerContent
        className="w-full px-3 py-4"
        aria-describedby="edit-about-drawer-description"
      >
        <div className="mx-auto w-full max-w-sm text-slate-800">
          <div className="no-scrollbar max-h-screen overflow-x-hidden overflow-y-scroll">
            <DrawerHeader>
              <DrawerTitle className="mb-2 mt-3">Edit About</DrawerTitle>
              <DrawerDescription
                id="edit-about-drawer-description"
                className="sr-only"
              >
                Edit your About to provide more information about yourself.
              </DrawerDescription>
            </DrawerHeader>
            <EditStaffOverviewContent
              sectionKind="about"
              staffOverviewData={staffOverviewData}
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

const EditExpertiseDialog = ({
  userPk,
  refetch,
  staffOverviewData,
}: {
  userPk: number;
  refetch: () => void;
  staffOverviewData: IStaffOverviewData;
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
            icon={MdEdit}
            as={"div"}
            ariaLabel={"Edit Expertise Button"}
            label={"Click to edit your Expertise"}
            onClick={() => {}}
            innerItemSize={"20px"}
            p={1}
          />
        </span>
      </DialogTrigger>
      <DialogContent className="max-h-[80vh] w-[700px] max-w-[700px] overflow-y-auto text-slate-800">
        <DialogHeader>
          <DialogTitle className="mb-2 mt-3">Edit Expertise</DialogTitle>
        </DialogHeader>
        <EditStaffOverviewContent
          sectionKind="expertise"
          staffOverviewData={staffOverviewData}
          usersPk={userPk}
          refetch={refetch}
          onClose={handleClose}
          kind={"dialog"}
        />{" "}
      </DialogContent>
    </Dialog>
  );
};

const EditExpertiseDrawer = ({
  userPk,
  refetch,
  staffOverviewData,
}: {
  userPk: number;
  refetch: () => void;
  staffOverviewData: IStaffOverviewData;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // const handleOpen = () => setIsOpen(true);
  const handleClose = () => setIsOpen(false);

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerTrigger>
        <span className="flex items-center">
          <AddItemButton
            icon={MdEdit}
            as={"div"}
            ariaLabel={"Edit Expertise Button"}
            label={"Click to edit your Expertise"}
            onClick={() => {}}
            innerItemSize={"20px"}
            p={1}
          />
        </span>
      </DrawerTrigger>
      <DrawerContent className="w-full px-3 py-4">
        <div className="mx-auto w-full max-w-sm text-slate-800">
          <div className="no-scrollbar max-h-screen overflow-x-hidden overflow-y-scroll">
            <DrawerHeader>
              <DrawerTitle className="mb-2 mt-3">Edit Expertise</DrawerTitle>
            </DrawerHeader>
            <EditStaffOverviewContent
              sectionKind="expertise"
              staffOverviewData={staffOverviewData}
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

const EditKeywordsDialog = ({
  userPk,
  refetch,
  staffOverviewData,
}: {
  userPk: number;
  refetch: () => void;
  staffOverviewData: IStaffOverviewData;
}) => {
  const [isOpen, setIsOpen] = useState(false);
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
        <EditStaffOverviewContent
          sectionKind="keyword_tags"
          staffOverviewData={staffOverviewData}
          usersPk={userPk}
          refetch={refetch}
          onClose={handleClose}
          kind={"dialog"}
        />
      </DialogContent>
    </Dialog>
  );
};

const EditKeywordsDrawer = ({
  userPk,
  refetch,
  staffOverviewData,
}: {
  userPk: number;
  refetch: () => void;
  staffOverviewData: IStaffOverviewData;
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
            <EditStaffOverviewContent
              sectionKind="keyword_tags"
              staffOverviewData={staffOverviewData}
              usersPk={userPk}
              refetch={refetch}
              onClose={handleClose}
              kind={"drawer"}
            />
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

const TagList = ({ staffOverviewData }) => {
  const containerRef = useRef(null);

  return (
    <p
      ref={containerRef}
      className={`text-balance ${staffOverviewData?.keyword_tags?.length > 0 && "mt-3"}`}
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "0.25rem",
        whiteSpace: "normal",
        wordBreak: "break-word",
      }}
    >
      {staffOverviewData?.keyword_tags
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
                className="text-[14px] font-medium text-gray-700"
              >
                {/* Trimmed and every first letter capitalized */}
                {tag.name?.trim()?.replace(/\b\w/g, (l) => l.toUpperCase())}
                {idx < staffOverviewData.keyword_tags.length - 1 && ", "}
              </span>

              {/* Render the separator, but ensure it doesn’t wrap onto a new line by using a non-breaking space */}
              {/* {idx < staffOverviewData.keyword_tags.length - 1 && (
                <span
                  className="separator"
                  style={{
                    marginLeft: "0.05rem",
                    marginRight: "0.05rem",
                  }}
                >
                  &nbsp;|&nbsp;
                </span>
              )} */}
            </React.Fragment>
          );
        })}
    </p>
  );
};
