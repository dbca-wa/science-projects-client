import { ExtractedHTMLTitle } from "@/shared/components/ExtractedHTMLTitle";
import { useProjectSearchContext } from "@/features/projects/hooks/useProjectSearch";
import { useBoxShadow } from "@/shared/hooks/useBoxShadow";
import type { IMainDoc } from "@/shared/types";
import { Separator } from "@/shared/components/ui/separator";
import { useColorMode } from "@/shared/utils/theme.utils";
import { useNavigate } from "react-router-dom";
import { FaBiohazard, FaShieldDog } from "react-icons/fa6";
import { PiPlantFill } from "react-icons/pi";

interface IProps {
  endorsementKind: "animalEthics" | "biometrician" | "herbarium";
  document: IMainDoc;
}

export const TraditionalEndorsementTaskDisplay = ({
  endorsementKind,
  document,
}: IProps) => {
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
    } else if (isOnProjectsPage) {
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
  };

  const formattedKind = (endorsementKind: string) => {
    // "conceptplan" | "projectplan" | "progressreport" | "studentreport" | "projectclosure"
    if (endorsementKind === "animalEthics") {
      return "Animal Ethics";
    } else if (endorsementKind === "biometrician") {
      return "Biometrician";
    } else if (endorsementKind === "herbarium") {
      return "Herbarium Curator";
    } else {
      // catchall

      return endorsementKind;
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
      <div className="relative min-w-[170px] max-w-[170px] h-full flex items-center">
        <div className="flex items-center h-full">
          <div
            className={`flex items-center justify-center mr-3 w-5 h-5 ${
              endorsementKind === "animalEthics"
                ? colorMode === "light"
                  ? "text-blue-600"
                  : "text-blue-200"
                : endorsementKind === "biometrician"
                  ? colorMode === "light"
                    ? "text-red-600"
                    : "text-red-200"
                  : colorMode === "light"
                    ? "text-green-600"
                    : "text-green-200"
            }`}
          >
            {endorsementKind === "animalEthics" ? (
              <FaShieldDog />
            ) : endorsementKind === "herbarium" ? (
              <PiPlantFill />
            ) : (
              <FaBiohazard />
            )}
          </div>

          <div className="mx-0 w-full">
            <p>{formattedKind(endorsementKind)}</p>
          </div>
        </div>
        <div className="w-6 right-0 top-0 absolute h-full">
          <Separator
            orientation="vertical"
            className="h-full ml-2 mr-3"
          />
        </div>
      </div>

      <div className="flex flex-col">
        <ExtractedHTMLTitle
          htmlContent={`${document?.project?.title}`}
          color={colorMode === "dark" ? "blue.200" : "blue.400"}
          fontWeight={"bold"}
          cursor={"pointer"}
        />
        <div className="flex">
          <p className="text-gray-500 font-semibold text-sm">
            {endorsementKind === "animalEthics"
              ? "Upload the Animal Ethics Committee Approval form (PDF) to provide AEC approval"
              : endorsementKind === "biometrician"
                ? "Provide Biometrician Approval"
                : endorsementKind === "herbarium"
                  ? "Provide Hermarium Curator Approval"
                  : `Provide ${endorsementKind} approval`}
          </p>
        </div>
      </div>
    </div>
  );
};
