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

const ScienceStaffSearchResult = ({
  pk,
  name,
  email,
  title,
  branch,
  position,
  disableEmailButton,
  // address,
}: IStaffUserResult) => {
  const navigate = useNavigate();
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const ignoredTitles = ["ms", "mrs", "mr", "master"];

  return (
    <div className="min-h-48 rounded-md border border-blue-100 p-6">
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
        {branch?.name && (
          <span className="flex items-center">
            <Building className="mt-[2px] self-start" size={"15px"} />
            <p className="ml-2 flex-1 text-sm">{branch?.name}</p>
          </span>
        )}
        {branch?.address && (
          <span className="flex items-center">
            <MapPin className="mt-[2px] self-start" size={"15px"} />
            <div className="ml-2 flex-1 text-sm">
              {branch?.address?.street && (
                <p>{`${branch?.address?.street?.trim()}`}</p>
              )}
              {branch?.address?.state &&
                branch?.address?.city &&
                branch?.address?.zipcode && (
                  <p>{`${branch?.address?.city?.trim()}, ${branch?.address?.state?.trim()}. ${branch?.address?.zipcode}`}</p>
                )}
            </div>
          </span>
        )}
        {/* {address && (
    
        )} */}
        {email &&
          (!isDesktop ? (
            disableEmailButton === true ? (
              <span className="flex items-center">
                <Mail className="mt-[2px] self-start" size={"15px"} />
                <a className="ml-2 flex-1 cursor-pointer text-sm font-semibold text-blue-600">
                  Email {`${name}`}
                </a>
              </span>
            ) : (
              <SendUserEmailMobileDrawer name={`${name}`} email={email} />
            )
          ) : disableEmailButton === true ? (
            <span className="flex items-center">
              <Mail className="mt-[2px] self-start" size={"15px"} />
              <a className="ml-2 flex-1 cursor-pointer text-sm font-semibold text-blue-600">
                Email {`${name}`}
              </a>
            </span>
          ) : (
            <SendUserEmailDialog name={`${name}`} email={email} />
          ))}
      </div>
    </div>
  );
};

export const SendUserEmailDialog = ({ name, email }: IStaffUserResult) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <span className="flex items-center">
          <Mail className="mt-[2px] self-start" size={"15px"} />
          <a className="ml-2 flex-1 cursor-pointer text-sm font-semibold text-blue-600">
            Email {`${name}`}
          </a>
        </span>
      </DialogTrigger>
      <DialogContent className="text-slate-800 sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="mb-2 mt-3">Email {`${name}`}</DialogTitle>
        </DialogHeader>

        <EmailStaffMemberContent email={email} name={name} kind={"dialog"} />
      </DialogContent>
    </Dialog>
  );
};

export const SendUserEmailMobileDrawer = ({
  name,
  email,
}: IStaffUserResult) => {
  return (
    <Drawer>
      <DrawerTrigger>
        <span className="flex items-center">
          <Mail className="mt-[2px] self-start" size={"15px"} />
          <a className="ml-2 flex-1 cursor-pointer text-sm font-semibold text-blue-600">
            Email {`${name}`}
          </a>
        </span>
      </DrawerTrigger>
      <DrawerContent>
        <div className="mx-auto w-full max-w-sm text-slate-800">
          <DrawerHeader>
            <DrawerTitle className="mb-2 mt-3">Email {`${name}`}</DrawerTitle>
          </DrawerHeader>
          <EmailStaffMemberContent kind={"drawer"} email={email} name={name} />
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default ScienceStaffSearchResult;
