import { ExtractedHTMLTitle } from "@/shared/components/ExtractedHTMLTitle";
// import { useProjectSearchContext } from "@/shared/hooks/ProjectSearchContext";
import { useBoxShadow } from "@/shared/hooks/useBoxShadow";
import type { IMainDoc } from "@/shared/types";
import { Separator } from "@/shared/components/ui/separator";
import { useColorMode } from "@/shared/utils/theme.utils";
import { useNavigate } from "react-router-dom";
import { HiDocumentCheck } from "react-icons/hi2";
import { useProjectSearchContext } from "@/features/projects/hooks/useProjectSearch";

interface IProps {
  inputKind:
    | "team_member"
    | "project_lead"
    | "business_area_lead"
    | "directorate";
  document: IMainDoc;
}

export const TraditionalDocumentTaskDisplay = ({
  inputKind,
  document,
}: IProps) => {
  // useEffect(() => { console.log(document) }, [document])
  const { colorMode } = useColorMode();
  const navigate = useNavigate();
  const { isOnProjectsPage } = useProjectSearchContext();

  const goToProjectDocument = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
    pk: number | undefined,
    document: IMainDoc,
  ) => {
    let urlkind = "";
    if (document?.kind === "progressreport") {
      urlkind = "progress";
    } else if (document?.kind === "projectclosure") {
      urlkind = "closure";
    } else if (document?.kind === "studentreport") {
      urlkind = "student";
    } else if (document?.kind === "concept") {
      urlkind = "concept";
    } else if (document?.kind === "projectplan") {
      urlkind = "project";
    }

    if (pk === undefined) {
      console.log("The Pk is undefined. Potentially use 'id' instead.");
    } else {
      if (isOnProjectsPage) {
        if (e.ctrlKey || e.metaKey) {
          window.open(`${pk}/${urlkind}`, "_blank"); // Opens in a new tab
        } else {
          navigate(`${pk}/${urlkind}`);
        }
      } else {
        if (e.ctrlKey || e.metaKey) {
          window.open(`projects/${pk}/${urlkind}`, "_blank"); // Opens in a new tab
        } else {
          navigate(`projects/${pk}/${urlkind}`);
        }
      }
    }
  };
  const formattedDocumentKind = (docKind: string) => {
    // "conceptplan" | "projectplan" | "progressreport" | "studentreport" | "projectclosure"
    if (docKind === "studentreport") {
      return "Student";
    } else if (docKind === "concept") {
      return "Concept Plan";
    } else if (docKind === "projectclosure") {
      return "Project Closure";
    } else if (docKind === "projectplan") {
      return "Project Plan";
    } else if (docKind === "progressreport") {
      return "Progress Report";
    } else {
      // catchall

      return docKind;
    }
  };

  const formattedInputKind = (
    actionKind:
      | "team_member"
      | "project_lead"
      | "business_area_lead"
      | "directorate",
  ) => {
    // "conceptplan" | "projectplan" | "progressreport" | "studentreport" | "projectclosure"
    if (actionKind === "directorate") {
      return "Directorate";
    } else if (actionKind === "team_member") {
      return "Team Member";
    } else if (actionKind === "project_lead") {
      return "Project Lead";
    } else if (actionKind === "business_area_lead") {
      return "Business Area Lead";
    } else {
      // catchall

      return actionKind;
    }
  };
  const boxShadow = useBoxShadow();

  return (
    <div
      className={`flex items-center border border-t-0 w-full p-2 cursor-pointer hover:z-[999] ${
        colorMode === "light" 
          ? "border-gray-200 hover:text-blue-300" 
          : "border-gray-600 hover:text-blue-100"
      }`}
      style={{
        boxShadow: "hover:" + boxShadow,
      }}
      onClick={(e) =>
        goToProjectDocument(
          e,
          document?.project?.pk ? document?.project?.pk : document?.project?.id,
          document,
        )
      }
    >
      <div className="flex min-w-[156px] max-w-[156px]">
        <div className="flex items-center">
          <div
            className={`flex items-center justify-center mr-3 w-5 h-5 ${
              colorMode === "light" ? "text-red-600" : "text-red-200"
            }`}
          >
            <HiDocumentCheck />
          </div>
        </div>

        <div className="flex flex-col">
          <div className="w-full">
            <p>{formattedDocumentKind(document?.kind)}</p>
          </div>
        </div>
      </div>

      <Separator orientation="vertical" className="mr-5" />
      <div className="flex-1 grid">
        <div className="flex">
          <ExtractedHTMLTitle
            htmlContent={`${document?.project?.title}`}
            color={colorMode === "dark" ? "blue.200" : "blue.400"}
            fontWeight={"bold"}
            cursor={"pointer"}
          />
        </div>
        <div className="flex">
          <span
            className={`font-semibold text-sm mr-1 ${
              inputKind === "directorate"
                ? "text-red-600"
                : inputKind === "business_area_lead"
                  ? "text-orange-600"
                  : inputKind === "team_member"
                    ? "text-blue-600"
                    : "text-green-600"
            }`}
          >
            {`${formattedInputKind(inputKind)}:`}
          </span>
          <span className="text-gray-500 font-semibold text-sm">
            {inputKind === "team_member"
              ? "Input required"
              : `Determine if the ${formattedDocumentKind(
                  document?.kind,
                )} for this project is satisfactory`}
          </span>
        </div>
      </div>
    </div>
  );
};
