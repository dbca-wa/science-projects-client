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
import { SimpleEditableRTE } from "./Sections/SimpleEditableRTE";



interface IProps {
    // data: string;
    section: EditorSubsections;
    editorType: EditorType;
    isUpdate: boolean;
    value: string;
    setValueFunction: React.Dispatch<React.SetStateAction<string>>;
}

export const SimpleStateRichTextEditor = ({
    section, editorType, isUpdate, value, setValueFunction }: IProps) => {

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


    return (
        <Box
            pb={6}
            w={"100%"}
            zIndex={2}
        >
            <Box
                pos={"relative"}
                w={"100%"}
                roundedBottom={20}
                boxShadow={"rgba(100, 100, 111, 0.1) 0px 7px 29px 0px"}
                bg={
                    colorMode === "light" ? "whiteAlpha.600" : "blackAlpha.500"}
                roundedTop={20}
                zIndex={2}
            >
                <SimpleEditableRTE

                    initialConfig={initialConfig}
                    editorRef={editorRef}


                    data={value}
                    section={section}
                    editorType={editorType}
                    isUpdate={isUpdate}

                    displayData={value}

                    editorText={editorText}
                    setEditorText={setEditorText}
                    shouldShowTree={shouldShowTree}
                    setShouldShowTree={setShouldShowTree}
                    setDisplayData={setValueFunction}
                />
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




