import { ExtractedHTMLTitle } from "@/shared/components/ExtractedHTMLTitle";
import { useProjectSearchContext } from "@/features/projects/hooks/ProjectSearchContext";
import type { ITaskEndorsement } from "@/shared/types";
import { useColorMode } from "@/shared/utils/theme.utils";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { FaBiohazard } from "react-icons/fa";
import { FaShieldDog } from "react-icons/fa6";
import { PiPlantFill } from "react-icons/pi";
import { cn } from "@/shared/utils/component.utils";

interface IProps {
  endorsement: ITaskEndorsement;
  kind: "aec" | "bm" | "hc";
}
export const ModernEndorsementTaskDisplayCard = ({
  endorsement,
  kind,
}: IProps) => {
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
  const navigate = useNavigate();
  const { isOnProjectsPage } = useProjectSearchContext();

  const handleProjectTaskCardClick = () => {
    goToProjectDocument(
      endorsement?.project_plan?.document?.project?.pk,
      endorsement,
    );
  };

  const goToProjectDocument = (
    pk: number | undefined,
    endorsement: ITaskEndorsement,
  ) => {
    let urlkind = "";
    if (
      endorsement?.project_plan?.document?.project?.kind === "progressreport"
    ) {
      urlkind = "progress";
    } else if (
      endorsement?.project_plan?.document?.project?.kind === "projectclosure"
    ) {
      urlkind = "closure";
    } else if (
      endorsement?.project_plan?.document?.project?.kind === "studentreport"
    ) {
      urlkind = "student";
    } else if (
      endorsement?.project_plan?.document?.project?.kind === "concept"
    ) {
      urlkind = "concept";
    } else if (
      endorsement?.project_plan?.document?.project?.kind === "projectplan"
    ) {
      urlkind = "project";
    }

    if (pk === undefined) {
      console.log("The Pk is undefined. Potentially use 'id' instead.");
      console.log(endorsement?.project_plan?.document?.project?.pk);
    } else if (isOnProjectsPage) {
      navigate(`${pk}/${urlkind}`);
    } else {
      navigate(`projects/${pk}/${urlkind}`);
    }
  };

  return (
    <motion.div
      initial={{ scale: 1, opacity: 1 }} // Initial scale (no animation)
      animate={{ scale: isAnimating ? 1.05 : 1, opacity: isAnimating ? 1 : 1 }} // Scale to 0 when isAnimating is true
      transition={{ duration: 0.2 }} // Animation duration in seconds
    >
      <div
        className={cn(
          "p-4 select-none rounded-lg min-h-[230px] flex flex-col items-stretch relative cursor-pointer",
          colorMode === "light" ? "bg-gray-50" : "bg-gray-700"
        )}
        style={{
          boxShadow:
            colorMode === "light"
              ? "0px 7px 12px -3px rgba(0, 0, 0, 0.15), 0px 1.4px 1.75px -0.7px rgba(0, 0, 0, 0.03), -2.1px 0px 7px -1.4px rgba(0, 0, 0, 0.0465), 2.1px 0px 7px -1.4px rgba(0, 0, 0, 0.0465)"
              : "0px 1.4px 2.1px -0.7px rgba(255, 255, 255, 0.0465), 0px 0.7px 1.4px -0.7px rgba(255, 255, 255, 0.028), -1.4px 0px 2.1px -0.7px rgba(255, 255, 255, 0.032)"
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleProjectTaskCardClick}
      >
        <div className="w-full">
          <ExtractedHTMLTitle
            htmlContent={endorsement?.project_plan?.document?.project?.title}
            color={colorMode === "light" ? "blue.500" : "blue.300"}
            fontWeight={"semibold"}
          />
        </div>

        <div>
          <span
            className={cn(
              "font-semibold text-sm",
              colorMode === "light" ? "text-gray-500" : "text-gray-300"
            )}
          >
            {kind === "aec"
              ? "Upload the Animal Ethics Committee Approval form (PDF) to provide AEC approval"
              : kind === "bm"
                ? "Provide Biometrician Approval"
                : kind === "hc"
                  ? "Provide Hermarium Curator Approval"
                  : `Provide ${kind} approval`}
          </span>
        </div>
        <div className="absolute bottom-2 right-1.5 px-1">
          <div className="flex justify-end pt-4">
            <div className="flex">
              <div
                className={cn(
                  "mt-0.5 mr-2 w-5 h-5 flex items-center justify-center",
                  kind === "aec"
                    ? colorMode === "light"
                      ? "text-blue-600"
                      : "text-blue-200"
                    : kind === "bm"
                      ? colorMode === "light"
                        ? "text-red-600"
                        : "text-red-200"
                      : colorMode === "light"
                        ? "text-green-600"
                        : "text-green-200"
                )}
              >
                {kind === "aec" ? (
                  <FaShieldDog />
                ) : kind === "hc" ? (
                  <PiPlantFill />
                ) : (
                  <FaBiohazard />
                )}
              </div>
              <div>
                <span
                  className={cn(
                    "font-semibold text-sm mr-1",
                    `${
                      kind === "aec" ? "text-blue-600" : kind === "bm" ? "text-red-600" : "text-green-600"
                    }`
                  )}
                >
                  {`${
                    kind === "aec"
                      ? "Animal Ethics Committee"
                      : kind === "bm"
                        ? "Biometrician"
                        : "Herbarium Curator"
                  }`}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
