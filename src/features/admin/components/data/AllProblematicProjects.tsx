import { RemedyExternallyLedProjectsModalContent } from "@/features/admin/components/modals/RemedyExternallyLedProjectsModalContent";
import { RemedyLeaderlessProjectsModalContent } from "@/features/admin/components/modals/RemedyLeaderlessProjectsModalContent";
import { RemedyMemberlessProjectsModalContent } from "@/features/admin/components/modals/RemedyMemberlessProjectsModalContent";
import { RemedyMultipleLeaderProjectsModalContent } from "@/features/admin/components/modals/RemedyMultipleLeaderProjectsModalContent";
import { BaseModal } from "@/shared/components/Modals/BaseModal";
import {
  Accordion,
  AccordionContent,
  AccordionTrigger,
} from "@/shared/components/ui/accordion";
import { Button } from "@/shared/components/ui/button";
import { Separator } from "@/shared/components/ui/separator";
import { getAllProblematicProjects } from "@/features/admin/services/admin.service";
import { getEmailProjectList } from "@/features/users/services/users.service";
import { type IProblematicData } from "@/features/projects/hooks/useAllProblematicProjects";
import { AccordionItem } from "@radix-ui/react-accordion";
import { useState, useEffect } from "react";
import { TbRefresh } from "react-icons/tb";
import { UserProjectsDataTable } from "@/features/dashboard/components/UserProjectsDataTable";
import { RemedyOpenClosedModalContent } from "@/features/admin/components/modals/RemedyOpenClosedModalContent";
import { FaFileDownload } from "react-icons/fa";
import { Loader2 } from "lucide-react";
import { useColorMode } from "@/shared/utils/theme.utils";

export const AllProblematicProjects = () => {
  const { colorMode } = useColorMode();

  const [fetchingData, setFetchingData] = useState(false);
  const [problematicProjectData, setproblematicProjectData] =
    useState<IProblematicData>(null);

  const fetchProblematicProjects = async () => {
    setFetchingData(true);
    try {
      const res = await getAllProblematicProjects();
      console.log(res);
      setproblematicProjectData(res);
    } catch (error) {
      console.error("Error fetching problematic projects:", error);
    } finally {
      setFetchingData(false);
    }
  };

  // Auto-fetch data on component mount
  useEffect(() => {
    fetchProblematicProjects();
  }, []);

  // State for all modals (replacing useDisclosure hooks)
  const [isRemedyNoMembersModalOpen, setIsRemedyNoMembersModalOpen] = useState(false);
  const [isRemedyOpenClosedModalOpen, setIsRemedyOpenClosedModalOpen] = useState(false);
  const [isRemedyNoLeadersModalOpen, setIsRemedyNoLeadersModalOpen] = useState(false);
  const [isRemedyMultipleLeadersModalOpen, setIsRemedyMultipleLeadersModalOpen] = useState(false);
  const [isRemedyExternalLeadersModalOpen, setIsRemedyExternalLeadersModalOpen] = useState(false);

  // Modal control functions
  const onOpenRemedyNoMembersModal = () => setIsRemedyNoMembersModalOpen(true);
  const onCloseRemedyNoMembersModal = () => setIsRemedyNoMembersModalOpen(false);
  const onOpenRemedyOpenClosedModal = () => setIsRemedyOpenClosedModalOpen(true);
  const onCloseRemedyOpenClosedModal = () => setIsRemedyOpenClosedModalOpen(false);
  const onOpenRemedyNoLeadersModal = () => setIsRemedyNoLeadersModalOpen(true);
  const onCloseRemedyNoLeadersModal = () => setIsRemedyNoLeadersModalOpen(false);
  const onOpenRemedyMultipleLeadersModal = () => setIsRemedyMultipleLeadersModalOpen(true);
  const onCloseRemedyMultipleLeadersModal = () => setIsRemedyMultipleLeadersModalOpen(false);
  const onOpenRemedyExternalLeadersModal = () => setIsRemedyExternalLeadersModalOpen(true);
  const onCloseRemedyExternalLeadersModal = () => setIsRemedyExternalLeadersModalOpen(false);

  const [isProcessingEmailList, setIsProcessingEmailList] = useState(false);

  const downloadEmailList = async () => {
    try {
      setIsProcessingEmailList(true);
      const { file_content } = await getEmailProjectList({
        shouldDownloadList: true,
      });

      const contentString = Object.values(file_content).join("");
      const blob = new Blob([contentString], { type: "text/plain" });
      const url = URL.createObjectURL(blob);

      // Create temporary link for download
      const link = document.createElement("a");
      link.href = url;
      link.download = "project_leads_list.txt";
      link.click();

      // Open in new tab and cleanup
      window.open(url, "_blank");
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading email list:", error);
    } finally {
      setIsProcessingEmailList(false);
    }
  };

  return (
    <>
      {/* Open Closed */}
      <BaseModal
        isOpen={isRemedyOpenClosedModalOpen}
        onClose={onCloseRemedyOpenClosedModal}
        modalTitle="Remedy Open Close Projects"
      >
        <RemedyOpenClosedModalContent
          projects={problematicProjectData?.open_closed}
          refreshDataFn={fetchProblematicProjects}
          onClose={onCloseRemedyNoMembersModal}
        />
      </BaseModal>

      {/* Memberless */}
      <BaseModal
        isOpen={isRemedyNoMembersModalOpen}
        onClose={onCloseRemedyNoMembersModal}
        modalTitle="Remedy Memberless Projects"
      >
        <RemedyMemberlessProjectsModalContent
          projects={problematicProjectData?.no_members}
          refreshDataFn={fetchProblematicProjects}
          onClose={onCloseRemedyNoMembersModal}
        />
      </BaseModal>

      {/* No Lead Projects */}
      <BaseModal
        isOpen={isRemedyNoLeadersModalOpen}
        onClose={onCloseRemedyNoLeadersModal}
        modalTitle="Remedy Members but No Lead Projects"
      >
        <RemedyLeaderlessProjectsModalContent
          projects={problematicProjectData?.no_leader}
          refreshDataFn={fetchProblematicProjects}
          onClose={onCloseRemedyNoLeadersModal}
        />
      </BaseModal>

      {/* Multiple Lead */}
      <BaseModal
        isOpen={isRemedyMultipleLeadersModalOpen}
        onClose={onCloseRemedyMultipleLeadersModal}
        modalTitle="Remedy Multiple Lead Projects"
      >
        <RemedyMultipleLeaderProjectsModalContent
          projects={problematicProjectData?.multiple_leads}
          refreshDataFn={fetchProblematicProjects}
          onClose={onCloseRemedyMultipleLeadersModal}
        />
      </BaseModal>

      {/* External */}
      <BaseModal
        isOpen={isRemedyExternalLeadersModalOpen}
        onClose={onCloseRemedyExternalLeadersModal}
        modalTitle="Remedy External Leads Projects"
      >
        <RemedyExternallyLedProjectsModalContent
          projects={problematicProjectData?.external_leader}
          refreshDataFn={fetchProblematicProjects}
          onClose={onCloseRemedyExternalLeadersModal}
        />
      </BaseModal>

      <div>
        <div className="flex items-center mt-4">
          <h2 className="text-xl py-4 flex-1">
            Problematic Project Lists
          </h2>
          {problematicProjectData && (
            <div className="flex justify-end">
              <Button
                className={`text-white ${
                  colorMode === "light" 
                    ? "bg-blue-500 hover:bg-blue-400" 
                    : "bg-blue-500 hover:bg-blue-400"
                }`}
                onClick={fetchProblematicProjects}
                disabled={fetchingData}
              >
                <TbRefresh className="mr-2 h-4 w-4" />
                Refresh Data
              </Button>
            </div>
          )}
        </div>

        {fetchingData && !problematicProjectData ? (
          <div className="flex justify-center items-center w-full h-[500px]">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p className="ml-4 text-gray-500 text-xl font-bold">
              Fetching ...
            </p>
          </div>
        ) : (
          <>
            {problematicProjectData && (
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger>
                    <p className="text-lg py-4">
                      Projects with progress reports with no updates since
                      creation this FY (
                      {problematicProjectData?.no_progress?.length || 0})
                    </p>
                  </AccordionTrigger>
                  <AccordionContent>
                    <UserProjectsDataTable
                      projectData={problematicProjectData?.no_progress}
                      defaultSorting={"business_area"}
                      disabledColumns={{
                        kind: true,
                        title: false,
                        role: true,
                      }}
                      noDataString={"No results"}
                    />
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2">
                  <AccordionTrigger>
                    <p className="text-lg py-4">
                      ACTIVE Projects with INACTIVE Staff Leaders (
                      {problematicProjectData?.inactive_lead_active_project
                        ?.length || 0}
                      )
                    </p>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="flex pb-8 justify-end">
                      <Button
                        className={`text-white ${
                          colorMode === "light" 
                            ? "bg-green-500 hover:bg-green-400" 
                            : "bg-green-600 hover:bg-green-500"
                        }`}
                        onClick={downloadEmailList}
                        disabled={isProcessingEmailList}
                      >
                        <FaFileDownload className="mr-2 h-4 w-4" />
                        Download TXT List
                      </Button>
                    </div>
                    <UserProjectsDataTable
                      projectData={
                        problematicProjectData?.inactive_lead_active_project
                      }
                      defaultSorting={"business_area"}
                      disabledColumns={{
                        kind: true,
                        title: false,
                        role: true,
                      }}
                      noDataString={"No results"}
                    />
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-3">
                  <AccordionTrigger>
                    <p className="text-lg py-4">
                      Projects With Approved Closure That Are Open (
                      {problematicProjectData?.open_closed?.length || 0})
                    </p>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="flex pb-8 justify-end">
                      <Button
                        className={`text-white ${
                          colorMode === "light" 
                            ? "bg-green-500 hover:bg-green-400" 
                            : "bg-green-600 hover:bg-green-500"
                        }`}
                        onClick={onOpenRemedyOpenClosedModal}
                      >
                        Remedy
                      </Button>
                    </div>
                    <UserProjectsDataTable
                      projectData={problematicProjectData?.open_closed}
                      defaultSorting={"business_area"}
                      disabledColumns={{
                        kind: true,
                        title: false,
                        role: true,
                      }}
                      noDataString={"No results"}
                    />
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-4">
                  <AccordionTrigger>
                    <p className="text-lg py-4">
                      Projects with No Members (
                      {problematicProjectData?.no_members?.length || 0})
                    </p>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="flex pb-8 justify-end">
                      <Button
                        className={`text-white ${
                          colorMode === "light" 
                            ? "bg-green-500 hover:bg-green-400" 
                            : "bg-green-600 hover:bg-green-500"
                        }`}
                        onClick={onOpenRemedyNoMembersModal}
                      >
                        Remedy
                      </Button>
                    </div>
                    <UserProjectsDataTable
                      projectData={problematicProjectData?.no_members}
                      defaultSorting={"business_area"}
                      disabledColumns={{
                        kind: true,
                        title: false,
                        role: true,
                      }}
                      noDataString={"No results"}
                    />
                  </AccordionContent>
                </AccordionItem>
                <Separator />
                <AccordionItem value="item-5">
                  <AccordionTrigger>
                    <p className="text-lg py-4">
                      Projects with Members but No Leader Role (
                      {problematicProjectData?.no_leader?.length || 0})
                    </p>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="flex pb-8 justify-end">
                      <Button
                        className={`text-white ${
                          colorMode === "light" 
                            ? "bg-green-500 hover:bg-green-400" 
                            : "bg-green-600 hover:bg-green-500"
                        }`}
                        onClick={onOpenRemedyNoLeadersModal}
                      >
                        Remedy
                      </Button>
                    </div>
                    <UserProjectsDataTable
                      projectData={problematicProjectData?.no_leader}
                      defaultSorting={"business_area"}
                      disabledColumns={{
                        kind: true,
                        title: false,
                        role: true,
                      }}
                      noDataString={"No results"}
                    />
                  </AccordionContent>
                </AccordionItem>
                <Separator />
                <AccordionItem value="item-6">
                  <AccordionTrigger>
                    <p className="text-lg py-4">
                      Projects with Multiple Project Leader Roles (
                      {problematicProjectData?.multiple_leads?.length || 0})
                    </p>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="flex pb-8 justify-end">
                      <Button
                        className={`text-white ${
                          colorMode === "light" 
                            ? "bg-green-500 hover:bg-green-400" 
                            : "bg-green-600 hover:bg-green-500"
                        }`}
                        onClick={onOpenRemedyMultipleLeadersModal}
                      >
                        Remedy
                      </Button>
                    </div>
                    <UserProjectsDataTable
                      projectData={problematicProjectData?.multiple_leads}
                      defaultSorting={"business_area"}
                      disabledColumns={{
                        kind: true,
                        title: false,
                        role: true,
                      }}
                      noDataString={"No results"}
                    />
                  </AccordionContent>
                </AccordionItem>
                <Separator />
                <AccordionItem value="item-7">
                  <AccordionTrigger>
                    <p className="text-lg py-4">
                      Projects with Leaders Set to External User (
                      {problematicProjectData?.external_leader?.length || 0})
                    </p>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="flex pb-8 justify-end">
                      <Button
                        className={`text-white ${
                          colorMode === "light" 
                            ? "bg-green-500 hover:bg-green-400" 
                            : "bg-green-600 hover:bg-green-500"
                        }`}
                        onClick={onOpenRemedyExternalLeadersModal}
                      >
                        Remedy
                      </Button>
                    </div>

                    <UserProjectsDataTable
                      projectData={problematicProjectData?.external_leader}
                      defaultSorting={"business_area"}
                      disabledColumns={{
                        kind: true,
                        title: false,
                        role: true,
                      }}
                      noDataString={"No results"}
                    />
                  </AccordionContent>
                </AccordionItem>

                <Separator />
              </Accordion>
            )}
          </>
        )}
      </div>
    </>
  );
};
