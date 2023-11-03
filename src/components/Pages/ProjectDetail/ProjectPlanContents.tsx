// Maps out the document provided to the rich text editor components for project plan documents. 

import { Box, Checkbox, Grid, Text, useColorMode } from "@chakra-ui/react"
import { DocumentActions } from "./DocumentActions"
import { IProjectPlan } from "../../../types";
import { RichTextEditor } from "../../RichTextEditor/Editors/RichTextEditor";

interface Props {
    document: IProjectPlan | null;
}

export const ProjectPlanContents = ({ document }: Props) => {


    // Force a rerender when dark mode or year changed to update design and content
    // const editorKey = selectedYear.toString() + colorMode;
    const { colorMode } = useColorMode();

    const documentType = "projectplan"
    const editorKey = colorMode + documentType;


    return (
        <>
            {/* <DocumentActions /> */}

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
                key={`knowledge_transfer${editorKey}`} // Change the key to force a re-render
                data={document?.knowledge_transfer}
                section={"knowledge_transfer"}
            />
            <RichTextEditor
                key={`project_tasks${editorKey}`} // Change the key to force a re-render
                data={document?.project_tasks}
                section={"project_tasks"}
            />
            <RichTextEditor
                key={`related_projects${editorKey}`} // Change the key to force a re-render
                data={document?.related_projects}
                section={"related_projects"}
            />
            <RichTextEditor
                key={`listed_references${editorKey}`} // Change the key to force a re-render
                data={document?.listed_references}
                section={"listed_references"}
            />


            <RichTextEditor
                key={`data_management${editorKey}`} // Change the key to force a re-render
                data={document?.endorsemeents?.data_management}
                section={"data_management"}
            />

            <RichTextEditor
                key={`methodology${editorKey}`} // Change the key to force a re-render
                data={document?.methodology}
                section={"methodology"}
            />


            <RichTextEditor
                key={`no_specimens${editorKey}`} // Change the key to force a re-render
                data={document?.endorsemeents?.no_specimens}
                section={"specimens"}
            />


            {/* <SimpleRichTextEditor
                key={`no_specimens${editorKey}`} // Change the key to force a re-render
                data={document?.endorsemeents?.no_specimens}
                section={"specimens"}
            /> */}
            <Box
                pb={6}
            >
                <Text
                    fontWeight={"bold"}
                    fontSize={"2xl"}
                >
                    Endorsements
                </Text>
                <Grid
                    mt={4}
                >
                    <Box>
                        Herbarium Curator's Endorsement
                        {
                            document?.endorsemeents && (
                                <Checkbox
                                    checked={
                                        document.endorsemeents.hc_endorsement
                                    }
                                />

                            )
                        }
                    </Box>
                    <Box>
                        Animal Ethics Committee's Endorsement
                        {
                            document?.endorsemeents && (
                                <Checkbox
                                    checked={
                                        document.endorsemeents.ae_endorsement
                                    }
                                />

                            )
                        }
                    </Box>
                </Grid>

            </Box>


            <Box
                pb={6}
            >
                <Text
                    fontWeight={"bold"}
                    fontSize={"2xl"}
                >
                    Funding
                </Text>
                <Grid
                    mt={4}
                    gridRowGap={10}
                >
                    {/* <Box>
                        External Funds: {document?.operating_budget_external}
                    </Box> */}
                    <Box>
                        <Text
                            fontWeight={"semibold"}
                        >External Budget:</Text>
                        {/* <SimpleRichTextEditor
                            data={document?.operating_budget_external}
                        /> */}

                    </Box>
                    <Box>
                        <Text
                            fontWeight={"semibold"}
                        >Operating Budget:</Text>

                        {/* <SimpleRichTextEditor
                            data={document?.operating_budget}
                        /> */}

                    </Box>
                </Grid>

            </Box>

            <Box
                pb={6}
            >
                <Text
                    fontWeight={"bold"}
                    fontSize={"2xl"}
                >
                    Involves
                </Text>
                <Grid
                    mt={4}
                >
                    <Box>
                        Plant Specimen Collection
                        <Checkbox
                            checked={
                                document?.involves_plants
                            }
                        />
                    </Box>
                    <Box>
                        Interaction with Vertebrate Animals
                        <Checkbox
                            checked={
                                document?.involves_animals
                            }
                        />

                    </Box>
                </Grid>

            </Box>

        </>
    )
}