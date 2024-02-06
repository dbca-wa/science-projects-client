import DocumentApprovedEmail from "@/components/Emails/DocumentApprovedEmail";
import DocumentReadyForEditingEmail from "@/components/Emails/DocumentReadyForEditingEmail";
import DocumentSentBackEmail from "@/components/Emails/DocumentSentBackEmail";
import NewCycleOpenEmail from "@/components/Emails/NewCycleOpenEmail";
import ProjectClosureEmail from "@/components/Emails/ProjectClosureEmail";
import ReviewDocumentEmail from "@/components/Emails/ReviewDocumentEmail"
import { Box, Button, Flex, Grid, Text } from "@chakra-ui/react"

interface IWrapper {
    children: React.ReactElement;
    templateName: string;
    onSendTestEmail: () => void;
}

const EmailWrapper = ({ children, onSendTestEmail, templateName }: IWrapper) => {
    return (
        <Box
            alignItems={"center"}
            justifyContent={"center"}
            w={"100%"}
            alignContent={"center"}
            bg={"gray.50"}
            pos={"relative"}
        >
            <Box pos={"absolute"} py={2} justifyContent={"center"} w={"100%"} textAlign={"center"}>
                <Text fontWeight={"bold"} color={"blue.500"}>
                    {templateName}
                </Text>
            </Box>

            <Box
                border={"1px solid"}
                borderColor={"gray.300"}
                rounded={'xl'}
            >
                {children}

            </Box>
            <Flex justifyContent={"flex-end"} mt={-10} bg={"gray.200"} py={4} px={6}
                border={"1px solid"}
                borderColor={"gray.300"}
                rounded={'xl'}
                roundedTop={0}

            >
                <Button colorScheme={"blue"} onClick={onSendTestEmail}>Send Test Email</Button>
            </Flex>
        </Box>
    )
}

export const TestEmailPage = () => {
    return (
        <Box>
            <Text fontWeight={"bold"} fontSize={"xl"}>See below for emails templates</Text>
            <Grid
                pt={8}
                gridTemplateColumns={"repeat(3, 1fr)"}
                gridGap={4}
                gridRowGap={8}
            >
                <EmailWrapper
                    templateName={"Review Document"}
                    onSendTestEmail={() => console.log("Sending email")}
                >
                    <ReviewDocumentEmail />
                </EmailWrapper>

                <EmailWrapper
                    templateName={"New Reporting Cycle"}
                    onSendTestEmail={() => console.log("Sending email")}
                >
                    <NewCycleOpenEmail />
                </EmailWrapper>

                <EmailWrapper
                    templateName={"Project Closure"}
                    onSendTestEmail={() => console.log("Sending email")}
                >
                    <ProjectClosureEmail />
                </EmailWrapper>

                <EmailWrapper
                    templateName={"Document Ready"}
                    onSendTestEmail={() => console.log("Sending email")}
                >
                    <DocumentReadyForEditingEmail />
                </EmailWrapper>

                <EmailWrapper
                    templateName={"Document Sent Back"}
                    onSendTestEmail={() => console.log("Sending email")}
                >
                    <DocumentSentBackEmail />
                </EmailWrapper>

                <EmailWrapper
                    templateName={"Document Approved"}
                    onSendTestEmail={() => console.log("Sending email")}
                >
                    <DocumentApprovedEmail />
                </EmailWrapper>
            </Grid>

        </Box>
    )
}