import { getStaffProfileEmailList } from "@/features/users/services/users.service";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { useColorMode } from "@/shared/utils/theme.utils";
import { useEffect, useState } from "react";
import { MdEmail } from "react-icons/md";
import { TbRefresh } from "react-icons/tb";
import { Loader2 } from "lucide-react";
import { UserDataTable } from "./UserDataTable";

interface IUserDataTableEntry {
  pk: number;
  name: string;
  email: string;
  image: string;
  is_staff: boolean;
  is_active: boolean;
}

const StaffProfileEmails = () => {
  const [activeProjectLeadEmailList, setActiveProjectLeadEmailList] = useState<
    IUserDataTableEntry[] | null
  >(null);

  const { colorMode } = useColorMode();

  const [fetchingData, setFetchingData] = useState<boolean>(false);

  useEffect(() => {
    console.log(activeProjectLeadEmailList);
  }, [activeProjectLeadEmailList]);

  const fetchLeadEmails = async () => {
    setFetchingData(true);
    if (activeProjectLeadEmailList !== null) {
      setActiveProjectLeadEmailList(null);
    }

    const staffData = await getStaffProfileEmailList();
    setActiveProjectLeadEmailList(staffData);
    setFetchingData(false);
  };

  return (
    <>
      <div>
        <div className="flex items-center mt-4">
          <p className="text-xl py-4 flex-1">
            Users with Staff Profiles{" "}
            {activeProjectLeadEmailList?.length > 0 &&
              `(${activeProjectLeadEmailList?.length})`}
          </p>
          {!fetchingData && activeProjectLeadEmailList?.length > 1 && (
            <div className="flex justify-end">
              <Button
                className={`text-white ${
                  colorMode === "light" 
                    ? "bg-blue-500 hover:bg-blue-400" 
                    : "bg-blue-500 hover:bg-blue-400"
                }`}
                onClick={fetchLeadEmails}
                disabled={fetchingData}
              >
                <TbRefresh className="mr-2 h-4 w-4" />
                Refresh Data
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* <ProjectLeadEmailModal
    isOpen={isProjectLeadEmailModalOpen}
    onClose={onProjectLeadEmailModalClose}
  /> */}
      {fetchingData && !activeProjectLeadEmailList ? (
        <div className="flex justify-center items-center w-full h-[500px]">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="ml-4 text-gray-500 text-xl font-bold">
            Fetching ...
          </p>
        </div>
      ) : (
        <>
          {activeProjectLeadEmailList ? (
            <>
              <EmailInputWithCopy
                activeProjectLeadEmailList={activeProjectLeadEmailList}
              />
              <UserDataTable
                userData={activeProjectLeadEmailList}
                defaultSorting={"name"}
                disabledColumns={{
                  pk: true,
                  image: true,
                  name: false,
                  is_staff: true,
                  is_active: true,
                  email: false,
                }}
                noDataString={"No Data"}
              />
            </>
          ) : (
            <div className="flex justify-center items-center w-full h-[500px] flex-col">
              <Button
                className={`text-white my-4 ${
                  colorMode === "light" 
                    ? "bg-blue-500 hover:bg-blue-400" 
                    : "bg-blue-500 hover:bg-blue-400"
                }`}
                onClick={fetchLeadEmails}
                disabled={fetchingData}
                size="lg"
              >
                Check Data
              </Button>
              <p className="text-gray-500 text-xl font-bold">
                Press "Check Data" to get emails for users with staff profiles
              </p>
            </div>
          )}
        </>
      )}
    </>
  );
};

export default StaffProfileEmails;

const EmailInputWithCopy = ({ activeProjectLeadEmailList }) => {
  const [copySuccess, setCopySuccess] = useState(false);

  const emailString = activeProjectLeadEmailList
    ?.map((u) => u.email)
    .join("; ");

  const emailStringForSend = activeProjectLeadEmailList
    ?.map((u) => u.email)
    .join(","); // Use comma for separating multiple email addresses
  const subject = encodeURIComponent("Staff Profiles");

  // Directly use mailto link
  const handleEmailClick = () => {
    const mailToLink = `mailto:${emailStringForSend}?subject=${subject}`;
    window.location.href = mailToLink;
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(emailString).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000); // Reset after 2 seconds
    });
  };

  const handleSendClick = () => {
    const mailToLink = `mailto:${emailStringForSend}?subject=${subject}`;
    const link = document.createElement("a");
    link.href = mailToLink;
    link.click();
  };

  const { colorMode } = useColorMode();

  return (
    <div className="mb-4">
      <p className="mb-2 ml-2">
        Some systems may block the email button due to large amount of emails.
        Copy and paste the email list into your email client if it is blocked.
      </p>
      <div className="flex items-center">
        <Input value={emailString} readOnly />
        <div className="flex">
          <Button
            onClick={copyToClipboard}
            className={`mx-2 text-white ${
              copySuccess 
                ? "bg-green-400 hover:bg-green-500" 
                : "bg-blue-400 hover:bg-blue-500"
            }`}
          >
            {copySuccess ? "Copied!" : "Copy"}
          </Button>
          <Button
            className={`text-white mr-2 ${
              colorMode === "light" 
                ? "bg-green-500 hover:bg-green-400" 
                : "bg-green-500 hover:bg-green-400"
            }`}
            onClick={handleSendClick}
            disabled={activeProjectLeadEmailList?.length < 1}
          >
            <MdEmail className="mr-2 h-4 w-4" />
            Email
          </Button>
        </div>
      </div>
    </div>
  );
};
