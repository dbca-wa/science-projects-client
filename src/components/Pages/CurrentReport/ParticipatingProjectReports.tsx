// WIP tab contents for participating projects. Features some additional info and the projects via AnnualReportProjectDisplay

import { ARProgressReportHandler } from "@/components/RichTextEditor/Editors/ARProgressReportHandler";
import { useLatestYearsActiveProgressReports } from "@/lib/hooks/useLatestYearsActiveProgressReports";
import { useLatestYearsActiveStudentProjects } from "@/lib/hooks/useLatestYearsActiveStudentProjects";
import { useUser } from "@/lib/hooks/useUser";
import { Accordion, AccordionButton, AccordionItem, AccordionPanel, Box, Center, Spinner, Text, useColorMode } from "@chakra-ui/react";
import { useEffect } from "react";
import whitePaperBackground from "@/images/white-texture.jpg"
import { RiBook3Fill } from "react-icons/ri";
import { MdScience } from "react-icons/md";
import { ARStudentReportHandler } from "@/components/RichTextEditor/Editors/ARStudentReportHandler";


export const ParticipatingProjectReports = () => {

  const { latestProgressReportsData, latestProgressReportsLoading } = useLatestYearsActiveProgressReports();

  const { latestStudentReportsData, latestStudentReportsLoading } = useLatestYearsActiveStudentProjects();

  useEffect(() => {
    if (!latestProgressReportsLoading && !latestStudentReportsLoading) {
      console.log({
        "student": latestStudentReportsData,
        "other": latestProgressReportsData
      })
    }
  }, [latestProgressReportsData, latestStudentReportsData, latestProgressReportsLoading, latestStudentReportsLoading])


  const { userData, userLoading } = useUser();
  const A4Width = 210; // in millimeters
  const A4Height = A4Width * 1.414; // 1.414 is the aspect ratio of A4 paper (297 / 210)

  const { colorMode } = useColorMode();

  return (
    <Box>

      {latestProgressReportsLoading || latestStudentReportsLoading ? (
        <Center>
          <Spinner />
        </Center>
      ) : (
        <Box display={"flex"} flexDir={"column"} margin={"auto"} maxW={`${A4Width}mm`} minH={`${A4Height}mm`} py={4}
          // bg={"orange"}
          position="relative"
        // zIndex={1}
        >
          <Box
            position="absolute"
            top="0"
            left="0"
            right="0"
            bottom="0" minH={`${A4Height}mm`}
            backgroundImage={`url(${whitePaperBackground})`}
            backgroundSize="cover"
            backgroundPosition="center"
            backgroundRepeat="no-repeat"
            // transform="rotate(90deg)" // Rotate the background image by 90 degrees
            opacity={0.25} // Set the opacity of the background image
            zIndex={0}
          />
          {(latestStudentReportsData?.length + latestProgressReportsData?.length) < 1 ?
            <Center>
              <Text pos={"absolute"} top={10}>There are no approved reports for this year</Text>

            </Center>
            :


            <Accordion
              defaultIndex={[1]}
              allowMultiple
              zIndex={2}
              w={"100%"}
            >
              <AccordionItem
                mt={-4}
                borderColor={
                  colorMode === "light" ? "blackAlpha.500" : "whiteAlpha.600"
                }
                borderBottom={"none"}
                borderTop={"none"}
                zIndex={999}
                opacity={1.5}
                w={"100%"}
              >
                <AccordionButton
                  // bg={colorMode === "light" ? "gray.200" : "gray.700"}
                  bg={colorMode === "light" ? "blue.500" : "blue.600"}
                  w={"100%"}
                  color={"white"}
                  _hover={
                    colorMode === "light"
                      ? { bg: "blue.400" }
                      : { bg: "blue.500" }
                  }
                  userSelect={"none"}
                  opacity={0.9}
                  borderBottomRadius={"50%"}
                  alignItems={"center"}
                  justifyContent={"center"}
                >
                  <Center
                    mb={4}
                    mt={4}
                    ml={6}
                  >
                    <Box display="flex" alignItems="center" justifyContent="center" width={8} height={8} mr={4}>
                      <RiBook3Fill
                        size={"lg"}
                      />
                    </Box>
                    <Text
                      fontWeight={"bold"} fontSize={"xl"}
                    // color={"black"}
                    >
                      Student Reports ({latestStudentReportsData?.length})
                    </Text>
                  </Center>

                </AccordionButton>
                <AccordionPanel
                  py={4}
                  mt={4}
                >
                  {!userLoading &&
                    latestStudentReportsData?.map((sr, index) => {
                      return (


                        <ARStudentReportHandler
                          key={`student${index}`}
                          canEdit={userData?.is_superuser || userData?.business_area?.name === "Directorate"}
                          report={sr}
                          shouldAlternatePicture={index % 2 !== 0}
                        />
                      );
                    })}

                </AccordionPanel>
              </AccordionItem>

              <AccordionItem
                mt={4}
                borderColor={
                  colorMode === "light" ? "blackAlpha.500" : "whiteAlpha.600"
                }
                borderBottom={"none"}
                borderTop={"none"}
                zIndex={999}
                opacity={1.5}
                w={"100%"}
              >
                <AccordionButton
                  // bg={colorMode === "light" ? "gray.200" : "gray.700"}
                  bg={colorMode === "light" ? "green.500" : "green.600"}
                  w={"100%"}
                  color={"white"}
                  _hover={
                    colorMode === "light"
                      ? { bg: "green.400" }
                      : { bg: "green.500" }
                  }
                  userSelect={"none"}
                  opacity={0.9}
                  borderBottomRadius={"50%"}
                  alignItems={"center"}
                  justifyContent={"center"}
                >
                  <Center
                    mb={4}
                    mt={4}
                    ml={6}
                  >
                    <Box display="flex" alignItems="center" justifyContent="center" width={8} height={8} mr={4}>
                      <MdScience
                        size={"lg"}
                      />
                    </Box>
                    <Text
                      fontWeight={"bold"} fontSize={"xl"}
                    // color={"black"}
                    >
                      Progress Reports ({latestProgressReportsData?.length})
                    </Text>
                  </Center>


                </AccordionButton>
                <AccordionPanel
                  py={4}
                  mt={4}
                >
                  {latestProgressReportsData &&
                    latestProgressReportsData?.map((pr, index) => {
                      return (


                        <ARProgressReportHandler
                          key={`ordinary${index}`}
                          canEdit={userData?.is_superuser || userData?.business_area?.name === "Directorate"}
                          report={pr}
                          shouldAlternatePicture={index % 2 !== 0}
                        />
                      );
                    })}

                </AccordionPanel>
              </AccordionItem>
            </Accordion>
          }
        </Box>

      )
      }
    </Box>
  );
};



{/* // <Center>
        //   {!userLoading &&
        //     latestProgressReportsData?.map((report, index) => {
        //       return (
        //         <Box key={index}>
        //           <>
        //             <ARProgressReportHandler
        //               canEdit={
        //                 userData?.is_superuser ||
        //                 userData?.business_area?.name === "Directorate"
        //               }
        //               project={report?.project}
        //               document={report?.document}
        //               report={report}
        //               reportKind={
        //                 report?.progress_report ? "student" : "ordinary"
        //               }
        //               shouldAlternatePicture={index % 2 === 0}
        //             />
        //           </>
        //         </Box>
        //       );
        //     })}
        // </Center> */}
