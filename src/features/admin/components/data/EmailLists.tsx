import { ProjectLeadEmailModal } from "@/features/projects/components/modals/ProjectLeadEmailModal";
import { getEmailProjectList } from "@/features/users/services/users.service";
import { downloadBCSStaffCSV } from "@/features/users/services/users.service";
import { useColorMode } from "@/shared/utils/theme.utils";
import { Button } from "@/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { Separator } from "@/shared/components/ui/separator";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { UserDataTable } from "./UserDataTable";
import {
  Accordion,
  AccordionItem,
  AccordionContent,
  AccordionTrigger,
} from "@/shared/components/ui/accordion";
import { MdEmail } from "react-icons/md";
import { TbRefresh } from "react-icons/tb";
import { FaFileDownload } from "react-icons/fa";
import { ChevronDown } from "lucide-react";

export interface IUserDataTableEntry {
  pk: number;
  name: string;
  email: string;
  image: string;
  is_staff: boolean;
  is_active: boolean;
}

interface IEmailResponseObject {
  file_content: string[];
  unique_dbca_emails_list: IUserDataTableEntry[];
  unique_non_dbca_emails_list: IUserDataTableEntry[];
}

export const EmailLists = () => {
  const { colorMode } = useColorMode();
  const [isProjectLeadEmailModalOpen, setIsProjectLeadEmailModalOpen] = useState(false);
  const onProjectLeadEmailModalOpen = () => setIsProjectLeadEmailModalOpen(true);
  const onProjectLeadEmailModalClose = () => setIsProjectLeadEmailModalOpen(false);

  const [activeProjectLeadEmailList, setActiveProjectLeadEmailList] =
    useState<IUserDataTableEntry[]>(null);

  const [inactiveLeadList, setInactiveLeadList] =
    useState<IUserDataTableEntry[]>(null);

  const [fileContent, setFileContent] = useState(null);

  const [fetchingData, setFetchingData] = useState<boolean>(false);

  const fetchLeadEmails = async () => {
    setFetchingData(true);
    if (inactiveLeadList !== null) {
      setInactiveLeadList(null);
    }
    if (activeProjectLeadEmailList !== null) {
      setActiveProjectLeadEmailList(null);
    }

    await getEmailProjectList({ shouldDownloadList: true }).then((res) => {
      console.log(res);
      setActiveProjectLeadEmailList(res.unique_dbca_emails_list);
      setInactiveLeadList(res.unique_non_dbca_emails_list);
      setFileContent(res.file_content);
      setFetchingData(false);
    });
  };

  const sendEmailsToDBCALeads = async () => {
    const emailString = activeProjectLeadEmailList
      ?.map((user) => user.email)
      .join(",");
    const mailToLink = `mailto:${emailString}?subject=SPMS:`;
    const link = document.createElement("a");
    link.href = mailToLink;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadEmailList = async () => {
    const contentString = Object.values(fileContent).join("");

    // Create a Blob from the string
    const blob = new Blob([contentString], { type: "text/plain" });

    // Generate a URL for the Blob
    const url = URL.createObjectURL(blob);

    const downloadLink = document.createElement("a");
    downloadLink.href = url;
    downloadLink.download = "project_leads_list.txt";
    document.body.appendChild(downloadLink);
    downloadLink.click();

    // Open the file in a new tab
    const openLink = document.createElement("a");
    openLink.href = url;
    openLink.target = "_blank";
    document.body.appendChild(openLink);
    openLink.click();

    // Cleanup: remove the link elements and revoke the object URL
    document.body.removeChild(downloadLink);
    document.body.removeChild(openLink);
  };

  useEffect(() => {
    fetchLeadEmails();
  }, []);

  return (
    <>
      <div>
        <div className="flex items-center mt-4">
          <p className="text-2xl py-4 flex-1">
            Email List
          </p>

          {!fetchingData && activeProjectLeadEmailList && (
            <div className="flex gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    className={`text-white ${
                      colorMode === "light" 
                        ? "bg-orange-500 hover:bg-orange-400" 
                        : "bg-orange-500 hover:bg-orange-400"
                    }`}
                  >
                    Download BCS Staff (CSV)
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem
                    onClick={() => downloadBCSStaffCSV({ in_spms: false })}
                  >
                    All
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() =>
                      downloadBCSStaffCSV({ in_spms: true, is_active: true })
                    }
                  >
                    SPMS | Active Users
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() =>
                      downloadBCSStaffCSV({ in_spms: true, is_active: false })
                    }
                  >
                    SPMS | Inactive Users
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button
                className={`text-white ${
                  colorMode === "light" 
                    ? "bg-green-500 hover:bg-green-400" 
                    : "bg-green-500 hover:bg-green-400"
                }`}
                onClick={sendEmailsToDBCALeads}
                disabled={
                  fetchingData || activeProjectLeadEmailList?.length < 1
                }
              >
                <MdEmail className="mr-2 h-4 w-4" />
                Email Leads
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* <ProjectLeadEmailModal
        isOpen={isProjectLeadEmailModalOpen}
        onClose={onProjectLeadEmailModalClose}
      /> */}
      {fetchingData && !activeProjectLeadEmailList && !inactiveLeadList ? (
        <div className="w-full h-[500px] flex justify-center items-center">
          <Loader2 className="animate-spin" />
          <p className="ml-4 text-gray-500 text-2xl font-bold">
            Fetching ...
          </p>
        </div>
      ) : (
        <>
          {activeProjectLeadEmailList && inactiveLeadList ? (
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger>
                  <p className="text-lg py-4">
                    Project Leads with DBCA Email (
                    {activeProjectLeadEmailList?.length || 0})
                  </p>
                </AccordionTrigger>
                <AccordionContent>
                  <UserDataTable
                    userData={activeProjectLeadEmailList}
                    defaultSorting={"name"}
                    disabledColumns={{
                      pk: true,
                      image: true,
                      name: false,
                      is_staff: false,
                      is_active: false,
                      email: false,
                    }}
                    noDataString={"No Data"}
                  />
                </AccordionContent>
              </AccordionItem>
              <Separator />
              <AccordionItem value="item-2">
                <AccordionTrigger>
                  <p className="text-lg py-4">
                    Non-DBCA Email / Inactive Project Leads (
                    {inactiveLeadList?.length || 0})
                  </p>
                </AccordionTrigger>
                <AccordionContent>
                  <UserDataTable
                    userData={inactiveLeadList}
                    defaultSorting={"name"}
                    disabledColumns={{
                      pk: true,
                      image: true,
                      name: false,
                      is_staff: false,
                      is_active: false,
                      email: false,
                    }}
                    noDataString={"No Data"}
                  />{" "}
                </AccordionContent>
              </AccordionItem>
              <Separator />
            </Accordion>
          ) : (
            <div className="w-full h-[500px] flex flex-col justify-center items-center">
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
              <p className="text-gray-500 text-2xl font-bold">
                Press "Check Data" to get the latest information for project
                leads in active, update requested and suspended projects.
              </p>
            </div>
          )}
        </>
      )}
    </>
  );
};
