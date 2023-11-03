import { useColorMode } from "@chakra-ui/react";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { ListItemNode, ListNode } from "@lexical/list";
import { HeadingNode } from "@lexical/rich-text";
import { PrepopulateHTMLPlugin } from "../../Plugins/PrepopulateHTMLPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import LexicalErrorBoundary from "@lexical/react/LexicalErrorBoundary";

import '../../../../styles/texteditor.css'


type DisplayArea = "projectOverviewTitle" | "projectCardTitle" | "traditionalProjectTitle";

interface Props {
    data: string;
    displayData: string;
    displayArea: DisplayArea;
}


export const SimpleDisplaySRTE = (
    {
        data,
        displayData,
        displayArea,
    }: Props) => {

    const { colorMode } = useColorMode();

    const generateTheme = (colorMode) => {
        return {
            quote: 'editor-quote',
            ltr: "ltr",
            rtl: "rtl",
            paragraph: displayArea === "projectOverviewTitle" ?
                "editor-project-title-overview" :
                displayArea === "traditionalProjectTitle" ? "editor-project-title-traditional" : "editor-project-title-card",
            span: colorMode === "light" ? 'editor-p-light' : "editor-p-dark",
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

    const theme = generateTheme(colorMode);
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

    const uneditableInitialCOnfig = {
        ...initialConfig,
        editable: false
    }
    return (
        <LexicalComposer
            initialConfig={uneditableInitialCOnfig}
        >
            {/* Plugins*/}
            <ListPlugin />
            {data !== undefined && data !== null && (
                <PrepopulateHTMLPlugin data={displayData} />

            )}


            {/* Text Area */}
            <RichTextPlugin
                contentEditable={

                    <ContentEditable
                        style={{
                            minHeight: displayArea === "projectOverviewTitle" ?
                                "50px" : undefined,
                            width: "100%",
                            height: "auto",
                            // padding: "32px",
                            // paddingBottom: "16px",
                            // paddingTop: "16px",
                            borderRadius: "0 0 25px 25px",
                            outline: "none",
                            fontSize: "40px"
                        }}
                    />
                }
                placeholder={
                    <div
                        style={{
                            userSelect: "none",
                            pointerEvents: "none",
                        }}
                    >
                        {/* There should be text here                                                                                                                  : "some text"}.`} */}
                    </div>
                }
                ErrorBoundary={LexicalErrorBoundary}
            />

        </LexicalComposer>
    )
}
