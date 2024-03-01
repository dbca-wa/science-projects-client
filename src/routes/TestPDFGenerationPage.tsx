import { ConceptPlanPDF } from "@/components/HTMLPDFs/ConceptPlanPDF";
import { testFunction } from "@/lib/api";
import { Box, Button, Flex, Grid, Text, ToastId, useColorMode, useToast, } from "@chakra-ui/react";
import { render } from "@react-email/render";
import { useMutation } from "@tanstack/react-query";
import { useRef } from "react";


interface IPDFWrapper {
    children: React.ReactElement;
    templateName: string;
    props?: { concept_plan_pk: number };
}

const PDFWrapper = ({
    children,
    templateName,
}: IPDFWrapper) => {
    const { colorMode } = useColorMode();
    const toast = useToast();
    const toastIdRef = useRef<ToastId>();
    const addToast = (data) => {
        toastIdRef.current = toast(data);
    };
    const mutation = useMutation(testFunction, {
        onMutate: () => {
            const html = render(children, {
                pretty: true,
            });

            console.log(html);

            addToast({
                status: "loading",
                title: "Generating PDF",
                position: "top-right",
            });
        },
        onSuccess: () => {
            if (toastIdRef.current) {
                toast.update(toastIdRef.current, {
                    title: "Success",
                    description: `PDF Generated`,
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
                    title: "Could Not Generate PDF",
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

    // const latexMutation = useMutation(latexTest, {
    //     onMutate: () => {

    //         addToast({
    //             status: "loading",
    //             title: "Generating PDF",
    //             position: "top-right",
    //         });
    //     },
    //     onSuccess: () => {
    //         if (toastIdRef.current) {
    //             toast.update(toastIdRef.current, {
    //                 title: "Success",
    //                 description: `PDF Generated`,
    //                 status: "success",
    //                 position: "top-right",
    //                 duration: 3000,
    //                 isClosable: true,
    //             });
    //         }
    //     },
    //     onError: (error) => {
    //         if (toastIdRef.current) {
    //             toast.update(toastIdRef.current, {
    //                 title: "Could Not Generate PDF",
    //                 description: `${error}`,
    //                 status: "error",
    //                 position: "top-right",
    //                 duration: 3000,
    //                 isClosable: true,
    //             });
    //         }
    //     },
    // });


    // const onTest = () => {
    //     latexMutation.mutate();
    // }

    // latexTest

    return (
        <Box
            alignItems={"center"}
            justifyContent={"center"}
            w={"100%"}
            h={"100%"}
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
                    Generate
                </Button>
                {/* <Button
                    onClick={onTest}
                >
                    Latex Test
                </Button> */}
            </Flex>
        </Box>
    );
};

export const TestPDFGenerationPage = () => {
    return (<Box>
        <Text fontWeight={"bold"} fontSize={"xl"}>
            See below for PDF Design Ideas
        </Text>
        <Grid
            h={"100%"}
            pt={8}
            gridTemplateColumns={{
                base: "repeat(1, 1fr)",
                // lg: "repeat(2, 1fr)",
                // "2xl": "repeat(3, 1fr)",
            }}
            gridGap={4}
            gridRowGap={8}
        >
            <PDFWrapper
                templateName={"Concept Plan"}
            >
                <ConceptPlanPDF
                    concept_plan_pk={296}
                />
            </PDFWrapper>

        </Grid>
    </Box>
    )
}