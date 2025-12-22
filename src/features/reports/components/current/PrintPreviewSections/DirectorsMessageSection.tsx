import { PrintPreview } from "@/shared/components/RichTextEditor/Editors/PrintPreview";

interface IEDM {
  dm: string;
}

export const DirectorsMessageSection = ({ dm }: IEDM) => {
  return (
    <div className="flex flex-col">
      <div className="flex justify-center mb-10">
        <p className="text-2xl font-bold">
          Executive Director's Message
        </p>
      </div>

      <PrintPreview
        canEdit={false}
        data={dm}
        section={"dm"}
        editorType={"Comment"}
        isUpdate={false}
      />
    </div>
  );
};
