import DocumentApprovedEmail from "@/components/Emails/DocumentApprovedEmail";
import DocumentRecalledEmail from "@/components/Emails/DocumentRecalledEmail";
import { DocumentApprovedEmailModal } from "@/components/Modals/Emails/DocumentApprovedEmailModal";
import {
  IDocumentApproved,
  IDocumentReadyEmail,
  IDocumentRecalled,
  INewCycleEmail,
  IProjectClosureEmail,
  IReviewDocumentEmail,
  sendDocumentApprovedEmail,
} from "@/lib/api/api";
import { useUser } from "@/lib/hooks/tanstack/useUser";
import {
  Box,
  Button,
  Center,
  Flex,
  Grid,
  Spinner,
  Text,
  useColorMode,
  useDisclosure,
} from "@chakra-ui/react";
import React, { useRef } from "react";
import { render } from "@react-email/render";
import { DocumentRecalledEmailModal } from "@/components/Modals/Emails/DocumentRecalledEmailModal";
import { Head } from "@/components/Base/Head";

interface IWrapper {
  children: React.ReactElement;
  templateName: string;
  openModalFunction: () => void;
  props?:
    | IReviewDocumentEmail
    | INewCycleEmail
    | IProjectClosureEmail
    | IDocumentReadyEmail
    | IDocumentApproved
    | IDocumentRecalled;
}

const EmailWrapper = ({
  children,
  openModalFunction,
  templateName,
}: IWrapper) => {
  const { colorMode } = useColorMode();

  const wrapperRef = useRef(null);

  return (
    <Box
      alignItems={"center"}
      justifyContent={"center"}
      w={"100%"}
      alignContent={"center"}
      //   bg={"gray.50"}
      rounded={"xl"}
      pos={"relative"}
      overflow={"hidden"}
    >
      <Box
        bg={colorMode === "light" ? "gray.50" : "gray.800"}
        pos={"absolute"}
        py={2}
        justifyContent={"center"}
        w={"100%"}
        border={"1px solid"}
        borderColor={colorMode === "light" ? "gray.300" : "gray.500"}
        roundedTop={"xl"}
        textAlign={"center"}
      >
        <Text fontWeight={"bold"} color={"blue.500"}>
          {templateName}
        </Text>
      </Box>

      <Box
        ref={wrapperRef}
        border={"1px solid"}
        borderColor={"gray.300"}
        rounded={"xl"}
        // bg={colorMode === "light" ? "gray.200" : "gray.700"}
      >
        {children}
      </Box>
      <Flex
        justifyContent={"flex-end"}
        mt={-10}
        bg={colorMode === "light" ? "gray.200" : "gray.800"}
        py={4}
        px={6}
        border={"1px solid"}
        borderColor={colorMode === "light" ? "gray.300" : "gray.500"}
        rounded={"xl"}
        roundedTop={0}
      >
        <Button
          bg={colorMode === "light" ? "blue.500" : "blue.500"}
          color={"white"}
          _hover={{
            bg: "blue.400",
          }}
          onClick={() => {
            const html = render(children, {
              pretty: true,
            });

            console.log(html);

            openModalFunction();
          }}
        >
          Send Test Email
        </Button>
      </Flex>
    </Box>
  );
};

export const TestEmailPage = () => {
  const { userLoading, userData } = useUser();
  const {
    isOpen: isDocumentApprovedModalOpen,
    onOpen: onDocumentApprovedModalOpen,
    onClose: onDocumentApprovedModalClose,
  } = useDisclosure();
  const {
    isOpen: isDocumentRecalledModalOpen,
    onOpen: onDocumentRecalledModalOpen,
    onClose: onDocumentRecalledModalClose,
  } = useDisclosure();

  return userLoading && !userData ? (
    <Center>
      <Spinner />
    </Center>
  ) : (
    <>
      <Head title="Emails" />
      <Box>
        <DocumentApprovedEmailModal
          isOpen={isDocumentApprovedModalOpen}
          onClose={onDocumentApprovedModalClose}
          emailFunction={sendDocumentApprovedEmail}
          thisUser={userData}
        />
        <DocumentRecalledEmailModal
          isOpen={isDocumentRecalledModalOpen}
          onClose={onDocumentRecalledModalClose}
          emailFunction={sendDocumentApprovedEmail}
          thisUser={userData}
        />
        <Text fontWeight={"bold"} fontSize={"xl"}>
          See below for emails templates
        </Text>
        <Grid
          pt={8}
          gridTemplateColumns={{
            base: "repeat(1, 1fr)",
            lg: "repeat(2, 1fr)",
            "2xl": "repeat(3, 1fr)",
          }}
          gridGap={4}
          gridRowGap={8}
        >
          <EmailWrapper
            templateName={"Document Approved"}
            openModalFunction={onDocumentApprovedModalOpen}
          >
            <DocumentApprovedEmail userData={userData} />
          </EmailWrapper>

          <EmailWrapper
            templateName={"Document Recalled"}
            openModalFunction={onDocumentRecalledModalOpen}
          >
            <DocumentRecalledEmail userData={userData} />
          </EmailWrapper>
        </Grid>
      </Box>
    </>
  );
};
