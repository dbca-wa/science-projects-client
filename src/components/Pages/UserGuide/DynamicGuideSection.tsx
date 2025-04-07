import { GuideRichTextEditor } from "@/components/RichTextEditor/Editors/GuideRichTextEditor";
import { saveGuideContentToDB } from "@/lib/api";
import { Box, Text, useColorMode } from "@chakra-ui/react";

// New dynamic section component
export const DynamicGuideSection = ({
  isSuperUser,
  section,
  adminOptionsData,
  adminOptionsPk,
  refetch,
}) => {
  const { colorMode } = useColorMode();

  // Function to save content using the new dynamic approach
  const handleSaveContent = async (fieldKey: string, content: string) => {
    try {
      await saveGuideContentToDB({
        fieldKey,
        content,
        adminOptionsPk,
      });
      return true;
    } catch (error) {
      console.error("Error saving content:", error);
      return false;
    }
  };

  if (!section.content_fields || section.content_fields.length === 0) {
    return (
      <Box pr={4}>
        <Text color="gray.500" mb={4}>
          No content fields have been defined for this section.
        </Text>
        {isSuperUser && (
          <Text fontSize="sm">
            Add content fields to this section in the Django admin interface.
          </Text>
        )}
      </Box>
    );
  }

  return (
    <Box pr={4}>
      {section.content_fields
        .sort((a, b) => a.order - b.order)
        .map((field) => (
          <Box key={field.id} mb={6}>
            <GuideRichTextEditor
              key={`${field.field_key}${colorMode}`}
              canEdit={isSuperUser}
              data={adminOptionsData?.guide_content?.[field.field_key] || ""}
              section={field.field_key}
              fieldTitle={field.title || field.field_key}
              adminOptionsPk={adminOptionsPk}
              isUpdate={true}
              refetch={refetch}
              onSave={(content) =>
                handleSaveContent(field.field_key, content.content)
              }
            />
          </Box>
        ))}
    </Box>
  );
};
