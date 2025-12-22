import { ExtractedHTMLTitle } from "@/shared/components/ExtractedHTMLTitle";
import { useProjectSearchContext } from "@/features/projects/hooks/ProjectSearchContext";
import type { IMainDoc } from "@/shared/types";
import { useColorMode } from "@/shared/utils/theme.utils";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { HiDocumentCheck } from "react-icons/hi2";
import { useNavigate } from "react-router-dom";

interface IProps {
  document: IMainDoc;
  kind: "team" | "project_lead" | "ba_lead" | "directorate";
}
export const ModernDocumentTaskDisplayCard = ({ document, kind }: IProps) => {
  const { colorMode } = useColorMode();
  const [isHovered, setIsHovered] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isHovered) {
      setIsAnimating(true);
    } else {
      setIsAnimating(false);
    }
  }, [isHovered]);
  const { isOnProjectsPage } = useProjectSearchContext();

  const navigate = useNavigate();
  // const handleProjectTaskCardClick = () => {
  // 	goToProjectDocument(document?.project?.pk, document);

  // };

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
      return "Student Report";
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
    actionKind: "team" | "project_lead" | "ba_lead" | "directorate",
  ) => {
    // "conceptplan" | "projectplan" | "progressreport" | "studentreport" | "projectclosure"
    if (actionKind === "directorate") {
      return "Directorate";
    } else if (actionKind === "team") {
      return "Team Member";
    } else if (actionKind === "project_lead") {
      return "Project Lead";
    } else if (actionKind === "ba_lead") {
      return "Business Area Lead";
    } else {
      // catchall

      return actionKind;
    }
  };

  return (
    <motion.div
      initial={{ scale: 1, opacity: 1 }} // Initial scale (no animation)
      animate={{
        scale: isAnimating ? 1.05 : 1,
        opacity: isAnimating ? 1 : 1,
      }} // Scale to 0 when isAnimating is true
      transition={{ duration: 0.2 }} // Animation duration in seconds
    >
      <div
        className={`p-4 select-none rounded-lg min-h-[230px] flex flex-col relative cursor-pointer ${
          colorMode === "light" ? "bg-gray-50" : "bg-gray-700"
        }`}
        style={{
          boxShadow:
            colorMode === "light"
              ? "0px 7px 12px -3px rgba(0, 0, 0, 0.15), 0px 1.4px 1.75px -0.7px rgba(0, 0, 0, 0.03), -2.1px 0px 7px -1.4px rgba(0, 0, 0, 0.0465), 2.1px 0px 7px -1.4px rgba(0, 0, 0, 0.0465)"
              : "0px 1.4px 2.1px -0.7px rgba(255, 255, 255, 0.0465), 0px 0.7px 1.4px -0.7px rgba(255, 255, 255, 0.028), -1.4px 0px 2.1px -0.7px rgba(255, 255, 255, 0.032)",
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={(e) =>
          goToProjectDocument(
            e,
            document?.project?.pk
              ? document?.project?.pk
              : document?.project?.id,
            document,
          )
        }
      >
        <div className="w-full">
          <ExtractedHTMLTitle
            htmlContent={document?.project?.title}
            color={colorMode === "light" ? "blue.500" : "blue.300"}
            fontWeight={"semibold"}
          />
        </div>

        <div>
          <span
            className={`font-semibold text-sm mr-1 ${
              kind === "directorate"
                ? "text-red-600"
                : kind === "ba_lead"
                  ? "text-orange-600"
                  : kind === "team"
                    ? "text-blue-600"
                    : "text-green-600"
            }`}
          >
            {`${formattedInputKind(kind)}:`}
          </span>
          <span
            className={`font-semibold text-sm ${
              colorMode === "light" ? "text-gray-500" : "text-gray-200"
            }`}
          >
            {kind === "team"
              ? "Input required"
              : `Determine if the ${formattedDocumentKind(
                  document?.kind,
                )} for this project is satisfactory`}
          </span>
        </div>

        <div className="absolute bottom-2 right-1.5 px-1">
          <div className="flex">
            <div
              className={`text-center mr-2 mt-0.5 w-5 h-5 flex items-center justify-center ${
                colorMode === "light" ? "text-red-600" : "text-red-200"
              }`}
            >
              <HiDocumentCheck />
            </div>
            <div className="w-full">
              <span className="text-red-600 font-semibold text-sm mr-1">
                {formattedDocumentKind(document?.kind)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
