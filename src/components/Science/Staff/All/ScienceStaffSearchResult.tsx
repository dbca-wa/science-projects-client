import { IStaffUserResult } from "@/types";
import { Building, Mail, MapPin, User } from "lucide-react";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import EmailStaffMemberContent from "../../Modals/EmailStaffMemberContent";
import { useNavigate } from "react-router-dom";
import { useMediaQuery } from "@/lib/utils/useMediaQuery";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const ScienceStaffSearchResult = ({
  first_name,
  last_name,
  email,
  title,
  branch,
  position,
  address,
}: IStaffUserResult) => {
  const navigate = useNavigate();
  const isDesktop = useMediaQuery("(min-width: 768px)");

  return (
    <div className="rounded-md border border-blue-100 p-2">
      <h4
        className="cursor-pointer text-balance text-lg font-bold text-blue-600 hover:text-blue-500 hover:underline"
        onClick={() => {
          const staffId = 1;
          navigate(`/staff/${staffId}`);
        }}
      >
        {title && `${title} `} {first_name} {last_name}
      </h4>
      <div className="my-3">
        {position && (
          <span className="flex items-center">
            <User className="mt-[2px] self-start" size={"15px"} />
            <p className="ml-2 flex-1 text-balance text-sm">{position}</p>
          </span>
        )}
        {branch && (
          <span className="flex items-center">
            <Building className="mt-[2px] self-start" size={"15px"} />
            <p className="ml-2 flex-1 text-sm">{branch}</p>
          </span>
        )}
        {address && (
          <span className="flex items-center">
            <MapPin className="mt-[2px] self-start" size={"15px"} />
            <p className="ml-2 flex-1 text-sm">{address}</p>
          </span>
        )}
        {email &&
          (!isDesktop ? (
            <SendUserEmailMobileDrawer
              first_name={first_name}
              last_name={last_name}
              email={email}
            />
          ) : (
            <EmailStaffDialog
              first_name={first_name}
              last_name={last_name}
              email={email}
            />
          ))}
      </div>
    </div>
  );
};

const EmailStaffDialog = ({
  first_name,
  last_name,
  email,
}: IStaffUserResult) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <span className="flex items-center">
          <Mail className="mt-[2px] self-start" size={"15px"} />
          <a className="ml-2 flex-1 cursor-pointer text-sm font-semibold text-blue-600">
            Email {`${first_name} ${last_name}`}
          </a>
        </span>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <EmailStaffMemberContent email={email} />
      </DialogContent>
    </Dialog>
  );
};

const SendUserEmailMobileDrawer = ({
  first_name,
  last_name,
  email,
}: IStaffUserResult) => {
  return (
    <Drawer>
      <DrawerTrigger>
        <span className="flex items-center">
          <Mail className="mt-[2px] self-start" size={"15px"} />
          <a className="ml-2 flex-1 cursor-pointer text-sm font-semibold text-blue-600">
            Email {`${first_name} ${last_name}`}
          </a>
        </span>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerTitle className="mb-2 mt-3">
          Email {`${first_name} ${last_name}`}
        </DrawerTitle>
        <DrawerDescription className="hidden">
          Emailing {`${first_name} ${last_name}`}
        </DrawerDescription>
        <EmailStaffMemberContent email={email} />
      </DrawerContent>
    </Drawer>
  );
};

export default ScienceStaffSearchResult;
