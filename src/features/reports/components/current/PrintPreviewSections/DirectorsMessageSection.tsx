import { PrintPreview } from "@/shared/components/RichTextEditor/Editors/PrintPreview";
import { Center, Flex, Text } from "@chakra-ui/react";

interface IEDM {
  dm: string;
}

export const DirectorsMessageSection = ({ dm }: IEDM) => {
  return (
    <Flex flexDir={"column"}>
      <Center mb={10}>
        <Text fontWeight={"bold"} fontSize={"2xl"}>
          Executive Director's Message
        </Text>
      </Center>

      <PrintPreview
        canEdit={false}
        data={dm}
        section={"dm"}
        editorType={"Comment"}
        isUpdate={false}
      />
    </Flex>
  );
};
