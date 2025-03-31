import { INewCycleEmail } from "@/lib/api";
import { IEmailModalProps, IUserMe } from "@/types";
import {
  Box,
  Button,
  Flex,
  Text,
  useColorMode,
  useDisclosure,
} from "@chakra-ui/react";
import { AxiosError, AxiosResponse } from "axios";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

{
  /* <TabPanel>
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
                    emailComponent={
                      <DocumentApprovedEmail userData={userData} />
                    }
                    ModalComponent={DocumentApprovedEmailModal}
                    emailFunction={sendDocumentApprovedEmail}
                    thisUser={userData}
                  />
                </Box>

                <Box>
                  <EmailPreviewWrapper
                    title="Document Recalled"
                    emailComponent={
                      <DocumentRecalledEmail userData={userData} />
                    }
                    ModalComponent={DocumentRecalledEmailModal}
                    emailFunction={sendDocumentRecalledEmail}
                    thisUser={userData}
                  />
                </Box>
              </Grid>
            </Box>
          </TabPanel> */
}
interface IWrapper {
  children: React.ReactElement;
  templateName: string;
  openModalFunction: () => void;
  props?: INewCycleEmail;
}

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

const EmailStylingPage = () => {
  return <div>Style your emails here</div>;
};

export default EmailStylingPage;
