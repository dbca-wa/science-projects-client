import { ProjectLeadEmailModal } from "@/components/Modals/ProjectLeadEmailModal";
import { getEmailProjectList } from "@/lib/api";
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
import { useState } from "react";
import { UserDataTable } from "./UserDataTable";
import {
  Accordion,
  AccordionItem,
  AccordionContent,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { MdEmail } from "react-icons/md";
import { TbRefresh } from "react-icons/tb";
import { FaFileDownload } from "react-icons/fa";

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
  const {
    isOpen: isProjectLeadEmailModalOpen,
    onOpen: onProjectLeadEmailModalOpen,
    onClose: onProjectLeadEmailModalClose,
  } = useDisclosure();

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
    // const mailToLink = `mailto:${emailString}&subject=${subject}`;
    // console.log(emailList);
    // console.log("EMAIL STRING: ", emailString);
    const mailToLink = `mailto:${emailString}?subject=SPMS:`;
    // const mailToLink = `mailto:jarid.prince@dbca.wa.gov.au,rory.mcauley@dbca.wa.gov.au&subject=SPMS:`;

    // jarid.prince@dbca.wa.gov.au
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

  return (
    <>
      <Box>
        <Flex alignItems={"center"} mt={4}>
          <Text fontSize={"x-large"} py={4} flex={1}>
            Email List
          </Text>
          {!fetchingData && activeProjectLeadEmailList && (
            <Flex justifyContent={"flex-end"}>
              <Button
                bg={colorMode === "light" ? "orange.500" : "orange.500"}
                color={"white"}
                _hover={{
                  bg: colorMode === "light" ? "orange.400" : "orange.400",
                }}
                onClick={downloadEmailList}
                isDisabled={
                  fetchingData ||
                  !fileContent ||
                  (activeProjectLeadEmailList?.length < 1 &&
                    inactiveLeadList?.length < 1)
                }
                mr={2}
                leftIcon={<FaFileDownload />}
              >
                Download List
              </Button>
              <Button
                bg={colorMode === "light" ? "green.500" : "green.500"}
                color={"white"}
                _hover={{
                  bg: colorMode === "light" ? "green.400" : "green.400",
                }}
                onClick={sendEmailsToDBCALeads}
                isDisabled={
                  fetchingData || activeProjectLeadEmailList?.length < 1
                }
                mr={2}
                leftIcon={<MdEmail />}
              >
                Send Emails to DBCA Leads
              </Button>
              <Button
                bg={colorMode === "light" ? "blue.500" : "blue.500"}
                color={"white"}
                _hover={{
                  bg: colorMode === "light" ? "blue.400" : "blue.400",
                }}
                onClick={fetchLeadEmails}
                isDisabled={fetchingData}
                leftIcon={<TbRefresh />}
              >
                Refresh Data
              </Button>
            </Flex>
            // <Button
            //   onClick={onProjectLeadEmailModalOpen}
            //   bg={colorMode === "light" ? "green.500" : "green.500"}
            //   color={"white"}
            //   _hover={{
            //     bg: colorMode === "light" ? "green.400" : "green.400",
            //   }}
            // >
            //   Get Project Leads
            // </Button>
          )}
        </Flex>
      </Box>

      {/* <ProjectLeadEmailModal
        isOpen={isProjectLeadEmailModalOpen}
        onClose={onProjectLeadEmailModalClose}
      /> */}
      {fetchingData && !activeProjectLeadEmailList && !inactiveLeadList ? (
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
          {activeProjectLeadEmailList && inactiveLeadList ? (
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger>
                  <Text fontSize={"large"} py={4}>
                    Project Leads with DBCA Email (
                    {activeProjectLeadEmailList?.length || 0})
                  </Text>
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
              <Divider />
              <AccordionItem value="item-2">
                <AccordionTrigger>
                  <Text fontSize={"large"} py={4}>
                    Non-DBCA Email / Inactive Project Leads (
                    {inactiveLeadList?.length || 0})
                  </Text>
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
              <Divider />
            </Accordion>
          ) : (
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
                onClick={fetchLeadEmails}
                isDisabled={fetchingData}
                size={"lg"}
                my={4}
              >
                Check Data
              </Button>
              <Text color={"gray.500"} fontSize={"x-large"} fontWeight={"bold"}>
                Press "Check Data" to get the latest information for project
                leads in active, update requested and suspended projects.
              </Text>
            </Center>
          )}
        </>
      )}
    </>
  );
};
