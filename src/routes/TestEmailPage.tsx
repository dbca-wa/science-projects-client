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
  sendDocumentRecalledEmail,
} from "@/lib/api";
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
import { renderToStaticMarkup } from "react-dom/server";
import { DocumentRecalledEmailModal } from "@/components/Modals/Emails/DocumentRecalledEmailModal";
import { Head } from "@/components/Base/Head";
import { on } from "events";
import { IEmailModalProps, IUserMe } from "@/types";
import { AxiosError, AxiosResponse } from "axios";

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

// const EmailWrapper = ({
//   children,
//   openModalFunction,
//   templateName,
// }: IWrapper) => {
//   const { colorMode } = useColorMode();

//   const wrapperRef = useRef(null);

//   return (
// <Box
//   alignItems={"center"}
//   justifyContent={"center"}
//   w={"100%"}
//   alignContent={"center"}
//   //   bg={"gray.50"}
//   rounded={"xl"}
//   pos={"relative"}
//   overflow={"hidden"}
// >
// <Box
//   bg={colorMode === "light" ? "gray.50" : "gray.800"}
//   pos={"absolute"}
//   py={2}
//   justifyContent={"center"}
//   w={"100%"}
//   border={"1px solid"}
//   borderColor={colorMode === "light" ? "gray.300" : "gray.500"}
//   roundedTop={"xl"}
//   textAlign={"center"}
// >
//   <Text fontWeight={"bold"} color={"blue.500"}>
//     {templateName}
//   </Text>
// </Box>

//       <Box
//         ref={wrapperRef}
//         border={"1px solid"}
//         borderColor={"gray.300"}
//         rounded={"xl"}
//         minH={"300px"}

//         // bg={colorMode === "light" ? "gray.200" : "gray.700"}
//       >
//         {children}
//       </Box>
// <Flex
//   justifyContent={"flex-end"}
//   mt={-10}
//   bg={colorMode === "light" ? "gray.200" : "gray.800"}
//   py={4}
//   px={6}
//   border={"1px solid"}
//   borderColor={colorMode === "light" ? "gray.300" : "gray.500"}
//   rounded={"xl"}
//   roundedTop={0}
// >
//   <Button
//     bg={colorMode === "light" ? "blue.500" : "blue.500"}
//     color={"white"}
//     _hover={{
//       bg: "blue.400",
//     }}
//     onClick={() => {
//       const html = render(children, {
//         pretty: true,
//       });

//       console.log(html);

//       openModalFunction();
//     }}
//   >
//     Send Test Email
//   </Button>
// </Flex>
//     </Box>
//   );
// };

// Type for the actual API functions
type ApiEmailFunction = (
  data: any,
) => Promise<AxiosResponse<any, any> | AxiosError>;

// Type for what the modal expects
type ModalEmailFunction = (data: any) => Promise<void>;

interface EmailPreviewWrapperProps {
  emailComponent: React.ReactElement;
  title: string;
  ModalComponent: React.ComponentType<IEmailModalProps>;
  thisUser: IUserMe;
  emailFunction: ApiEmailFunction; // This accepts the API function type
}

export const EmailPreviewWrapper: React.FC<EmailPreviewWrapperProps> = ({
  emailComponent,
  title,
  ModalComponent,
  thisUser,
  emailFunction,
}) => {
  const [htmlString, setHtmlString] = React.useState<string>("");
  const { colorMode } = useColorMode();
  const { isOpen, onOpen, onClose } = useDisclosure();

  React.useEffect(() => {
    try {
      const rendered = renderToStaticMarkup(emailComponent);
      setHtmlString(rendered);
    } catch (error) {
      console.error("Error rendering email:", error);
    }
  }, [emailComponent]);
  return (
    <>
      <ModalComponent
        isOpen={isOpen}
        onClose={onClose}
        emailFunction={emailFunction}
        thisUser={thisUser}
      />

      <Box
        alignItems="center"
        justifyContent="center"
        w="100%"
        alignContent="center"
        border="1px solid"
        borderColor={colorMode === "light" ? "gray.300" : "gray.500"}
        rounded="xl"
        pos="relative"
        overflow="hidden"
      >
        <Box
          bg={colorMode === "light" ? "gray.50" : "gray.800"}
          py={2}
          justifyContent="center"
          w="100%"
          borderBottom="1px solid"
          borderColor={colorMode === "light" ? "gray.300" : "gray.500"}
          roundedTop="xl"
          textAlign="center"
        >
          <Text fontWeight="bold" color="blue.500">
            {title}
          </Text>
        </Box>

        <div
          className="email-preview"
          dangerouslySetInnerHTML={{ __html: htmlString }}
        />

        <Flex
          justifyContent="flex-end"
          mt={-10}
          bg={colorMode === "light" ? "gray.200" : "gray.800"}
          py={4}
          px={6}
          border="1px solid"
          borderColor={colorMode === "light" ? "gray.300" : "gray.500"}
          rounded="xl"
          roundedTop={0}
        >
          <Button
            bg={colorMode === "light" ? "blue.500" : "blue.500"}
            color="white"
            _hover={{
              bg: "blue.400",
            }}
            onClick={onOpen}
          >
            Send Test Email
          </Button>
        </Flex>
      </Box>
    </>
  );
};

export const TestEmailPage = () => {
  const { userLoading, userData } = useUser();
  if (userLoading || !userData) {
    return (
      <Center>
        <Spinner />
      </Center>
    );
  }

  return (
    <>
      <Head title="Emails" />
      <Box>
        <Text fontWeight="bold" fontSize="xl">
          Email Templates
        </Text>

        <Grid
          pt={8}
          templateColumns={{
            base: "1fr",
            lg: "repeat(1, 1fr)",
            "2xl": "repeat(1, 1fr)",
          }}
          gap={4}
          rowGap={8}
        >
          <Box>
            <EmailPreviewWrapper
              title="Document Approved"
              emailComponent={<DocumentApprovedEmail userData={userData} />}
              ModalComponent={DocumentApprovedEmailModal}
              emailFunction={sendDocumentApprovedEmail}
              thisUser={userData}
            />
          </Box>

          <Box>
            <EmailPreviewWrapper
              title="Document Recalled"
              emailComponent={<DocumentRecalledEmail userData={userData} />}
              ModalComponent={DocumentRecalledEmailModal}
              emailFunction={sendDocumentRecalledEmail}
              thisUser={userData}
            />
          </Box>
        </Grid>
      </Box>
    </>
  );
};
