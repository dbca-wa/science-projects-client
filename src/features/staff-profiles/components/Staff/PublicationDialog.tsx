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
import EditStaffPublicationContent from "../Modals/EditStaffPublicationContent";
import DeleteStaffPublicationContent from "../Modals/DeleteStaffPublicationContent";
import AddStaffPublicationContent from "../Modals/AddPublicationContent";
import type { IStaffPublicationEntry } from "@/shared/types/index.d";

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
            bgColor={
              kind === "edit"
                ? "green.500"
                : kind === "delete"
                  ? "red.500"
                  : "blue.500"
            }
            _hover={{
              bg:
                kind === "edit"
                  ? "green.400"
                  : kind === "delete"
                    ? "red.400"
                    : "blue.400",
            }}
            mr={kind === "edit" ? 2 : undefined}
            innerItemSize={kind !== "add" ? "20px" : undefined}
            p={kind !== "add" ? 1 : undefined}
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
