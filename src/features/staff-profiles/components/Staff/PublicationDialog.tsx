import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/components/ui/dialog";
import AddItemButton from "./Detail/AddItemButton";
import { FaTrashAlt } from "react-icons/fa";
import { MdModeEditOutline } from "react-icons/md";
import { useState } from "react";
import EditStaffPublicationContent from "@/features/staff-profiles/components/modals/EditStaffPublicationContent";
import DeleteStaffPublicationContent from "@/features/staff-profiles/components/modals/DeleteStaffPublicationContent";
import AddStaffPublicationContent from "@/features/staff-profiles/components/modals/AddPublicationContent";
import type { IStaffPublicationEntry } from "@/shared/types";

export const PublicationDialog = ({
  staffProfilePk,
  userPk,
  refetch,
  kind,
  itemPk,
  publicationItem,
}: {
  itemPk?: number;
  staffProfilePk: number;
  userPk: number;
  refetch: () => void;
  kind: "add" | "delete" | "edit";
  publicationItem?: IStaffPublicationEntry;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // const handleOpen = () => setIsOpen(true);
  const handleClose = () => setIsOpen(false);
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger>
        <span className="flex items-center">
          <AddItemButton
            as={"div"}
            ariaLabel={`${kind?.charAt(0).toUpperCase()}${kind?.slice(1)} Publication Button`}
            label={`Click to ${kind} a publication item`}
            onClick={() => {}}
            icon={
              kind === "delete"
                ? FaTrashAlt
                : kind === "edit"
                  ? MdModeEditOutline
                  : undefined
            }
            innerItemSize={kind !== "add" ? "20px" : undefined}
          />
        </span>
      </DialogTrigger>
      <DialogContent className="max-h-[80vh] w-[700px] max-w-[700px] overflow-y-auto text-slate-800">
        <div className="">
          <DialogHeader>
            <DialogTitle className="mt-3 mb-2">
              {`${kind?.charAt(0).toUpperCase()}${kind?.slice(1)}`} Publication
            </DialogTitle>
          </DialogHeader>
          {kind === "add" && (
            <AddStaffPublicationContent
              staffProfilePk={staffProfilePk}
              usersPk={userPk}
              refetch={refetch}
              kind="dialog"
              onClose={handleClose}
            />
          )}
          {kind === "edit" && (
            <EditStaffPublicationContent
              // itemPk={itemPk}
              publicationItem={publicationItem}
              // staffProfilePk={staffProfilePk}
              usersPk={userPk}
              refetch={refetch}
              kind="dialog"
              onClose={handleClose}
            />
          )}
          {kind === "delete" && (
            <DeleteStaffPublicationContent
              publicationItem={publicationItem}
              // staffProfilePk={staffProfilePk}
              usersPk={userPk}
              refetch={refetch}
              kind="dialog"
              onClose={handleClose}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
