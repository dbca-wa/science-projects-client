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
import { useEffect } from "react";
import { MdEdit } from "react-icons/md";
import EditStaffAboutContent from "../../Modals/EditStaffAboutContent";
import EditStaffExpertiseContent from "../../Modals/EditStaffExpertiseContent";
import SimpleSkeletonSection from "../../SimpleSkeletonSection";
import AddItemButton from "./AddItemButton";
import Subsection from "./Subsection";

const OverviewSection = ({
  userId,
  buttonsVisible,
}: {
  userId: number;
  buttonsVisible: boolean;
}) => {
  const { staffOverviewLoading, staffOverviewData } = useStaffOverview(userId);

  useEffect(() => {
    console.log(buttonsVisible);
  }, [buttonsVisible]);
  const isDesktop = useMediaQuery("(min-width: 768px");

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
              buttonsVisible ? (
                isDesktop ? (
                  <EditAboutDialog userPk={userId} />
                ) : (
                  <EditAboutDrawer userPk={userId} />
                )
              ) : undefined
            }
          >
            {staffOverviewData?.about ? (
              <div>
                <div
                  dangerouslySetInnerHTML={{ __html: staffOverviewData?.about }}
                />
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
              buttonsVisible ? (
                isDesktop ? (
                  <EditExpertiseDialog userPk={userId} />
                ) : (
                  <EditExpertiseDrawer userPk={userId} />
                )
              ) : undefined
            }
          >
            {staffOverviewData?.expertise ? (
              <div>
                <div
                  dangerouslySetInnerHTML={{
                    __html: staffOverviewData?.expertise,
                  }}
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

const EditAboutDialog = ({ userPk }: { userPk: number }) => {
  return (
    <Dialog>
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
      <DialogContent className="text-slate-800 sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="mb-2 mt-3">Edit About</DialogTitle>
        </DialogHeader>

        <EditStaffAboutContent
          staffProfilePk={0}
          usersPk={0}
          refetch={function (): void {
            throw new Error("Function not implemented.");
          }}
          onClose={function (): void {
            throw new Error("Function not implemented.");
          }}
          kind={"dialog"}
        />
      </DialogContent>
    </Dialog>
  );
};

const EditAboutDrawer = ({ userPk }: { userPk: number }) => {
  return (
    <Drawer>
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
      <DrawerContent>
        <div className="mx-auto w-full max-w-sm text-slate-800">
          <DrawerHeader>
            <DrawerTitle className="mb-2 mt-3">Edit About</DrawerTitle>
          </DrawerHeader>
          <EditStaffAboutContent
            staffProfilePk={0}
            usersPk={0}
            refetch={function (): void {
              throw new Error("Function not implemented.");
            }}
            onClose={function (): void {
              throw new Error("Function not implemented.");
            }}
            kind={"dialog"}
          />{" "}
        </div>
      </DrawerContent>
    </Drawer>
  );
};

const EditExpertiseDialog = ({ userPk }: { userPk: number }) => {
  return (
    <Dialog>
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
      <DialogContent className="text-slate-800 sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="mb-2 mt-3">Edit Expertise</DialogTitle>
        </DialogHeader>
        <EditStaffAboutContent
          staffProfilePk={0}
          usersPk={0}
          refetch={function (): void {
            throw new Error("Function not implemented.");
          }}
          onClose={function (): void {
            throw new Error("Function not implemented.");
          }}
          kind={"dialog"}
        />{" "}
      </DialogContent>
    </Dialog>
  );
};

const EditExpertiseDrawer = ({ userPk }: { userPk: number }) => {
  return (
    <Drawer>
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
      <DrawerContent>
        <div className="mx-auto w-full max-w-sm text-slate-800">
          <DrawerHeader>
            <DrawerTitle className="mb-2 mt-3">Edit Expertise</DrawerTitle>
          </DrawerHeader>
          <EditStaffAboutContent
            staffProfilePk={0}
            usersPk={0}
            refetch={function (): void {
              throw new Error("Function not implemented.");
            }}
            onClose={function (): void {
              throw new Error("Function not implemented.");
            }}
            kind={"dialog"}
          />{" "}
        </div>
      </DrawerContent>
    </Drawer>
  );
};
