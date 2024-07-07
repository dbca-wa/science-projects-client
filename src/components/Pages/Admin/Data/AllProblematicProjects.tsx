import { UpdateExternalLeadersModalContent } from "@/components/Modals/Admin/UpdateExternalLeadersModalContent";
import { BaseModal } from "@/components/Modals/BaseModal";
import {
  Accordion,
  AccordionContent,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { getAllProblematicProjects } from "@/lib/api";
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
import { UserProjectsDataTable } from "../../Dashboard/UserProjectsDataTable";
import { TbRefresh } from "react-icons/tb";

export const AllProblematicProjects = () => {
  const { colorMode } = useColorMode();

  const [fetchingData, setFetchingData] = useState(false);
  const [problematicProjectData, setproblematicProjectData] =
    useState<IProblematicData>(null);

  const {
    isOpen: isUpdateExternalLeadsModalOpen,
    onOpen: onOpenUpdateExternalLeadsModal,
    onClose: onCloseUpdateExternalLeadsModal,
  } = useDisclosure();

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

  return (
    <>
      <BaseModal
        isOpen={isUpdateExternalLeadsModalOpen}
        onClose={onCloseUpdateExternalLeadsModal}
        modalTitle="Update External Leaders"
      >
        <UpdateExternalLeadersModalContent />
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
                    {/* <Flex pb={8} justifyContent={"flex-end"}>
                      <Button
                        bg={colorMode === "light" ? "red.500" : "red.600"}
                        color={"white"}
                        _hover={{
                          bg: colorMode === "light" ? "red.400" : "red.500",
                        }}
                        onClick={onOpenUpdateExternalLeadsModal}
                      >
                        Update External Leaders
                      </Button>
                    </Flex> */}

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
