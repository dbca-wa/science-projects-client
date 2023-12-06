import { ExtractedHTMLTitle } from "@/components/ExtractedHTMLTitle";
import { useProjectSearchContext } from "@/lib/hooks/ProjectSearchContext";
import { IMainDoc } from "@/types";
import { Box, Button, Center, Flex, useColorMode, Text, Divider, Grid, Tag } from "@chakra-ui/react"
import { FaArrowRight } from "react-icons/fa"
import { HiDocumentCheck } from "react-icons/hi2"
import { useNavigate } from "react-router-dom";
import { FaBiohazard, FaShieldDog } from "react-icons/fa6";
import { PiPlantFill } from "react-icons/pi";
import { useBoxShadow } from "@/lib/hooks/useBoxShadow";

interface IProps {
    inputKind: "team_member" | "project_lead" | "business_area_lead" | "directorate";
    document: IMainDoc;
}

export const TraditionalDocumentTaskDisplay = ({ inputKind, document }: IProps) => {
    const { colorMode } = useColorMode();
    const navigate = useNavigate();
    const { isOnProjectsPage } = useProjectSearchContext();

    const goToProjectDocument = (pk: number | undefined, document: IMainDoc) => {

        let urlkind = '';
        if (document?.kind === "progressreport") {
            urlkind = 'progress'
        } else if (document?.kind === "projectclosure") {
            urlkind = 'closure'
        } else if (document?.kind === "studentreport") {
            urlkind = 'student'
        } else if (document?.kind === "concept") {
            urlkind = 'concept'
        } else if (document?.kind === "projectplan") {
            urlkind = 'project'
        }

        if (pk === undefined) {
            console.log("The Pk is undefined. Potentially use 'id' instead.")
        }
        else if (isOnProjectsPage) {
            navigate(`${pk}/${urlkind}`)
        }
        else {
            navigate(`projects/${pk}/${urlkind}`)

        }
    }


    const formattedDocumentKind = (docKind: string) => {
        // "conceptplan" | "projectplan" | "progressreport" | "studentreport" | "projectclosure"
        if (docKind === "studentreport") {
            return "Student"
        } else if (docKind === "concept") {
            return "Concept Plan"
        } else if (docKind === "projectclosure") {
            return "Project Closure"
        } else if (docKind === "projectplan") {
            return "Project Plan"
        }
        else if (docKind === "progressreport") {
            return "Progress Report"
        }
        else {
            // catchall 

            return docKind
        }
    }

    const formattedInputKind = (actionKind: "team_member" | "project_lead" | "business_area_lead" | "directorate") => {
        // "conceptplan" | "projectplan" | "progressreport" | "studentreport" | "projectclosure"
        if (actionKind === "directorate") {
            return "Directorate"
        } else if (actionKind === "team_member") {
            return "Team Member"
        } else if (actionKind === "project_lead") {
            return "Project Lead"
        } else if (actionKind === "business_area_lead") {
            return "Business Area Lead"
        }
        else {
            // catchall 

            return actionKind
        }
    }
    const boxShadow = useBoxShadow();



    return (
        <Flex
            alignItems={"center"}
            border={"1px solid"}
            borderTopWidth={0}
            borderColor={colorMode === "light" ? "gray.200" : "gray.600"}
            w={"100%"}
            p={2}
            _hover={{
                color: colorMode === "dark" ? "blue.100" : "blue.300",
                cursor: "pointer",
                boxShadow: boxShadow,
                zIndex: 999,

            }}
            onClick={() => goToProjectDocument(document?.project?.pk ? document?.project?.pk : document?.project?.id, document)}

        >
            <Flex
                // gridTemplateRows={"repeat(2, 1fr)"}
                // bg={"pink"}
                minW={"156px"}
                maxW={"156px"}
            >
                <Box
                    // bg={"yellow"}
                    alignItems={"center"}
                    display={"flex"}
                >
                    <Center
                        color={
                            colorMode === "light" ? "red.600" : "red.200"
                        }
                        mr={3}
                        alignItems={"center"}
                        alignContent={"center"}
                        boxSize={5}
                        w={"20px"}

                    // w={"100%"}
                    // bg={"orange"}

                    >
                        <HiDocumentCheck />
                    </Center>
                </Box>


                <Flex
                    flexDir={"column"}
                // p={1}
                >


                    <Box
                        // mx={0}
                        w={"100%"}
                    >
                        <Text>
                            {formattedDocumentKind(document?.kind)}
                        </Text>

                    </Box>



                </Flex>
            </Flex>


            <Divider
                orientation='vertical'
                // ml={-1}
                mr={5}
            />
            {/* <SimpleDisplaySRTE

            data={document?.project.title}
            displayData={document?.project.title}
            displayArea="traditionalProjectTitle"
        /> */}
            <Grid
                flex={1}
            >
                <Flex>

                    <ExtractedHTMLTitle
                        htmlContent={`${document?.project?.title}`}
                        // onClick={() => goToProjectDocument(document?.project?.pk ? document?.project?.pk : document?.project?.id, document)}

                        color={
                            colorMode === "dark" ? "blue.200" : "blue.400"
                        }
                        fontWeight={"bold"}
                        cursor={"pointer"}
                    // _hover={
                    //     {
                    //         color: colorMode === "dark" ? "blue.100" : "blue.300",
                    //         textDecoration: "underline",
                    //     }
                    // }
                    />


                </Flex>
                <Flex>
                    <Text
                        color={`${inputKind === "directorate" ? "red" : inputKind === "business_area_lead" ? "orange" : "green"}.600`}
                        fontWeight={"semibold"}
                        fontSize={"small"}
                        mr={1}
                    >
                        {`${formattedInputKind(inputKind)}:`}
                    </Text>
                    <Text
                        color={"gray.500"}
                        fontWeight={"semibold"}
                        fontSize={"small"}
                    >
                        {
                            inputKind === "team_member"
                                ?
                                "Input required"
                                :
                                `Determine if the ${formattedDocumentKind(document?.kind)} for this project is satisfactory`

                        }

                        {/* {inputKind === "team_member" ? "Input" : "Action"} required as {formattedInputKind(inputKind)} */}
                    </Text>
                </Flex>



            </Grid>

            {/* <Flex
                alignItems="center"
                justifyContent={'flex-end'}
                right={0}
                // flex={1}
                pl={4}
                flexDir={"column"}
            // bg={"orange"}
            >

                <Button
                    size={"xs"}
                    bg={"blue.500"}
                    color={"white"}
                    _hover={{
                        bg: "blue.400"
                    }}
                    // rightIcon={<FaArrowRight />}
                    onClick={() => goToProjectDocument(document?.project?.pk ? document?.project?.pk : document?.project?.id, document)}
                // maxW={"70px"}
                // minW={"70px"}
                >
                    <FaArrowRight />
                </Button>

            </Flex> */}

        </Flex>
    )
}