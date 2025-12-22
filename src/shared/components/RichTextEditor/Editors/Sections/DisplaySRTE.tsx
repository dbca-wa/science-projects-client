import { useGetRTESectionPlaceholder } from "@/features/reports/utils/useGetRTESectionPlaceholder";
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
import { TreeViewPlugin } from "@/shared/lib/plugins/TreeViewPlugin";
import type { EditorSubsections } from "@/shared/types";
import { PrepopulateHTMLPlugin } from "../../Plugins/PrepopulateHTMLPlugin";

interface Props {
  initialConfig: InitialConfigType;
  data: string;
  section: EditorSubsections;
  shouldShowTree: boolean;
}

export const DisplaySRTE = ({
  initialConfig,
  data,
  section,
  shouldShowTree,
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
                  overflowY: "scroll",
                  msOverflowY: "scroll",
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
                  {`Press the edit button to add 
                        ${useGetRTESectionPlaceholder(section)}.`}
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
