import { useGetRTESectionPlaceholder } from "@/lib/hooks/helper/useGetRTESectionPlaceholder";
import { EditorSubsections } from "@/types";
import { Box, Spacer, Text } from "@chakra-ui/react";
import { ClearEditorPlugin } from "@lexical/react/LexicalClearEditorPlugin";
import {
  InitialConfigType,
  LexicalComposer,
} from "@lexical/react/LexicalComposer";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import LexicalErrorBoundary from "@lexical/react/LexicalErrorBoundary";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { TablePlugin } from "@lexical/react/LexicalTablePlugin";
import { PrepopulateHTMLPlugin } from "../Plugins/PrepopulateHTMLPlugin";

interface Props {
  initialConfig: InitialConfigType;
  data: string;
  section: EditorSubsections;
  shouldShowTree: boolean;
}

export const ARProgressReportDisplayEditor = ({
  initialConfig,
  data,
  section,
}: Props) => {
  return (
    <>
      <LexicalComposer initialConfig={initialConfig}>
        {/* Plugins*/}
        <HistoryPlugin />
        <ListPlugin />
        <TablePlugin hasCellMerge={true} hasCellBackgroundColor={false} />
        <PrepopulateHTMLPlugin data={data} />
        <RichTextPlugin
          contentEditable={
            <>
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
            </>
          }
          placeholder={
            <>
              <Box
                style={{
                  position: "absolute",
                  left: "32px",
                  top: "20px",
                  userSelect: "none",
                  pointerEvents: "none",
                  color: "gray.500",
                }}
              >
                <Text color={"gray.500"} fontSize={"14px"}>
                  {`Press the edit button to add 
                        ${useGetRTESectionPlaceholder(section)}.`}
                </Text>
              </Box>
              <Spacer pb={2} />
            </>
          }
          ErrorBoundary={LexicalErrorBoundary}
        />

        <Box></Box>
        <ClearEditorPlugin />
      </LexicalComposer>
    </>
  );
};
