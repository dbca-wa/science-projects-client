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
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  useColorMode,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { BusinessAreaEditableDisplay } from "./BusinessAreaEditableDisplay";
import { ProblematicProjectsDataTable } from "./ProblematicProjectsDataTable";
import {
  IPendingProjectDocumentData,
  UnapprovedDocumentsDataTable,
} from "./UnapprovedDocumentsDataTable";
import { motion } from "framer-motion";
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

  type UnapprovedDocumentsInAreas = {
    [key: number]: IMainDoc[];
  };

  type ProblematicProjectsInArea = {
    [key: number]: IProjectData[];
  };

  const [unapprovedDocumentsInAreas, setUnapprovedDocumentsInAreas] =
    useState<UnapprovedDocumentsInAreas>({});

  const [problematicProjectsData, setProblematicProjectsData] =
    useState<ProblematicProjectsInArea>({});

  useEffect(() => {
    if (Object.keys(problematicProjectsData).length > 0) {
      console.log(problematicProjectsData);
    }
  }, [problematicProjectsData]);

  //   useEffect(() => {
  //     if (Object.keys(unapprovedDocumentsInAreas).length > 0) {
  //       console.log(unapprovedDocumentsInAreas);
  //     }
  //   }, [unapprovedDocumentsInAreas]);

  useEffect(() => {
    const fetchUnapprovedDocs = async () => {
      if (!basLoading && myBusinessAreas?.length >= 1) {
        const flatPkList = myBusinessAreas.map((ba) => ba.pk);
        // console.log(flatPkList);

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
      }
    };

    fetchUnapprovedDocs();
  }, [myBusinessAreas, basLoading]);

  return (
    <>
      {!userLoading && (
        <Box maxW={"100%"} maxH={"100%"}>
          {/* Count of BAs Led and title */}
          {!basLoading && !isRepainting && (
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
                      return (
                        <Box key={`${ba?.pk}problemProjects`}>
                          <Text fontWeight={"bold"} fontSize={"larger"} py={4}>
                            {ba?.name}
                          </Text>
                          {Object.keys(problematicProjectsData).length > 0 && (
                            <>
                              <ProblematicProjectsDataTable
                                projectData={Object.keys(
                                  problematicProjectsData[ba?.pk],
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

                                  const projectsWithType =
                                    problematicProjectsData[ba?.pk][key].map(
                                      (project) => ({
                                        ...project,
                                        problemKind: problemType,
                                      }),
                                    );

                                  return [...acc, ...projectsWithType];
                                }, [])}
                              />
                            </>
                          )}
                        </Box>

                        // problematicProjectsData[ba?.pk]
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
                          : "This section lists all projects documents in your area which have yet to be approved by Project Leads"}
                      </Text>
                    </Box>

                    {myBusinessAreas?.map((ba) => {
                      const pendingProjectDocumentData: IPendingProjectDocumentData =
                        {
                          all: [],
                          team: [],
                          ba: [],
                          lead: unapprovedDocumentsInAreas[`${ba?.pk}`] || [],
                          directorate: [],
                        };
                      return (
                        <Box key={`${ba?.pk}unapproveddocs`}>
                          <Text fontWeight={"bold"} fontSize={"larger"} py={4}>
                            {ba?.name}
                          </Text>
                          {Object.keys(unapprovedDocumentsInAreas).length >
                            0 && (
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
                          )}
                        </Box>
                      );
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
