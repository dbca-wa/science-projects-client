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
import { useMediaQuery } from "@/lib/utils/useMediaQuery";
import { IStaffUserResult } from "@/types";
import { Building, Mail, MapPin, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import EmailStaffMemberContent from "../../Modals/EmailStaffMemberContent";
import { useState } from "react";

const ScienceStaffSearchResult = ({
  pk,
  name,
  title,
  position,
  unit,
  location,
  division,
  // branch,
  disableEmailButton,
}: IStaffUserResult) => {
  const navigate = useNavigate();
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const ignoredTitles = ["ms", "mrs", "mr", "master"];

  return (
    <div className="min-h-48 rounded-md border border-blue-300 p-6">
      <h4
        className="cursor-pointer text-balance text-lg font-bold text-blue-600 hover:text-blue-500 hover:underline"
        onClick={() => {
          const staffId = pk;
          if (!disableEmailButton) {
            navigate(`/staff/${staffId}`);
          }
        }}
      >
        {title &&
          !ignoredTitles.includes(title) &&
          `${title[0].toLocaleUpperCase()}${title.slice(1)}. `}{" "}
        {name}
      </h4>
      <div className="my-3">
        {position && (
          <span className="flex items-center">
            <User className="mt-[2px] self-start" size={"15px"} />
            <p className="ml-2 flex-1 text-balance text-sm">{position}</p>
          </span>
        )}
        {division && (
          <span className="flex items-center">
            <Building className="mt-[2px] self-start" size={"15px"} />
            <p className="ml-2 flex-1 text-balance text-sm">
              {division}, {unit}
            </p>
          </span>
        )}
        {location && (
          <span className="flex items-center">
            <MapPin className="mt-[2px] self-start" size={"15px"} />
            <div className="ml-2 flex-1 text-sm">
              <p>{`${location?.name?.trim()}`}</p>
            </div>
          </span>
        )}

        {disableEmailButton === true ? (
          <span className="flex items-center">
            <Mail className="mt-[2px] self-start" size={"15px"} />
            <a className="ml-2 flex-1 cursor-pointer text-sm font-semibold text-blue-600">
              Email {`${name}`}
            </a>
          </span>
        ) : isDesktop ? (
          <SendUserEmailDialog name={`${name}`} pk={pk} />
        ) : (
          <SendUserEmailMobileDrawer name={`${name}`} pk={pk} />
        )}
      </div>
    </div>
  );
};

export const SendUserEmailDialog = ({ name, pk }: IStaffUserResult) => {
  const [isOpen, setIsOpen] = useState(false);
  const handleClose = () => setIsOpen(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <span className="flex items-center">
          <Mail className="mt-[3px] self-start" size={"15px"} />
          <a className="ml-2 flex-1 cursor-pointer text-sm font-semibold text-blue-600 hover:underline">
            Email {`${name}`}
          </a>
        </span>
      </DialogTrigger>
      <DialogContent className="p-4 text-slate-800 sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="mb-2 mt-3">Email {`${name}`}</DialogTitle>
        </DialogHeader>

        <EmailStaffMemberContent
          pk={pk}
          name={name}
          kind={"dialog"}
          onClose={handleClose}
        />
      </DialogContent>
    </Dialog>
  );
};

export const SendUserEmailMobileDrawer = ({
  name,
  pk,
  // email,
}: IStaffUserResult) => {
  const [isOpen, setIsOpen] = useState(false);
  const handleClose = () => setIsOpen(false);

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerTrigger>
        <span className="flex items-center">
          <Mail className="mt-[3px] self-start" size={"15px"} />
          <a className="ml-2 flex-1 cursor-pointer text-sm font-semibold text-blue-600 hover:underline">
            Email {`${name}`}
          </a>
        </span>
      </DrawerTrigger>
      <DrawerContent className="p-4">
        <div className="mx-auto w-full max-w-sm text-slate-800">
          <DrawerHeader>
            <DrawerTitle className="mb-2 mt-3">Email {`${name}`}</DrawerTitle>
          </DrawerHeader>
          <EmailStaffMemberContent
            kind={"drawer"}
            pk={pk}
            name={name}
            onClose={handleClose}
          />
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default ScienceStaffSearchResult;
