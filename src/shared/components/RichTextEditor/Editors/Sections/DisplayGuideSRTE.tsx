import { ClearEditorPlugin } from "@lexical/react/LexicalClearEditorPlugin";
import {
  type InitialConfigType,
  LexicalComposer,
} from "@lexical/react/LexicalComposer";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { TablePlugin } from "@lexical/react/LexicalTablePlugin";
import { TreeViewPlugin } from "@/shared/lib/plugins/TreeViewPlugin";
import { PrepopulateHTMLPlugin } from "@/shared/components/RichTextEditor/Plugins/PrepopulateHTMLPlugin";
import { ImagePlugin } from "../../Plugins/ImagesPlugin";
import { useGetRTESectionPlaceholder } from "@/features/reports/utils/useGetRTESectionPlaceholder";

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
              <div
                className="pointer-events-none absolute left-8 top-5 select-none text-gray-500"
              >
                <p className="text-sm text-gray-500">
                  {`Press the edit button to add ${placeholder}.`}
                </p>
              </div>
              <div className="pb-2" />
            </>
          }
          ErrorBoundary={LexicalErrorBoundary}
        />

        <div></div>
        {shouldShowTree ? <TreeViewPlugin /> : null}
        <ClearEditorPlugin />
      </LexicalComposer>
    </>
  );
};
