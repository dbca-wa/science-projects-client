import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { useStaffOverview } from "@/lib/hooks/tanstack/useStaffOverview";
import { useMediaQuery } from "@/lib/utils/useMediaQuery";
import { useEffect, useState } from "react";
import { MdEdit } from "react-icons/md";
import EditStaffOverviewContent from "../../Modals/EditStaffOverviewContent";
import SimpleSkeletonSection from "../../SimpleSkeletonSection";
import AddItemButton from "./AddItemButton";
import Subsection from "./Subsection";
import { IStaffOverviewData, IUserMe } from "@/types";
import DatabaseRichTextEditor from "../../Editor/DatabaseRichTextEditor";

const OverviewSection = ({
  viewingUser,
  userId,
  buttonsVisible,
}: {
  viewingUser: IUserMe;
  userId: number;
  buttonsVisible: boolean;
}) => {
  const { staffOverviewLoading, staffOverviewData, refetch } =
    useStaffOverview(userId);

  useEffect(() => {
    console.log(buttonsVisible);
  }, [buttonsVisible]);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  return (
    <div className="">
      {/* Profile/About Me */}
      {staffOverviewLoading ? (
        <>
          <SimpleSkeletonSection />
          <SimpleSkeletonSection />
        </>
      ) : staffOverviewData ? (
        <>
          {/* About Me */}
          <Subsection
            title="About Me"
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
            {staffOverviewData?.about ? (
              <div className="pt-2">
                <DatabaseRichTextEditor
                  label={"About"}
                  htmlFor={"about"}
                  populationData={staffOverviewData?.about}
                />
                {/* <div
                  dangerouslySetInnerHTML={{ __html: staffOverviewData?.about }}
                /> */}
              </div>
            ) : (
              <div>
                <p>No information available.</p>
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
            {staffOverviewData?.expertise ? (
              <div className="pt-2">
                <DatabaseRichTextEditor
                  label={"Expertise"}
                  htmlFor={"expertise"}
                  populationData={staffOverviewData?.expertise}
                />
              </div>
            ) : (
              <div>
                <p>No information available.</p>
              </div>
            )}
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
      <DialogContent className="max-h-[80vh] w-[700px] max-w-[700px] overflow-y-auto text-slate-800">
        <DialogHeader>
          <DialogTitle className="mb-2 mt-3">Edit About</DialogTitle>
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
      <DrawerContent className="p-3">
        <div className="mx-auto w-full max-w-sm text-slate-800">
          <div className="no-scrollbar max-h-screen overflow-x-hidden overflow-y-scroll">
            <DrawerHeader>
              <DrawerTitle className="mb-2 mt-3">Edit About</DrawerTitle>
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
      <DrawerContent className="p-3">
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
