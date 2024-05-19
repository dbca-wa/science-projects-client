// The options bar which sits below the text area in the simple rich text editor

import { GuideSections } from "@/lib/api";
import { useUser } from "@/lib/hooks/tanstack/useUser";
import { Flex, Grid } from "@chakra-ui/react";
import { EditorType } from "../../../types";
import { ClearButton } from "../Buttons/ClearButton";
import { GuideSaveButton } from "../Buttons/GuideSaveButton";
import { TreeButton } from "../Buttons/TreeButton";

interface IOptionsBarProps {
  // editor: LexicalEditor;
  canSave: boolean;
  setCanSave: React.Dispatch<React.SetStateAction<boolean>>;

  isUpdate: boolean;
  editorText: string | null;
  shouldShowTree: boolean;
  setShouldShowTree: React.Dispatch<React.SetStateAction<boolean>>;
  rawHTML: string;
  section: GuideSections;
  displayData: string;
  editorIsOpen: boolean;
  setIsEditorOpen: React.Dispatch<React.SetStateAction<boolean>>;
  adminOptionsByPk: number;
  refetch: () => void;
  // setDisplayData: React.Dispatch<React.SetStateAction<string>>;
}

export const GuideOptionsBar = ({
  displayData,
  isUpdate,
  editorText,
  shouldShowTree,
  setShouldShowTree,
  rawHTML,
  editorIsOpen,
  setIsEditorOpen,
  section,
  adminOptionsByPk,
  //   setDisplayData,
  canSave,
  setCanSave,
  refetch,
}: IOptionsBarProps) => {
  const { userData } = useUser();
  return (
    editorIsOpen && (
      <Flex height={20} width={"100%"} bottom={0}>
        {/* <Flex justifyContent="flex-start" alignItems="center" flex={1} px={10}>
          <WordCount
            text={editorText}
            wordLimit={wordLimit}
            limitCanBePassed={limitCanBePassed}
            setCanSave={setCanSave}
          />
        </Flex> */}

        <Flex justifyContent="flex-end" alignItems="center" flex={1}>
          <Grid
            px={10}
            py={4}
            gridTemplateColumns={`repeat(${
              userData?.is_superuser ? 3 : 2
            }, 1fr)`}
            // width={"100%"}
            gridColumnGap={2}
          >
            {userData?.is_superuser ? (
              <TreeButton
                shouldShowTree={shouldShowTree}
                setShouldShowTree={setShouldShowTree}
                editorText={editorText}
                rawHTML={rawHTML}
              />
            ) : null}

            <ClearButton canClear={true} />
            <GuideSaveButton
              canSave={canSave}
              setIsEditorOpen={setIsEditorOpen}
              isUpdate={isUpdate}
              htmlData={displayData}
              adminOptionsPk={adminOptionsByPk}
              section={section}
              softRefetch={refetch}
            />
          </Grid>
        </Flex>
      </Flex>
    )
  );
};
