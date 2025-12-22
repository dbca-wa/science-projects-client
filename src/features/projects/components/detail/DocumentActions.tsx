// Used for all documents. WIP - need to update the content shown based on doc, and parametise the document sent in.

import { useColorMode } from "@/shared/utils/theme.utils";
import { Badge } from "@/shared/components/ui/badge";
import {
  IConceptPlan,
  IProgressReport,
  IProjectClosure,
  IProjectPlan,
  IStudentReport,
} from "@/shared/types";

interface IDocumentActions {
  tabType: string;
  document:
    | IConceptPlan
    | IProjectPlan
    | IProgressReport
    | IStudentReport
    | IProjectClosure
    | null
    | undefined;
  projectPk: number;
}

export const DocumentActions = ({
  tabType,
  document,
  projectPk,
}: IDocumentActions) => {
  const { colorMode } = useColorMode();
  return (
    <div
      className={`rounded-lg p-4 my-6 ${
        colorMode === "light" ? "bg-gray-100" : "bg-gray-700"
      }`}
    >
      <div className="flex w-full">
        <p
          className={`flex-1 font-bold text-lg pb-4 select-none ${
            colorMode === "light" ? "text-gray-800" : "text-gray-100"
          }`}
        >
          Document Actions
        </p>
        <Badge className="bg-green-500 text-white">
          STATUS
        </Badge>
      </div>

      {tabType === "overview" ? (
        <div className="mb-4 grid gap-4 grid-cols-2"></div>
      ) : tabType === "concept" ? (
        <div>
          Concept Plan (Project: {projectPk}, Pk: {document?.pk})
        </div>
      ) : tabType === "project" ? (
        <div>
          Project Plan (Project: {projectPk}, Pk: {document?.pk})
        </div>
      ) : tabType === "progress" ? (
        <div>
          Progress Reports (Project: {projectPk}, Pk: {document?.pk})
        </div>
      ) : tabType === "student" ? (
        <div>
          Student Reports (Project: {projectPk}, Pk: {document?.pk})
        </div>
      ) : tabType === "closure" ? (
        <div>
          Closure (Project: {projectPk}, Pk: {document.pk})
        </div>
      ) : (
        <div>
          Unimplemented: neither concept, progress, student, project, closure
        </div>
      )}
    </div>
  );
};
