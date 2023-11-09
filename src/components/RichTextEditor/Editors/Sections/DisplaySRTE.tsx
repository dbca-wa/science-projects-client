import { Box, Text, useColorMode } from "@chakra-ui/react";
import { ClearEditorPlugin } from "@lexical/react/LexicalClearEditorPlugin";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { NodeEventPlugin } from "@lexical/react/LexicalNodeEventPlugin";
import { OptionsBar } from "../../OptionsBar/OptionsBar";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { ListItemNode, ListNode } from "@lexical/list";
import { HeadingNode } from "@lexical/rich-text";
import { $getRoot, $getSelection, ParagraphNode } from "lexical";
import { PrepopulateHTMLPlugin } from "../../Plugins/PrepopulateHTMLPlugin";
import { RichTextToolbar } from "../../Toolbar/RichTextToolbar";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import LexicalErrorBoundary from "@lexical/react/LexicalErrorBoundary";
import { TreeViewPlugin } from "../../../../lib/plugins/TreeViewPlugin"
import { $generateNodesFromDOM, $generateHtmlFromNodes } from "@lexical/html"
import { useEffect, useState } from "react";
import { EditorSubsections, EditorType } from "../../../../types";

interface Props {
    initialConfig: any;
    editorRef: any;
    data: string;
    section: EditorSubsections;
    project_pk: number;
    document_pk: number;
    editorType: EditorType;
    isUpdate: boolean;

    editorText: string;
    setEditorText: React.Dispatch<React.SetStateAction<string>>;
    shouldShowTree: boolean;
    setShouldShowTree: React.Dispatch<React.SetStateAction<boolean>>;
    isEditorOpen: boolean;
    setIsEditorOpen: React.Dispatch<React.SetStateAction<boolean>>;
    displayData: string;
    setDisplayData: React.Dispatch<React.SetStateAction<string>>;
    textEditorName?: string;
}

export const DisplaySRTE = (
    {
        initialConfig, editorRef, data,
        section, project_pk, document_pk, isUpdate,
        editorType,
        editorText, setEditorText,
        isEditorOpen, setIsEditorOpen,
        displayData, setDisplayData,
        shouldShowTree, setShouldShowTree,
        textEditorName
    }: Props) => {

    const { colorMode } = useColorMode();

    const [selectedNodeType, setSelectedNodeType] = useState<string>();
    // useEffect(() => {
    //     console.log("Hi:", displayData)
    // }, [displayData])

    return (
        <LexicalComposer
            initialConfig={initialConfig}
        >


            {/* Plugins*/}
            <HistoryPlugin />
            <ListPlugin />
            <OnChangePlugin onChange={(editorState, editor) => {
                editorState.read(() => {
                    const root = $getRoot();
                    setEditorText(root.__cachedText);
                    const newHtml = $generateHtmlFromNodes(editor, null)
                    // console.log("DATA DISPLAY PLUGIN:", newHtml);
                    setDisplayData(newHtml);
                })
            }} />
            {data !== undefined && data !== null && (
                <PrepopulateHTMLPlugin data={displayData} />

            )}


            {/* Text Area */}
            <RichTextPlugin
                contentEditable={

                    <ContentEditable
                        style={{
                            minHeight: "50px",
                            width: "100%",
                            height: "auto",
                            padding: "32px",
                            paddingBottom: "16px",
                            paddingTop: "16px",
                            borderRadius: "0 0 25px 25px",
                            outline: "none",
                        }}
                    />
                }
                placeholder={
                    <div
                        style={{
                            position: "absolute",
                            left: "32px",
                            top: "20px",
                            // bottom: "50px",
                            userSelect: "none",
                            pointerEvents: "none",
                        }}
                    >
                        <Text
                            color={"gray.500"}
                            fontSize={"14px"}
                        >
                            {`Press the edit button to add 
                        ${textEditorName === "Description" ? "a project description"
                                    : textEditorName === "Title" ? "a project title"
                                        : textEditorName === "Tagline" ? "a project tagline"
                                            : textEditorName === "Background" ? "some background"
                                                : textEditorName === "Aims" ? "some aims"
                                                    : textEditorName === "Outcome" ? "an expected outcome"
                                                        : textEditorName === "Collaboration" ? "expected collaborations"
                                                            : textEditorName === "Strategic Context" ? "a strategic context"
                                                                : textEditorName === "Staff Time Allocation" ? "a staff time allocation"
                                                                    : textEditorName === "Operating Budget" ? "an operating budget"
                                                                        : textEditorName === "External Budget" ? "an external budget"
                                                                            : textEditorName === "Knowledge Transfer" ? "knowledge transfer"
                                                                                : textEditorName === "Tasks and Milestones" ? "tasks and milestones"
                                                                                    : textEditorName === "Related Projects" ? "names of related projects"
                                                                                        : textEditorName === "References" ? "references"
                                                                                            : textEditorName === "Data Management" ? "data management"
                                                                                                : textEditorName === "Methodology" ? "methodology"
                                                                                                    : textEditorName === "Progress" ? "this year's progress"
                                                                                                        : textEditorName === "Management Implications" ? "management implications"
                                                                                                            : textEditorName === "Future Directions" ? "future directions"
                                                                                                                : textEditorName === "Reason" ? "a reason of closure"
                                                                                                                    : textEditorName === "Intended Outcome" ? "an intended outcome"
                                                                                                                        : textEditorName === "Data Location" ? "a data location"
                                                                                                                            : textEditorName === "Hardcopy Location" ? "a hardcopy location"
                                                                                                                                : textEditorName === "Backup Location" ? "a backup location"
                                                                                                                                    : textEditorName === "Scientific Outputs" ? "scientific outputs"
                                                                                                                                        : textEditorName === "Context" ? "some context"
                                                                                                                                            : "some text"}.`}

                        </Text>
                    </div>
                }
                ErrorBoundary={LexicalErrorBoundary}
            />


            <Box>
                <OptionsBar
                    editorType={editorType}
                    displayData={displayData}
                    editorText={editorText}
                    shouldShowTree={shouldShowTree}
                    setShouldShowTree={setShouldShowTree}
                    rawHTML={displayData}
                    section={section}
                    project_pk={project_pk}
                    document_pk={document_pk}
                    isUpdate={isUpdate}

                    editorIsOpen={isEditorOpen}
                    setIsEditorOpen={setIsEditorOpen}
                    setDisplayData={setDisplayData}
                />
            </Box>
            {
                shouldShowTree ?
                    <TreeViewPlugin />
                    : null
            }
            <ClearEditorPlugin />
            {/* <NodeEventPlugin
                nodeType={ParagraphNode}
                eventType={'click'}
                eventListener={(e: Event) => {

                    console.log(e)
                    console.log('paragaph node clicked')
                    // setSelectedNodeType('paragraph')
                }}
            />
            <NodeEventPlugin
                nodeType={ListItemNode}
                eventType={'click'}
                eventListener={(e: Event) => {

                    console.log(e)
                    console.log('li node clicked')
                    // setSelectedNodeType('li')
                }}
            /> */}
        </LexicalComposer>
    )
}



// <LexicalComposer
// initialConfig={uneditableInitialCOnfig}
// >
// {/* Plugins*/}
// <HistoryPlugin />
// <ListPlugin />
// <OnChangePlugin onChange={(editorState) => {
//     editorState.read(() => {
//         const root = $getRoot();

//         setEditorText(root.__cachedText);

//     })
// }} />
// {data !== undefined && data !== null && (
//     <PrepopulateHTMLPlugin data={data} />

// )}


// {/* Text Area */}
// <RichTextPlugin
//     contentEditable={
//         <>
//             <ContentEditable
//                 style={{
//                     minHeight: "50px",
//                     width: "100%",
//                     height: "auto",
//                     padding: "32px",
//                     paddingBottom: "16px",
//                     borderRadius: "0 0 25px 25px",
//                     outline: "none",
//                 }}
//             />
//         </>
//     }
//     placeholder={
//         <div
//             style={{
//                 position: "absolute",
//                 left: "32px",
//                 top: "89px",
//                 userSelect: "none",
//                 pointerEvents: "none",

//             }}
//         >
//             {"Enter some text..."}
//         </div>
//     }
//     ErrorBoundary={LexicalErrorBoundary}
// />


// <Box>
//     <OptionsBar
//         editorText={editorText}
//         shouldShowTree={shouldShowTree}
//         setShouldShowTree={setShouldShowTree}
//         rawHTML={data}
//         editorIsOpen={isEditorOpen}
//         setIsEditorOpen={setIsEditorOpen}
//         setDisplayData={setDisplayData}
//     />
// </Box>
// {
//     shouldShowTree ?
//         <TreeViewPlugin />
//         : null
// }
// <ClearEditorPlugin />
// <NodeEventPlugin
//     nodeType={ParagraphNode}
//     eventType={'click'}
//     eventListener={(e: Event) => {

//         console.log(e)
//         console.log('paragaph node clicked')
//         setSelectedNodeType('paragraph')
//     }}
// />
// <NodeEventPlugin
//     nodeType={ListItemNode}
//     eventType={'click'}
//     eventListener={(e: Event) => {

//         console.log(e)
//         console.log('li node clicked')
//         setSelectedNodeType('li')
//     }}
// />

// {/* <SelectionSetterPlugin /> */}
// {/* <DarkModePlugin /> */}
// </LexicalComposer>