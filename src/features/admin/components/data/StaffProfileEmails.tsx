import { getStaffProfileEmailList } from "@/shared/lib/api";
import {
  Box,
  Button,
  Flex,
  useColorMode,
  Text,
  Center,
  Spinner,
  Input,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { MdEmail } from "react-icons/md";
import { TbRefresh } from "react-icons/tb";
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
      <Box>
        <Flex alignItems={"center"} mt={4}>
          <Text fontSize={"x-large"} py={4} flex={1}>
            Users with Staff Profiles{" "}
            {activeProjectLeadEmailList?.length > 0 &&
              `(${activeProjectLeadEmailList?.length})`}
          </Text>
          {!fetchingData && activeProjectLeadEmailList?.length > 1 && (
            <Flex justifyContent={"flex-end"}>
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
          )}
        </Flex>
      </Box>

      {/* <ProjectLeadEmailModal
    isOpen={isProjectLeadEmailModalOpen}
    onClose={onProjectLeadEmailModalClose}
  /> */}
      {fetchingData && !activeProjectLeadEmailList ? (
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
                Press "Check Data" to get emails for users with staff profiles
              </Text>
            </Center>
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
    <Box mb={4}>
      <Text mb={2} ml={2}>
        Some systems may block the email button due to large amount of emails.
        Copy and paste the email list into your email client if it is blocked.
      </Text>
      <Flex align="center">
        <Input value={emailString} readOnly />
        <Flex>
          <Button
            onClick={copyToClipboard}
            mx={2}
            bg={copySuccess ? "green.400" : "blue.400"}
            color="white"
            _hover={{ bg: copySuccess ? "green.500" : "blue.500" }}
          >
            {copySuccess ? "Copied!" : "Copy"}
          </Button>
          <Button
            bg={colorMode === "light" ? "green.500" : "green.500"}
            color={"white"}
            _hover={{
              bg: colorMode === "light" ? "green.400" : "green.400",
            }}
            onClick={handleSendClick}
            isDisabled={activeProjectLeadEmailList?.length < 1}
            mr={2}
            leftIcon={<MdEmail />}
          >
            Email
          </Button>
        </Flex>
      </Flex>
    </Box>
  );
};
