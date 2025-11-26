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
import { getAllProblematicProjects } from "@/features/admin/services/admin.service";
import { getEmailProjectList } from "@/features/users/services/users.service";
import { IProblematicData } from "@/features/projects/hooks/useAllProblematicProjects";
import {
  Box,
  Button,
  Center,
  Divider,
  Flex,
  Spinner,
  Text,
  useColorMode,
  useDisclosure,
} from "@chakra-ui/react";
import { AccordionItem } from "@radix-ui/react-accordion";
import { useState, useEffect } from "react";
import { TbRefresh } from "react-icons/tb";
import { UserProjectsDataTable } from "@/features/dashboard/components/UserProjectsDataTable";
import { RemedyOpenClosedModalContent } from "@/features/admin/components/modals/RemedyOpenClosedModalContent";
import { FaFileDownload } from "react-icons/fa";

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

  const {
    isOpen: isRemedyNoMembersModalOpen,
    onOpen: onOpenRemedyNoMembersModal,
    onClose: onCloseRemedyNoMembersModal,
  } = useDisclosure();

  const {
    isOpen: isRemedyOpenClosedModalOpen,
    onOpen: onOpenRemedyOpenClosedModal,
    onClose: onCloseRemedyOpenClosedModal,
  } = useDisclosure();

  const {
    isOpen: isRemedyNoLeadersModalOpen,
    onOpen: onOpenRemedyNoLeadersModal,
    onClose: onCloseRemedyNoLeadersModal,
  } = useDisclosure();

  const {
    isOpen: isRemedyMultipleLeadersModalOpen,
    onOpen: onOpenRemedyMultipleLeadersModal,
    onClose: onCloseRemedyMultipleLeadersModal,
  } = useDisclosure();

  const {
    isOpen: isRemedyExternalLeadersModalOpen,
    onOpen: onOpenRemedyExternalLeadersModal,
    onClose: onCloseRemedyExternalLeadersModal,
  } = useDisclosure();

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

      <Box>
        <Flex alignItems={"center"} mt={4}>
          <Text fontSize={"x-large"} py={4} flex={1}>
            Problematic Project Lists
          </Text>
          {problematicProjectData && (
            <Box justifyContent={"flex-end"}>
              <Button
                bg={colorMode === "light" ? "blue.500" : "blue.500"}
                color={"white"}
                _hover={{
                  bg: colorMode === "light" ? "blue.400" : "blue.400",
                }}
                onClick={fetchProblematicProjects}
                isDisabled={fetchingData}
                leftIcon={<TbRefresh />}
              >
                Refresh Data
              </Button>
            </Box>
          )}
        </Flex>

        {fetchingData && !problematicProjectData ? (
          <Center w={"100%"} h={"500px"}>
            <Spinner />
            <Text
              ml={4}
              color={"gray.500"}
              fontSize={"x-large"}
              fontWeight={"bold"}
            >
              Fetching ...
            </Text>
          </Center>
        ) : (
          <>
            {problematicProjectData && (
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger>
                    <Text fontSize={"large"} py={4}>
                      Projects with progress reports with no updates since
                      creation this FY (
                      {problematicProjectData?.no_progress?.length || 0})
                    </Text>
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
                    <Text fontSize={"large"} py={4}>
                      ACTIVE Projects with INACTIVE Staff Leaders (
                      {problematicProjectData?.inactive_lead_active_project
                        ?.length || 0}
                      )
                    </Text>
                  </AccordionTrigger>
                  <AccordionContent>
                    <Flex pb={8} justifyContent={"flex-end"}>
                      <Button
                        bg={colorMode === "light" ? "green.500" : "green.600"}
                        color={"white"}
                        _hover={{
                          bg: colorMode === "light" ? "green.400" : "green.500",
                        }}
                        onClick={downloadEmailList}
                        leftIcon={<FaFileDownload />}
                        isDisabled={isProcessingEmailList}
                      >
                        Download TXT List
                      </Button>
                    </Flex>
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
                    <Text fontSize={"large"} py={4}>
                      Projects With Approved Closure That Are Open (
                      {problematicProjectData?.open_closed?.length || 0})
                    </Text>
                  </AccordionTrigger>
                  <AccordionContent>
                    <Flex pb={8} justifyContent={"flex-end"}>
                      <Button
                        bg={colorMode === "light" ? "green.500" : "green.600"}
                        color={"white"}
                        _hover={{
                          bg: colorMode === "light" ? "green.400" : "green.500",
                        }}
                        onClick={onOpenRemedyOpenClosedModal}
                      >
                        Remedy
                      </Button>
                    </Flex>
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
                    <Text fontSize={"large"} py={4}>
                      Projects with No Members (
                      {problematicProjectData?.no_members?.length || 0})
                    </Text>
                  </AccordionTrigger>
                  <AccordionContent>
                    <Flex pb={8} justifyContent={"flex-end"}>
                      <Button
                        bg={colorMode === "light" ? "green.500" : "green.600"}
                        color={"white"}
                        _hover={{
                          bg: colorMode === "light" ? "green.400" : "green.500",
                        }}
                        onClick={onOpenRemedyNoMembersModal}
                      >
                        Remedy
                      </Button>
                    </Flex>
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
                <Divider />
                <AccordionItem value="item-5">
                  <AccordionTrigger>
                    <Text fontSize={"large"} py={4}>
                      Projects with Members but No Leader Role (
                      {problematicProjectData?.no_leader?.length || 0})
                    </Text>
                  </AccordionTrigger>
                  <AccordionContent>
                    <Flex pb={8} justifyContent={"flex-end"}>
                      <Button
                        bg={colorMode === "light" ? "green.500" : "green.600"}
                        color={"white"}
                        _hover={{
                          bg: colorMode === "light" ? "green.400" : "green.500",
                        }}
                        onClick={onOpenRemedyNoLeadersModal}
                      >
                        Remedy
                      </Button>
                    </Flex>
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
                <Divider />
                <AccordionItem value="item-6">
                  <AccordionTrigger>
                    <Text fontSize={"large"} py={4}>
                      Projects with Multiple Project Leader Roles (
                      {problematicProjectData?.multiple_leads?.length || 0})
                    </Text>
                  </AccordionTrigger>
                  <AccordionContent>
                    <Flex pb={8} justifyContent={"flex-end"}>
                      <Button
                        bg={colorMode === "light" ? "green.500" : "green.600"}
                        color={"white"}
                        _hover={{
                          bg: colorMode === "light" ? "green.400" : "green.500",
                        }}
                        onClick={onOpenRemedyMultipleLeadersModal}
                      >
                        Remedy
                      </Button>
                    </Flex>
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
                <Divider />
                <AccordionItem value="item-7">
                  <AccordionTrigger>
                    <Text fontSize={"large"} py={4}>
                      Projects with Leaders Set to External User (
                      {problematicProjectData?.external_leader?.length || 0})
                    </Text>
                  </AccordionTrigger>
                  <AccordionContent>
                    <Flex pb={8} justifyContent={"flex-end"}>
                      <Button
                        bg={colorMode === "light" ? "green.500" : "green.600"}
                        color={"white"}
                        _hover={{
                          bg: colorMode === "light" ? "green.400" : "green.500",
                        }}
                        onClick={onOpenRemedyExternalLeadersModal}
                      >
                        Remedy
                      </Button>
                    </Flex>

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

                <Divider />
              </Accordion>
            )}
          </>
        )}
      </Box>
    </>
  );
};
