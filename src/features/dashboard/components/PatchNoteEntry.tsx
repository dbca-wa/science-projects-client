import { Check } from "lucide-react";

const PatchNoteEntry = ({
  title,
  kind,
  description,
}: {
  title: string;
  kind: "feature" | "update" | "fix";
  description: string;
}) => {
  return (
    <li className="text-sm -indent-5 ml-5 flex items-start gap-2">
      <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
      <div>
        <span className="font-semibold">
          {`${kind[0].toUpperCase()}${kind.slice(1)}: ${title}`}
        </span>
        <div className="block mt-0 ml-0">
          {description}
        </div>
      </div>
    </li>
  );
};

export default PatchNoteEntry;
