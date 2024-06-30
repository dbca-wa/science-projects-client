import { useMyBusinessAreas } from "@/lib/hooks/tanstack/useMyBusinessAreas";
import { useUser } from "@/lib/hooks/tanstack/useUser";
import {
  Box,
  Center,
  Grid,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  useColorMode,
} from "@chakra-ui/react";
import { BusinessAreaEditableDisplay } from "./BusinessAreaEditableDisplay";
import { useEffect, useState } from "react";
import {
  IPendingProjectDocumentData,
  UnapprovedDocumentsDataTable,
} from "./UnapprovedDocumentsDataTable";
import { getUnapprovedDocsForBusinessAreas } from "@/lib/api";
import { IMainDoc, IProjectDocument, IProjectDocuments } from "@/types";
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

  const [unapprovedDocumentsInAreas, setUnapprovedDocumentsInAreas] =
    useState<UnapprovedDocumentsInAreas>({});

  useEffect(() => {
    if (Object.keys(unapprovedDocumentsInAreas).length > 0) {
      console.log(unapprovedDocumentsInAreas);
    }
  }, [unapprovedDocumentsInAreas]);

  useEffect(() => {
    const fetchUnapprovedDocs = async () => {
      if (!basLoading && myBusinessAreas?.length >= 1) {
        const flatPkList = myBusinessAreas.map((ba) => ba.pk);
        // console.log(flatPkList);

        if (
          flatPkList.length >= 1 &&
          Object.keys(unapprovedDocumentsInAreas).length === 0
        ) {
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
                    <Box></Box>
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
