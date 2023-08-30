// The basic rich text editor component; does not allow sticky notes, emotes, etc.

// React
import { forwardRef, useEffect, useRef, useState } from "react"

// Styles and Styling Components
import { Box, Flex, useColorMode } from "@chakra-ui/react";

// Lexical
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import LexicalErrorBoundary from '@lexical/react/LexicalErrorBoundary';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';

// Lexical Plugins
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin"
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';

// Custom Components
import { SimpleRichTextToolbar } from "../Toolbar/SimpleRichTextToolbar";
import { OptionsBar } from "../OptionsBar/OptionsBar";
// import { AutoFocusPlugin } from "../../../../lib/plugins/AutoFocusPlugin";


import '../../../styles/texteditor.css'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $createParagraphNode, $createTextNode, $getRoot, $getSelection, $insertNodes, LexicalNode, LineBreakNode } from "lexical";
import { $generateNodesFromDOM } from "@lexical/html"



import { ListItemNode, ListNode } from "@lexical/list";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-ignore
import { TreeViewPlugin } from "../../../lib/plugins/TreeViewPlugin"



interface IProps {
    data: string;
}


// Wrap the ContentEditable component with forwardRef to access the ref prop
// const ContentEditableWithRef = forwardRef<HTMLTextAreaElement, React.HTMLProps<HTMLTextAreaElement>>(
//     (props, ref) => <ContentEditable {...props} ref={ref} />
// );


export const SimpleRichTextEditor = ({ data }: IProps) => {

    const { colorMode } = useColorMode();


    const theme = {
        quote: 'editor-quote',
        ltr: "ltr",
        rtl: "rtl",
        paragraph: colorMode === "light" ? 'editor-p-light' : "editor-paragraph-dark",
        heading: {
            h1: colorMode === "light" ? 'editor-h1-light' : "editor-h1-dark",
            h2: colorMode === "light" ? 'editor-h2-light' : "editor-h2-dark",
            h3: colorMode === "light" ? 'editor-h3-light' : "editor-h3-dark",
        },
        text: {

            bold: 'editor-bold',
            italics: 'editor-italics',
            unerline: 'editor-underline',
        }

    }

    // Catch errors that occur during Lexical updates
    const onError = (error: Error) => {
        console.log(error)
    }

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

    const [editorText, setEditorText] = useState<string | null>("");
    const editorRef = useRef<HTMLTextAreaElement>(null);


    return (
        // Wrapper
        <Box
            pos={"relative"}
            w={"100%"}
            // bg={"gray.100"}
            rounded={20}
            boxShadow={"rgba(100, 100, 111, 0.2) 0px 7px 29px 0px"}
        >
            <LexicalComposer
                initialConfig={initialConfig}
            >
                {/* Plugins*/}
                <HistoryPlugin />
                <ListPlugin />
                <OnChangePlugin onChange={(editorState) => {
                    editorState.read(() => {
                        const root = $getRoot();
                        setEditorText(root.__cachedText);
                    })
                }} />

                {/* Text Area */}
                <RichTextPlugin
                    contentEditable={
                        <>
                            {/* Toolbar */}
                            <SimpleRichTextToolbar editorRef={editorRef} />

                            <ContentEditable
                                style={{
                                    minHeight: "300px",
                                    width: "100%",
                                    height: "auto",
                                    padding: "32px",
                                    paddingBottom: "16px",
                                    borderRadius: "0 0 25px 25px",
                                    outline: "none",
                                }}

                            />
                        </>
                    }
                    placeholder={
                        <div
                            style={{
                                position: "absolute",
                                left: "32px",
                                top: "89px",
                                userSelect: "none",
                                pointerEvents: "none",

                            }}
                        >
                            Enter some text...
                        </div>
                    }
                    ErrorBoundary={LexicalErrorBoundary}
                />


                <Box
                >
                    <OptionsBar editorText={editorText} />
                </Box>
                <TreeViewPlugin />

            </LexicalComposer>
        </Box>
    )
}