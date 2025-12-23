import { BusinessAreaEditableDisplay } from "@/features/business-areas/components/BusinessAreaEditableDisplay";
import { ProblematicProjectsDataTable } from "@/features/business-areas/components/ProblematicProjectsDataTable";
import {
  type IPendingProjectDocumentData,
  UnapprovedDocumentsDataTable,
} from "@/features/business-areas/components/UnapprovedDocumentsDataTable";
import { useMyBusinessAreas } from "@/features/business-areas/hooks/useMyBusinessAreas";
import { useUser } from "@/features/users/hooks/useUser";
import {
  getProblematicProjectsForBusinessAreas,
  getUnapprovedDocsForBusinessAreas,
} from "@/features/users/services/users.service";
import type { IMainDoc, IProjectData } from "@/shared/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
// Show BAs how their BA will display on AR

export const MyBusinessArea = () => {
  const { userData, userLoading } = useUser();
  const { basLoading, baData: myBusinessAreas, refetch } = useMyBusinessAreas();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [isRepainting, setIsRepainting] = useState(false);

  const softRefetch = async () => {
    setIsRepainting(true);
    await refetch();
    setIsRepainting(false);
  };

  interface baUnapprovedDocsSection {
    linked: IMainDoc[];
    unlinked: IMainDoc[];
  }

  type UnapprovedDocumentsInAreas = {
    [key: number]: baUnapprovedDocsSection;
  };

  type ProblematicProjectsInArea = {
    [key: number]: IProjectData[];
  };
  const [flatPkList, setFlatPkList] = useState<number[]>([]);

  const [unapprovedDocumentsInAreas, setUnapprovedDocumentsInAreas] =
    useState<UnapprovedDocumentsInAreas>({});

  const [problematicProjectsData, setProblematicProjectsData] =
    useState<ProblematicProjectsInArea>({});

  // useEffect(() => {
  //   if (Object.keys(problematicProjectsData).length > 0) {
  //     console.log(problematicProjectsData);
  //   }
  // }, [problematicProjectsData]);

  useEffect(() => {
    if (Object.keys(unapprovedDocumentsInAreas).length > 0) {
      flatPkList?.map((baPk) =>
        console.log(
          `${baPk}: ${unapprovedDocumentsInAreas[baPk]?.linked?.length}`,
        ),
      );
    }
  }, [unapprovedDocumentsInAreas, flatPkList]);

  useEffect(() => {
    if (basLoading || myBusinessAreas?.length < 1) {
      return;
    } else {
      if (flatPkList.length === 0) {
        setFlatPkList(myBusinessAreas.map((ba) => ba.pk));
      } else {
        const fetchUnapprovedDocs = async (flatPkList) => {
          if (flatPkList.length >= 1) {
            if (Object.keys(unapprovedDocumentsInAreas).length === 0) {
              try {
                const res = await getUnapprovedDocsForBusinessAreas({
                  baArray: flatPkList,
                });
                // console.log(res);
                setUnapprovedDocumentsInAreas(res);
              } catch (error) {
                console.error("Error fetching unapproved documents:", error);
              }
            }
          }
        };

        const fetchProblemProjects = async (flatPkList) => {
          if (flatPkList.length >= 1) {
            if (Object.keys(problematicProjectsData).length === 0) {
              try {
                const res = await getProblematicProjectsForBusinessAreas({
                  baArray: flatPkList,
                });
                // console.log(res);
                setProblematicProjectsData(res);
              } catch (error) {
                console.error("Error fetching problematic projects:", error);
              }
            }
          }
        };

        if (
          Object.keys(problematicProjectsData).length === 0 &&
          Object.keys(unapprovedDocumentsInAreas).length === 0
        ) {
          fetchUnapprovedDocs(flatPkList);
          fetchProblemProjects(flatPkList);
        }
      }
    }
  }, [
    flatPkList,
    myBusinessAreas,
    basLoading,
    unapprovedDocumentsInAreas,
    problematicProjectsData,
  ]);

  return (
    <>
      {!userLoading && (
        <div className="max-w-full max-h-full">
          {/* Count of BAs Led and title */}
          {!basLoading && !isRepainting && myBusinessAreas?.length >= 1 && (
            <>
              <div className="mb-4">
                <p className="font-semibold text-lg">
                  My Business Area
                  {myBusinessAreas?.length > 1 &&
                    `s (${myBusinessAreas.length})`}
                </p>
              </div>

              <Tabs defaultValue="display" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="display">Display</TabsTrigger>
                  <TabsTrigger value="problematic">Problematic Projects</TabsTrigger>
                  <TabsTrigger value="unapproved">Unapproved Project Documents</TabsTrigger>
                </TabsList>
                
                <TabsContent value="display">
                  <div className="mb-4">
                    <p className={`mt-2 ${isDark ? "text-gray-300" : "text-gray-500"}`}>
                      {myBusinessAreas.length < 1
                        ? "You are not leading any business areas."
                        : "This section provides an idea of how your business area intro will look on the Annual Report before progress reports are shown"}
                    </p>
                  </div>

                  <div className="flex justify-center w-full">
                    <div className="w-[240mm] h-full my-3">
                      {myBusinessAreas?.map((ba) => (
                        <BusinessAreaEditableDisplay
                          key={ba.pk}
                          pk={ba.pk}
                          leader={userData}
                          name={ba.name}
                          introduction={ba.introduction}
                          image={ba.image}
                          refetch={softRefetch}
                        />
                      ))}
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="problematic">
                  <div className="mb-4">
                    <p className={`mt-2 ${isDark ? "text-gray-300" : "text-gray-500"}`}>
                      This section shows all projects belonging to your
                      Business Area which have some data problems which may
                      prevent progressing to the annual report.
                    </p>
                  </div>

                  {myBusinessAreas?.map((ba) => {
                    const baData = problematicProjectsData[ba?.pk] || {};

                    // Reduce problematic project data
                    const problematicProjectsForBaData = Object.keys(
                      baData,
                    ).reduce((acc, key) => {
                      const problemType =
                        key === "no_members"
                          ? "memberless"
                          : key === "no_leader"
                            ? "leaderless"
                            : key === "external_leader"
                              ? "externally_led"
                              : key === "multiple_leads"
                                ? "multiple_leaders"
                                : ""; // handle other cases if necessary

                      const projectsWithType = baData[key].map((project) => ({
                        ...project,
                        problemKind: problemType,
                      }));

                      return [...acc, ...projectsWithType];
                    }, []);

                    const problemsCount = problematicProjectsForBaData.length;

                    return (
                      <div key={`${ba?.pk}problemProjects`}>
                        <p className="font-bold text-lg py-4">
                          {ba?.name} ({problemsCount} problems)
                        </p>
                        <ProblematicProjectsDataTable
                          projectData={problematicProjectsForBaData}
                        />
                      </div>
                    );
                  })}
                </TabsContent>
                
                <TabsContent value="unapproved">
                  <div className="mb-4">
                    <p className={`mt-2 ${isDark ? "text-gray-300" : "text-gray-500"}`}>
                      {myBusinessAreas.length < 1
                        ? "You are not leading any business areas."
                        : "This section lists all projects documents in your area which have yet to be approved by Project Leads. Please check that the listed leader is a dbca member and confer with them to push the document through."}
                    </p>
                  </div>

                  {myBusinessAreas?.map((ba) => {
                    const pendingProjectDocumentData: IPendingProjectDocumentData =
                      {
                        all: [],
                        team: [],
                        ba: [],
                        lead: unapprovedDocumentsInAreas[ba.pk]?.linked,
                        directorate: [],
                      };
                    return pendingProjectDocumentData ? (
                      <div key={`${ba?.pk}unapproveddocs`}>
                        <p className="font-bold text-lg py-4">
                          {ba?.name} (
                          {
                            unapprovedDocumentsInAreas[`${ba?.pk}`]?.linked
                              ?.length
                          }{" "}
                          Unapproved Documents)
                        </p>
                        <UnapprovedDocumentsDataTable
                          pendingProjectDocumentData={
                            pendingProjectDocumentData
                          }
                        />
                      </div>
                    ) : null;
                  })}
                </TabsContent>
              </Tabs>
            </>
          )}
        </div>
      )}
    </>
  );
};
