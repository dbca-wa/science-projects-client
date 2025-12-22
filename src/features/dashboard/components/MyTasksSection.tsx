// Component for displaying the tasks the user has on the dashboard (modern)

import { Separator } from "@/shared/components/ui/separator";
import { useColorMode } from "@/shared/utils/theme.utils";
// import { TaskDisplayCard } from "./TaskDisplayCard"
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import type { IMainDoc } from "@/shared/types";
import { ModernDocumentTaskDisplayCard } from "./ModernDocumentTaskDisplayCard";
import { ModernEndorsementTaskDisplayCard } from "./ModernEndorsementTaskDisplayCard";

interface ITaskSection {
  endorsementTaskData: {
    aec: IMainDoc[];
    bm: IMainDoc[];
    hc: IMainDoc[];
  };
  endorsementTaskDataLoading: boolean;
  documentTaskData: {
    all: IMainDoc[];
    ba: IMainDoc[];
    directorate: IMainDoc[];
    lead: IMainDoc[];
    team: IMainDoc[];
  };
  documentTaskDataLoading: boolean;
}

export const MyTasksSection = ({
  endorsementTaskData,
  documentTaskData,
}: ITaskSection) => {
  const { colorMode } = useColorMode();
  const [total, setTotal] = useState(0);

  useEffect(() => {
    console.log({
      endorsementTaskData,
      documentTaskData,
    });
    endorsementTaskData &&
      documentTaskData &&
      setTotal(
        endorsementTaskData.aec.length +
          // endorsementTaskData.bm.length +
          // endorsementTaskData.hc.length +
          documentTaskData?.all?.length,
      );
  }, [endorsementTaskData, documentTaskData]);

  // useEffect(() => {
  //   console.log(total);
  // }, [total]);

  const renderEndorsementTaskCards = (documents, kind) => {
    if (!documents) return null;

    return documents.map((doc, index) => (
      <motion.div
        key={`endorsementtask${kind}${index}`}
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 10, opacity: 0 }}
        transition={{ duration: 0.4, delay: index / 8 }}
        style={{
          position: "relative",
          height: "100%",
          animation: "oscillate 8s ease-in-out infinite",
        }}
      >
        <ModernEndorsementTaskDisplayCard endorsement={doc} kind={kind} />
      </motion.div>
    ));
  };

  const renderDocumentTaskCards = (documents, kind) => {
    if (!documents) return null;

    return documents.map((doc, index) => (
      <motion.div
        key={`documenttask${kind}${index}`}
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 10, opacity: 0 }}
        transition={{ duration: 0.4, delay: index / 8 }}
        style={{
          position: "relative",
          height: "100%",
          animation: "oscillate 8s ease-in-out infinite",
        }}
      >
        <ModernDocumentTaskDisplayCard document={doc} kind={kind} />
      </motion.div>
    ));
  };

  return total < 1 ? (
    <div className="w-full h-full">
      <p>Your tasks will be shown here...</p>
    </div>
  ) : (
    <div className="flex flex-col w-full h-full">
      {/* documentTaskData?.directorate &&
documentTaskData?.ba && */}
      {documentTaskData?.team &&
      documentTaskData?.lead &&
      [
        ...documentTaskData.team,
        ...documentTaskData.lead,
        // ...documentTaskData.directorate,
        // ...documentTaskData.ba,
      ].length >= 1 ? (
        <>
          <div className="relative p-10">
            <Separator />
            <div
              className={`absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 px-4 ${
                colorMode === "light" ? "bg-white" : "bg-gray-800"
              }`}
            >
              <h3 className="text-lg font-semibold">Team Tasks</h3>
            </div>
          </div>
          <div
            className="grid gap-4 mb-6"
            style={{
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gridRowGap: "2rem",
            }}
          >
            {renderDocumentTaskCards(documentTaskData?.lead, "project_lead")}
            {renderDocumentTaskCards(documentTaskData?.team, "team")}
            {/* {renderDocumentTaskCards(
							documentTaskData?.ba,
							"ba_lead"
						)}
						{renderDocumentTaskCards(
							documentTaskData?.directorate,
							"directorate"
						)} */}
          </div>
        </>
      ) : null}

      {documentTaskData?.ba && [...documentTaskData.ba].length >= 1 ? (
        <>
          <div className="relative p-10">
            <Separator />
            <div
              className={`absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 px-4 ${
                colorMode === "light" ? "bg-white" : "bg-gray-800"
              }`}
            >
              <h3 className="text-lg font-semibold">Business Area Lead Tasks</h3>
            </div>
          </div>
          <div
            className="grid gap-4 mb-6"
            style={{
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gridRowGap: "2rem",
            }}
          >
            {renderDocumentTaskCards(documentTaskData?.ba, "ba_lead")}
          </div>
        </>
      ) : null}

      {documentTaskData?.directorate &&
      [...documentTaskData.directorate].length >= 1 ? (
        <>
          <div className="relative p-10">
            <Separator />
            <div
              className={`absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 px-4 ${
                colorMode === "light" ? "bg-white" : "bg-gray-800"
              }`}
            >
              <h3 className="text-lg font-semibold">Directorate Tasks</h3>
            </div>
          </div>
          <div
            className="grid gap-4 mb-6"
            style={{
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gridRowGap: "2rem",
            }}
          >
            {renderDocumentTaskCards(
              documentTaskData?.directorate,
              "directorate",
            )}
          </div>
        </>
      ) : null}

      {endorsementTaskData?.aec &&
      endorsementTaskData?.bm &&
      endorsementTaskData?.hc &&
      [
        ...endorsementTaskData.aec,
        ...endorsementTaskData.bm,
        ...endorsementTaskData.hc,
      ].length >= 1 ? (
        <>
          <div className="relative p-10">
            <Separator />
            <div
              className={`absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 px-4 ${
                colorMode === "light" ? "bg-white" : "bg-gray-800"
              }`}
            >
              <h3 className="text-lg font-semibold">Endorsement Tasks</h3>
            </div>
          </div>
          <div
            className="grid gap-4 mb-6"
            style={{
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gridRowGap: "2rem",
            }}
          >
            {renderEndorsementTaskCards(endorsementTaskData?.aec, "aec")}
            {renderEndorsementTaskCards(endorsementTaskData?.bm, "bm")}
            {renderEndorsementTaskCards(endorsementTaskData?.hc, "hc")}
          </div>
        </>
      ) : null}
    </div>
  );
};
