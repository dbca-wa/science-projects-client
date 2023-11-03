// The basic rich text editor component; does not allow sticky notes, emotes, etc.

// React
import { useEffect, useRef, useState } from "react"

// Styles and Styling Components
import { Box, useColorMode, Text, Flex, Grid } from "@chakra-ui/react";

// Lexical
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import LexicalErrorBoundary from '@lexical/react/LexicalErrorBoundary';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';

// Lexical Plugins
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { NodeEventPlugin } from "@lexical/react/LexicalNodeEventPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin"
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ClearEditorPlugin } from '@lexical/react/LexicalClearEditorPlugin';


// Custom Components
import { OptionsBar } from "../OptionsBar/OptionsBar";
// import { AutoFocusPlugin } from "../../../../lib/plugins/AutoFocusPlugin";


import '../../../styles/texteditor.css'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getRoot, $getSelection, ParagraphNode } from "lexical";



import { ListItemNode, ListNode } from "@lexical/list";
import { HeadingNode } from "@lexical/rich-text";

import { EditableSRTE } from "./Sections/EditableSRTE";
import { DisplaySRTE } from "./Sections/DisplaySRTE";
import { EditorSubsections, EditorType } from "../../../types";
import { HideEditorButton } from "../Buttons/HideEditorButton";



interface IProps {
    data: string;
    titleTextSize?: string;
    section: EditorSubsections;
    project_pk: number;
    document_pk?: number;
    editorType: EditorType;
    isUpdate: boolean;
}

export const RichTextEditor = ({ data, titleTextSize, section, project_pk, document_pk, editorType, isUpdate }: IProps) => {

    const [shouldShowTree, setShouldShowTree] = useState(false);
    const { colorMode } = useColorMode();

    const [lastSelectedNode, setLastSelectedNode] = useState();

    const generateTheme = (colorMode) => {
        return {
            quote: 'editor-quote',
            ltr: "ltr",
            rtl: "rtl",
            paragraph: colorMode === "light" ? 'editor-p-light' : "editor-p-dark",
            span: colorMode === "light" ? 'editor-p-light' : "editor-p-dark",
            heading: {
                h1: colorMode === "light" ? 'editor-h1-light' : "editor-h1-dark",
                h2: colorMode === "light" ? 'editor-h2-light' : "editor-h2-dark",
                h3: colorMode === "light" ? 'editor-h3-light' : "editor-h3-dark",
            },
            list: {
                ul: colorMode === "light" ? 'editor-ul-light' : 'editor-ul-dark',
                ol: colorMode === "light" ? 'editor-ol-light' : 'editor-ol-dark',
                listitem: colorMode === "light" ? 'editor-li-light' : 'editor-li-dark',
                listitemChecked: 'editor-listItemChecked',
                listitemUnchecked: 'editor-listItemUnchecked',
            },
            text: {
                bold: colorMode === "light" ? 'editor-bold-light' : 'editor-bold-dark',
                italics: colorMode === "light" ? 'editor-italics-light' : 'editor-italics-dark',
                underline: colorMode === "light" ? 'editor-underline-light' : 'editor-underline-dark',
                strikethrough: colorMode === "light" ? 'editor-textStrikethrough-light' : 'editor-textStrikethrough-dark',
                subscript: colorMode === "light" ? 'editor-textSubscript-light' : 'editor-textSubscript-dark',
                underlineStrikethrough: colorMode === "light" ? 'editor-textUnderlineStrikethrough-light' : 'editor-textUnderlineStrikethrough-dark',
            }
        };
    };

    // Generate the theme based on the current colorMode
    const theme = generateTheme(colorMode);

    // Catch errors that occur during Lexical updates
    const onError = (error: Error) => {
        console.log(error)
    }

    const [editorText, setEditorText] = useState<string | null>("");
    const editorRef = useRef(null);

    useEffect(() => {
        setDisplayData(data);
    }, [data])

    // useEffect(() => {
    //     console.log("Data:", data)
    //     console.log("Display Data:", displayData)
    // }, [data])

    // useEffect(() => {
    //     console.log("Hi:", displayData)
    // }, [displayData])

    const initialConfig = {
        namespace: 'Annual Report Document Editor',
        editable: true,
        theme,
        onError,
        nodes: [
            ListNode,
            ListItemNode,
            HeadingNode,
        ],
    };

    const uneditableInitialCOnfig = {
        ...initialConfig,
        editable: false
    }
    // useEffect(() => {
    //     console.log("Hi:", displayData)
    // }, [displayData])

    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [displayData, setDisplayData] = useState(data);

    return (
        // Wrapper
        <Box
            pb={6}

        >
            <Flex
                bg={colorMode === "light" ? "gray.200" : section === "description" ? "gray.800" : "gray.700"}
                // roundedTop={"8px"}
                roundedTop={20}

            >
                <Flex
                    justifyContent="flex-start"
                    alignItems={"center"}
                >
                    <Text
                        pt={5}
                        pl={8}
                        fontWeight={"bold"}
                        fontSize={titleTextSize ? titleTextSize : "2xl"}
                        paddingBottom={"12px"}
                    >
                        {
                            section === "description" ? "Description" :

                                section === "background" ? "Background" :
                                    section === "aims" ? "Aims" :
                                        section === "outcome" ? "Expected Outcome" :
                                            section === "collaborations" ? "Collaborations" :
                                                section === "strategic_context" ? "Strategic Context" :
                                                    section === "staff_time_allocation" ? "Staff Time Allocation" :
                                                        section === "budget" ? "Indicitave Operating Budget" :
                                                            section === "knowledge_transfer" ? "Knowledge Transfer" :
                                                                section === "project_tasks" ? "Tasks and Milestones" :
                                                                    section === "related_projects" ? "Related Science Projects" :
                                                                        section === "listed_references" ? "References" :
                                                                            section === "data_management" ? "Data Management" :
                                                                                section === "methodology" ? "Related Science Projects" :
                                                                                    section === "specimens" ? "No. of Specimens" :
                                                                                        section === "operating_budget" ? "Operating Budget" :
                                                                                            section === "operating_budget_external" ? "External Budget" :

                                                                                                section === "context" ? "Context" :
                                                                                                    section === "progress" ? "Progress" :
                                                                                                        section === "implications" ? "Management Implications" :
                                                                                                            section === "future" ? "Future Directions" :

                                                                                                                section === "progress_report" ? "Progress Report" :
                                                                                                                    section === "reason" ? "Reason" :
                                                                                                                        section === "intended_outcome" ? "Intended Outcome" :
                                                                                                                            section === "data_location" ? "Intended Outcome" :
                                                                                                                                section === "hardcopy_location" ? "Intended Outcome" :
                                                                                                                                    section === "backup_location" ? "Intended Outcome" :
                                                                                                                                        // scientific_outputs
                                                                                                                                        "Scientific Outputs"
                        }
                    </Text>
                </Flex>


                <Flex
                    justifyContent="flex-end"
                    // alignItems="center"
                    flex={1}
                >
                    <Grid
                        // px={10}
                        pr={8}
                        py={4}
                        gridTemplateColumns={"repeat(1, 1fr)"}
                        // width={"100%"}
                        gridColumnGap={2}
                    >

                        <HideEditorButton
                            setIsEditorOpen={setIsEditorOpen}
                            editorIsOpen={isEditorOpen}
                            // setDisplayData={setDisplayData}
                            editorText={editorText}
                        // rawHTML={rawHTML}
                        />
                    </Grid>
                </Flex>



                {/* {editorIsOpen ? 
                ()
                :
            ( */}
                {/* <Flex
                    height={20}
                    width={"100%"}
                    pos={"absolute"}
                    top={0}
                >
                    <Flex
                        justifyContent="flex-end"
                        alignItems="center"
                        flex={1}
                    >
                        <Grid
                            px={10}
                            py={4}
                            gridTemplateColumns={"repeat(1, 1fr)"}
                            // width={"100%"}
                            gridColumnGap={2}
                        >

                            <HideEditorButton
                                setIsEditorOpen={setIsEditorOpen}
                                editorIsOpen={isEditorOpen}
                                // setDisplayData={setDisplayData}
                                editorText={editorText}
                                rawHTML={rawHTML}
                            />
                        </Grid>
                    </Flex>

                </Flex> */}
                {/* )
} */}

            </Flex>

            <Box
                pos={"relative"}
                w={"100%"}
                // bg={"gray.100"}
                roundedBottom={20}
                boxShadow={"rgba(100, 100, 111, 0.1) 0px 7px 29px 0px"}
                bg={
                    colorMode === "light" ? isEditorOpen ? "whiteAlpha.600" : "whiteAlpha.400" : isEditorOpen ? "blackAlpha.500" : "blackAlpha.400"}
            >

                {isEditorOpen ? (
                    <EditableSRTE

                        initialConfig={initialConfig}
                        editorRef={editorRef}


                        data={data}
                        section={section}
                        project_pk={project_pk}
                        document_pk={document_pk}
                        editorType={editorType}
                        isUpdate={isUpdate}

                        displayData={displayData}

                        editorText={editorText}
                        setEditorText={setEditorText}
                        shouldShowTree={shouldShowTree}
                        setShouldShowTree={setShouldShowTree}
                        isEditorOpen={isEditorOpen}
                        setIsEditorOpen={setIsEditorOpen}
                        setDisplayData={setDisplayData}
                    />

                )
                    :
                    (
                        <DisplaySRTE
                            initialConfig={uneditableInitialCOnfig}
                            editorRef={editorRef}


                            data={data}
                            section={section}
                            project_pk={project_pk}
                            document_pk={document_pk}
                            editorType={editorType}
                            isUpdate={isUpdate}

                            displayData={displayData}

                            editorText={editorText}
                            setEditorText={setEditorText}
                            shouldShowTree={shouldShowTree}
                            setShouldShowTree={setShouldShowTree}
                            isEditorOpen={isEditorOpen}
                            setIsEditorOpen={setIsEditorOpen}
                            setDisplayData={setDisplayData}

                            textEditorName={section === "description" ? "Description" : undefined}
                        />
                    )
                }

            </Box>
        </Box>

    )
}


const SelectionSetterPlugin = () => {
    const [editor] = useLexicalComposerContext();
    useEffect(() => {
        editor.update(() => {
            console.log($getSelection())

        })
    }, [editor])
    return null;
}





