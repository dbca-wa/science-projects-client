import DocumentApprovedEmail from "@/components/Emails/DocumentApprovedEmail";
import DocumentReadyForEditingEmail from "@/components/Emails/DocumentReadyForEditingEmail";
import DocumentSentBackEmail from "@/components/Emails/DocumentSentBackEmail";
import NewCycleOpenEmail from "@/components/Emails/NewCycleOpenEmail";
import ProjectClosureEmail from "@/components/Emails/ProjectClosureEmail";
import ReviewDocumentEmail from "@/components/Emails/ReviewDocumentEmail"
import { sendTestEmail } from "@/lib/api";
import { Box, Button, Flex, Grid, Text, ToastId, useColorMode, useToast } from "@chakra-ui/react"
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRef } from "react";
import { useForm } from "react-hook-form";

interface IWrapper {
    children: React.ReactElement;
    templateName: string;
    testEmailFunction: () => Promise<any>;
}

const EmailWrapper = ({ children, testEmailFunction, templateName }: IWrapper) => {

    const { colorMode } = useColorMode();
    const queryClient = useQueryClient();
    // const { register, handleSubmit, reset } = useForm<ITestEmail>();
    const toast = useToast();
    const toastIdRef = useRef<ToastId>();
    const addToast = (data) => {
        toastIdRef.current = toast(data);
    };
    const mutation = useMutation(testEmailFunction, {
        onMutate: () => {
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
    }

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
                <Button colorScheme={"blue"} onClick={onSend}>Send Test Email</Button>
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
                    testEmailFunction={sendTestEmail}
                >
                    <ReviewDocumentEmail />
                </EmailWrapper>
                {/* 
                <EmailWrapper
                    templateName={"New Reporting Cycle"}
                    testEmailFunction={() => console.log("Sending email")}
                >
                    <NewCycleOpenEmail />
                </EmailWrapper>

                <EmailWrapper
                    templateName={"Project Closure"}
                    testEmailFunction={() => console.log("Sending email")}
                >
                    <ProjectClosureEmail />
                </EmailWrapper>

                <EmailWrapper
                    templateName={"Document Ready"}
                    testEmailFunction={() => console.log("Sending email")}
                >
                    <DocumentReadyForEditingEmail />
                </EmailWrapper>

                <EmailWrapper
                    templateName={"Document Sent Back"}
                    testEmailFunction={() => console.log("Sending email")}
                >
                    <DocumentSentBackEmail />
                </EmailWrapper>

                <EmailWrapper
                    templateName={"Document Approved"}
                    testEmailFunction={() => console.log("Sending email")}
                >
                    <DocumentApprovedEmail />
                </EmailWrapper> */}
            </Grid>

        </Box>
    )
}