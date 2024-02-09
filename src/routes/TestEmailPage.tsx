import DocumentApprovedEmail from "@/components/Emails/DocumentApprovedEmail";
import DocumentReadyForEditingEmail from "@/components/Emails/DocumentReadyForEditingEmail";
import DocumentRecalledEmail from "@/components/Emails/DocumentRecalledEmail";
import DocumentSentBackEmail from "@/components/Emails/DocumentSentBackEmail";
import NewCycleOpenEmail from "@/components/Emails/NewCycleOpenEmail";
import ProjectClosureEmail from "@/components/Emails/ProjectClosureEmail";
import ReviewDocumentEmail from "@/components/Emails/ReviewDocumentEmail";
import {
  IDocumentApproved,
  IDocumentReadyEmail,
  IDocumentRecalled,
  INewCycleEmail,
  IProjectClosureEmail,
  IReviewDocumentEmail,
  sendDocumentApprovedEmail,
  sendDocumentReadyEmail,
  sendDocumentRecalledEmail,
  sendDocumentSentBackEmail,
  sendNewReportingCycleOpenEmail,
  sendProjectClosureEmail,
  sendReviewProjectDocumentEmail,
} from "@/lib/api";
import {
  Box,
  Button,
  Flex,
  Grid,
  Text,
  ToastId,
  useColorMode,
  useToast,
} from "@chakra-ui/react";
import { render } from "@react-email/render";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRef } from "react";

interface IWrapper {
  children: React.ReactElement;
  templateName: string;
  emailFunction: (
    props?:
      | IReviewDocumentEmail
      | INewCycleEmail
      | IProjectClosureEmail
      | IDocumentReadyEmail
      | IDocumentApproved
      | IDocumentRecalled
  ) => Promise<any>; // Allow props to be optional
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
  emailFunction,
  templateName,
  props,
}: IWrapper) => {
  const { colorMode } = useColorMode();
  const queryClient = useQueryClient();
  // const { register, handleSubmit, reset } = useForm<ITestEmail>();
  const toast = useToast();
  const toastIdRef = useRef<ToastId>();
  const addToast = (data) => {
    toastIdRef.current = toast(data);
  };
  const mutation = useMutation(() => emailFunction(props ?? undefined), {
    onMutate: () => {
      const html = render(children, {
        pretty: true,
      });

      console.log(html);

      addToast({
        status: "loading",
        title: "Sending Email",
        position: "top-right",
      });
    },
    onSuccess: () => {
      if (toastIdRef.current) {
        toast.update(toastIdRef.current, {
          title: "Success",
          description: `Email Sent`,
          status: "success",
          position: "top-right",
          duration: 3000,
          isClosable: true,
        });
      }
    },
    onError: (error) => {
      if (toastIdRef.current) {
        toast.update(toastIdRef.current, {
          title: "Could Not Send Email",
          description: `${error}`,
          status: "error",
          position: "top-right",
          duration: 3000,
          isClosable: true,
        });
      }
    },
  });

  const onSend = () => {
    mutation.mutate();
  };

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
          onClick={onSend}
        >
          Send Test Email
        </Button>
      </Flex>
    </Box>
  );
};

export const TestEmailPage = () => {
  return (
    <Box>
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
          templateName={"Review Document"}
          emailFunction={sendReviewProjectDocumentEmail}
          props={{
            recipients_list: [101073],
            project_pk: 4,
            document_kind: "concept",
          }}
        >
          <ReviewDocumentEmail />
        </EmailWrapper>

        <EmailWrapper
          templateName={"New Reporting Cycle"}
          emailFunction={sendNewReportingCycleOpenEmail}
          props={{
            financial_year: 2024,
            include_projects_with_status_updating: false,
          }}
        >
          <NewCycleOpenEmail />
        </EmailWrapper>

        <EmailWrapper
          templateName={"Project Closure"}
          emailFunction={sendProjectClosureEmail}
          props={{
            project_pk: 20,
          }}
        >
          <ProjectClosureEmail />
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
          <DocumentReadyForEditingEmail />
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
          <DocumentSentBackEmail />
        </EmailWrapper>

        <EmailWrapper
          templateName={"Document Approved"}
          emailFunction={sendDocumentApprovedEmail}
          props={{
            recipients_list: [101073],
            project_pk: 4,
            document_kind: "concept",
          }}
        >
          <DocumentApprovedEmail />
        </EmailWrapper>

        <EmailWrapper
          templateName={"Document Recalled"}
          emailFunction={sendDocumentRecalledEmail}
          props={{
            stage: 3,
            recipients_list: [101073],
            project_pk: 4,
            document_kind: "concept",
          }}
        >
          <DocumentRecalledEmail />
        </EmailWrapper>
      </Grid>
    </Box>
  );
};
