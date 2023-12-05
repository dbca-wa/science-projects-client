import { ExtractedHTMLTitle } from "@/components/ExtractedHTMLTitle";
import { useProjectSearchContext } from "@/lib/hooks/ProjectSearchContext";
import { IMainDoc } from "@/types"
import { Box, Text, Flex, useColorMode } from "@chakra-ui/react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface IProps {
    document: IMainDoc;
    kind: "team" | "project_lead" | "ba_lead" | "directorate";
}
export const ModernDocumentTaskDisplayCard = ({ document, kind }: IProps) => {

    const { colorMode } = useColorMode();
    const [isHovered, setIsHovered] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);

    useEffect(() => {
        if (isHovered) {
            setIsAnimating(true)

        } else {
            setIsAnimating(false)

        }
    }

        , [isHovered])
    const { isOnProjectsPage } = useProjectSearchContext();

    const navigate = useNavigate();
    const handleProjectTaskCardClick = () => {
        goToProjectDocument(document?.project?.pk, document);
    }

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

    const formattedInputKind = (actionKind: "team" | "project_lead" | "ba_lead" | "directorate") => {
        // "conceptplan" | "projectplan" | "progressreport" | "studentreport" | "projectclosure"
        if (actionKind === "directorate") {
            return "Directorate"
        } else if (actionKind === "team") {
            return "Team Member"
        } else if (actionKind === "project_lead") {
            return "Project Lead"
        } else if (actionKind === "ba_lead") {
            return "Area Lead"
        }
        else {
            // catchall 

            return actionKind
        }
    }

    return (
        <motion.div
            initial={{ scale: 1, opacity: 1 }} // Initial scale (no animation)
            animate={{ scale: isAnimating ? 1.05 : 1, opacity: isAnimating ? 1 : 1 }} // Scale to 0 when isAnimating is true
            transition={{ duration: 0.3 }} // Animation duration in seconds
        >
            <Flex
                p={4}
                userSelect={"none"}
                rounded="lg"
                bg={colorMode === "light" ? "gray.50" : "gray.700"}
                minH="230px"
                // minW="300px"
                // p={4}
                boxShadow={
                    colorMode === "light"
                        ? "0px 7px 12px -3px rgba(0, 0, 0, 0.15), 0px 1.4px 1.75px -0.7px rgba(0, 0, 0, 0.03), -2.1px 0px 7px -1.4px rgba(0, 0, 0, 0.0465), 2.1px 0px 7px -1.4px rgba(0, 0, 0, 0.0465)"
                        : "0px 1.4px 2.1px -0.7px rgba(255, 255, 255, 0.0465), 0px 0.7px 1.4px -0.7px rgba(255, 255, 255, 0.028), -1.4px 0px 2.1px -0.7px rgba(255, 255, 255, 0.032)"
                }
                display="flex"
                flexDirection="column"
                justifyContent="space-between"
                alignItems="stretch"
                pos={"relative"}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                cursor={"pointer"}
                onClick={handleProjectTaskCardClick}
            >
                <ExtractedHTMLTitle
                    htmlContent={document?.project?.title}
                />
                | {kind}
                <Flex>
                    <Text
                        color={`${kind === "directorate" ? "red" : kind === "ba_lead" ? "orange" : "green"}.600`}
                        fontWeight={"semibold"}
                        fontSize={"small"}
                        mr={1}
                    >
                        {`${formattedInputKind(kind)}:`}
                    </Text>
                    <Text
                        color={"gray.500"}
                        fontWeight={"semibold"}
                        fontSize={"small"}
                    >
                        {
                            kind === "team"
                                ?
                                "Input required"
                                :
                                `Determine if the ${formattedDocumentKind(document?.kind)} for this project is satisfactory`
                        }

                        {/* {inputKind === "team_member" ? "Input" : "Action"} required as {formattedInputKind(inputKind)} */}
                    </Text>
                </Flex>

            </Flex>
        </motion.div>
    )
}