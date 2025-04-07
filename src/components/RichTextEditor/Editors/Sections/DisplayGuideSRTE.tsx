import { Box, Spacer, Text } from "@chakra-ui/react";
import { ClearEditorPlugin } from "@lexical/react/LexicalClearEditorPlugin";
import {
  InitialConfigType,
  LexicalComposer,
} from "@lexical/react/LexicalComposer";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { TablePlugin } from "@lexical/react/LexicalTablePlugin";
import { TreeViewPlugin } from "@/lib/plugins/TreeViewPlugin";
import { PrepopulateHTMLPlugin } from "@/components/RichTextEditor/Plugins/PrepopulateHTMLPlugin";
import { ImagePlugin } from "../../Plugins/ImagesPlugin";
import { useGetRTESectionPlaceholder } from "@/lib/hooks/helper/useGetRTESectionPlaceholder";

interface Props {
  initialConfig: InitialConfigType;
  data: string;
  section: string; // Changed from GuideSections enum to string for field_key
  shouldShowTree: boolean;
}

export const DisplayGuideSRTE = ({
  initialConfig,
  data,
  section,
  shouldShowTree,
}: Props) => {
  // Try to derive a placeholder from the section key
  const placeholder = useGetRTESectionPlaceholder(section);

  return (
    <>
      <LexicalComposer initialConfig={initialConfig}>
        {/* Plugins*/}
        <HistoryPlugin />
        <ListPlugin />
        <TablePlugin hasCellMerge={true} hasCellBackgroundColor={false} />
        <PrepopulateHTMLPlugin data={data} />
        <ImagePlugin />
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
                  {`Press the edit button to add ${placeholder}.`}
                </Text>
              </Box>
              <Spacer pb={2} />
            </>
          }
          ErrorBoundary={LexicalErrorBoundary}
        />

        <Box></Box>
        {shouldShowTree ? <TreeViewPlugin /> : null}
        <ClearEditorPlugin />
      </LexicalComposer>
    </>
  );
};
