import { PrintPreview } from "@/components/RichTextEditor/Editors/PrintPreview";
import { Center, Flex, Text } from "@chakra-ui/react";

interface ServiceDeliveryProps {
  intro: string;
}

export const ServiceDeliverySection = ({ intro }: ServiceDeliveryProps) => {
  return (
    <Flex flexDir={"column"}>
      <Center>
        <Text fontWeight={"bold"} fontSize={"2xl"}>
          SDS
        </Text>
      </Center>

      <PrintPreview
        canEdit={false}
        data={intro}
        section={"dm"}
        editorType={"Comment"}
        isUpdate={false}
      />
    </Flex>
  );
};
