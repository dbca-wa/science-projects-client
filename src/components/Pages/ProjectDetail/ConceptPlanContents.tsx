// Maps out the document provided to the rich text editor components for concept plan documents. 

import { Box, Text, useColorMode } from "@chakra-ui/react"
import { DocumentActions } from "./DocumentActions"
import { IConceptPlan } from "../../../types";
import { RichTextEditor } from "../../RichTextEditor/Editors/RichTextEditor";

interface Props {
    document: IConceptPlan | null;
    projectPk: number;
}

export const ConceptPlanContents = ({ document, projectPk }: Props) => {


    // Force a rerender when dark mode or year changed to update design and content
    // const editorKey = selectedYear.toString() + colorMode;
    const { colorMode } = useColorMode();

    const documentType = "conceptplan"
    const editorKey = colorMode + documentType;


    return (
        <>

            <DocumentActions
                tabType={"concept"}
                document={document}
                projectPk={projectPk}
            />


            <RichTextEditor
                key={`background${editorKey}`} // Change the key to force a re-render
                data={document?.background}
                section={"background"}
            />
            <RichTextEditor
                key={`aims${editorKey}`} // Change the key to force a re-render
                data={document?.aims}
                section={"aims"}
            />

            <RichTextEditor
                key={`outcome${editorKey}`} // Change the key to force a re-render
                data={document?.outcome}
                section={"outcome"}
            />
            <RichTextEditor
                key={`collaborations${editorKey}`} // Change the key to force a re-render
                data={document?.collaborations}
                section={"collaborations"}
            />
            <RichTextEditor
                key={`strategic_context${editorKey}`} // Change the key to force a re-render
                data={document?.strategic_context}
                section={"strategic_context"}
            />


            <RichTextEditor
                key={`staff_time_allocation${editorKey}`} // Change the key to force a re-render
                data={document?.staff_time_allocation}
                section={"staff_time_allocation"}
            />

            <RichTextEditor
                key={`budget${editorKey}`} // Change the key to force a re-render
                data={document?.budget}
                section={"budget"}
            />

            {/* <Box
                pb={6}
            >
                <Text
                    fontWeight={"bold"}
                    fontSize={"2xl"}
                >
                    Staff Time Allocation
                </Text>
                <Box
                    mt={4}

                >
                    {document?.staff_time_allocation}
                    [["Role", "Year 1", "Year 2", "Year 3"], ["Scientist", "", "", ""], ["Technical", "", "", ""], ["Volunteer", "", "", ""], ["Collaborator", "", "", ""]]
                </Box>
                <SimpleRichTextEditor
                    data={document?.staff_time_allocation}
                />
            </Box>

            <Box
                pb={6}
            >
                <Text
                    fontWeight={"bold"}
                    fontSize={"2xl"}
                >
                    Indicative Operating Budget
                </Text>
                <Box
                    mt={4}
                >
                    {document?.budget}
                    [["Source", "Year 1", "Year 2", "Year 3"], ["Consolidated Funds (DBCA)", "", "", ""], ["External Funding", "", "", ""]]
                </Box>
                <SimpleRichTextEditor
                    data={document?.budget}
                />
            </Box> */}
        </>

    )
}