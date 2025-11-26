import { GuideSections, saveGuideContentToDB } from "@/features/admin/services/admin.service";
import { useUser } from "@/features/users/hooks/useUser";
import { Flex, Grid } from "@chakra-ui/react";
import type { EditorType } from "@/shared/types";
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
  section: string | GuideSections; // Update to accept either string or enum
  displayData: string;
  editorIsOpen: boolean;
  setIsEditorOpen: React.Dispatch<React.SetStateAction<boolean>>;
  adminOptionsByPk: number;
  refetch: () => void;
  // Optional prop to specify a different field key for API calls
  fieldKey?: string;
  // New prop for dynamic content saving - using the simpler signature for this component
  onSave?: (content: string) => Promise<boolean>;
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
  fieldKey, // Added fieldKey prop (optional)
  onSave, // Original onSave function from parent
}: IOptionsBarProps) => {
  const { userData } = useUser();

  // Create an adapter function to bridge the type difference
  const handleSave = async (content: string): Promise<boolean> => {
    try {
      console.log(
        "GuideOptionsBar: handleSave called with content length:",
        content.length,
      );
      const effectiveFieldKey = fieldKey || section.toString();

      // Use the saveGuideContentToDB function directly with proper parameters
      const result = await saveGuideContentToDB({
        fieldKey: effectiveFieldKey,
        content: content,
        adminOptionsPk: adminOptionsByPk,
      });
      return !!result;
    } catch (error) {
      console.error("Error in GuideOptionsBar handleSave:", error);
      return false;
    }
  };

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
              onSave={handleSave} // Use our adapter function instead of saveGuideContentToDB directly
              setIsEditorOpen={setIsEditorOpen}
              isUpdate={isUpdate}
              htmlData={displayData}
              adminOptionsPk={adminOptionsByPk}
              section={section}
              softRefetch={refetch}
              fieldKey={fieldKey || section.toString()} // Use fieldKey if provided, otherwise use section
            />
          </Grid>
        </Flex>
      </Flex>
    )
  );
};
