import {
  getProblematicProjectsForBusinessAreas,
  getUnapprovedDocsForBusinessAreas,
} from "@/lib/api";
import { useMyBusinessAreas } from "@/lib/hooks/tanstack/useMyBusinessAreas";
import { useUser } from "@/lib/hooks/tanstack/useUser";
import { IMainDoc, IProjectData } from "@/types";
import {
  Box,
  Center,
  List,
  ListItem,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  useColorMode,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { BusinessAreaEditableDisplay } from "@/components/Pages/MyBusinessArea/BusinessAreaEditableDisplay";
import { ProblematicProjectsDataTable } from "@/components/Pages/MyBusinessArea/ProblematicProjectsDataTable";
import {
  IPendingProjectDocumentData,
  UnapprovedDocumentsDataTable,
} from "@/components/Pages/MyBusinessArea/UnapprovedDocumentsDataTable";
// Show BAs how their BA will display on AR

export const MyBusinessArea = () => {
  const { userData, userLoading } = useUser();
  const { basLoading, baData: myBusinessAreas, refetch } = useMyBusinessAreas();
  const { colorMode } = useColorMode();

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
        <Box maxW={"100%"} maxH={"100%"}>
          {/* Count of BAs Led and title */}
          {!basLoading && !isRepainting && myBusinessAreas?.length >= 1 && (
            <>
              <Box mb={4}>
                <Text fontWeight={"semibold"} fontSize={"lg"}>
                  My Business Area
                  {myBusinessAreas?.length > 1 &&
                    `s (${myBusinessAreas.length})`}
                </Text>
              </Box>

              <Tabs isFitted>
                <TabList>
                  <Tab>Display</Tab>
                  <Tab>Problematic Projects</Tab>
                  <Tab>Unapproved Project Documents</Tab>
                </TabList>
                <TabPanels>
                  <TabPanel>
                    <Box mb={4}>
                      <Text
                        color={colorMode === "light" ? "gray.500" : "gray.300"}
                        mt={2}
                      >
                        {myBusinessAreas.length < 1
                          ? "You are not leading any business areas."
                          : "This section provides an idea of how your business area intro will look on the Annual Report before progress reports are shown"}
                      </Text>
                    </Box>

                    <Center w="100%">
                      <Box w={"240mm"} h={"100%"} my={3}>
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
                      </Box>
                    </Center>
                  </TabPanel>
                  <TabPanel>
                    <Box mb={4}>
                      <Text
                        color={colorMode === "light" ? "gray.500" : "gray.300"}
                        mt={2}
                      >
                        This section shows all projects belonging to your
                        Business Area which have some data problems which may
                        prevent progressing to the annual report.
                      </Text>
                    </Box>

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
                        <Box key={`${ba?.pk}problemProjects`}>
                          <Text fontWeight={"bold"} fontSize={"larger"} py={4}>
                            {ba?.name} ({problemsCount} problems)
                          </Text>
                          <ProblematicProjectsDataTable
                            projectData={problematicProjectsForBaData}
                          />
                        </Box>
                      );
                    })}
                  </TabPanel>
                  <TabPanel>
                    <Box mb={4}>
                      <Text
                        color={colorMode === "light" ? "gray.500" : "gray.300"}
                        mt={2}
                      >
                        {myBusinessAreas.length < 1
                          ? "You are not leading any business areas."
                          : "This section lists all projects documents in your area which have yet to be approved by Project Leads. Please check that the listed leader is a dbca member and confer with them to push the document through."}
                      </Text>
                      {/* <Box mt={2}>
                        <Text color={"orange.500"} fontWeight={"semibold"}>
                          There are some issues with older data. Please refrain
                          from approving documents in the following situations:
                        </Text>
                        <List color={"red.500"}>
                          <ListItem>
                            - A concept plan requires approval, but a project
                            plan already exists
                          </ListItem>
                          <ListItem>
                            - A project plan requires approval, but a progress
                            report already exists
                          </ListItem>
                        </List>
                      </Box> */}
                    </Box>

                    {myBusinessAreas?.map((ba) => {
                      const pendingProjectDocumentData: IPendingProjectDocumentData =
                        {
                          all: [],
                          team: [],
                          ba: [],
                          lead: unapprovedDocumentsInAreas[ba.pk]?.linked,
                          directorate: [],
                        };
                      // console.log(unapprovedDocumentsInAreas[`${ba?.pk}`])
                      return pendingProjectDocumentData ? (
                        <Box key={`${ba?.pk}unapproveddocs`}>
                          <Text fontWeight={"bold"} fontSize={"larger"} py={4}>
                            {ba?.name} (
                            {
                              unapprovedDocumentsInAreas[`${ba?.pk}`]?.linked
                                ?.length
                            }{" "}
                            Unapproved Documents)
                          </Text>
                          {/* {Object.keys(pendingProjectDocumentData['lead']).length >
                              0 && ( */}
                          <>
                            {/* {unapprovedDocumentsInAreas[ba?.pk]?.map(
                                (doc) => {
                                  console.log(doc);
                                  return (
                                    <Box key={doc?.id}>
                                      <Text>{doc?.project?.title}</Text>
                                    </Box>
                                  );
                                },
                              )} */}
                            <UnapprovedDocumentsDataTable
                              pendingProjectDocumentData={
                                pendingProjectDocumentData
                              }
                            />
                          </>
                          {/* )} */}
                        </Box>
                      ) : null;
                    })}
                  </TabPanel>
                </TabPanels>
              </Tabs>
            </>
          )}
        </Box>
      )}
    </>
  );
};
