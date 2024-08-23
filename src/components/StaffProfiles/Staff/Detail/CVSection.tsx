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
import { useStaffCV } from "@/lib/hooks/tanstack/useStaffCV";
import { useMediaQuery } from "@/lib/utils/useMediaQuery";
import { useEffect, useState } from "react";
import { FaTrashAlt } from "react-icons/fa";
import { MdModeEditOutline } from "react-icons/md";
import AddStaffEducationContent from "../../Modals/AddStaffEducationContent";
import AddStaffEmploymentContent from "../../Modals/AddStaffEmploymentContent";
import DeleteStaffEducationContent from "../../Modals/DeleteStaffEducationContent";
import DeleteStaffEmploymentContent from "../../Modals/DeleteStaffEmploymentContent";
import EditStaffEducationContent from "../../Modals/EditStaffEducationContent";
import EditStaffEmploymentContent from "../../Modals/EditStaffEmploymentContent";
import AddItemButton from "./AddItemButton";
import EducationEntry from "./EducationEntry";
import EmploymentEntry from "./EmploymentEntry";
import Subsection from "./Subsection";
import { IStaffEducationEntry, IStaffEmploymentEntry, IUserMe } from "@/types";

const CVSection = ({
  userId,
  buttonsVisible,
  viewingUser,
}: {
  viewingUser: IUserMe;
  userId: number;
  buttonsVisible: boolean;
}) => {
  const { staffCVData, staffCVLoading, refetch } = useStaffCV(userId);
  // useEffect(() => console.log(buttonsVisible), [buttonsVisible]);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  return (
    <>
      {!staffCVLoading ? (
        <>
          <Subsection
            title="Employment"
            divider
            button={
              (viewingUser?.pk === userId || viewingUser?.is_superuser) &&
              buttonsVisible ? (
                isDesktop ? (
                  <>
                    <EmploymentDialog
                      kind="add"
                      userPk={userId}
                      refetch={refetch}
                      staffProfilePk={staffCVData?.pk}
                    />
                  </>
                ) : (
                  <>
                    <EmploymentDrawer
                      kind="add"
                      userPk={userId}
                      refetch={refetch}
                      staffProfilePk={staffCVData?.pk}
                    />
                  </>
                )
              ) : undefined
            }
          >
            {staffCVData?.employment
              ?.sort((a, b) => {
                // First, sort by start_year (descending)

                if (Number(a.start_year) !== Number(b.start_year)) {
                  return Number(b.start_year) - Number(a.start_year);
                }
                // If start_year is the same, sort by end_year (descending)
                if (Number(a.end_year) !== Number(b.end_year)) {
                  return Number(b.end_year) - Number(a.end_year);
                }
                // If both start_year and end_year are the same, sort by position_title alphabetically (ascending)
                return a.position_title.localeCompare(b.position_title);
              })
              ?.map((employmentItem, index) => (
                <EmploymentEntry
                  refetch={refetch}
                  buttonsVisible={buttonsVisible}
                  key={`Employment${index}`}
                  pk={employmentItem?.pk}
                  public_profile={employmentItem?.public_profile}
                  position_title={employmentItem?.position_title}
                  start_year={employmentItem?.start_year}
                  end_year={employmentItem?.end_year}
                  employer={employmentItem?.employer}
                  section={employmentItem?.section}
                />
              ))}

            {staffCVData?.employment?.length === 0 && (
              <div>
                <p>No information recorded</p>
              </div>
            )}
          </Subsection>

          <Subsection
            title="Education"
            divider
            button={
              (viewingUser?.pk === userId || viewingUser?.is_superuser) &&
              buttonsVisible ? (
                isDesktop ? (
                  <>
                    <EducationDialog
                      kind="add"
                      userPk={userId}
                      refetch={refetch}
                      staffProfilePk={staffCVData?.pk}
                    />
                  </>
                ) : (
                  <>
                    <EducationDrawer
                      kind="add"
                      userPk={userId}
                      refetch={refetch}
                      staffProfilePk={staffCVData?.pk}
                    />
                  </>
                )
              ) : undefined
            }
          >
            {staffCVData?.education
              ?.sort((a, b) => {
                // First, sort by start_year (descending)

                if (Number(a.start_year) !== Number(b.start_year)) {
                  return Number(b.start_year) - Number(a.start_year);
                }
                // If start_year is the same, sort by end_year (descending)
                if (Number(a.end_year) !== Number(b.end_year)) {
                  return Number(b.end_year) - Number(a.end_year);
                }
                // If both start_year and end_year are the same, sort by position_title alphabetically (ascending)
                return a.qualification_name.localeCompare(b.qualification_name);
              })
              ?.map((educationItem, index) => (
                <EducationEntry
                  buttonsVisible={buttonsVisible}
                  refetch={refetch}
                  key={`Education${index}`}
                  pk={educationItem?.pk}
                  public_profile={educationItem?.public_profile}
                  qualification_field={educationItem?.qualification_field}
                  qualification_name={educationItem?.qualification_name}
                  qualification_kind={educationItem?.qualification_kind}
                  start_year={educationItem?.start_year}
                  end_year={educationItem?.end_year}
                  institution={educationItem?.institution}
                  location={educationItem?.location}
                />
              ))}
            {staffCVData?.education?.length === 0 && (
              <div>
                <p>No information recorded</p>
              </div>
            )}
          </Subsection>
        </>
      ) : null}
    </>
  );
};

export default CVSection;

// Modals and Dialogs (ADD, EDIT, DELETE)
export const EmploymentDialog = ({
  staffProfilePk,
  userPk,
  itemPk,
  refetch,
  kind,
  employmentItem,
}: {
  staffProfilePk: number;
  userPk: number;
  itemPk?: number;
  refetch: () => void;
  kind: "add" | "delete" | "edit";
  employmentItem?: IStaffEmploymentEntry;
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
            as={"div"}
            ariaLabel={`${kind.charAt(0).toUpperCase()}${kind.slice(1)} Employment Button`}
            label={`Click to ${kind} an employment item`}
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
      <DialogContent className="text-slate-800 sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="mb-2 mt-3">
            {`${kind.charAt(0).toUpperCase()}${kind.slice(1)}`} Employment
          </DialogTitle>
        </DialogHeader>

        {kind === "add" && (
          <AddStaffEmploymentContent
            staffProfilePk={staffProfilePk}
            usersPk={userPk}
            refetch={refetch}
            kind="dialog"
            onClose={handleClose}
          />
        )}
        {kind === "edit" && (
          <EditStaffEmploymentContent
            // staffProfilePk={staffProfilePk}
            employmentItem={employmentItem}
            usersPk={userPk}
            refetch={refetch}
            kind="dialog"
            onClose={handleClose}
          />
        )}
        {kind === "delete" && (
          <DeleteStaffEmploymentContent
            // staffProfilePk={staffProfilePk}
            usersPk={userPk}
            employmentItem={employmentItem}
            refetch={refetch}
            kind="dialog"
            onClose={handleClose}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export const EmploymentDrawer = ({
  userPk,
  refetch,
  staffProfilePk,
  kind,
  itemPk,
  employmentItem,
}: {
  staffProfilePk: number;
  userPk: number;
  itemPk?: number;
  refetch: () => void;
  kind: "add" | "delete" | "edit";
  employmentItem?: IStaffEmploymentEntry;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // const handleOpen = () => setIsOpen(true);
  const handleClose = () => setIsOpen(false);

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerTrigger>
        <span className="flex items-center">
          <AddItemButton
            as={"div"}
            ariaLabel={`${kind.charAt(0).toUpperCase()}${kind.slice(1)} Employment Button`}
            label={`Click to ${kind} an employment item`}
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
      </DrawerTrigger>
      <DrawerContent>
        <div className="mx-auto w-full max-w-sm text-slate-800">
          <DrawerHeader>
            <DrawerTitle className="mb-2 mt-3">
              {`${kind.charAt(0).toUpperCase()}${kind.slice(1)}`} Employment
            </DrawerTitle>
          </DrawerHeader>
          {kind === "add" && (
            <AddStaffEmploymentContent
              staffProfilePk={staffProfilePk}
              usersPk={userPk}
              refetch={refetch}
              kind="drawer"
              onClose={handleClose}
            />
          )}
          {kind === "edit" && (
            <EditStaffEmploymentContent
              // staffProfilePk={staffProfilePk}
              employmentItem={employmentItem}
              usersPk={userPk}
              refetch={refetch}
              kind="dialog"
              onClose={handleClose}
            />
          )}
          {kind === "delete" && (
            <DeleteStaffEmploymentContent
              employmentItem={employmentItem}
              // staffProfilePk={staffProfilePk}
              usersPk={userPk}
              refetch={refetch}
              kind="dialog"
              onClose={handleClose}
            />
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export const EducationDialog = ({
  userPk,
  staffProfilePk,
  refetch,
  kind,
  itemPk,
  educationItem,
}: {
  itemPk?: number;
  userPk: number;
  staffProfilePk: number;
  refetch: () => void;
  kind: "add" | "delete" | "edit";
  educationItem?: IStaffEducationEntry;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // const handleOpen = () => setIsOpen(true);
  const handleClose = () => setIsOpen(false);
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger
      // asChild
      >
        {/*         
        <AddItemButton
              as={"div"}
              ariaLabel={"Edit Education Button"}
              label={"Click to edit this entry"}
              onClick={() => {}}
              icon={MdModeEditOutline}
              bgColor={"green.500"}
              _hover={{ bg: "green.400" }}
              mr={2}
              innerItemSize="20px"
              p={1}
            />
            <AddItemButton
              as={"div"}
              ariaLabel={"Delete Education Button"}
              label={"Click to delete this entry"}
              onClick={() => {}}
              icon={FaTrashAlt}
              bgColor={"red.500"}
              _hover={{ bg: "red.400" }}
              innerItemSize="20px"
              p={1}
            /> */}
        <span className="flex items-center">
          <AddItemButton
            as={"div"}
            ariaLabel={`${kind?.charAt(0).toUpperCase()}${kind?.slice(1)} Education Button`}
            label={`Click to ${kind} an education item`}
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
      <DialogContent className="text-slate-800 sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="mb-2 mt-3">
            {`${kind?.charAt(0)?.toUpperCase()}${kind?.slice(1)}`} Education
          </DialogTitle>
        </DialogHeader>
        {kind === "add" && (
          <AddStaffEducationContent
            staffProfilePk={staffProfilePk}
            usersPk={userPk}
            refetch={refetch}
            kind="dialog"
            onClose={handleClose}
          />
        )}
        {kind === "edit" && (
          <EditStaffEducationContent
            // itemPk={itemPk}
            educationItem={educationItem}
            // staffProfilePk={staffProfilePk}
            usersPk={userPk}
            refetch={refetch}
            kind="dialog"
            onClose={handleClose}
          />
        )}
        {kind === "delete" && (
          <DeleteStaffEducationContent
            educationItem={educationItem}
            // staffProfilePk={staffProfilePk}
            usersPk={userPk}
            refetch={refetch}
            kind="dialog"
            onClose={handleClose}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export const EducationDrawer = ({
  staffProfilePk,
  userPk,
  refetch,
  kind,
  itemPk,
  educationItem,
}: {
  itemPk?: number;
  staffProfilePk: number;
  userPk: number;
  refetch: () => void;
  kind: "add" | "delete" | "edit";
  educationItem?: IStaffEducationEntry;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // const handleOpen = () => setIsOpen(true);
  const handleClose = () => setIsOpen(false);
  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerTrigger>
        <span className="flex items-center">
          <AddItemButton
            as={"div"}
            ariaLabel={`${kind?.charAt(0).toUpperCase()}${kind?.slice(1)} Education Button`}
            label={`Click to ${kind} an education item`}
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
      </DrawerTrigger>
      <DrawerContent>
        <div className="mx-auto w-full max-w-sm text-slate-800">
          <DrawerHeader>
            <DrawerTitle className="mb-2 mt-3">
              {`${kind?.charAt(0).toUpperCase()}${kind?.slice(1)}`} Education
            </DrawerTitle>
          </DrawerHeader>
          {kind === "add" && (
            <AddStaffEducationContent
              staffProfilePk={staffProfilePk}
              usersPk={userPk}
              refetch={refetch}
              kind="dialog"
              onClose={handleClose}
            />
          )}
          {kind === "edit" && (
            <EditStaffEducationContent
              // itemPk={itemPk}
              educationItem={educationItem}
              // staffProfilePk={staffProfilePk}
              usersPk={userPk}
              refetch={refetch}
              kind="dialog"
              onClose={handleClose}
            />
          )}
          {kind === "delete" && (
            <DeleteStaffEducationContent
              educationItem={educationItem}
              // staffProfilePk={staffProfilePk}
              usersPk={userPk}
              refetch={refetch}
              kind="dialog"
              onClose={handleClose}
            />
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
};
