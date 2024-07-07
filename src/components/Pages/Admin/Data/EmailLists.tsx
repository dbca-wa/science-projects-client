import { ProjectLeadEmailModal } from "@/components/Modals/ProjectLeadEmailModal";
import { getEmailProjectList } from "@/lib/api";
import {
  Box,
  Button,
  Center,
  Flex,
  Text,
  useColorMode,
  useDisclosure,
} from "@chakra-ui/react";
import { useState } from "react";

interface IUserEmail {
  pk: number;
  name: string;
  email: string;
  image: string;
}

interface IEmailResponseObject {
  file_content: string[];
  unique_dbca_emails_list: IUserEmail[];
  unique_non_dbca_emails_list: IUserEmail[];
}

export const EmailLists = () => {
  const { colorMode } = useColorMode();
  const {
    isOpen: isProjectLeadEmailModalOpen,
    onOpen: onProjectLeadEmailModalOpen,
    onClose: onProjectLeadEmailModalClose,
  } = useDisclosure();

  const [activeProjectLeadEmailList, setActiveProjectLeadEmailList] =
    useState<IUserEmail[]>(null);
  const [inactiveLeadList, setInactiveLeadList] = useState<IUserEmail[]>(null);
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
      setFetchingData(false);
    });
  };

  return (
    <>
      <Box>
        <Flex alignItems={"center"} mt={4}>
          <Text fontSize={"x-large"} py={4} flex={1}>
            Email List
          </Text>
          {!fetchingData && activeProjectLeadEmailList && (
            <Button
              onClick={onProjectLeadEmailModalOpen}
              bg={colorMode === "light" ? "green.500" : "green.500"}
              color={"white"}
              _hover={{
                bg: colorMode === "light" ? "green.400" : "green.400",
              }}
            >
              Get Project Leads
            </Button>
          )}
        </Flex>
      </Box>

      <ProjectLeadEmailModal
        isOpen={isProjectLeadEmailModalOpen}
        onClose={onProjectLeadEmailModalClose}
      />

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
          Press "Check Data" to get the latest information for project leads in
          active, update requested and suspended projects.
        </Text>
      </Center>

      <Box>
        <Text>DBCA</Text>
        {activeProjectLeadEmailList?.map((ac) => <Text>{ac.email}</Text>)}

        <Text mt={8}>NON DBCA</Text>
        {inactiveLeadList?.map((inac) => <Text>{inac.email}</Text>)}
      </Box>
    </>
  );
};
