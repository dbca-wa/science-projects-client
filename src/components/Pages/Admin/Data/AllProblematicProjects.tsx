import { RemedyExternallyLedProjectsModalContent } from "@/components/Modals/Admin/RemedyExternallyLedProjectsModalContent";
import { RemedyLeaderlessProjectsModalContent } from "@/components/Modals/Admin/RemedyLeaderlessProjectsModalContent";
import { RemedyMemberlessProjectsModalContent } from "@/components/Modals/Admin/RemedyMemberlessProjectsModalContent";
import { RemedyMultipleLeaderProjectsModalContent } from "@/components/Modals/Admin/RemedyMultipleLeaderProjectsModalContent";
import { BaseModal } from "@/components/Modals/BaseModal";
import {
  Accordion,
  AccordionContent,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { getAllProblematicProjects } from "@/lib/api/api";
import { IProblematicData } from "@/lib/hooks/tanstack/useAllProblematicProjects";
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
import { useState } from "react";
import { TbRefresh } from "react-icons/tb";
import { UserProjectsDataTable } from "../../Dashboard/UserProjectsDataTable";

export const AllProblematicProjects = () => {
  const { colorMode } = useColorMode();

  const [fetchingData, setFetchingData] = useState(false);
  const [problematicProjectData, setproblematicProjectData] =
    useState<IProblematicData>(null);

  const fetchProblematicProjects = async () => {
    setFetchingData(true);
    if (problematicProjectData !== null) {
      setproblematicProjectData(null);
    }
    await getAllProblematicProjects().then((res) => {
      console.log(res);
      setproblematicProjectData(res);
      setFetchingData(false);
    });
  };

  const {
    isOpen: isRemedyNoMembersModalOpen,
    onOpen: onOpenRemedyNoMembersModal,
    onClose: onCloseRemedyNoMembersModal,
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

  return (
    <>
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
          {!fetchingData && problematicProjectData && (
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
            {!problematicProjectData ? (
              <Center
                w={"100%"}
                h={"500px"}
                flexDir={"column"}
                //   bg={"Red"}
              >
                <Button
                  bg={colorMode === "light" ? "blue.500" : "blue.500"}
                  color={"white"}
                  _hover={{
                    bg: colorMode === "light" ? "blue.400" : "blue.400",
                  }}
                  onClick={fetchProblematicProjects}
                  isDisabled={fetchingData}
                  size={"lg"}
                  my={4}
                >
                  Check Data
                </Button>
                <Text
                  color={"gray.500"}
                  fontSize={"x-large"}
                  fontWeight={"bold"}
                >
                  Press "Check Data" to get the latest information on
                  problematic projects
                </Text>
              </Center>
            ) : (
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
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
                <AccordionItem value="item-2">
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
                <AccordionItem value="item-3">
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
                <AccordionItem value="item-4">
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
