import { PrintPreview } from "@/shared/components/RichTextEditor/Editors/PrintPreview";

interface ServiceDeliveryProps {
  intro: string;
}

export const ServiceDeliverySection = ({ intro }: ServiceDeliveryProps) => {
  return (
    <div className="flex flex-col">
      <div className="flex justify-center">
        <p className="text-2xl font-bold">
          SDS
        </p>
      </div>

      <PrintPreview
        canEdit={false}
        data={intro}
        section={"dm"}
        editorType={"Comment"}
        isUpdate={false}
      />
    </div>
  );
};
