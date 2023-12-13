import { Box, Spacer, Text, useColorMode } from "@chakra-ui/react";
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
import { useGetRTESectionPlaceholder } from "@/lib/hooks/useGetRTESectionPlaceholder";

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
    // console.log('editorname', textEditorName)
    const [selectedNodeType, setSelectedNodeType] = useState<string>();
    // useEffect(() => {
    //     console.log("Hi:", displayData)
    // }, [displayData])

    return (
        <>

            <LexicalComposer
                initialConfig={initialConfig}
            >


                {/* Plugins*/}
                <HistoryPlugin />
                <ListPlugin />
                {/* <OnChangePlugin onChange={(editorState, editor) => {
                    editorState.read(() => {
                        const root = $getRoot();
                        console.log(root.__cachedText)
                        setEditorText(root.__cachedText);
                        const newHtml = $generateHtmlFromNodes(editor, null)
                        // console.log("DATA DISPLAY PLUGIN:", newHtml);
                        setDisplayData(newHtml);
                    })
                }} /> */}
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
                                paddingTop: "20px",
                                paddingBottom: "16px",
                                borderRadius: "0 0 25px 25px",
                                outline: "none",
                            }}
                        />
                    }
                    placeholder={
                        <>
                            <Box
                                style={{
                                    position: "absolute",
                                    left: "32px",
                                    top: "20px",
                                    // paddingTop: "20px",
                                    // paddingBottom: "16px",
                                    userSelect: "none",
                                    pointerEvents: "none",
                                    color: "gray.500",
                                    // paddingBottom: "20px"

                                }}
                            >
                                <Text
                                    color={"gray.500"}
                                    fontSize={"14px"}
                                // pb={2}
                                >
                                    {`Press the edit button to add 
                        ${useGetRTESectionPlaceholder(section)}.`}
                                </Text>
                            </Box>
                            <Spacer pb={2} />
                        </>
                    }
                    ErrorBoundary={LexicalErrorBoundary}

                />


                <Box>

                </Box>
                {
                    shouldShowTree ?
                        <TreeViewPlugin />
                        : null
                }
                <ClearEditorPlugin />

            </LexicalComposer>
        </>
    )
}
