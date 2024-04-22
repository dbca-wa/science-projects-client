import DocumentApprovedEmail from "@/components/Emails/DocumentApprovedEmail";
// import DocumentReadyForEditingEmail from "@/components/Emails/DocumentReadyForEditingEmail";
import DocumentRecalledEmail from "@/components/Emails/DocumentRecalledEmail";
// import DocumentSentBackEmail from "@/components/Emails/DocumentSentBackEmail";
// import NewCycleOpenEmail from "@/components/Emails/NewCycleOpenEmail";
// import ProjectClosureEmail from "@/components/Emails/ProjectClosureEmail";
// import ReviewDocumentEmail from "@/components/Emails/ReviewDocumentEmail";
import { DocumentApprovedEmailModal } from "@/components/Modals/Emails/DocumentApprovedEmailModal";
import {
  IDocumentApproved,
  IDocumentReadyEmail,
  IDocumentRecalled,
  INewCycleEmail,
  IProjectClosureEmail,
  IReviewDocumentEmail,
  sendDocumentApprovedEmail,
  // sendDocumentReadyEmail,
  // sendDocumentRecalledEmail,
  // sendDocumentSentBackEmail,
  // sendNewReportingCycleOpenEmail,
  // sendProjectClosureEmail,
  // sendReviewProjectDocumentEmail,
} from "@/lib/api";
import { useUser } from "@/lib/hooks/useUser";
import {
  Box,
  Button,
  Center,
  Flex,
  Grid,
  Spinner,
  Text,
  // ToastId,
  useColorMode,
  useDisclosure,
  // useToast,
} from "@chakra-ui/react";
import React, {
  useRef,
  // useState, ReactElement, createElement, useEffect 
} from "react";
import { render } from "@react-email/render";
import { DocumentRecalledEmailModal } from "@/components/Modals/Emails/DocumentRecalledEmailModal";
// import {
//   useMutation,
//   //  useQueryClient 
// } from "@tanstack/react-query";
// import { useRef } from "react";

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
          onClick={
            () => {
              const html = render(children, {
                pretty: true,
              });

              console.log(html);

              openModalFunction();
            }
          }
        >
          Send Test Email
        </Button>
      </Flex>
    </Box>
  );
};

export const TestEmailPage = () => {
  const { userLoading, userData } = useUser();
  const { isOpen: isDocumentApprovedModalOpen, onOpen: onDocumentApprovedModalOpen, onClose: onDocumentApprovedModalClose } = useDisclosure();
  const { isOpen: isDocumentRecalledModalOpen, onOpen: onDocumentRecalledModalOpen, onClose: onDocumentRecalledModalClose } = useDisclosure();


  return (
    (userLoading && !userData) ?
      <Center><Spinner /></Center> : (
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
            {/* <EmailWrapper
              templateName={"Review Document"}
              // emailFunction={onDocumentApprovedModalOpen}
              props={{
                recipients_list: [101073],
                project_pk: 4,
                document_kind: "concept",
              }}
            >
              <ReviewDocumentEmail userData={userData} />
            </EmailWrapper>

            <EmailWrapper
              templateName={"New Reporting Cycle"}
              emailFunction={sendNewReportingCycleOpenEmail}
              props={{
                financial_year: 2024,
                include_projects_with_status_updating: false,
              }}
            >
              <NewCycleOpenEmail userData={userData} />
            </EmailWrapper>

            <EmailWrapper
              templateName={"Project Closure"}
              emailFunction={sendProjectClosureEmail}
              props={{
                project_pk: 20,
              }}
            >
              <ProjectClosureEmail userData={userData} />
            </EmailWrapper>

            <EmailWrapper
              templateName={"Document Ready"}
              emailFunction={sendDocumentReadyEmail}
              props={{
                recipients_list: [101073],
                project_pk: 4,
                document_kind: "concept",
              }}
            >
              <DocumentReadyForEditingEmail userData={userData} />
            </EmailWrapper>

            <EmailWrapper
              templateName={"Document Sent Back"}
              emailFunction={sendDocumentSentBackEmail}
              props={{
                stage: 3,
                recipients_list: [101073],
                project_pk: 4,
                document_kind: "concept",
              }}
            >
              <DocumentSentBackEmail userData={userData} />
            </EmailWrapper> */}

            <EmailWrapper
              templateName={"Document Approved"}
              openModalFunction={onDocumentApprovedModalOpen}
            >
              <DocumentApprovedEmail
                userData={userData}
              />
            </EmailWrapper>

            <EmailWrapper
              templateName={"Document Recalled"}
              openModalFunction={onDocumentRecalledModalOpen}
            >
              <DocumentRecalledEmail userData={userData} />
            </EmailWrapper>
          </Grid>
        </Box>
      )

  );
};



// emailFunction={sendDocumentRecalledEmail}
// props={{
//   stage: 3,
//   recipients_list: [101073],
//   project_pk: 4,
//   document_kind: "concept",
// }}