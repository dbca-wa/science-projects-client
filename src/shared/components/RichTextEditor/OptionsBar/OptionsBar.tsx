// The options bar which sits below the text area in the simple rich text editor

import { useUser } from "@/features/users/hooks/useUser";
import type { EditorSections, EditorSubsections, EditorType } from "@/shared/types";
import { ClearButton } from "../Buttons/ClearButton";
import { SaveButton } from "../Buttons/SaveButton";
import { TreeButton } from "../Buttons/TreeButton";
import { WordCount } from "./WordCount";
import { PasteHTMLDataButton } from "../Buttons/PasteHTMLDataButton";
import { useMaintainer } from "@/features/admin/hooks/useMaintainer";
import { PopulationButton } from "../Buttons/PopulationButton";
import { cn } from "@/shared/utils";

interface IOptionsBarProps {
  // editor: LexicalEditor;
  canSave: boolean;
  setCanSave: React.Dispatch<React.SetStateAction<boolean>>;

  writeable_document_kind?: EditorSections | null;
  writeable_document_pk?: number | null;
  details_pk?: number | null;
  wordLimit: number;
  limitCanBePassed: boolean;

  isUpdate: boolean;
  editorText: string | null;
  editorType: EditorType;
  shouldShowTree: boolean;
  setShouldShowTree: React.Dispatch<React.SetStateAction<boolean>>;
  rawHTML: string;
  section: EditorSubsections;
  project_pk: number;
  document_pk: number;
  displayData: string;
  editorIsOpen: boolean;
  setIsEditorOpen: React.Dispatch<React.SetStateAction<boolean>>;
  shouldCheckForPrepopulation: boolean;
  documentTypeCount: number;
  // setDisplayData: React.Dispatch<React.SetStateAction<string>>;
}

export const OptionsBar = ({
  shouldCheckForPrepopulation,
  // editor,
  details_pk,
  displayData,
  editorType,
  isUpdate,
  editorText,
  shouldShowTree,
  setShouldShowTree,
  writeable_document_kind,
  writeable_document_pk,
  rawHTML,
  editorIsOpen,
  setIsEditorOpen,
  section,
  project_pk,
  document_pk,
  wordLimit,
  limitCanBePassed,
  documentTypeCount,
  //   setDisplayData,
  canSave,
  setCanSave,
}: IOptionsBarProps) => {
  const { userData } = useUser();
  const { maintainerData, maintainerLoading } = useMaintainer();

  const showPopulationButton =
    shouldCheckForPrepopulation &&
    editorText.length === 0 &&
    documentTypeCount > 1;

  const getGridColumns = () => {
    const isMaintainer = userData?.pk === maintainerData?.pk;
    const hasText = editorText.length !== 0;
    
    if (showPopulationButton) {
      if (isMaintainer) {
        return hasText ? 6 : 7;
      } else {
        return hasText ? 2 : 3;
      }
    } else {
      return isMaintainer ? 6 : 2;
    }
  };

  return (
    editorIsOpen && (
      <div className="flex h-20 w-full bottom-0">
        <div className="flex justify-start items-center flex-1 px-10">
          <WordCount
            text={editorText}
            wordLimit={wordLimit}
            limitCanBePassed={limitCanBePassed}
            setCanSave={setCanSave}
          />
        </div>

        <div className="flex justify-end items-center flex-1">
          <div
            className={cn(
              "p-4 grid gap-2",
              `grid-cols-${getGridColumns()}`
            )}
          >
            {showPopulationButton && (
              <PopulationButton
                canPopulate={shouldCheckForPrepopulation}
                // editorText={editorText}
                writeable_document_kind={writeable_document_kind}
                section={section}
                project_pk={project_pk}
              />
            )}
            {userData?.pk === maintainerData?.pk ? (
              <>
                <TreeButton
                  shouldShowTree={shouldShowTree}
                  setShouldShowTree={setShouldShowTree}
                  editorText={editorText}
                  rawHTML={rawHTML}
                />
                <PasteHTMLDataButton kind="unordered" />
                <PasteHTMLDataButton kind="ordered" />
                <PasteHTMLDataButton kind="both" />
              </>
            ) : null}

            <ClearButton canClear={true} />
            <SaveButton
              canSave={canSave}
              writeable_document_pk={writeable_document_pk}
              writeable_document_kind={writeable_document_kind}
              details_pk={details_pk}
              setIsEditorOpen={setIsEditorOpen}
              isUpdate={isUpdate}
              editorType={editorType}
              htmlData={displayData}
              project_pk={project_pk}
              document_pk={document_pk}
              section={section}
            />
          </div>
        </div>
      </div>
    )
  );
};
